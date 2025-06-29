from run import db
from app.models import User

def seed_admin():
    admin = User.query.filter_by(email='admin').first()
    if not admin:
        admin = User(email='admin', role='admin')
        admin.set_password('adminpass')  # Change this to a secure password
        db.session.add(admin)
        db.session.commit()
