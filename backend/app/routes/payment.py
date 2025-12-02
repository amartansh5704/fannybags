from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Wallet, WalletTransaction, RazorpayOrder
from datetime import datetime
import random
import string
import time
import hmac
import hashlib

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


# =====================================================
# =====================================================
# RAZORPAY INTEGRATION - NEW CODE ADDED BELOW
# =====================================================
# =====================================================

# Initialize Razorpay client (will be set up on first request)
razorpay_client = None


def get_razorpay_client():
    """
    Get or create Razorpay client instance.
    This is done lazily to ensure app config is available.
    """
    global razorpay_client
    if razorpay_client is None:
        import razorpay
        key_id = current_app.config.get('RAZORPAY_KEY_ID')
        key_secret = current_app.config.get('RAZORPAY_KEY_SECRET')
        
        if not key_id or not key_secret:
            raise ValueError("Razorpay API keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in config.")
        
        razorpay_client = razorpay.Client(auth=(key_id, key_secret))
    return razorpay_client


def get_or_create_wallet(user_id):
    """Get existing wallet or create new one for user"""
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0)
        db.session.add(wallet)
        db.session.commit()
    return wallet


def verify_razorpay_signature(order_id, payment_id, signature, secret):
    """
    Verify Razorpay payment signature.
    This ensures the payment response hasn't been tampered with.
    """
    message = f"{order_id}|{payment_id}"
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)


# =============================
# RAZORPAY ENDPOINTS
# =============================

@bp.route('/razorpay/create-order', methods=['POST'])
@jwt_required()
def create_razorpay_order():
    """
    Create a Razorpay order for payment.
    
    Request Body:
    {
        "amount": 1000,
        "payment_type": "wallet_deposit"
    }
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        data = request.get_json()
        amount = data.get('amount')
        payment_type = data.get('payment_type', 'wallet_deposit')
        
        # Validate amount
        if not amount:
            return jsonify({'success': False, 'error': 'Amount is required'}), 400
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'Invalid amount format'}), 400
        
        if amount <= 0:
            return jsonify({'success': False, 'error': 'Amount must be greater than 0'}), 400
        
        if amount < 1:
            return jsonify({'success': False, 'error': 'Minimum amount is ₹1'}), 400
        
        if amount > 500000:
            return jsonify({'success': False, 'error': 'Maximum amount is ₹5,00,000'}), 400
        
        # Get Razorpay client
        client = get_razorpay_client()
        
        # Create order with Razorpay (amount in paise)
        order_data = {
            'amount': int(amount * 100),
            'currency': current_app.config.get('RAZORPAY_CURRENCY', 'INR'),
            'receipt': f'rcpt_{user_id}_{int(datetime.utcnow().timestamp())}',
            'notes': {
                'user_id': str(user_id),
                'user_email': user.email,
                'payment_type': payment_type
            }
        }
        
        razorpay_order = client.order.create(data=order_data)
        
        # Save order to database
        db_order = RazorpayOrder(
            user_id=user_id,
            razorpay_order_id=razorpay_order['id'],
            amount=amount,
            currency=order_data['currency'],
            payment_type=payment_type,
            status='created',
            razorpay_response=razorpay_order
        )
        db.session.add(db_order)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'data': {
                'order_id': razorpay_order['id'],
                'amount': amount,
                'amount_in_paise': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'key_id': current_app.config.get('RAZORPAY_KEY_ID'),
                'db_order_id': db_order.id,
                'user_name': user.name,
                'user_email': user.email,
                'user_phone': user.phone or '',
                'company_name': current_app.config.get('RAZORPAY_COMPANY_NAME', 'FannyBags'),
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating Razorpay order: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to create order: {str(e)}'}), 500


@bp.route('/razorpay/verify', methods=['POST'])
@jwt_required()
def verify_razorpay_payment():
    """
    Verify Razorpay payment after checkout completion.
    
    Request Body:
    {
        "razorpay_order_id": "order_xxxxx",
        "razorpay_payment_id": "pay_xxxxx",
        "razorpay_signature": "signature_string"
    }
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        data = request.get_json()
        
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return jsonify({
                'success': False, 
                'error': 'Missing required payment verification fields'
            }), 400
        
        # Find the order in database
        db_order = RazorpayOrder.query.filter_by(
            razorpay_order_id=razorpay_order_id,
            user_id=user_id
        ).first()
        
        if not db_order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        if db_order.status == 'paid':
            return jsonify({
                'success': False, 
                'error': 'Payment already processed'
            }), 400
        
        # Verify signature
        key_secret = current_app.config.get('RAZORPAY_KEY_SECRET')
        is_valid = verify_razorpay_signature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            key_secret
        )
        
        if not is_valid:
            db_order.mark_as_failed('SIGNATURE_INVALID', 'Payment signature verification failed')
            db.session.commit()
            
            return jsonify({
                'success': False, 
                'error': 'Payment verification failed. Invalid signature.'
            }), 400
        
        # Signature is valid - process the payment
        wallet = get_or_create_wallet(user_id)
        balance_before = wallet.balance
        
        # Update wallet balance
        wallet.balance += db_order.amount
        wallet.total_deposited += db_order.amount
        wallet.updated_at = datetime.utcnow()
        
        # Create wallet transaction record
        wallet_transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type='deposit',
            amount=db_order.amount,
            balance_before=balance_before,
            balance_after=wallet.balance,
            description=f'Razorpay deposit of ₹{db_order.amount}',
            reference_id=razorpay_payment_id,
            reference_type='razorpay_payment',
            status='completed'
        )
        db.session.add(wallet_transaction)
        
        # Update order status
        db_order.mark_as_paid(razorpay_payment_id, razorpay_signature)
        
        # Fetch payment details from Razorpay
        try:
            client = get_razorpay_client()
            payment_details = client.payment.fetch(razorpay_payment_id)
            db_order.razorpay_response = payment_details
        except Exception as e:
            current_app.logger.warning(f"Could not fetch payment details: {e}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Payment of ₹{db_order.amount} verified successfully!',
            'data': {
                'amount': db_order.amount,
                'new_balance': wallet.balance,
                'transaction_id': wallet_transaction.id,
                'payment_id': razorpay_payment_id,
                'order_id': razorpay_order_id
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error verifying payment: {str(e)}")
        return jsonify({'success': False, 'error': f'Payment verification failed: {str(e)}'}), 500


@bp.route('/razorpay/payment-status/<order_id>', methods=['GET'])
@jwt_required()
def get_razorpay_payment_status(order_id):
    """
    Get payment status for a specific order.
    """
    try:
        user_id = get_jwt_identity()
        
        db_order = RazorpayOrder.query.filter_by(
            razorpay_order_id=order_id,
            user_id=user_id
        ).first()
        
        if not db_order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        return jsonify({
            'success': True,
            'data': db_order.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/razorpay/orders', methods=['GET'])
@jwt_required()
def get_razorpay_user_orders():
    """
    Get all payment orders for the current user.
    """
    try:
        user_id = get_jwt_identity()
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        orders = RazorpayOrder.query.filter_by(user_id=user_id).order_by(
            RazorpayOrder.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'data': {
                'orders': [order.to_dict() for order in orders.items],
                'total': orders.total,
                'pages': orders.pages,
                'current_page': page
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/razorpay/config', methods=['GET'])
def get_razorpay_config():
    """
    Get Razorpay configuration for frontend.
    """
    return jsonify({
        'success': True,
        'data': {
            'key_id': current_app.config.get('RAZORPAY_KEY_ID'),
            'currency': current_app.config.get('RAZORPAY_CURRENCY', 'INR'),
            'company_name': current_app.config.get('RAZORPAY_COMPANY_NAME', 'FannyBags'),
            'min_amount': 1,
            'max_amount': 500000
        }
    }), 200