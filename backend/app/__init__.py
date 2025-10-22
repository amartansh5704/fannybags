from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    app.config.from_object('config.Config')
    
    # 🔥 ADD: Configure upload folder
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # 🔥 ADD: Serve uploaded files route
    @app.route('/uploads/<path:folder>/<path:filename>')
    def uploaded_file(folder, filename):
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        return send_from_directory(upload_path, filename)
    
    # CORS headers on all responses (single place only)
    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    # Handle preflight requests
    @app.before_request
    def handle_preflight():
        from flask import request
        if request.method == "OPTIONS":
            return '', 200
    
    # Register blueprints (routes)
    with app.app_context():
        from app.routes import auth, campaigns, investors, wallet
        app.register_blueprint(wallet.bp)
        app.register_blueprint(auth.bp)
        app.register_blueprint(campaigns.bp)
        app.register_blueprint(investors.bp)
        
        # Create tables
        db.create_all()
    
    return app