
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Campaign, InvestorHolding, Partition
from datetime import datetime
from werkzeug.utils import secure_filename
import os

bp = Blueprint('artist', __name__, url_prefix='/api/artist')

@bp.route('/profile/<int:artist_id>', methods=['GET'])
def get_artist_profile(artist_id):
    """Get public artist profile"""
    artist = User.query.filter_by(id=artist_id, role='artist').first()
    
    if not artist:
        return jsonify({'error': 'Artist not found'}), 404
    
    # Get artist's campaigns
    campaigns = Campaign.query.filter_by(artist_id=artist_id).all()
    
    # Calculate stats
    total_raised = sum(c.amount_raised for c in campaigns)
    live_campaigns = sum(1 for c in campaigns if c.funding_status == 'live')
    funded_campaigns = sum(1 for c in campaigns if c.funding_status == 'funded')
    
    # Get unique investors count
    all_investors = set()
    for campaign in campaigns:
        investors = db.session.query(InvestorHolding.investor_id).filter_by(campaign_id=campaign.id).all()
        all_investors.update([i[0] for i in investors])
    
    total_investors = len(all_investors)
    
    # Calculate success rate
    completed_campaigns = funded_campaigns + sum(1 for c in campaigns if c.funding_status == 'failed')
    success_rate = (funded_campaigns / completed_campaigns * 100) if completed_campaigns > 0 else 0
    
    return jsonify({
        'id': artist.id,
        'name': artist.name,
        'email': artist.email,
        'bio': artist.bio or "Passionate musician creating unique sounds",
        'profile_image_url': artist.profile_image_url,
        'location': artist.location or "India",
        'genre': artist.genre or "Independent",
        'verified': artist.verified,
        'social_links': {
            'spotify': artist.spotify_url,
            'instagram': artist.instagram_url,
            'youtube': artist.youtube_url,
            'twitter': artist.twitter_url
        },
        'stats': {
            'total_raised': total_raised,
            'total_investors': total_investors,
            'live_campaigns': live_campaigns,
            'funded_campaigns': funded_campaigns,
            'total_campaigns': len(campaigns),
            'success_rate': round(success_rate, 1)
        },
        'joined_date': artist.created_at.isoformat() if artist.created_at else None,
        'campaigns': [{
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'artwork_url': c.artwork_url,
            'target_amount': c.target_amount,
            'amount_raised': c.amount_raised,
            'revenue_share_pct': c.revenue_share_pct,
            'partition_price': c.partition_price,
            'funding_status': c.funding_status,
            'progress_percentage': (c.amount_raised / c.target_amount * 100) if c.target_amount > 0 else 0
        } for c in campaigns]
    }), 200

@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_my_profile():
    """Get current artist's own profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'artist':
        return jsonify({'error': 'Not an artist account'}), 403
    
    return get_artist_profile(user_id)

@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_artist_profile():
    """Update artist profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'artist':
        return jsonify({'error': 'Not an artist account'}), 403
    
    data = request.get_json()
    
    # Update allowed fields
    if 'bio' in data:
        user.bio = data['bio']
    if 'location' in data:
        user.location = data['location']
    if 'genre' in data:
        user.genre = data['genre']
    if 'spotify_url' in data:
        user.spotify_url = data['spotify_url']
    if 'instagram_url' in data:
        user.instagram_url = data['instagram_url']
    if 'youtube_url' in data:
        user.youtube_url = data['youtube_url']
    if 'twitter_url' in data:
        user.twitter_url = data['twitter_url']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'profile': {
            'bio': user.bio,
            'location': user.location,
            'genre': user.genre,
            'social_links': {
                'spotify': user.spotify_url,
                'instagram': user.instagram_url,
                'youtube': user.youtube_url,
                'twitter': user.twitter_url
            }
        }
    }), 200

@bp.route('/profile/upload-image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    """Upload artist profile image"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'artist':
        return jsonify({'error': 'Not an artist account'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check file extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type'}), 400
    
    # Create safe filename
    filename = secure_filename(file.filename)
    timestamp = int(datetime.utcnow().timestamp())
    filename = f"artist_{user_id}_{timestamp}_{filename}"
    
    # Save file
    upload_folder = os.path.join('uploads', 'profiles')
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    
    # Update user profile
    user.profile_image_url = f'/uploads/profiles/{filename}'
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Profile image uploaded successfully',
        'profile_image_url': user.profile_image_url
    }), 200