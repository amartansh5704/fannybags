from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Wallet, WalletTransaction
from datetime import datetime
import random
import string
import time

bp = Blueprint('payments', __name__, url_prefix='/api/payments')

# =============================
# MOCK PAYMENT CONFIGURATION
# =============================

# Set this to True for mock mode, False when integrating real gateway
USE_MOCK_GATEWAY = True

# Mock payment success rate (95% success for testing)
MOCK_SUCCESS_RATE = 0.95

# Simulated processing time (seconds)
MOCK_PROCESSING_TIME = 2.0


# =============================
# HELPER FUNCTIONS
# =============================

def generate_transaction_id(prefix='TXN'):
    """
    Generate a realistic-looking transaction ID
    Format: TXN_YYYYMMDDHHMMSS_RANDOM6
    Example: TXN_20240115143022_A3F9K2
    """
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}_{timestamp}_{random_suffix}"


def simulate_payment_processing():
    """
    Simulate payment gateway processing time
    In real gateway, this is where API call happens
    """
    time.sleep(MOCK_PROCESSING_TIME)
    
    # Simulate occasional failures (5% failure rate)
    if random.random() > MOCK_SUCCESS_RATE:
        return False, "Payment declined by bank"
    
    return True, "Payment successful"


# =============================
# DEPOSIT FLOW
# =============================

@bp.route('/deposit/initiate', methods=['POST'])
@jwt_required()
def initiate_deposit():
    """
    STEP 1: Initiate a deposit transaction
    
    This endpoint:
    1. Validates the deposit amount
    2. Creates a pending transaction record
    3. Returns transaction ID for processing
    
    In REAL gateway mode, this would:
    - Create an order with Razorpay/Stripe
    - Return payment page URL or checkout session ID
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get deposit amount from request
    data = request.get_json()
    amount = data.get('amount')
    
    # Validate amount
    if not amount:
        return jsonify({'error': 'Amount is required'}), 400
    
    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid amount format'}), 400
    
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400
    
    if amount > 100000:  # Max deposit limit
        return jsonify({'error': 'Maximum deposit amount is ₹1,00,000'}), 400
    
    if amount < 100:  # Min deposit limit
        return jsonify({'error': 'Minimum deposit amount is ₹100'}), 400
    
    # Get or create wallet
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0)
        db.session.add(wallet)
        db.session.flush()  # Get wallet ID
    
    # Generate transaction ID
    transaction_id = generate_transaction_id('DEP')
    
    # Create pending transaction record
    transaction = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type='deposit',
        amount=amount,
        balance_before=wallet.balance,
        balance_after=wallet.balance,  # Not updated yet
        description=f'Wallet deposit of ₹{amount}',
        reference_id=transaction_id,
        reference_type='payment_gateway',
        status='pending'
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    # Return transaction details
    return jsonify({
        'success': True,
        'message': 'Deposit initiated',
        'data': {
            'transaction_id': transaction_id,
            'amount': amount,
            'wallet_transaction_id': transaction.id,
            'status': 'pending',
            'gateway_mode': 'mock' if USE_MOCK_GATEWAY else 'live'
        }
    }), 201


@bp.route('/deposit/process', methods=['POST'])
@jwt_required()
def process_deposit():
    """
    STEP 2: Process the payment
    
    In MOCK mode:
    - Simulates payment gateway processing
    - Updates wallet balance
    - Marks transaction as completed
    
    In REAL gateway mode, this would:
    - Verify payment signature from Razorpay/Stripe webhook
    - Confirm payment status
    - Update wallet only if payment confirmed
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get transaction ID
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    
    if not transaction_id:
        return jsonify({'error': 'Transaction ID is required'}), 400
    
    # Find the pending transaction
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    
    transaction = WalletTransaction.query.filter_by(
        wallet_id=wallet.id,
        reference_id=transaction_id,
        status='pending'
    ).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found or already processed'}), 404
    
    # MOCK GATEWAY: Simulate payment processing
    if USE_MOCK_GATEWAY:
        success, message = simulate_payment_processing()
        
        if not success:
            # Mark transaction as failed
            transaction.status = 'failed'
            transaction.description += f' - {message}'
            db.session.commit()
            
            return jsonify({
                'success': False,
                'message': message,
                'data': {
                    'transaction_id': transaction_id,
                    'status': 'failed'
                }
            }), 400
    
    # PAYMENT SUCCESSFUL - Update wallet
    try:
        # Update wallet balance
        wallet.balance += transaction.amount
        wallet.total_deposited += transaction.amount
        wallet.updated_at = datetime.utcnow()
        
        # Update transaction record
        transaction.balance_after = wallet.balance
        transaction.status = 'completed'
        transaction.created_at = datetime.utcnow()  # Update timestamp to processing time
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Deposit successful! ₹{:.2f} added to your wallet'.format(transaction.amount),
            'data': {
                'transaction_id': transaction_id,
                'amount': float(transaction.amount),
                'new_balance': float(wallet.balance),
                'status': 'completed',
                'timestamp': transaction.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        
        # Mark transaction as failed
        transaction.status = 'failed'
        transaction.description += f' - Error: {str(e)}'
        db.session.commit()
        
        return jsonify({
            'success': False,
            'message': f'Payment processing failed: {str(e)}',
            'data': {
                'transaction_id': transaction_id,
                'status': 'failed'
            }
        }), 500


@bp.route('/deposit/verify', methods=['POST'])
@jwt_required()
def verify_deposit():
    """
    STEP 3: Verify payment status
    
    This endpoint allows frontend to check transaction status
    Useful for handling async payment confirmations
    
    In REAL gateway mode:
    - Query Razorpay/Stripe API for payment status
    - Return confirmed status
    """
    user_id = get_jwt_identity()
    
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    
    if not transaction_id:
        return jsonify({'error': 'Transaction ID is required'}), 400
    
    # Find wallet
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    
    # Find transaction
    transaction = WalletTransaction.query.filter_by(
        wallet_id=wallet.id,
        reference_id=transaction_id
    ).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    return jsonify({
        'success': True,
        'data': {
            'transaction_id': transaction_id,
            'amount': float(transaction.amount),
            'status': transaction.status,
            'balance_before': float(transaction.balance_before),
            'balance_after': float(transaction.balance_after),
            'created_at': transaction.created_at.isoformat()
        }
    }), 200


@bp.route('/methods', methods=['GET'])
def get_payment_methods():
    """
    Get available payment methods
    
    In MOCK mode: Returns simulated methods
    In REAL mode: Would return actual Razorpay/Stripe supported methods
    """
    if USE_MOCK_GATEWAY:
        return jsonify({
            'success': True,
            'mode': 'mock',
            'message': 'Mock payment gateway active (for testing)',
            'methods': [
                {
                    'id': 'upi',
                    'name': 'UPI',
                    'icon': '💳',
                    'enabled': True
                },
                {
                    'id': 'card',
                    'name': 'Credit/Debit Card',
                    'icon': '💳',
                    'enabled': True
                },
                {
                    'id': 'netbanking',
                    'name': 'Net Banking',
                    'icon': '🏦',
                    'enabled': True
                },
                {
                    'id': 'wallet',
                    'name': 'Mobile Wallets',
                    'icon': '📱',
                    'enabled': True
                }
            ]
        }), 200
    else:
        # In real mode, would query Razorpay/Stripe for available methods
        return jsonify({
            'success': True,
            'mode': 'live',
            'message': 'Live payment gateway active',
            'methods': []
        }), 200


# =============================
# CONFIGURATION ENDPOINT (Admin only - for future use)
# =============================

@bp.route('/config', methods=['GET'])
@jwt_required()
def get_payment_config():
    """
    Get payment gateway configuration
    Returns whether mock or live mode is active
    """
    return jsonify({
        'success': True,
        'config': {
            'mode': 'mock' if USE_MOCK_GATEWAY else 'live',
            'min_deposit': 100,
            'max_deposit': 100000,
            'currency': 'INR',
            'processing_time_seconds': MOCK_PROCESSING_TIME if USE_MOCK_GATEWAY else None
        }
    }), 200