import os
from flask import Flask, send_from_directory
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_caching import Cache
from celery import Celery
from app.models import db, Admin
from app.routes import register_routes
import redis
from sqlalchemy import inspect
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Path to the directory where files are stored
ATTACH_FOLDER = 'pdf_files'
CSV_FOLDER = 'csv'

cache = Cache()  # Initialize cache globally

def create_celery(app=None):
    """Initialize Celery."""
    app = app or create_app()
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)
    return celery

def create_app(environment='development'):
    """Factory function to create and configure the Flask app."""
    app = Flask(__name__)

    # Load configuration based on environment
    if environment == 'production':
        app.config.from_object('app.config.ProductionConfig')
    else:
        app.config.from_object('app.config.DevelopmentConfig')
    
    # Initialize Redis and Caching
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    cache.init_app(app)  # Use the global `cache` object initialized above
    app.cache = cache
    # Initialize extensions
    JWTManager(app)
    db.init_app(app)  # Initialize db after creating the app
    Migrate(app, db)

    # Initialize Celery app
    celery_app = create_celery(app)

    # Register Blueprints (for various routes)
    register_routes(app)

    # Route to Serve PDF and CSV Files
    @app.route('/pdf_files/<path:filename>')
    def serve_pdf(filename):
        return send_from_directory(ATTACH_FOLDER, filename)

    @app.route('/csv/<path:filename>')
    def serve_csv(filename):
        return send_from_directory(CSV_FOLDER, filename, as_attachment=True)

    return app, celery_app

class ExportCSVResource(Resource):
    """API Resource to export data as CSV."""
    # Placeholder for future logic

def create_initial_data(app):
    """Create initial data and tables if not already present."""
    with app.app_context():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Existing tables: {tables}")
        
        expected_tables = ['admin', 'campaign', 'other_table']
        missing_tables = [table for table in expected_tables if table not in tables]
        print(f"Missing tables: {missing_tables}")

        if missing_tables:
            try:
                db.create_all()
                # Seed the admin user if it doesn't exist
                if not Admin.query.filter_by(email='admin').first():
                    admin = Admin(email='admin')
                    admin.set_password('adminpass')  # Use a secure password
                    db.session.add(admin)
                    db.session.commit()
                print("Missing Tables created successfully.")
            except Exception as e:
                print(f"Error creating tables: {e}")
        else:
            print("All tables already exist.")

if __name__ == "__main__":
    environment = os.getenv('FLASK_ENV', 'development')
    # Unpack the returned tuple into app and celery_app
    app, celery_app = create_app(environment)
    create_initial_data(app)  # Pass only the Flask app instance
    app.run(debug=True)
