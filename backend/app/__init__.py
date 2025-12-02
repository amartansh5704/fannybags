from flask import Flask, send_from_directory, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    app.config.from_object('config.Config')
    
    # Configure upload folder
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Serve uploaded files route
    @app.route('/uploads/<path:folder>/<path:filename>')
    def uploaded_file(folder, filename):
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        return send_from_directory(upload_path, filename)
    
    # Health check route
    @app.route('/')
    def index():
        return {"status": "online", "message": "FannyBags API is running!"}, 200

    # Allowed origins list
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://fannybags.vercel.app",
    ]

    # CORS headers on all responses
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin', '')
        
        # Check if origin is allowed
        if origin in ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
        
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    # Handle preflight requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            origin = request.headers.get('Origin', '')
            if origin in ALLOWED_ORIGINS:
                response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response
    
    # Register blueprints
    with app.app_context():
        from app.routes import auth, campaigns, investors, wallet, artist, comment, payment
        app.register_blueprint(artist.bp) 
        app.register_blueprint(wallet.bp)
        app.register_blueprint(auth.bp)
        app.register_blueprint(campaigns.bp)
        app.register_blueprint(investors.bp)
        app.register_blueprint(comment.bp)
        app.register_blueprint(payment.bp)
        
        db.create_all()
    
    return app