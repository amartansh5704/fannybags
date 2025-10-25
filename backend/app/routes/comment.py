from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Comment, User, Campaign
from datetime import datetime

bp = Blueprint('comments', __name__, url_prefix='/api/campaigns')

# =============================
# POST /api/campaigns/<id>/comments
# Create a new comment
# =============================
@bp.route('/<int:campaign_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(campaign_id):
    """
    STEP-BY-STEP:
    1. Get the logged-in user's ID from the JWT token
    2. Check if the campaign exists
    3. Get the comment text from the request
    4. Create a new Comment object
    5. Save it to the database
    6. Return the new comment with author details
    """
    
    # 1. Get current user
    user_id = get_jwt_identity()
    
    # 2. Verify campaign exists
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    
    # 3. Get comment body from request
    data = request.get_json()
    body = data.get('body', '').strip()
    
    # Validate comment text
    if not body:
        return jsonify({'error': 'Comment cannot be empty'}), 400
    
    if len(body) > 1000:  # Limit comment length
        return jsonify({'error': 'Comment too long (max 1000 characters)'}), 400
    
    # 4. Create new comment
    try:
        comment = Comment(
            body=body,
            user_id=user_id,
            campaign_id=campaign_id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        # 5. Get author details to return with comment
        author = User.query.get(user_id)
        
        # 6. Return success response
        return jsonify({
            'success': True,
            'message': 'Comment posted successfully',
            'comment': {
                'id': comment.id,
                'body': comment.body,
                'created_at': comment.created_at.isoformat(),
                'user_id': comment.user_id,
                'campaign_id': comment.campaign_id,
                'author': {
                    'id': author.id,
                    'name': author.name,
                    'profile_image_url': author.profile_image_url,
                    'role': author.role,
                    'verified': author.verified if author.role == 'artist' else False
                }
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to post comment: {str(e)}'}), 500


# =============================
# GET /api/campaigns/<id>/comments
# Fetch all comments for a campaign
# =============================
@bp.route('/<int:campaign_id>/comments', methods=['GET'])
def get_comments(campaign_id):
    """
    STEP-BY-STEP:
    1. Verify campaign exists
    2. Fetch all comments for this campaign (newest first)
    3. For each comment, include author details
    4. Return as JSON array
    """
    
    # 1. Verify campaign exists
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    
    # 2. Fetch comments (newest first)
    comments = Comment.query.filter_by(
        campaign_id=campaign_id
    ).order_by(
        Comment.created_at.desc()  # Most recent comments first
    ).all()
    
    # 3. Build response with author details
    comments_data = []
    for comment in comments:
        author = User.query.get(comment.user_id)
        
        comments_data.append({
            'id': comment.id,
            'body': comment.body,
            'created_at': comment.created_at.isoformat(),
            'user_id': comment.user_id,
            'campaign_id': comment.campaign_id,
            'time_ago': get_time_ago(comment.created_at),  # Human-readable time
            'author': {
                'id': author.id,
                'name': author.name,
                'profile_image_url': author.profile_image_url or get_default_avatar(author.name),
                'role': author.role,
                'verified': author.verified if author.role == 'artist' else False
            }
        })
    
    # 4. Return response
    return jsonify({
        'success': True,
        'count': len(comments_data),
        'comments': comments_data
    }), 200


# =============================
# DELETE /api/comments/<id>
# Delete a comment (own comments only)
# =============================
@bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """
    STEP-BY-STEP:
    1. Get logged-in user
    2. Find the comment
    3. Verify ownership (users can only delete their own comments)
    4. Delete the comment
    5. Return success response
    """
    
    # 1. Get current user
    user_id = get_jwt_identity()
    
    # 2. Find comment
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    
    # 3. Verify ownership
    if comment.user_id != user_id:
        return jsonify({'error': 'You can only delete your own comments'}), 403
    
    # 4. Delete comment
    try:
        db.session.delete(comment)
        db.session.commit()
        
        # 5. Return success
        return jsonify({
            'success': True,
            'message': 'Comment deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete comment: {str(e)}'}), 500


# =============================
# HELPER FUNCTIONS
# =============================

def get_time_ago(dt):
    """
    Convert datetime to human-readable format like "2 hours ago"
    """
    now = datetime.utcnow()
    diff = now - dt
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} min ago" if minutes == 1 else f"{minutes} mins ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour ago" if hours == 1 else f"{hours} hours ago"
    elif seconds < 604800:
        days = int(seconds / 86400)
        return f"{days} day ago" if days == 1 else f"{days} days ago"
    elif seconds < 2592000:
        weeks = int(seconds / 604800)
        return f"{weeks} week ago" if weeks == 1 else f"{weeks} weeks ago"
    else:
        months = int(seconds / 2592000)
        return f"{months} month ago" if months == 1 else f"{months} months ago"


def get_default_avatar(name):
    """
    Generate a placeholder avatar URL based on user's name
    Using UI Avatars service (free)
    """
    import urllib.parse
    name_encoded = urllib.parse.quote(name)
    return f"https://ui-avatars.com/api/?name={name_encoded}&background=random&size=128"