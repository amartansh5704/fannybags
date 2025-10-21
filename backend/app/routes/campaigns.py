from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Campaign, User, Partition, Transaction
from datetime import datetime

bp = Blueprint('campaigns', __name__, url_prefix='/api/campaigns')

@bp.route('', methods=['POST'])
@jwt_required()
def create_campaign():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'artist':
        return jsonify({'error': 'Only artists can create campaigns'}), 403
    data = request.get_json()
    required_fields = ['title', 'target_amount', 'revenue_share_pct', 'partition_price']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    total_partitions = int(data['target_amount'] / data['partition_price'])
    
    # Convert string dates to datetime objects
    start_date = None
    end_date = None
    if data.get('start_date'):
        try:
            start_date = datetime.fromisoformat(data['start_date'])
        except:
            return jsonify({'error': 'Invalid start_date format'}), 400
    if data.get('end_date'):
        try:
            end_date = datetime.fromisoformat(data['end_date'])
        except:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    campaign = Campaign(
        artist_id=user_id,
        title=data['title'],
        description=data.get('description'),
        target_amount=data['target_amount'],
        revenue_share_pct=data['revenue_share_pct'],
        partition_price=data['partition_price'],
        total_partitions=total_partitions,
        min_partitions_per_user=data.get('min_partitions_per_user', 1),
        sharing_term=data.get('sharing_term'),
        expected_streams_3m=data.get('expected_streams_3m'),
        expected_revenue_3m=data.get('expected_revenue_3m'),
        start_date=start_date,
        end_date=end_date
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify({
        'message': 'Campaign created successfully',
        'campaign_id': campaign.id,
        'title': campaign.title,
        'total_partitions': total_partitions
    }), 201

@bp.route('', methods=['GET'])
def list_campaigns():
    # Return only LIVE campaigns for the browse/explore page
    campaigns = Campaign.query.filter_by(funding_status='live').all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'target_amount': c.target_amount,
        'amount_raised': c.amount_raised,
        'revenue_share_pct': c.revenue_share_pct,
        'funding_status': c.funding_status,
        'artist_id': c.artist_id,
        'created_at': c.created_at.isoformat(),
        'start_date': c.start_date.isoformat() if c.start_date else None,
        'end_date': c.end_date.isoformat() if c.end_date else None
    } for c in campaigns]), 200


@bp.route('/my-campaigns', methods=['GET'])
@jwt_required()
def get_my_campaigns():
    # Return ALL campaigns for the current artist (including draft, live, etc.)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'artist':
        return jsonify({'error': 'Only artists can view their campaigns'}), 403
    
    campaigns = Campaign.query.filter_by(artist_id=user_id).all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'target_amount': c.target_amount,
        'amount_raised': c.amount_raised,
        'revenue_share_pct': c.revenue_share_pct,
        'partition_price': c.partition_price,
        'total_partitions': c.total_partitions,
        'funding_status': c.funding_status,
        'artist_id': c.artist_id,
        'expected_streams_3m': c.expected_streams_3m,
        'expected_revenue_3m': c.expected_revenue_3m,
        'created_at': c.created_at.isoformat(),
        'start_date': c.start_date.isoformat() if c.start_date else None,
        'end_date': c.end_date.isoformat() if c.end_date else None
    } for c in campaigns]), 200

@bp.route('/<int:campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    artist = User.query.get(campaign.artist_id)
    return jsonify({
        'id': campaign.id,
        'title': campaign.title,
        'description': campaign.description,
        'target_amount': campaign.target_amount,
        'amount_raised': campaign.amount_raised,
        'revenue_share_pct': campaign.revenue_share_pct,
        'partition_price': campaign.partition_price,
        'total_partitions': campaign.total_partitions,
        'funding_status': campaign.funding_status,
        'artist_name': artist.name if artist else 'Unknown',
        'sharing_term': campaign.sharing_term,
        'expected_streams_3m': campaign.expected_streams_3m,
        'expected_revenue_3m': campaign.expected_revenue_3m,
        'created_at': campaign.created_at.isoformat(),
        'start_date': campaign.start_date.isoformat() if campaign.start_date else None,
        'end_date': campaign.end_date.isoformat() if campaign.end_date else None
    }), 200

@bp.route('/<int:campaign_id>/publish', methods=['POST'])
@jwt_required()
def publish_campaign(campaign_id):
    user_id = int(get_jwt_identity())  # Convert string to integer
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    if campaign.artist_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    campaign.funding_status = 'live'
    db.session.commit()
    return jsonify({
        'message': 'Campaign published successfully',
        'campaign_id': campaign.id
    }), 200

from flask_jwt_extended import jwt_required, get_jwt_identity

@bp.route('/<int:campaign_id>/analytics', methods=['GET'])
@jwt_required(optional=True)  # allow public access; token optional
def get_campaign_analytics(campaign_id):
    user_id = get_jwt_identity()  # may be None
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    # Determine if caller is the artist owner (when logged in)
    is_owner = False
    if user_id is not None:
        try:
            is_owner = int(user_id) == campaign.artist_id
        except (ValueError, TypeError):
            is_owner = False

    partitions = Partition.query.filter_by(campaign_id=campaign_id, status='confirmed').all()
    total_partitions_sold = sum(p.partitions_bought for p in partitions)
    num_investors = len(set(p.buyer_id for p in partitions))

    # Return public, non-sensitive analytics for everyone.
    # If you later add sensitive fields, only include them when is_owner is True.
    return jsonify({
        'campaign_id': campaign.id,
        'title': campaign.title,
        'target_amount': campaign.target_amount,
        'amount_raised': campaign.amount_raised,
        'partitions_sold': total_partitions_sold,
        'total_partitions': campaign.total_partitions,
        'number_of_investors': num_investors,
        'progress_percent': (campaign.amount_raised / campaign.target_amount * 100) if campaign.target_amount > 0 else 0
    }), 200

@bp.route('/<int:campaign_id>/revenue/upload', methods=['POST'])
@jwt_required()
def upload_revenue(campaign_id):
    user_id = int(get_jwt_identity())  # Convert to int
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    
    if campaign.artist_id != user_id:
        return jsonify({
            'error': 'Unauthorized - only artist can upload',
            'debug': {
                'campaign_artist_id': campaign.artist_id,
                'your_user_id': user_id,
                'types': f'campaign: {type(campaign.artist_id).__name__}, user: {type(user_id).__name__}'
            }
        }), 403
    
    data = request.get_json()
    amount = data.get('amount')
    source = data.get('source', 'manual')
    
    if not amount or amount <= 0:
        return jsonify({'error': 'Valid amount is required'}), 400
    
    from app.models import RevenueEvent
    
    revenue_event = RevenueEvent(
        campaign_id=campaign_id,
        source=source,
        amount=amount,
        currency='INR',
        gross_or_net='gross',
        processed=False
    )
    
    db.session.add(revenue_event)
    db.session.commit()
    
    return jsonify({
        'message': 'Revenue recorded successfully',
        'revenue_event_id': revenue_event.id,
        'campaign_id': campaign_id,
        'amount': amount,
        'source': source,
        'created_at': revenue_event.created_at.isoformat()
    }), 201

@bp.route('/<int:campaign_id>/distribute', methods=['POST'])
@jwt_required()
def distribute_revenue(campaign_id):
    user_id = int(get_jwt_identity())
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    
    if campaign.artist_id != user_id:
        print(f"DEBUG 403: campaign.artist_id={campaign.artist_id}, user_id={user_id}, types: {type(campaign.artist_id)}, {type(user_id)}")
        return jsonify({'error': 'Unauthorized - only artist can distribute'}), 403
    
    from app.models import RevenueEvent, Distribution, InvestorHolding, Transaction
    
    unprocessed_revenue = RevenueEvent.query.filter_by(
        campaign_id=campaign_id,
        processed=False
    ).all()
    
    if not unprocessed_revenue:
        return jsonify({'error': 'No unprocessed revenue to distribute'}), 400
    
    total_revenue = sum(r.amount for r in unprocessed_revenue)
    
    platform_fee_pct = 0.05
    platform_fee = total_revenue * platform_fee_pct
    
    investor_pool = total_revenue * (campaign.revenue_share_pct / 100)
    
    holdings = InvestorHolding.query.filter_by(campaign_id=campaign_id).all()
    
    if not holdings:
        return jsonify({'error': 'No investors to distribute to'}), 400
    
    distribution_data = {}
    
    for holding in holdings:
        investor_share = (holding.partitions_owned / campaign.total_partitions) * investor_pool
        distribution_data[str(holding.investor_id)] = {
            'investor_id': holding.investor_id,
            'partitions_owned': holding.partitions_owned,
            'share_amount': investor_share
        }
    
    distribution = Distribution(
        revenue_event_id=unprocessed_revenue[0].id,
        campaign_id=campaign_id,
        total_allocated_to_investors=investor_pool,
        platform_fee=platform_fee,
        distribution_data=distribution_data,
        distributed=True  # Changed to True since we're creating transactions
    )
    
    db.session.add(distribution)
    
    # Create transactions for each investor AND update their wallet
    from app.models import Wallet, WalletTransaction
    
    for investor_id, data in distribution_data.items():
        # Create old transaction record (for backwards compatibility)
        transaction = Transaction(
            user_id=int(investor_id),
            tx_type='revenue_distribution',
            amount=data['share_amount'],
            status='completed',
            tx_reference=f'DIST_{campaign_id}_{investor_id}_{int(datetime.utcnow().timestamp())}',
            description=f'Revenue share from {campaign.title}'
        )
        db.session.add(transaction)
        
        # Update investor wallet balance and earnings
        wallet = Wallet.query.filter_by(user_id=int(investor_id)).first()
        if not wallet:
            wallet = Wallet(user_id=int(investor_id))
            db.session.add(wallet)
            db.session.flush()  # Get wallet ID
        
        balance_before = wallet.balance
        wallet.balance += data['share_amount']
        wallet.total_earnings += data['share_amount']
        wallet.updated_at = datetime.utcnow()
        
        # Create wallet transaction record
        wallet_transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type='payout',
            amount=data['share_amount'],
            balance_before=balance_before,
            balance_after=wallet.balance,
            description=f'Revenue share from {campaign.title}',
            reference_id=str(campaign_id),
            reference_type='revenue',
            status='completed'
        )
        db.session.add(wallet_transaction)
    
    # Create transaction for artist
    artist_share = total_revenue - investor_pool - platform_fee
    artist_transaction = Transaction(
        user_id=campaign.artist_id,
        tx_type='revenue_distribution',
        amount=artist_share,
        status='completed',
        tx_reference=f'DIST_{campaign_id}_ARTIST_{int(datetime.utcnow().timestamp())}',
        description=f'Artist share from {campaign.title}'
    )
    db.session.add(artist_transaction)
    
    # Mark all revenue events as processed
    for revenue in unprocessed_revenue:
        revenue.processed = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Revenue distribution completed successfully',
        'distribution_id': distribution.id,
        'total_revenue': total_revenue,
        'platform_fee': platform_fee,
        'platform_fee_pct': platform_fee_pct * 100,
        'artist_share': artist_share,
        'investor_pool': investor_pool,
        'investor_pool_pct': campaign.revenue_share_pct,
        'distribution_breakdown': distribution_data
    }), 201

@bp.route('/<int:campaign_id>/actual-revenue', methods=['GET'])
@jwt_required()
def get_campaign_actual_revenue(campaign_id):
    user_id = int(get_jwt_identity())
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    
    if campaign.artist_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    from app.models import RevenueEvent
    from sqlalchemy import func
    
    # Get total actual revenue from all revenue events for this campaign
    actual_revenue = db.session.query(
        func.sum(RevenueEvent.amount)
    ).filter(
        RevenueEvent.campaign_id == campaign_id,
        RevenueEvent.processed == True
    ).scalar() or 0
    
    return jsonify({
        'campaign_id': campaign_id,
        'actual_revenue': float(actual_revenue)
    }), 200

@bp.route('/artist/<int:artist_id>/campaigns', methods=['GET'])
@jwt_required(optional=True)  # Allow public access
def get_artist_campaigns(artist_id):
    """Get all campaigns for a specific artist (public endpoint)"""
    campaigns = Campaign.query.filter_by(artist_id=artist_id).all()
    
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'target_amount': c.target_amount,
        'amount_raised': c.amount_raised,
        'revenue_share_pct': c.revenue_share_pct,
        'partition_price': c.partition_price,
        'total_partitions': c.total_partitions,
        'funding_status': c.funding_status,
        'artist_id': c.artist_id,
        'expected_streams_3m': c.expected_streams_3m,
        'expected_revenue_3m': c.expected_revenue_3m,
        'start_date': c.start_date.isoformat() if c.start_date else None,
        'end_date': c.end_date.isoformat() if c.end_date else None,
        'created_at': c.created_at.isoformat()
    } for c in campaigns]), 200
