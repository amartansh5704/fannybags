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