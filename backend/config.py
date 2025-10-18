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