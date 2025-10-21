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

@bp.route('/predict-revenue', methods=['POST'])
def predict_revenue():
    """
    Realistic AI predictor for campaign revenue
    Uses conservative but achievable estimates based on Indian music market
    """
    import time
    import random
    import math
    
    data = request.get_json()
    
    # Input parameters
    genre = data.get('genre', 'pop').lower()
    marketing_budget = float(data.get('marketing_budget', 10000))
    video_budget = float(data.get('video_budget', 10000))
    artist_followers = int(data.get('artist_followers', 5000))
    campaign_duration = int(data.get('campaign_duration', 3))  # months
    viral_factor = data.get('viral_factor', 'medium')  # low, medium, high
    
    total_investment = marketing_budget + video_budget
    
    # Simulate AI "processing"
    time.sleep(1.5)
    
    # Genre multipliers (Indian market focus)
    genre_multipliers = {
        'dhh': 1.4,      # DHH is hot right now
        'hip-hop': 1.4,
        'rap': 1.4,
        'indie': 1.1,
        'pop': 1.2,
        'indie pop': 1.25,
        'electronic': 0.9,
        'rock': 0.85,
        'classical': 0.7,
        'bollywood': 1.5,
        'punjabi': 1.45
    }
    
    genre_factor = genre_multipliers.get(genre, 1.0)
    
    # Viral probability multipliers
    viral_multipliers = {
        'low': 0.7,
        'medium': 1.0,
        'high': 1.5,
        'viral': 2.5  # "Fatega" factor
    }
    viral_mult = viral_multipliers.get(viral_factor, 1.0)
    
    # REALISTIC BASE CALCULATION
    # Marketing effectiveness: ₹1 = 20-30 streams (with good targeting)
    marketing_effectiveness = 25  # streams per rupee spent
    
    # Follower boost: Every 1000 followers = 10% boost, capped at 200%
    follower_boost = min(2.0, 1 + (artist_followers / 10000))
    
    # Video quality boost (better video = more shares)
    video_quality_boost = 1 + (video_budget / 20000)  # Up to 1.5x for ₹10k video
    
    # Calculate base streams (3 months)
    base_streams = marketing_budget * marketing_effectiveness * genre_factor * follower_boost * video_quality_boost * viral_mult
    
    # Platform distribution (Indian market reality)
    # Platform distribution (REAL Indian market - Spotify + YouTube dominate)
    youtube_views = int(base_streams * 0.50)     # 50% YouTube (FREE = KING in India)
    spotify_streams = int(base_streams * 0.40)   # 40% Spotify (most popular premium)
    other_streams = int(base_streams * 0.08)     # 8% Others (JioSaavn, Gaana, Wynk)
    apple_streams = int(base_streams * 0.02)     # 2% Apple Music (very rare)     # 7% Others
    
    # Add organic growth from followers
    organic_spotify = int(artist_followers * 3 * campaign_duration)  # Each follower = 3 streams/month
    organic_youtube = int(artist_followers * 5 * campaign_duration)   # More YouTube engagement
    
    spotify_streams += organic_spotify
    youtube_views += organic_youtube
    
    # Reels/Shorts potential (based on video budget and genre)
    reel_base = (video_budget / 100) * genre_factor * viral_mult
    reels_uses = int(reel_base * random.uniform(0.8, 1.2))  # Add some randomness
    
    # Revenue calculations (₹) - Indian market rates
    spotify_rate = 0.046      # ₹ per stream
    apple_rate = 0.25         # ₹ per stream (high rate but almost no users)
    # YouTube revenue (REALISTIC Indian music CPM)
# Net CPM = After YouTube's 45% cut + accounting for monetization rate

# Base CPM depends on audience geography
    indian_cpm = 60   # ₹60/1000 for Indian audience (conservative)
    global_cpm = 120  # ₹120/1000 if international audience

# Marketing budget determines reach quality
# Higher budget = better targeting = more global audience mix
    if marketing_budget >= 30000:
    # Big budget: 30% international, 70% Indian
        effective_cpm = (indian_cpm * 0.70) + (global_cpm * 0.30)  # ~₹78
    elif marketing_budget >= 15000:
    # Medium budget: 15% international, 85% Indian
        effective_cpm = (indian_cpm * 0.85) + (global_cpm * 0.15)  # ~₹69
    else:
    # Small budget: mostly Indian audience
        effective_cpm = (indian_cpm * 0.95) + (global_cpm * 0.05)  # ~₹63

# Genre boost (some genres travel better internationally)
    if genre in ['dhh', 'hip-hop', 'rap']:
        effective_cpm *= 1.1  # DHH has global appeal
    elif genre in ['bollywood', 'punjabi']:
        effective_cpm *= 1.15  # Very popular globally

# Viral factor (viral videos get better ad placements)
    if viral_factor == 'viral':
        effective_cpm *= 1.2  # Better retention = better ads
    elif viral_factor == 'high':
        effective_cpm *= 1.1

# Monetization rate (not all views are monetized)
    monetization_rate = 0.85  # 85% of views have ads (ad blockers, etc.)
    monetized_views = youtube_views * monetization_rate

# Calculate revenue
    youtube_revenue = (monetized_views / 1000) * effective_cpm
    other_rate = 0.03         # ₹ per stream (JioSaavn, Gaana, Wynk average)
    reel_rate = 0.05          # ₹ per reel use (audio)
    
    # Calculate revenues
    # Calculate revenues
    spotify_revenue = spotify_streams * spotify_rate
    apple_revenue = apple_streams * apple_rate
    other_revenue = other_streams * other_rate
    reels_revenue = reels_uses * reel_rate
    
    # Sync licensing (VERY RARE for indie artists)
# Only high-quality videos with good marketing have a chance
    sync_deals = 0
    sync_revenue = 0

# Need minimum thresholds to even have a chance
    if marketing_budget >= 20000 and video_budget >= 15000:
        sync_base_prob = 0.02  # 2% base chance (very low)
    
    # Follower boost (need decent following)
        sync_follower_boost = 0.01 if artist_followers > 50000 else 0
    
    # Viral boost (viral songs get noticed)
        sync_viral_boost = 0.03 if viral_factor == 'viral' else 0.01 if viral_factor == 'high' else 0
    
        sync_probability = sync_base_prob + sync_follower_boost + sync_viral_boost
    
    # Roll the dice
        if random.random() < sync_probability:
        # Small indie sync deals: ₹2000-8000 (realistic)
            sync_deals = 1  # Usually just 1 deal
            sync_revenue = random.choice([2000, 3000, 5000, 8000])  # Fixed realistic amounts
    elif marketing_budget >= 50000:  # Big budget might get lucky
        if random.random() < 0.10:  # 10% chance
            sync_deals = 1
            sync_revenue = random.choice([5000, 10000, 15000])  # Bigger deal
    
    # Merchandise (REALISTIC - based on follower base, not streams)
# 10k followers = 2-3 merch, 50k = 5-10, 100k = 15-20
    merch_base = int((artist_followers / 10000) * 2)  # Base: 2 sales per 10k followers
    merch_viral_boost = 1.5 if viral_factor == 'viral' else 1.0  # Viral songs sell more merch
    merch_random = random.uniform(0.8, 1.2)  # Add some randomness
    merch_sales = max(0, int(merch_base * merch_viral_boost * merch_random))
    merch_sales = min(merch_sales, 50)  # Cap at 50 for realistic numbers
    merch_revenue = merch_sales * 800  # ₹800 per item
    
    # Live shows (if artist has good following)
    show_revenue = 0
    if artist_followers > 30000:
        shows = campaign_duration  # 1 show per month
        show_revenue = shows * (5000 + (artist_followers / 10))  # Base + follower bonus
    
    # Total revenues
    total_streaming = spotify_revenue + apple_revenue + youtube_revenue + other_revenue
    total_additional = reels_revenue + sync_revenue + merch_revenue + show_revenue
    gross_revenue_3m = total_streaming + total_additional
    
    # 6-month projection (with growth momentum)
    growth_factor = 2.2 if viral_factor == 'high' else 1.8
    gross_revenue_6m = gross_revenue_3m * growth_factor
    
    # 12-month projection (steady state)
    gross_revenue_12m = gross_revenue_6m * 1.8
    
    # Calculate returns
    net_revenue_3m = gross_revenue_3m - total_investment
    roi_percentage = (net_revenue_3m / total_investment * 100) if total_investment > 0 else 0
    
    # Break-even calculation
    total_streams = spotify_streams + apple_streams + youtube_views + other_streams
    avg_revenue_per_stream = gross_revenue_3m / total_streams if total_streams > 0 else 0.05
    breakeven_streams = int(total_investment / avg_revenue_per_stream) if avg_revenue_per_stream > 0 else 0
    
    # Confidence score (based on multiple factors)
    confidence_base = 65
    confidence_marketing = min(15, marketing_budget / 1000)  # +1.5% per ₹1000
    confidence_video = min(10, video_budget / 1000)         # +1% per ₹1000  
    confidence_followers = min(10, artist_followers / 2000)  # +0.5% per 1000 followers
    confidence_score = min(95, confidence_base + confidence_marketing + confidence_video + confidence_followers)
    
    # Investor calculations
    # Investor pool (dynamic based on campaign revenue share)
    revenue_share_pct = float(data.get('revenue_share_pct', 40))
    revenue_share_pct = max(0.0, min(revenue_share_pct, 100.0))  # Clamp 0-100
    investor_pool_pct = revenue_share_pct  # This is the % going to investors
    
    # Return prediction response
    return jsonify({
        'success': True,
        'prediction': {
            'gross_revenue_3m': round(gross_revenue_3m, 2),
            'net_revenue_3m': round(net_revenue_3m, 2),
            'gross_revenue_6m': round(gross_revenue_6m, 2),
            'gross_revenue_12m': round(gross_revenue_12m, 2),
            'roi_percentage': round(roi_percentage, 2),
            'breakeven_streams': breakeven_streams,
            'confidence_score': round(confidence_score, 1),
            'total_streams_3m': total_streams
        },
        'breakdown': {
            'streaming': {
                'spotify': {
                    'streams': spotify_streams, 
                    'revenue': round(spotify_revenue, 2)
                },
                'apple_music': {
                    'streams': apple_streams, 
                    'revenue': round(apple_revenue, 2)
                },
                'youtube': {
                    'views': youtube_views, 
                    'revenue': round(youtube_revenue, 2)
                
                },
                'other_platforms': {
                    'streams': other_streams, 
                    'revenue': round(other_revenue, 2)
                },
                'total': round(total_streaming, 2)
            },
            'additional': {
                'reels_shorts': {
                    'uses': reels_uses, 
                    'revenue': round(reels_revenue, 2)
                },
                'sync_licensing': {
                    'deals': sync_deals,
                    'revenue': round(sync_revenue, 2)
                },
                'merchandise': {
                    'sales': merch_sales, 
                    'revenue': round(merch_revenue, 2)
                },
                'live_shows': {
                    'revenue': round(show_revenue, 2)
                },
                'total': round(total_additional, 2)
            }
        },
        'investor_returns': {
            'pool_percentage': investor_pool_pct,  # Already a percentage (0-100)
            'investor_share_3m': round(gross_revenue_3m * (investor_pool_pct / 100.0), 2),
            'investor_share_6m': round(gross_revenue_6m * (investor_pool_pct / 100.0), 2),
            'investor_share_12m': round(gross_revenue_12m * (investor_pool_pct / 100.0), 2),
            'min_investment': 1000,
            'max_investment': total_investment
},
        'investment': {
            'marketing': marketing_budget,
            'video': video_budget,
            'total': total_investment
        },
        'metadata': {
            'genre': genre,
            'genre_factor': genre_factor,
            'viral_factor': viral_factor,
            'duration_months': campaign_duration,
            'artist_followers': artist_followers,
            'processed_at': datetime.utcnow().isoformat()
        }
    }), 200