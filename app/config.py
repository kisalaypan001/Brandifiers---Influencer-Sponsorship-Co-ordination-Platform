import os
from celery.schedules import crontab

class Config:
    JWT_SECRET_KEY = os.getenv('SECRET_KEY', 'qwerty12345')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///app.db')
    SECURITY_PASSWORD_SALT = os.getenv('SECURITY_PASSWORD_SALT', 'salty-password')
    SECURITY_TOKEN_AUTHENTICATION_HEADER = os.getenv('SECURITY_TOKEN_AUTHENTICATION_HEADER', 'Authentication-Token')
    SECURITY_FRESHNESS_GRACE_PERIOD = int(os.getenv('SECURITY_FRESHNESS_GRACE_PERIOD', 3600))
    SECURITY_LOGIN_WITHOUT_CONFIRMATION = True  # Correct the variable name if necessary

    # Cache config
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.getenv('CACHE_REDIS_URL', "redis://localhost:6379/0")


class DevelopmentConfig(Config):
    """Development-specific configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'
    
    # Celery configuration
    CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

    CELERY_BEAT_SCHEDULE = {
        'generate_monthly_report': {
            'task': 'tasks.generate_monthly_report',
            'schedule': crontab(day_of_month=1, hour=0, minute=0),  # Run monthly on the 1st day at midnight
        },
        'send-daily-reminders': {
            'task': 'tasks.send_daily_reminders',
            'schedule': crontab(hour=22, minute=0),  # Run daily at 8:00 AM
        },
    }
    
    # Ensure cache configuration is defined only once
    CACHE_TYPE = 'redis'  # Use Redis for caching
    CACHE_REDIS_URL = "redis://localhost:6379/0"
    broker_connection_retry_on_startup=True

    # Mail configuration is inherited from the base config
    # You can override here if needed, but it's already defined above in the base class

