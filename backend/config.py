import os
from datetime import timedelta

class Config:
    # Database (SQLite - no setup needed)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///fannybags.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = 'fannybags-secret-key-2024-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    # App settings
    DEBUG = True
    TESTING = False

    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'm4a', 'ogg'}

    RAZORPAY_KEY_ID = 'rzp_test_RmmO8FAE4F95Gk'  # Your Test Key ID
    RAZORPAY_KEY_SECRET = 'J5q7st9JfMfVwcRnzPx7ZVg3'  # Your Test Key Secret
    
    # For production, change to:
    # RAZORPAY_KEY_ID = 'rzp_live_XXXXXXXXXXXXXX'
    # RAZORPAY_KEY_SECRET = 'XXXXXXXXXXXXXXXXXXXXXXXX'
    
    # Currency for payments
    RAZORPAY_CURRENCY = 'INR'
    
    # Your company/app name (shows on Razorpay checkout)
    RAZORPAY_COMPANY_NAME = 'FannyBags'