from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Wallet, WalletTransaction, Campaign, Partition
from datetime import datetime

bp = Blueprint('wallet', __name__, url_prefix='/api/wallet')

def get_or_create_wallet(user_id):
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id)
        db.session.add(wallet)
        db.session.commit()
    return wallet

@bp.route('/balance', methods=['GET'])
@jwt_required()
def get_balance():
    try:
        user_id = get_jwt_identity()
        wallet = get_or_create_wallet(user_id)
        return jsonify({'success': True, 'message': 'Balance retrieved', 'data': wallet.to_dict()}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@bp.route('/deposit', methods=['POST'])
@jwt_required()
def deposit():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')
        
        if not amount or amount <= 0:
            return jsonify({'success': False, 'message': 'Invalid amount'}), 400
        
        wallet = get_or_create_wallet(user_id)
        balance_before = wallet.balance
        
        wallet.balance += amount
        wallet.total_deposited += amount
        wallet.updated_at = datetime.utcnow()
        
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type='deposit',
            amount=amount,
            balance_before=balance_before,
            balance_after=wallet.balance,
            description=f'Deposit via {data.get("payment_method", "card")}',
            status='completed'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully deposited ₹{amount}',
            'data': {'wallet': wallet.to_dict(), 'transaction': transaction.to_dict()}
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Deposit failed: {str(e)}'}), 500

@bp.route('/withdraw', methods=['POST'])
@jwt_required()
def withdraw():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')
        
        if not amount or amount <= 0:
            return jsonify({'success': False, 'message': 'Invalid amount'}), 400
        
        wallet = get_or_create_wallet(user_id)
        
        if wallet.balance < amount:
            return jsonify({'success': False, 'message': f'Insufficient balance. Available: ₹{wallet.balance}'}), 400
        
        balance_before = wallet.balance
        wallet.balance -= amount
        wallet.total_withdrawn += amount
        wallet.updated_at = datetime.utcnow()
        
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type='withdraw',
            amount=amount,
            balance_before=balance_before,
            balance_after=wallet.balance,
            description=f'Withdrawal to {data.get("bank_account", "primary")}',
            status='completed'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully withdrew ₹{amount}',
            'data': {'wallet': wallet.to_dict(), 'transaction': transaction.to_dict()}
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Withdrawal failed: {str(e)}'}), 500

@bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        user_id = get_jwt_identity()
        wallet = get_or_create_wallet(user_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        transactions = WalletTransaction.query.filter_by(wallet_id=wallet.id).order_by(
            WalletTransaction.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'message': 'Transactions retrieved',
            'data': {
                'transactions': [t.to_dict() for t in transactions.items],
                'total': transactions.total,
                'pages': transactions.pages,
                'current_page': page
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@bp.route('/invest', methods=['POST'])
@jwt_required()
def invest_from_wallet():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        campaign_id = data.get('campaign_id')
        amount = data.get('amount')
        
        if not campaign_id or not amount or amount <= 0:
            return jsonify({'success': False, 'message': 'Invalid investment details'}), 400
        
        wallet = get_or_create_wallet(user_id)
        
        if wallet.balance < amount:
            return jsonify({'success': False, 'message': f'Insufficient balance. Available: ₹{wallet.balance}'}), 400
        
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'success': False, 'message': 'Campaign not found'}), 404
        
        balance_before = wallet.balance
        wallet.balance -= amount
        wallet.total_invested += amount
        wallet.updated_at = datetime.utcnow()
        
        # Create wallet transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type='investment',
            amount=amount,
            balance_before=balance_before,
            balance_after=wallet.balance,
            description=f'Investment in {campaign.title}',
            reference_id=str(campaign_id),
            reference_type='campaign',
            status='completed'
        )
        
        # Calculate partitions
        partitions = int(amount / campaign.partition_price)
        
        # Create Partition record
        partition = Partition(
            campaign_id=campaign_id,
            buyer_id=user_id,
            partitions_bought=partitions,
            amount_paid=amount,
            status='confirmed'
        )
        
        # Update or create InvestorHolding (CRITICAL FIX)
        from app.models import InvestorHolding
        holding = InvestorHolding.query.filter_by(
            campaign_id=campaign_id,
            investor_id=user_id
        ).first()
        
        if holding:
            # Update existing holding
            holding.partitions_owned += partitions
        else:
            # Create new holding
            holding = InvestorHolding(
                campaign_id=campaign_id,
                investor_id=user_id,
                partitions_owned=partitions
            )
            db.session.add(holding)
        
        # Calculate ownership percentage
        campaign.amount_raised += amount
        total_partitions = campaign.amount_raised / campaign.partition_price if campaign.partition_price > 0 else 0
        if total_partitions > 0:
            holding.ownership_pct = (holding.partitions_owned / total_partitions) * 100
        
        db.session.add(transaction)
        db.session.add(partition)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully invested ₹{amount}',
            'data': {
                'wallet': wallet.to_dict(),
                'transaction': transaction.to_dict(),
                'holding': {
                    'partitions': holding.partitions_owned,
                    'ownership_pct': round(holding.ownership_pct, 2) if holding.ownership_pct else 0
                }
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Investment failed: {str(e)}'}), 500