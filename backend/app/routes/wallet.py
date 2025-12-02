from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Wallet, WalletTransaction, Campaign, Partition, ArtistWithdrawal
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

        # Get investor wallet
        wallet = get_or_create_wallet(user_id)

        if wallet.balance < amount:
            return jsonify({'success': False, 'message': f'Insufficient balance. Available: ₹{wallet.balance}'}), 400

        # Get campaign
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'success': False, 'message': 'Campaign not found'}), 404

        # Deduct from investor wallet
        balance_before = wallet.balance
        wallet.balance -= amount
        wallet.total_invested += amount
        wallet.updated_at = datetime.utcnow()

        # Log investment transaction
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

        # Create Partition
        partition = Partition(
            campaign_id=campaign_id,
            buyer_id=user_id,
            partitions_bought=partitions,
            amount_paid=amount,
            status='confirmed'
        )

        # Update Investor Holdings
        from app.models import InvestorHolding
        holding = InvestorHolding.query.filter_by(
            campaign_id=campaign_id,
            investor_id=user_id
        ).first()

        if holding:
            holding.partitions_owned += partitions
        else:
            holding = InvestorHolding(
                campaign_id=campaign_id,
                investor_id=user_id,
                partitions_owned=partitions
            )
            db.session.add(holding)

        # Update ownership %
        campaign.amount_raised += amount
        total_partitions = campaign.amount_raised / campaign.partition_price if campaign.partition_price > 0 else 0

        if total_partitions > 0:
            holding.ownership_pct = (holding.partitions_owned / total_partitions) * 100

        # ------------------------------------
        # ✅ NEW: AUTO-SPLIT MONEY
        # ------------------------------------
        mv_budget = campaign.music_video_budget
        marketing_budget = campaign.marketing_budget
        artist_fee = campaign.artist_fee

        total_split = mv_budget + marketing_budget + artist_fee

        if total_split > 0:
            # Scale the % distribution based on the set budgets
            mv_cut = amount * (mv_budget / total_split)
            marketing_cut = amount * (marketing_budget / total_split)
            artist_cut = amount * (artist_fee / total_split)
        else:
            # Default: send everything to artist
            mv_cut = 0
            marketing_cut = 0
            artist_cut = amount

        # ------------------------------------
        # ✅ SEND ARTIST FEE TO ARTIST WALLET
        # ------------------------------------
        artist_wallet = get_or_create_wallet(campaign.artist_id)
        artist_balance_before = artist_wallet.balance

        artist_wallet.balance += artist_cut
        artist_wallet.total_earnings += artist_cut
        artist_wallet.updated_at = datetime.utcnow()

        artist_tx = WalletTransaction(
            wallet_id=artist_wallet.id,
            transaction_type='artist_fee',
            amount=artist_cut,
            balance_before=artist_balance_before,
            balance_after=artist_wallet.balance,
            description=f'Artist fee from investment in {campaign.title}',
            status='completed'
        )

        db.session.add(artist_tx)
        # ------------------------------------

        db.session.add(transaction)
        db.session.add(partition)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Successfully invested ₹{amount}',
            'split': {
                'music_video': round(mv_cut, 2),
                'marketing': round(marketing_cut, 2),
                'artist_fee': round(artist_cut, 2)
            },
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

    
@bp.route('/artist/withdraw', methods=['POST'])
@jwt_required()
def artist_withdraw():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != 'artist':
        return jsonify({'error': 'Only artists can withdraw'}), 403

    data = request.get_json()
    amount = data.get('amount')

    if not amount or amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400

    wallet = get_or_create_wallet(user_id)

    if wallet.balance < amount:
        return jsonify({'error': 'Insufficient wallet balance'}), 400

    # Deduct
    balance_before = wallet.balance
    wallet.balance -= amount
    wallet.total_withdrawn += amount
    wallet.updated_at = datetime.utcnow()

    # Save request
    from app.models import ArtistWithdrawal
    withdrawal = ArtistWithdrawal(
        artist_id=user_id,
        amount=amount,
        status='pending'
    )

    # Save wallet transaction
    tx = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type='artist_withdrawal',
        amount=amount,
        balance_before=balance_before,
        balance_after=wallet.balance,
        description='Artist payout withdrawal request',
        status='pending'
    )

    db.session.add(withdrawal)
    db.session.add(tx)
    db.session.commit()

    return jsonify({
        'message': 'Withdrawal request submitted',
        'withdrawal_id': withdrawal.id
    }), 200

# ================================
# 🚨 ADMIN: VIEW ALL WITHDRAW REQUESTS
# ================================
@bp.route('/admin/withdrawals', methods=['GET'])
@jwt_required()
def admin_get_withdrawals():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    withdrawals = ArtistWithdrawal.query.order_by(ArtistWithdrawal.created_at.desc()).all()

    result = []
    for w in withdrawals:
        artist = User.query.get(w.artist_id)
        result.append({
            "id": w.id,
            "artist_id": w.artist_id,
            "artist_name": artist.name if artist else "Unknown",
            "amount": w.amount,
            "status": w.status,
            "created_at": w.created_at.isoformat()
        })

    return jsonify({"withdrawals": result}), 200


# ================================
# 🚨 ADMIN: APPROVE WITHDRAWAL
# ================================
@bp.route('/admin/withdrawals/<int:withdrawal_id>/approve', methods=['POST'])
@jwt_required()
def admin_approve_withdrawal(withdrawal_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    from app.models import ArtistWithdrawal

    withdrawal = ArtistWithdrawal.query.get(withdrawal_id)
    if not withdrawal:
        return jsonify({'error': 'Withdrawal request not found'}), 404

    withdrawal.status = "approved"
    db.session.commit()

    return jsonify({"message": "Withdrawal approved"}), 200


# ================================
# 🚨 ADMIN: REJECT WITHDRAWAL
# ================================
@bp.route('/admin/withdrawals/<int:withdrawal_id>/reject', methods=['POST'])
@jwt_required()
def admin_reject_withdrawal(withdrawal_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    from app.models import ArtistWithdrawal

    withdrawal = ArtistWithdrawal.query.get(withdrawal_id)
    if not withdrawal:
        return jsonify({'error': 'Withdrawal request not found'}), 404

    withdrawal.status = "rejected"
    db.session.commit()

    return jsonify({"message": "Withdrawal rejected"}), 200



