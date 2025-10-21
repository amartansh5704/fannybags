from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='investor')
    kyc_status = db.Column(db.String(20), default='pending')
    kyc_data = db.Column(db.JSON)
    wallet_details = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.email}>'


class Campaign(db.Model):
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    audio_preview_url = db.Column(db.String(500))
    artwork_url = db.Column(db.String(500))
    target_amount = db.Column(db.Float, nullable=False)
    amount_raised = db.Column(db.Float, default=0)
    revenue_share_pct = db.Column(db.Float, nullable=False)
    partition_price = db.Column(db.Float, nullable=False)
    total_partitions = db.Column(db.Integer)
    min_partitions_per_user = db.Column(db.Integer, default=1)
    funding_status = db.Column(db.String(20), default='draft')
    sharing_term = db.Column(db.String(100))
    expected_streams_3m = db.Column(db.Integer)
    expected_revenue_3m = db.Column(db.Float)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Campaign {self.title}>'


class Partition(db.Model):
    __tablename__ = 'partitions'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    partitions_bought = db.Column(db.Integer, nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    payment_transaction_id = db.Column(db.String(255))
    status = db.Column(db.String(20), default='confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Partition {self.id}>'


class RevenueEvent(db.Model):
    __tablename__ = 'revenue_events'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    source = db.Column(db.String(50), default='manual')
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='INR')
    gross_or_net = db.Column(db.String(10), default='gross')
    report_file_url = db.Column(db.String(500))
    processed = db.Column(db.Boolean, default=False)
    processed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<RevenueEvent {self.id}>'


class Distribution(db.Model):
    __tablename__ = 'distributions'
    
    id = db.Column(db.Integer, primary_key=True)
    revenue_event_id = db.Column(db.Integer, db.ForeignKey('revenue_events.id'), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    total_allocated_to_investors = db.Column(db.Float, nullable=False)
    platform_fee = db.Column(db.Float, nullable=False)
    distribution_data = db.Column(db.JSON)
    distributed = db.Column(db.Boolean, default=False)
    distributed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Distribution {self.id}>'


class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tx_type = db.Column(db.String(50))
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    tx_reference = db.Column(db.String(255))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Transaction {self.id}>'


class InvestorHolding(db.Model):
    __tablename__ = 'investor_holdings'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    investor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    partitions_owned = db.Column(db.Integer, nullable=False)
    ownership_pct = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<InvestorHolding {self.id}>'


class Contract(db.Model):
    __tablename__ = 'contracts'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    file_url = db.Column(db.String(500))
    terms_text = db.Column(db.Text)
    signature_data = db.Column(db.JSON)
    signed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Contract {self.id}>'
    
class Wallet(db.Model):
        __tablename__ = 'wallets'
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
        balance = db.Column(db.Float, default=0.0, nullable=False)
        total_deposited = db.Column(db.Float, default=0.0, nullable=False)
        total_withdrawn = db.Column(db.Float, default=0.0, nullable=False)
        total_invested = db.Column(db.Float, default=0.0, nullable=False)
        total_earnings = db.Column(db.Float, default=0.0, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'user_id': self.user_id,
                'balance': round(self.balance, 2),
                'total_deposited': round(self.total_deposited, 2),
                'total_withdrawn': round(self.total_withdrawn, 2),
                'total_invested': round(self.total_invested, 2),
                'total_earnings': round(self.total_earnings, 2),
                'created_at': self.created_at.isoformat(),
                'updated_at': self.updated_at.isoformat()
                }
class WalletTransaction(db.Model):
    __tablename__ = 'wallet_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    balance_before = db.Column(db.Float, nullable=False)
    balance_after = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    reference_id = db.Column(db.String(100), nullable=True)
    reference_type = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), default='completed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'wallet_id': self.wallet_id,
            'transaction_type': self.transaction_type,
            'amount': round(self.amount, 2),
            'balance_before': round(self.balance_before, 2),
            'balance_after': round(self.balance_after, 2),
            'description': self.description,
            'reference_id': self.reference_id,
            'reference_type': self.reference_type,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }