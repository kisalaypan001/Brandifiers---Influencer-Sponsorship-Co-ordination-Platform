from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash



db = SQLAlchemy()
class Influencer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    flag = db.Column(db.Boolean, default=False, nullable=False) 
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    niche = db.Column(db.String(100), nullable=False)
    reach = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    social_profiles = db.Column(db.JSON, nullable=False)
    cost_per_ad = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(150), nullable=False)
    profile_summary = db.Column(db.Text, nullable=False)
    profile_photo = db.Column(db.String(200), nullable=True)
    ad_photo = db.Column(db.String(200), nullable=True)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    def to_dict(self):
        """Converts the Influencer instance to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "niche": self.niche,
            "reach": self.reach,
            "category": self.category,
            "social_profiles": self.social_profiles,
            "cost_per_ad": self.cost_per_ad,
            "location": self.location,
            "profile_summary": self.profile_summary,
            "profile_photo": self.profile_photo,
            "ad_photo": self.ad_photo
        }

class Sponsor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    approved = db.Column(db.Boolean)
    flag = db.Column(db.Boolean, default=False, nullable=False) 
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    industry_type = db.Column(db.String(100), nullable=False)
    industry_scale = db.Column(db.String(100), nullable=False)
    budget_for_ad = db.Column(db.Float, nullable=False)
    profile_photo = db.Column(db.String(200), nullable=True)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    def to_dict(self):
        """Converts the Sponsor instance to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "email": self.email,
            "approved": self.approved,
            "flag": self.flag,
            "name": self.name,
            "description": self.description,
            "industry_type": self.industry_type,
            "industry_scale": self.industry_scale,
            "budget_for_ad": self.budget_for_ad,
            "profile_photo": self.profile_photo,
        }
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'approved': self.approved,
            'flag': self.flag
        }



from sqlalchemy import Enum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Ad request model
from sqlalchemy import Boolean

class AdRequest(db.Model):
    __tablename__ = 'ad_request'

    id = db.Column(db.Integer, primary_key=True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('sponsor.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=True)
    infl_id = db.Column(db.Integer, db.ForeignKey('influencer.id'), nullable=True)
    budget = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    status = db.Column(Enum('pending', 'accepted', 'rejected','in progress','completed','under negotiation','active'), default='pending')
    negotiate_price = db.Column(db.Float, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    payment_flag = db.Column(Boolean, default=False)  

    def to_dict(self):
        return {
            'id': self.id,
            'sponsor_id': self.sponsor_id,
            'title': self.title,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'infl_id': self.infl_id,
            'budget': self.budget,
            'category': self.category,
            'status': self.status,
            'payment_flag': self.payment_flag,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None
        }
    
class Campaign(db.Model):
    __tablename__ = 'campaign'  # Specify the table name if needed

    id = db.Column(db.Integer, primary_key=True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('sponsor.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    # created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=True)
    infl_id = db.Column(db.Integer, db.ForeignKey('influencer.id'), nullable=True)
    budget = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Enum('pending', 'active', 'completed', 'cancelled', 'accepted', 'requested', 'in progress'), default='pending')
    flag = db.Column(db.Boolean, default=False, nullable=False)  # Campaign active status
    payment_flag = db.Column(db.Boolean, default=False, nullable=False)  # Payment flag (True if paid, False if not)
    start_date = db.Column(db.Date, nullable=True)  # Optional start date
    end_date = db.Column(db.Date, nullable=True)  # Optional end date

    def to_dict(self):
        return {
            'id': self.id,
            'sponsor_id': self.sponsor_id,
            'title': self.title,
            'description': self.description,
            'infl_id': self.infl_id,
            'budget': self.budget,
            'category': self.category,
            'status': self.status,
            'flag': self.flag,
            'payment_flag': self.payment_flag,  # Include payment_flag in the dictionary
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None
        }


from sqlalchemy import func 
# Statistics model
class Statistics(db.Model):
    __tablename__ = 'statistics'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    total_influencers = db.Column(db.Integer, nullable=False)
    total_sponsors = db.Column(db.Integer, nullable=False)
    active_campaigns = db.Column(db.Integer, nullable=False)
    pending_campaigns = db.Column(db.Integer, nullable=False)
    completed_campaigns = db.Column(db.Integer, nullable=False)
    canceled_campaigns = db.Column(db.Integer, nullable=False)
    total_private_campaigns = db.Column(db.Integer, nullable=False)  # New column for private campaign count

    @classmethod
    def compute_statistics(cls):
        # Fetch counts from the database
        total_influencers = db.session.query(func.count(Influencer.id)).scalar()  # Use .scalar() to get the value
        total_sponsors = db.session.query(func.count(Sponsor.id)).scalar()
        active_campaigns = db.session.query(func.count(Campaign.id)).filter(Campaign.status.in_(['accepted', 'active', 'in progress'])).scalar()
        pending_campaigns = db.session.query(func.count(Campaign.id)).filter(Campaign.status.in_(['pending', 'in progress'])).scalar()
        completed_campaigns = db.session.query(func.count(Campaign.id)).filter(Campaign.status == 'completed').scalar()
        canceled_campaigns = db.session.query(func.count(Campaign.id)).filter(Campaign.status == 'cancelled').scalar()
        
        # Fetch the count of private campaigns (where an influencer is assigned)
        total_private_campaigns = db.session.query(func.count(AdRequest.id)).filter(AdRequest.infl_id.isnot(None)).scalar()

        return {
            'totalInfluencers': total_influencers,
            'totalSponsors': total_sponsors,
            'activeCampaigns': active_campaigns,
            'pendingCampaigns': pending_campaigns,
            'completedCampaigns': completed_campaigns,
            'canceledCampaigns': canceled_campaigns,
            'totalPrivateCampaigns': total_private_campaigns  # Add the private campaign count
        }