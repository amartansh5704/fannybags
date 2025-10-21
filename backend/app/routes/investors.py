from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Campaign, Partition, Transaction, InvestorHolding, User
from datetime import datetime

bp = Blueprint('investors', __name__, url_prefix='/api')

@bp.route('/campaigns/<int:campaign_id>/buy', methods=['POST'])
@jwt_required()
def buy_partitions(campaign_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    if campaign.funding_status != 'live':
        return jsonify({'error': 'Campaign is not active'}), 400
    partitions_count = data.get('partitions_count', 1)
    if partitions_count < campaign.min_partitions_per_user:
        return jsonify({'error': f'Minimum {campaign.min_partitions_per_user} partitions required'}), 400
    amount_paid = partitions_count * campaign.partition_price
    transaction = Transaction(
        user_id=user_id,
        tx_type='purchase',
        amount=amount_paid,
        status='completed',
        tx_reference=f'TXN_{campaign_id}_{user_id}_{int(datetime.utcnow().timestamp())}',
        description=f'Purchase {partitions_count} partitions'
    )
    partition = Partition(
        campaign_id=campaign_id,
        buyer_id=user_id,
        partitions_bought=partitions_count,
        amount_paid=amount_paid,
        payment_transaction_id=transaction.tx_reference,
        status='confirmed'
    )
    campaign.amount_raised += amount_paid
    if campaign.amount_raised >= campaign.target_amount:
        campaign.funding_status = 'funded'
    holding = InvestorHolding(
        campaign_id=campaign_id,
        investor_id=user_id,
        partitions_owned=partitions_count,
        ownership_pct=(partitions_count / campaign.total_partitions) * campaign.revenue_share_pct
    )
    db.session.add(transaction)
    db.session.add(partition)
    db.session.add(holding)
    db.session.commit()
    return jsonify({
        'message': 'Partitions purchased',
        'transaction_id': transaction.id,
        'partitions_bought': partitions_count,
        'amount_paid': amount_paid,
        'campaign_status': campaign.funding_status
    }), 201

@bp.route('/users/<int:user_id>/holdings', methods=['GET'])
@jwt_required()
def get_user_holdings(user_id):
    current_user_id = get_jwt_identity()
    # Convert both to int for comparison to avoid type mismatch
    current_user_id = int(current_user_id)
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    holdings = InvestorHolding.query.filter_by(investor_id=user_id).all()
    result = []
    for holding in holdings:
        campaign = Campaign.query.get(holding.campaign_id)
        artist = User.query.get(campaign.artist_id)
        result.append({
            'holding_id': holding.id,
            'campaign_id': holding.campaign_id,
            'campaign_title': campaign.title,
            'artist_name': artist.name if artist else 'Unknown',
            'partitions_owned': holding.partitions_owned,
            'ownership_pct': holding.ownership_pct,
            'revenue_share_pct': campaign.revenue_share_pct,
            'expected_revenue_3m': campaign.expected_revenue_3m,
            'acquired_at': holding.created_at.isoformat()
        })
    return jsonify(result), 200

@bp.route('/users/<int:user_id>/transactions', methods=['GET'])
@jwt_required()
def get_user_transactions(user_id):
    current_user_id = get_jwt_identity()
    # Convert both to int for comparison to avoid type mismatch
    current_user_id = int(current_user_id)
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'type': t.tx_type,
        'amount': t.amount,
        'status': t.status,
        'description': t.description,
        'created_at': t.created_at.isoformat()
    } for t in transactions]), 200

@bp.route('/users/<int:user_id>/expected-returns', methods=['GET'])
@jwt_required()
def get_expected_returns(user_id):
    current_user_id = get_jwt_identity()
    
    # Convert to int to avoid type mismatch
    current_user_id = int(current_user_id)
    user_id = int(user_id)
    
    # Check if this person is asking for their own data
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized - you can only view your own returns'}), 403
    
    from app.models import InvestorHolding
    
    # Get all campaigns this investor invested in
    holdings = InvestorHolding.query.filter_by(investor_id=user_id).all()
    
    # If no investments, return empty list
    if not holdings:
        return jsonify({
            'user_id': user_id,
            'total_expected_return_3m': 0,
            'number_of_campaigns': 0,
            'holdings_breakdown': []
        }), 200
    
    # Calculate total expected return
    total_expected = 0
    breakdown = []
    
    for holding in holdings:
        # Get the campaign details
        campaign = Campaign.query.get(holding.campaign_id)
        artist = User.query.get(campaign.artist_id)
        
        # Calculate this investor's expected return
        if campaign.expected_revenue_3m:
            # What % of the campaign does this investor own?
            investor_ownership_pct = (holding.partitions_owned / campaign.total_partitions) * 100
            
            # What % of revenue goes to investors?
            investor_share_pct = campaign.revenue_share_pct
            
            # This investor gets: (their ownership % / 100) * (investor share % / 100) * total revenue
            expected_personal_return = (investor_ownership_pct / 100) * (investor_share_pct / 100) * campaign.expected_revenue_3m
        else:
            expected_personal_return = 0
        
        total_expected += expected_personal_return
        
        # Build detailed breakdown for each campaign
        breakdown.append({
            'holding_id': holding.id,
            'campaign_id': campaign.id,
            'campaign_title': campaign.title,
            'artist_name': artist.name if artist else 'Unknown',
            'partitions_owned': holding.partitions_owned,
            'total_partitions_in_campaign': campaign.total_partitions,
            'your_ownership_pct': (holding.partitions_owned / campaign.total_partitions) * 100,
            'campaign_revenue_share_pct': campaign.revenue_share_pct,
            'campaign_expected_revenue_3m': campaign.expected_revenue_3m,
            'your_expected_return_3m': expected_personal_return,
            'campaign_status': campaign.funding_status,
            'date_invested': holding.created_at.isoformat()
        })
    
    return jsonify({
        'user_id': user_id,
        'total_expected_return_3m': total_expected,
        'number_of_campaigns': len(holdings),
        'holdings_breakdown': breakdown
    }), 200

@bp.route('/investor/earnings/<int:investor_id>', methods=['GET'])
@jwt_required()
def get_investor_earnings(investor_id):
    current_user_id = int(get_jwt_identity())
    investor_id = int(investor_id)
    
    if current_user_id != investor_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    from sqlalchemy import func
    
    # Get completed investments (money already earned)
    actual_earnings = db.session.query(
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == investor_id,
        Transaction.tx_type == 'revenue_distribution',
        Transaction.status == 'completed'
    ).scalar() or 0
    
    # Get pending investments (money waiting)
    pending_earnings = db.session.query(
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == investor_id,
        Transaction.tx_type == 'revenue_distribution',
        Transaction.status == 'pending'
    ).scalar() or 0
    
    return jsonify({
        'actual_earnings': float(actual_earnings),
        'pending_earnings': float(pending_earnings)
    }), 200

@bp.route('/investor/portfolio/<int:investor_id>', methods=['GET'])
@jwt_required()
def get_investor_portfolio(investor_id):
    """Get complete portfolio with wallet, investments, and ROI"""
    current_user_id = int(get_jwt_identity())
    investor_id = int(investor_id)
    
    if current_user_id != investor_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    from app.models import Wallet, WalletTransaction, InvestorHolding
    from sqlalchemy import func
    
    # Get wallet data
    wallet = Wallet.query.filter_by(user_id=investor_id).first()
    wallet_balance = wallet.balance if wallet else 0
    total_deposited = wallet.total_deposited if wallet else 0
    total_invested = wallet.total_invested if wallet else 0
    total_earnings = wallet.total_earnings if wallet else 0
    
    # Get holdings with campaign details
    holdings = InvestorHolding.query.filter_by(investor_id=investor_id).all()
    
    holdings_detail = []
    total_expected_returns = 0
    
    for holding in holdings:
        campaign = Campaign.query.get(holding.campaign_id)
        artist = User.query.get(campaign.artist_id)
        
        # Calculate investment amount for this campaign
        partitions_invested = Partition.query.filter_by(
            campaign_id=holding.campaign_id,
            buyer_id=investor_id
        ).all()
        investment_amount = sum(p.amount_paid for p in partitions_invested)
        
        # Calculate actual earnings from this campaign
        campaign_earnings = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == investor_id,
            Transaction.tx_type == 'revenue_distribution',
            Transaction.status == 'completed',
            Transaction.description.contains(campaign.title)
        ).scalar() or 0
        
        # Calculate expected return
        if campaign.expected_revenue_3m:
            investor_ownership_pct = (holding.partitions_owned / campaign.total_partitions) * 100
            investor_share_pct = campaign.revenue_share_pct
            expected_return = (investor_ownership_pct / 100) * (investor_share_pct / 100) * campaign.expected_revenue_3m
        else:
            expected_return = 0
        
        total_expected_returns += expected_return
        
        # Calculate ROI
        roi_percentage = ((campaign_earnings / investment_amount) * 100) if investment_amount > 0 else 0
        
        holdings_detail.append({
            'holding_id': holding.id,
            'campaign_id': campaign.id,
            'campaign_title': campaign.title,
            'artist_name': artist.name if artist else 'Unknown',
            'partitions_owned': holding.partitions_owned,
            'investment_amount': investment_amount,
            'actual_earnings': float(campaign_earnings),
            'expected_return_3m': expected_return,
            'roi_percentage': roi_percentage,
            'campaign_status': campaign.funding_status,
            'date_invested': holding.created_at.isoformat()
        })
    
    # Calculate overall ROI
    overall_roi = ((total_earnings / total_invested) * 100) if total_invested > 0 else 0
    
    # Get recent wallet transactions
    recent_transactions = []
    if wallet:
        wallet_txs = WalletTransaction.query.filter_by(
            wallet_id=wallet.id
        ).order_by(WalletTransaction.created_at.desc()).limit(10).all()
        recent_transactions = [tx.to_dict() for tx in wallet_txs]
    
    return jsonify({
        'investor_id': investor_id,
        'wallet': {
            'balance': wallet_balance,
            'total_deposited': total_deposited,
            'total_invested': total_invested,
            'total_earnings': total_earnings
        },
        'portfolio': {
            'total_invested': total_invested,
            'total_earnings': total_earnings,
            'current_value': total_invested + total_earnings,
            'overall_roi': overall_roi,
            'number_of_campaigns': len(holdings),
            'expected_returns_3m': total_expected_returns
        },
        'holdings': holdings_detail,
        'recent_transactions': recent_transactions
    }), 200

