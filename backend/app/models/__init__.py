# --- FULL FILE CONTENT ---
from datetime import datetime
# Assuming 'db' is initialized in your main app factory (e.g., app/__init__.py)
# and imported here. If not, adjust the import.
from app import db # Make sure this import works based on your project structure

from werkzeug.security import generate_password_hash, check_password_hash

# --- User Model ---
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True) # Added index
    phone = db.Column(db.String(20), nullable=True) # Good, nullable is fine
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='investor', nullable=False) # Added nullable=False
    kyc_status = db.Column(db.String(20), default='pending', nullable=False) # Added nullable=False
    kyc_data = db.Column(db.JSON, nullable=True) # Good
    wallet_details = db.Column(db.JSON, nullable=True) # Good
    # Artist profile fields
    bio = db.Column(db.Text, nullable=True) # Good
    profile_image_url = db.Column(db.String(500), nullable=True) # Good
    spotify_url = db.Column(db.String(255), nullable=True) # Good
    instagram_url = db.Column(db.String(255), nullable=True) # Good
    youtube_url = db.Column(db.String(255), nullable=True) # Good
    twitter_url = db.Column(db.String(255), nullable=True) # Good
    location = db.Column(db.String(100), nullable=True) # Good
    genre = db.Column(db.String(50), nullable=True) # Good
    verified = db.Column(db.Boolean, default=False, nullable=False) # Added nullable=False
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) # Added nullable=False

    # --- ADDED/UPDATED RELATIONSHIPS ---
    campaigns = db.relationship('Campaign', backref='artist', lazy='dynamic')
    partitions = db.relationship('Partition', backref='buyer', lazy='dynamic')
    transactions = db.relationship('Transaction', backref='user', lazy='dynamic')
    wallet = db.relationship('Wallet', backref='user', uselist=False, cascade="all, delete-orphan") # Added cascade
    # This links User to Comment. Cascade ensures comments are deleted if user is deleted.
    comments = db.relationship('Comment', backref='author', lazy='dynamic', cascade="all, delete-orphan")
    # --- END RELATIONSHIPS ---

    def __repr__(self):
        return f'<User {self.email}>'

    # Add set_password and check_password methods if missing
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Add to_dict method if missing (useful for API responses)
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id, 'name': self.name, 'role': self.role,
            'profile_image_url': self.profile_image_url,
            'bio': self.bio if self.role == 'artist' else None,
            'location': self.location if self.role == 'artist' else None,
            'genre': self.genre if self.role == 'artist' else None,
            'verified': self.verified if self.role == 'artist' else None,
            'spotify_url': self.spotify_url if self.role == 'artist' else None,
            'instagram_url': self.instagram_url if self.role == 'artist' else None,
            'youtube_url': self.youtube_url if self.role == 'artist' else None,
            'twitter_url': self.twitter_url if self.role == 'artist' else None,
        }
        if include_sensitive:
            data['email'] = self.email
            data['phone'] = self.phone
            data['kyc_status'] = self.kyc_status
        return data


# --- Campaign Model ---
class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(db.Integer, primary_key=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True) # Added index
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True) # Good
    genre = db.Column(db.String(50), nullable=True, index=True) # Added index, nullable=True is fine
    audio_preview_url = db.Column(db.String(500), nullable=True) # Good
    artwork_url = db.Column(db.String(500), nullable=True) # Good
    target_amount = db.Column(db.Float, nullable=False)
    amount_raised = db.Column(db.Float, default=0, nullable=False) # Added nullable=False
    revenue_share_pct = db.Column(db.Float, nullable=False)
    partition_price = db.Column(db.Float, nullable=False)
    total_partitions = db.Column(db.Integer, nullable=True) # Made nullable, might be calculated later? If always needed, make False.
    min_partitions_per_user = db.Column(db.Integer, default=1, nullable=False) # Added nullable=False
    funding_status = db.Column(db.String(20), default='draft', nullable=False, index=True) # Added nullable=False, index
    sharing_term = db.Column(db.String(100), nullable=True) # Changed from String? If months, use Integer. Kept as String for now.
    expected_streams_3m = db.Column(db.Integer, nullable=True) # Good
    expected_revenue_3m = db.Column(db.Float, nullable=True) # Good
        # NEW — Budget splits
    music_video_budget = db.Column(db.Float, default=0)
    marketing_budget = db.Column(db.Float, default=0)
    artist_fee = db.Column(db.Float, default=0)

    # NEW — Dates
    campaign_start_date = db.Column(db.DateTime, nullable=True)
    release_date = db.Column(db.DateTime, nullable=True)
    payout_date = db.Column(db.DateTime, nullable=True)  # auto = release + 3 months

    start_date = db.Column(db.DateTime, nullable=True, index=True) # Added index
    end_date = db.Column(db.DateTime, nullable=True, index=True) # Added index
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True) # Added nullable=False, index
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False) # Added nullable=False
    is_featured = db.Column(db.Boolean, default=False, nullable=False, server_default='0', index=True) # Kept from previous step

    # --- ADDED/UPDATED RELATIONSHIPS ---
    # artist backref is defined in User
    partitions = db.relationship('Partition', backref='campaign', lazy='dynamic', cascade="all, delete-orphan")
    revenue_events = db.relationship('RevenueEvent', backref='campaign', lazy='dynamic', cascade="all, delete-orphan")
    contracts = db.relationship('Contract', backref='campaign', lazy='dynamic', cascade="all, delete-orphan") # Added Contract relationship
    distributions = db.relationship('Distribution', backref='campaign', lazy='dynamic') # Added Distribution relationship
    investor_holdings = db.relationship('InvestorHolding', backref='campaign', lazy='dynamic') # Added InvestorHolding relationship
    # This links Campaign to Comment. Cascade ensures comments are deleted if campaign is deleted.
    comments = db.relationship('Comment', backref='campaign', lazy='dynamic', cascade="all, delete-orphan")
    # --- END RELATIONSHIPS ---

    def __repr__(self):
        return f'<Campaign {self.title}>'


# --- Partition Model ---
class Partition(db.Model):
    __tablename__ = 'partitions'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False, index=True) # Added index
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True) # Added index
    partitions_bought = db.Column(db.Integer, nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    payment_transaction_id = db.Column(db.String(255), nullable=True) # Good
    status = db.Column(db.String(20), default='confirmed', nullable=False, index=True) # Added nullable=False, index
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True) # Added nullable=False, index

    def __repr__(self):
        return f'<Partition {self.id}>'


# --- RevenueEvent Model ---
class RevenueEvent(db.Model):
    __tablename__ = 'revenue_events'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False, index=True) # Added index
    source = db.Column(db.String(50), default='manual', nullable=True) # Made nullable=True, might not always know source
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='INR', nullable=False) # Added nullable=False
    gross_or_net = db.Column(db.String(10), default='gross', nullable=False) # Added nullable=False
    report_file_url = db.Column(db.String(500), nullable=True) # Good
    processed = db.Column(db.Boolean, default=False, nullable=False, index=True) # Added nullable=False, index
    processed_at = db.Column(db.DateTime, nullable=True) # Good
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) # Added nullable=False

    # Added relationship
    distributions = db.relationship('Distribution', backref='revenue_event', lazy='dynamic')

    def __repr__(self):
        return f'<RevenueEvent {self.id}>'


# --- Distribution Model ---
class Distribution(db.Model):
    __tablename__ = 'distributions'

    id = db.Column(db.Integer, primary_key=True)
    revenue_event_id = db.Column(db.Integer, db.ForeignKey('revenue_events.id'), nullable=False, index=True) # Added index
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False, index=True) # Added index
    total_allocated_to_investors = db.Column(db.Float, nullable=False)
    platform_fee = db.Column(db.Float, nullable=False)
    distribution_data = db.Column(db.JSON, nullable=True) # Good
    distributed = db.Column(db.Boolean, default=False, nullable=False, index=True) # Added nullable=False, index
    distributed_at = db.Column(db.DateTime, nullable=True) # Good
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) # Added nullable=False

    def __repr__(self):
        return f'<Distribution {self.id}>'


# --- Transaction Model ---
class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True) # Added index
    tx_type = db.Column(db.String(50), nullable=True, index=True) # Made nullable, index
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False, index=True) # Added nullable=False, index
    tx_reference = db.Column(db.String(255), nullable=True, unique=True) # Added unique=True
    description = db.Column(db.Text, nullable=True) # Good
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True) # Added nullable=False, index

    def __repr__(self):
        return f'<Transaction {self.id}>'


# --- InvestorHolding Model ---
class InvestorHolding(db.Model):
    __tablename__ = 'investor_holdings'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False, index=True) # Added index
    investor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True) # Added index
    partitions_owned = db.Column(db.Integer, nullable=False)
    ownership_pct = db.Column(db.Float, nullable=True) # Good
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) # Added nullable=False

    # Added UniqueConstraint
    __table_args__ = (db.UniqueConstraint('investor_id', 'campaign_id', name='_investor_campaign_uc'),)

    def __repr__(self):
        return f'<InvestorHolding {self.id}>'


# --- Contract Model ---
class Contract(db.Model):
    __tablename__ = 'contracts'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False, index=True) # Added index
    file_url = db.Column(db.String(500), nullable=True) # Good
    terms_text = db.Column(db.Text, nullable=True) # Good
    signature_data = db.Column(db.JSON, nullable=True) # Good
    signed_at = db.Column(db.DateTime, nullable=True) # Good
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) # Added nullable=False

    def __repr__(self):
        return f'<Contract {self.id}>'


# --- Wallet Model ---
class Wallet(db.Model):
    __tablename__ = 'wallets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0, nullable=False)
    total_deposited = db.Column(db.Float, default=0.0, nullable=False)
    total_withdrawn = db.Column(db.Float, default=0.0, nullable=False)
    total_invested = db.Column(db.Float, default=0.0, nullable=False)
    total_earnings = db.Column(db.Float, default=0.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) # Added nullable=False
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False) # Added nullable=False

    # Added Relationship
    transactions = db.relationship('WalletTransaction', backref='wallet', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id, 'user_id': self.user_id, 'balance': round(self.balance, 2),
            'total_deposited': round(self.total_deposited, 2), 'total_withdrawn': round(self.total_withdrawn, 2),
            'total_invested': round(self.total_invested, 2), 'total_earnings': round(self.total_earnings, 2),
            'created_at': self.created_at.isoformat(), 'updated_at': self.updated_at.isoformat()
        }


# --- WalletTransaction Model ---
class WalletTransaction(db.Model):
    __tablename__ = 'wallet_transactions'

    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False, index=True) # Added index
    transaction_type = db.Column(db.String(20), nullable=False, index=True) # Added index
    amount = db.Column(db.Float, nullable=False)
    balance_before = db.Column(db.Float, nullable=False)
    balance_after = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255), nullable=True) # Good
    reference_id = db.Column(db.String(100), nullable=True, index=True) # Added index
    reference_type = db.Column(db.String(50), nullable=True, index=True) # Added index
    status = db.Column(db.String(20), default='completed', nullable=False, index=True) # Added nullable=False, index
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True) # Added nullable=False, index

    def to_dict(self):
        return {
            'id': self.id, 'wallet_id': self.wallet_id, 'transaction_type': self.transaction_type,
            'amount': round(self.amount, 2), 'balance_before': round(self.balance_before, 2),
            'balance_after': round(self.balance_after, 2), 'description': self.description,
            'reference_id': self.reference_id, 'reference_type': self.reference_type,
            'status': self.status, 'created_at': self.created_at.isoformat()
        }


# --- NEW: Comment Model ---
# This defines the structure for storing comments in the database.
class Comment(db.Model):
    __tablename__ = 'comments' # The name of the table in your database

    # Basic columns for a comment:
    id = db.Column(db.Integer, primary_key=True) # Unique ID for each comment
    body = db.Column(db.Text, nullable=False) # The actual text content, cannot be empty
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True) # Timestamp, automatically set

    # Foreign Keys: These link the comment to a specific User and Campaign
    # `ForeignKey('users.id')` links this to the `id` column in the `users` table.
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    # `ForeignKey('campaigns.id')` links this to the `id` column in the `campaigns` table.
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False, index=True)

    # Relationships are handled by the 'backref' attributes in the User and Campaign models.
    # This means you can access `comment.author` to get the User object and
    # `comment.campaign` to get the Campaign object.

    def __repr__(self):
        # A helpful representation when printing comment objects during debugging
        return f'<Comment {self.id} by User {self.user_id} on Campaign {self.campaign_id}>'

    def to_dict(self):
        # Converts the Comment object into a simple dictionary format,
        # which is useful for sending data as JSON in API responses.
        return {
            'id': self.id,
            'body': self.body,
            'created_at': self.created_at.isoformat(), # Convert datetime to standard string format
            'user_id': self.user_id,
            'campaign_id': self.campaign_id,
            # We will add author details (like name and profile pic) when we fetch comments
            # in the API route later, by joining with the User table.
        }
    
class ArtistWithdrawal(db.Model):
    __tablename__ = 'artist_withdrawals'

    id = db.Column(db.Integer, primary_key=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# --- RazorpayOrder Model ---
# This stores all Razorpay payment/order information
class RazorpayOrder(db.Model):
    """
    Stores Razorpay order information.
    Created when user initiates a payment, updated when payment completes.
    """
    __tablename__ = 'razorpay_orders'

    id = db.Column(db.Integer, primary_key=True)
    
    # User who initiated the payment
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Razorpay identifiers
    razorpay_order_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    razorpay_payment_id = db.Column(db.String(100), unique=True, nullable=True, index=True)
    razorpay_signature = db.Column(db.String(500), nullable=True)
    
    # Payment details
    amount = db.Column(db.Float, nullable=False)  # Amount in INR (not paise)
    currency = db.Column(db.String(10), default='INR', nullable=False)
    
    # Payment purpose
    payment_type = db.Column(db.String(50), default='wallet_deposit', nullable=False, index=True)
    # payment_type can be: 'wallet_deposit', 'direct_investment', etc.
    
    # Reference to what this payment is for (optional)
    reference_id = db.Column(db.String(100), nullable=True)  # e.g., campaign_id for direct investment
    reference_type = db.Column(db.String(50), nullable=True)  # e.g., 'campaign'
    
    # Status tracking
    status = db.Column(db.String(20), default='created', nullable=False, index=True)
    # Possible statuses: 'created', 'paid', 'failed', 'refunded'
    
    # Error tracking (if payment fails)
    error_code = db.Column(db.String(50), nullable=True)
    error_description = db.Column(db.Text, nullable=True)
    
    # Razorpay response data (full JSON for debugging)
    razorpay_response = db.Column(db.JSON, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    paid_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<RazorpayOrder {self.razorpay_order_id} - {self.status}>'

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'razorpay_order_id': self.razorpay_order_id,
            'razorpay_payment_id': self.razorpay_payment_id,
            'amount': self.amount,
            'currency': self.currency,
            'payment_type': self.payment_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
        }
    
    def mark_as_paid(self, payment_id, signature):
        """Mark order as successfully paid"""
        self.razorpay_payment_id = payment_id
        self.razorpay_signature = signature
        self.status = 'paid'
        self.paid_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def mark_as_failed(self, error_code=None, error_description=None):
        """Mark order as failed"""
        self.status = 'failed'
        self.error_code = error_code
        self.error_description = error_description
        self.updated_at = datetime.utcnow()



