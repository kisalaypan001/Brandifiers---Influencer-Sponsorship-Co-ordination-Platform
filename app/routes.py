from flask import request, jsonify, render_template,Flask,url_for
from flask_jwt_extended import create_access_token,JWTManager,unset_jwt_cookies
from .models import db  # Import the db instance
from .models import Influencer,Sponsor,Admin,AdRequest,Campaign,Statistics # Import the User model
from werkzeug.security import generate_password_hash


def register_routes(app):
    cache= app.cache

    @app.route('/')
    def home():
        return render_template('index.html') 

    from werkzeug.security import generate_password_hash, check_password_hash
    from werkzeug.utils import secure_filename
    import os
    from datetime import datetime
    @app.get('/cache')
    @cache.cached(timeout = 5)
    def cashe_time():
        return{'time': str(datetime.now())}


    
    from celery.result import AsyncResult 

    @app.get('/celery')
    def celery_task():
        from tasks import add
        task = add.delay(10, 20)
    
    # Return task ID and status
        return jsonify({
            'task_id': task.id,
            'status': task.status
        })



    # Route to sign up influencers
    @app.route('/signup/influencer', methods=['POST'])
    def signup_influencer():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        age = data.get('age')
        gender = data.get('gender')
        niche = data.get('niche')
        reach = data.get('reach')
        category = data.get('category')
        social_profiles = data.get('social_profiles')
        cost_per_ad = data.get('cost_per_ad')
        location = data.get('location')
        profile_summary = data.get('profile_summary')
        # Handle file upload
        profile_photo_file = request.files.get('profile_photo')
        if profile_photo_file:
            # Secure the filename
            ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

        def allowed_file(filename):
            return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

        # In your signup route
        if profile_photo_file and allowed_file(profile_photo_file.filename):
            filename = secure_filename(profile_photo_file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            profile_photo_file.save(file_path)  # Save file to static/dp folder

            # Store relative path for DB entry
            profile_photo_path = f"{app.config['UPLOAD_FOLDER']}/{filename}"
        else:
            profile_photo_path = None

        # Check if email already exists in Influencer table
        if Influencer.query.filter_by(email=email).first():
            return jsonify({"msg": "Email already exists"}), 400

        # Create new influencer instance
        new_influencer = Influencer(
            email=email,
            password_hash=generate_password_hash(password),
            name=name,
            age=age,
            gender=gender,
            niche=niche,
            reach=reach,
            category=category,
            social_profiles=social_profiles,
            cost_per_ad=cost_per_ad,
            location=location,
            profile_summary=profile_summary,
            profile_photo=profile_photo_path
        )

        # Save influencer to the database
        try:
            db.session.add(new_influencer)
            db.session.commit()
            return jsonify({"msg": "Influencer signup successful. Login to view your dashboard."}), 200
        except Exception as e:
            db.session.rollback()  # Rollback in case of an error
            return jsonify({"msg": "Failed to create influencer", "error": str(e)}), 500



    @app.route('/signup/sponsor', methods=['POST'])
    def signup_sponsor():
        try:
            # Accessing the form data (including file upload)
            name = request.form['name']
            email = request.form['email']
            password = request.form['password']
            description = request.form['description']
            industry_type = request.form['industry_type']
            industry_scale = request.form['industry_scale']
            budget_for_ad = request.form['budget_for_ad']
            
            # Handle file upload (if exists)
            profile_photo_file = request.files.get('profile_photo')
            profile_photo_path = None  # Default to None if no file uploaded
            if profile_photo_file:
            # Secure the filename
                ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

            def allowed_file(filename):
                return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
            # Validate and save the file if it's valid
            if profile_photo_file and allowed_file(profile_photo_file.filename):
                filename = secure_filename(profile_photo_file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                profile_photo_file.save(file_path)
                profile_photo_path = f"{app.config['UPLOAD_FOLDER']}/{filename}"

            # Check if email already exists in the Sponsor table
            if Sponsor.query.filter_by(email=email).first():
                return jsonify({"msg": "Email already exists"}), 400

            # Create new sponsor instance
            new_sponsor = Sponsor(
                email=email,
                password_hash=generate_password_hash(password),  # Store the hashed password
                name=name,
                description=description,
                industry_type=industry_type,
                industry_scale=industry_scale,
                budget_for_ad=budget_for_ad,
                profile_photo=profile_photo_path,
                approved=False,  # Assuming new sponsors need admin approval
            )

            # Save sponsor to the database
            db.session.add(new_sponsor)
            db.session.commit()

            return jsonify({"msg": "Signup approval request sent to admin. You will be informed when your request is approved."}), 200

        except Exception as e:
            db.session.rollback()  # Rollback in case of an error
            return jsonify({"msg": "Failed to create sponsor", "error": str(e)}), 500
    
# Influencer login route
    @app.route('/login/influencer', methods=['POST'])
    def login_influencer():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Verify the influencer exists and check password
        influencer = Influencer.query.filter_by(email=email).first()
        if influencer and influencer.check_password(password):
            access_token = create_access_token(identity={'email': influencer.email})
            response = {
                'access_token': access_token,
                'email': influencer.email,
                'id': influencer.id,
            }
            return jsonify(response), 200
        
        return jsonify({"msg": "Invalid email or password"}), 401

# Sponsor login route
    @app.route('/login/sponsor', methods=['POST'])
    def login_sponsor():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Verify the sponsor exists and check password
        sponsor = Sponsor.query.filter_by(email=email).first()
        if sponsor and sponsor.check_password(password): 
            if not sponsor.approved:
                return jsonify({"msg": "Account not approved by admin"}), 403
            access_token = create_access_token(identity={'email': sponsor.email})
            response = {
                'access_token': access_token,
                'email': sponsor.email,
                'id': sponsor.id,
            }
            return jsonify(response), 200
        
        return jsonify({"msg": "Invalid email or password"}), 401
    
    from flask_jwt_extended import jwt_required, get_jwt_identity



# Admin login route
    @app.route('/login/admin', methods=['POST'])
    def login_admin():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Verify the influencer exists and check password
        admin = Admin.query.filter_by(email=email).first()
        if admin and admin.check_password(password):  # Assuming Influencer model has a check_password method
            access_token = create_access_token(identity={'email': admin.email})
            response = {
                'access_token': access_token,
                'email': admin.email,
                'id': admin.id,
            }
            return jsonify(response), 200
        
        return jsonify({"msg": "Invalid email or password"}), 401

    @app.route('/logout', methods=['POST'])
    @jwt_required()
    def logout():
        response = jsonify({"msg": "Logout successful"})
        # Unset the JWT cookies to log the user out (for JWT cookie-based storage)
        unset_jwt_cookies(response)
        return response, 200



 #Admin page and functions ----OK
    @app.route('/adminpage', methods=['GET'])
    @jwt_required()
    def admin_page():
        current_user = get_jwt_identity()  # Assuming JWT contains user email
        print(f"Current user: {current_user['email']}") 

        user = Admin.query.filter_by(email=current_user['email']).first()

        if not user:
            return jsonify({"msg": "User not found"}), 404

        try:
            pending_sponsors = Sponsor.query.filter_by(approved='0').all()
            pending_sponsor_data = [
                {'id': sponsor.id, 'email': sponsor.email} for sponsor in pending_sponsors
            ]
            
            return jsonify({
                'id': user.id,
                'email': user.email,
                'pending_sponsors': pending_sponsor_data
            }), 200
        except Exception as e:
            print(f"Error fetching pending sponsors: {e}")
            return jsonify({"msg": "Error fetching pending sponsors"}), 500

 
#Approve sponsor request----OK
    @app.route('/approve_sponsor/<int:user_id>', methods=['POST'])
    @jwt_required()
    def approve_sponsor(user_id):
        current_user = get_jwt_identity()
        user = Admin.query.filter_by(email=current_user['email']).first()
        sponsor = Sponsor.query.filter_by(id=user_id).first()
        if sponsor:
            sponsor.approved = True
            db.session.commit()
            return jsonify({"msg": "Sponsor approved"}), 200
        return jsonify({"msg": "Sponsor not found"}), 404


#Reject sponsor ----OK
    @app.route('/reject_sponsor/<int:user_id>', methods=['DELETE'])
    @jwt_required()
    def reject_sponsor(user_id):
        current_user = get_jwt_identity()
        user = Admin.query.filter_by(email=current_user['email']).first()
        sponsor = Sponsor.query.filter_by(id=user_id).first()
        if sponsor:
            db.session.delete(sponsor)
            db.session.commit()
            return jsonify({"msg": "Sponsor rejected and deleted"}), 200
        return jsonify({"msg": "Sponsor not found"}), 404

#Influensor profile----Need to check
    @app.route('/influencerprofile', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def influencer_profile():
        current_user = get_jwt_identity()
        user = Influencer.query.filter_by(email=current_user['email']).first()
        if user and user.role == 'infl':
            return render_template('influencerprofile.html', user=user)
        return jsonify({"msg": "User not found"}), 404




# Route to get all public ad requests for sponsors
    @app.route('/api/campaigns', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def get_campaigns():
        current_user = get_jwt_identity()
        user = Sponsor.query.filter_by(email=current_user['email']).first()
        campaigns = Campaign.query.filter_by(sponsor_id=user.id).all()  # Fetching campaigns for the sponsor
        return jsonify([campaign.to_dict() for campaign in campaigns]), 200
    

#Route to get all influencer Ad request
    @app.route('/api/public-ad-requests', methods=['GET'])
    @jwt_required()
    def get_public_ad_requests():
        current_user = get_jwt_identity()
        user = Influencer.query.filter_by(email=current_user['email']).first()
        public_ad_requests = Campaign.query.all()

        # Add 'isHidden' key with default value False to each campaign's data
        ad_requests_with_hidden = []
        for campaign in public_ad_requests:
            campaign_data = campaign.to_dict()  # Assuming `to_dict` is implemented for Campaign model
            campaign_data['isHidden'] = False  # Add isHidden field with default value False
            ad_requests_with_hidden.append(campaign_data)
        
        # Return the modified data with 'isHidden'
        return jsonify(ad_requests_with_hidden)




# Route to fetch all campaigns----OK
    @app.route('/campaigns', methods=['GET'])
    @jwt_required()
    def fetch_campaigns():
        current_user = get_jwt_identity()  # Assuming JWT contains user email
        print(f"Current user: {current_user['email']}")

        user = Influencer.query.filter_by(email=current_user['email']).first()

        if not user:
            return jsonify({"msg": "User not found"}), 404

        try:
            campaigns = Campaign.query.all()
            campaigns_data = [campaign.to_dict() for campaign in campaigns]
            return jsonify({'campaigns': campaigns_data}), 200
        except Exception as e:
            print(f"Error fetching campaigns: {str(e)}")  # Log the full error message
            return jsonify({"msg": f"Error fetching campaigns: {str(e)}"}), 500



# Route to get all  ad request for Sponsor---OK
    @app.route('/api/ad-requests', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def get_ad_requests():
        current_user = get_jwt_identity()
        user = Sponsor.query.filter_by(email=current_user['email']).first()
        ad_requests = AdRequest.query.filter_by(sponsor_id=user.id).all()  # Fetching ad requests for the sponsor
        return jsonify([request.to_dict() for request in ad_requests]), 200


# Route to get all campaigns for a Sponsor
    @app.route('/api/getcampaigns', methods=['GET'])
    @jwt_required()
    def getcampaigns():
        current_user = get_jwt_identity()
        user = Sponsor.query.filter_by(email=current_user['email']).first()
        campaigns = Campaign.query.filter_by(sponsor_id=user.id).all()
        return jsonify([campaign.to_dict() for campaign in campaigns]), 200

# Edit campaign route for sponsor 
    from datetime import datetime
    @app.route('/api/update-campaign/<int:campaign_id>', methods=['PUT'])
    @jwt_required()
    def update_campaign(campaign_id):
        try:
            # Get the JSON data sent with the request
            data = request.get_json()

            # Ensure the sponsor is logged in
            current_user = get_jwt_identity()
            user = Sponsor.query.filter_by(email=current_user['email']).first()

            # Find the campaign by ID and sponsor_id
            campaign = Campaign.query.filter(Campaign.id == campaign_id, Campaign.sponsor_id == user.id).first()

            if not campaign:
                return jsonify({'error': 'Campaign not found or unauthorized'}), 404

            # Update the campaign with new data
            campaign.title = data.get('title', campaign.title)
            campaign.description = data.get('description', campaign.description)
            campaign.budget = data.get('budget', campaign.budget)
            campaign.category = data.get('category', campaign.category)
            campaign.status = data.get('status', campaign.status)
            
            # Update start_date and end_date if provided
            if 'start_date' in data:
                campaign.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
            if 'end_date' in data:
                campaign.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')

            # Commit the changes to the database
            db.session.commit()

            # Return a success message with the updated campaign data
            return jsonify({'message': 'Campaign updated successfully', 'campaign': campaign.to_dict()})

        except Exception as e:
            # Return a general error message if something goes wrong
            return jsonify({'error': str(e)}), 500



#Delete Campaign for sponsor 
    @app.route('/api/delete-campaign/<int:id>', methods=['DELETE'])
    def delete_campaign(id):
        # Find the campaign by ID
        campaign = db.session.query(Campaign).filter(Campaign.id == id).first()
        
        if not campaign:
            # If campaign doesn't exist, return 404 error
            return jsonify({'message': 'Campaign not found'}), 404
        
        try:
            # Delete the campaign from the database
            db.session.delete(campaign)
            db.session.commit()  # Commit the transaction to make it permanent

            return jsonify({'message': 'Campaign deleted successfully'}), 200
        
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({'error': str(e)}), 500

# Route to get all influencer Ad requests (corrected)
    @app.route('/api/active-ad-requests', methods=['GET'])
    @jwt_required()
    def active_ad_requests():
        current_user = get_jwt_identity()
        user = Influencer.query.filter_by(email=current_user['email']).first()
        ad_requests = AdRequest.query.filter(
            AdRequest.infl_id==user.id,
            AdRequest.status.in_(['accepted', 'completed', 'in progress','under negotiation'])
            ).all()
        return jsonify([ad_request.to_dict() for ad_request in ad_requests])

# Route to get all influencer Ad requests ---Ok
    @app.route('/api/infl-ad-requests', methods=['GET'])
    @jwt_required()
    #@cache.cached(timeout = 120)
    def infl_ad_requests():
        current_user = get_jwt_identity()
        user = Influencer.query.filter_by(email=current_user['email']).first()
        ad_requests = AdRequest.query.filter_by(infl_id=user.id,status='pending').all()
        return jsonify([ad_request.to_dict() for ad_request in ad_requests])



# Route to create campaigns for Sponsor---OK
    @app.route('/postcampaign', methods=['POST'])
    @jwt_required()
    def create_campaign():
        try:
            # Get the logged-in user
            current_user = get_jwt_identity()
            user = Sponsor.query.filter_by(email=current_user['email']).first()

            if not user:
                return jsonify({"msg": "Unauthorized access"}), 403

            # Get data from the request
            data = request.get_json()

            # Create a new campaign with all required fields
            new_campaign = Campaign(
                sponsor_id=user.id,
                title=data.get('title'),
                description=data.get('description'),
                budget=data.get('budget'),
                category=data.get('category'),
                start_date=datetime.strptime(data['start_date'], '%Y-%m-%d') if 'start_date' in data else None,
                end_date=datetime.strptime(data['end_date'], '%Y-%m-%d') if 'end_date' in data else None
            )

            # Add and commit the new campaign to the database
            db.session.add(new_campaign)
            db.session.commit()

            return jsonify({"msg": "Campaign created successfully", "campaign_id": new_campaign.id}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500





# Route to create ad requests for sponsor


    @app.route('/api/send-ad-request', methods=['POST'])
    @jwt_required()
    def send_ad_request():
        try:
            # Parse JSON input
            data = request.get_json()
            # Get current sponsor details
            current_user = get_jwt_identity()
            sponsor = Sponsor.query.filter_by(email=current_user['email']).first()

            if not sponsor:
                return jsonify({'error': 'Unauthorized access. Sponsor not found.'}), 401

            # Validate Influencer ID
            influencer_id = data.get('infl_id')
            print(influencer_id)
            influencer = Influencer.query.filter_by(id=influencer_id).first()

            if not influencer:
                return jsonify({'error': 'Influencer not found.'}), 404

            # Validate required fields
            required_fields = ['title', 'description', 'budget', 'category']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'error': f"Field '{field}' is required."}), 400

            # Create new AdRequest
            ad_request = AdRequest(
                sponsor_id=sponsor.id,
                infl_id=influencer.id,
                title=data['title'],
                description=data['description'],
                budget=float(data['budget']),
                category=data['category'],
                created_at=datetime.utcnow()
            )

            # Save to database
            db.session.add(ad_request)
            db.session.commit()

            return jsonify({
                'message': 'Ad request sent successfully.',
                'ad_request': ad_request.to_dict()
            }), 201

        except Exception as e:
            return jsonify({'error': f"An error occurred: {str(e)}"}), 500
    @app.route('/api/current_user', methods=['GET'])
    @jwt_required()
    def current_user():
        current_user = get_jwt_identity()

        # Fetch the user from the database using the email from the JWT
        user = Sponsor.query.filter_by(email=current_user['email']).first()
        if user is None:
            user = Influencer.query.filter_by(email=current_user['email']).first()
            if user is None:
                return jsonify({"msg": "User not found"}), 404
            return jsonify(user.to_dict()), 200
        # Return the user's information
        return jsonify(user.to_dict()), 200

    


    # Catch-all route for Vue Router (ensures it renders index.html for all unknown routes)
    @app.route('/<path:path>', methods=['GET'])
    def catch_all(path):
        return render_template('index.html')  # Serve the main HTML file for Vue Router
    





    #Sponsors details for admin

    @app.route('/sponsors_with_campaigns', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def fetch_sponsors_with_campaigns():
        current_user = get_jwt_identity()

        user = Admin.query.filter_by(email=current_user['email']).first()

        if not user:
            return jsonify({"msg": "User is not authorized"}), 403

        try:
            sponsors = Sponsor.query.all()
            sponsors_data = []

            for sponsor in sponsors:
                # Get campaigns related to the sponsor
                campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).all()
                campaign_data = {
                    "active": sum(1 for c in campaigns if c.status == 'accepted'),
                    "in_progress": sum(1 for c in campaigns if c.status == 'in progress'),
                    "completed": sum(1 for c in campaigns if c.status == 'completed'),
                    "under_negotiation": sum(1 for c in campaigns if c.status == 'under negotiation'),
                    "total_campaigns": len(campaigns)  # Total campaigns for the sponsor
                }

                # Get ad-requests related to the sponsor
                ad_requests = AdRequest.query.filter_by(sponsor_id=sponsor.id).all()
                ad_request_data = {
                    "active": sum(1 for ad in ad_requests if ad.status == 'accepted'),
                    "in_progress": sum(1 for ad in ad_requests if ad.status == 'in progress'),
                    "completed": sum(1 for ad in ad_requests if ad.status == 'completed'),
                    "under_negotiation": sum(1 for ad in ad_requests if ad.status == 'under negotiation'),
                    "total_ad_requests": len(ad_requests)  # Total ad-requests for the sponsor
                }

                # Create sponsor's dictionary and append campaign/ad-request data
                sponsor_dict = sponsor.to_dict()
                sponsor_dict['campaign_breakdown'] = campaign_data
                sponsor_dict['ad_request_breakdown'] = ad_request_data

                sponsors_data.append(sponsor_dict)

            return jsonify({'sponsors': sponsors_data}), 200

        except Exception as e:
            print(f"Error fetching sponsors with campaigns: {str(e)}")
            return jsonify({"msg": f"Error fetching sponsors: {str(e)}"}), 500




    # Influencer data for Admin
    @app.route('/influencers_with_campaigns', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def fetch_influencers_with_campaigns():
        current_user = get_jwt_identity()
        user = Admin.query.filter_by(email=current_user['email']).first()

        if not user:
            return jsonify({"msg": "User is not authorized"}), 403

        try:
            influencers = Influencer.query.all()
            influencers_data = []

            for influencer in influencers:
                # Get campaigns related to the influencer
                campaigns = Campaign.query.filter_by(infl_id=influencer.id).all()
                campaign_data = {
                    "active": sum(1 for c in campaigns if c.status == 'accepted'),
                    "in_progress": sum(1 for c in campaigns if c.status == 'in progress'),
                    "completed": sum(1 for c in campaigns if c.status == 'completed'),
                    "under_negotiation": sum(1 for c in campaigns if c.status == 'under negotiation'),
                    "total_campaigns": len(campaigns)
                }

                # Get ad-requests related to the influencer
                ad_requests = AdRequest.query.filter_by(infl_id=influencer.id).all()
                ad_request_data = {
                    "active": sum(1 for ad in ad_requests if ad.status == 'accepted'),
                    "in_progress": sum(1 for ad in ad_requests if ad.status == 'in progress'),
                    "completed": sum(1 for ad in ad_requests if ad.status == 'completed'),
                    "under_negotiation": sum(1 for ad in ad_requests if ad.status == 'under negotiation'),
                    "total_ad_requests": len(ad_requests)
                }

                influencer_dict = influencer.to_dict()
                influencer_dict['campaign_breakdown'] = campaign_data
                influencer_dict['ad_request_breakdown'] = ad_request_data

                influencers_data.append(influencer_dict)

            return jsonify({'influencers': influencers_data}), 200

        except Exception as e:
            print(f"Error fetching influencers with campaigns: {str(e)}")
            return jsonify({"msg": f"Error fetching influencers: {str(e)}"}), 500
        



    from sqlalchemy import or_


    #Influencer query by sponsor
    @app.route('/api/influencers', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def get_influencers():
        current_user = get_jwt_identity()

        user = Sponsor.query.filter_by(email=current_user['email']).first()

    # Get filters from query parameters
        search = request.args.get('search', '', type=str)
        category = request.args.get('category', '', type=str)
        sort = request.args.get('sort', '', type=str)
        platform = request.args.get('platform', '', type=str)

        try:
            # Query influencers with filters
            query = Influencer.query

            if search:
                query = query.filter(
                    or_(
                        Influencer.name.ilike(f"%{search}%"),
                        Influencer.niche.ilike(f"%{search}%"),
                        Influencer.category.ilike(f"%{search}%"),
                        Influencer.location.ilike(f"%{search}%"),
                        Influencer.gender.ilike(f"%{search}%"),
                    )
                )
            
            if category:
                query = query.filter(Influencer.category == category)

            if platform:
                query = query.filter(Influencer.social_profiles[platform] != None)  # Check platform existence

            # Sorting logic
            if sort == "followers":
                query = query.order_by(Influencer.reach.desc())
            elif sort == "cost":
                query = query.order_by(Influencer.cost_per_ad.asc())

            # Execute query
            influencers = query.all()
            influencers_data = [influencer.to_dict() for influencer in influencers]

            return jsonify({'influencers': influencers_data}), 200

        except Exception as e:
            print(f"Error fetching influencers: {str(e)}")
            return jsonify({"msg": f"Error fetching influencers: {str(e)}"}), 500
        



# Flag / Unflag Users by admin

# Flag a Sponsor
    @app.route('/flag_spon/<int:user_id>', methods=['POST'])
    @jwt_required()
    def flag_spon(user_id):
        current_user = get_jwt_identity()

        # Check if the current user is an admin
        admin_user = Admin.query.filter_by(email=current_user['email']).first()
        if not admin_user:
            return jsonify({"msg": "User is not authorized"}), 403

        try:
            # Find the sponsor by ID
            sponsor_to_flag = Sponsor.query.get(user_id)
            if not sponsor_to_flag:
                return jsonify({"msg": "Sponsor not found"}), 404

            # Set the flag field to True to flag the sponsor
            sponsor_to_flag.flag = True
            db.session.commit()
            return jsonify({"msg": "Sponsor flagged successfully"}), 200
        except Exception as e:
            print(f"Error flagging sponsor: {str(e)}")
            return jsonify({"msg": f"Error flagging sponsor: {str(e)}"}), 500


    # Unflag a Sponsor
    @app.route('/unflag_spon/<int:user_id>', methods=['POST'])
    @jwt_required()
    def unflag_spon(user_id):
        current_user = get_jwt_identity()

        # Check if the current user is an admin
        admin_user = Admin.query.filter_by(email=current_user['email']).first()
        if not admin_user:
            return jsonify({"msg": "User is not authorized"}), 403

        try:
            # Find the sponsor by ID
            sponsor_to_unflag = Sponsor.query.get(user_id)
            if not sponsor_to_unflag:
                return jsonify({"msg": "Sponsor not found"}), 404

            # Set the flag field to False to unflag the sponsor
            sponsor_to_unflag.flag = False
            db.session.commit()
            return jsonify({"msg": "Sponsor unflagged successfully"}), 200
        except Exception as e:
            print(f"Error unflagging sponsor: {str(e)}")
            return jsonify({"msg": f"Error unflagging sponsor: {str(e)}"}), 500


    # Flag an Influencer
    @app.route('/flag_infl/<int:user_id>', methods=['POST'])
    @jwt_required()
    def flag_infl(user_id):
        current_user = get_jwt_identity()

        # Check if the current user is an admin
        admin_user = Admin.query.filter_by(email=current_user['email']).first()
        if not admin_user:
            return jsonify({"msg": "User is not authorized"}), 403

        try:
            # Find the influencer by ID
            influencer_to_flag = Influencer.query.get(user_id)
            if not influencer_to_flag:
                return jsonify({"msg": "Influencer not found"}), 404

            # Set the flag field to True to flag the influencer
            influencer_to_flag.flag = True
            db.session.commit()
            return jsonify({"msg": "Influencer flagged successfully"}), 200
        except Exception as e:
            print(f"Error flagging influencer: {str(e)}")
            return jsonify({"msg": f"Error flagging influencer: {str(e)}"}), 500


    # Unflag an Influencer
    @app.route('/unflag_infl/<int:user_id>', methods=['POST'])
    @jwt_required()
    def unflag_infl(user_id):
        current_user = get_jwt_identity()

        # Check if the current user is an admin
        admin_user = Admin.query.filter_by(email=current_user['email']).first()
        if not admin_user:
            return jsonify({"msg": "User is not authorized"}), 403

        try:
            # Find the influencer by ID
            influencer_to_unflag = Influencer.query.get(user_id)
            if not influencer_to_unflag:
                return jsonify({"msg": "Influencer not found"}), 404

            # Set the flag field to False to unflag the influencer
            influencer_to_unflag.flag = False
            db.session.commit()
            return jsonify({"msg": "Influencer unflagged successfully"}), 200
        except Exception as e:
            print(f"Error unflagging influencer: {str(e)}")
            return jsonify({"msg": f"Error unflagging influencer: {str(e)}"}), 500





# get statistics by admin
    @app.route('/statistics', methods=['GET'])
    def get_statistics():
        stats = Statistics.compute_statistics()
        return jsonify(stats)
    

#Update ad-requests by Sponsor
    @app.route('/api/update-ad-request/<int:ad_request_id>', methods=['PUT'])
    @jwt_required()
    def update_ad_request(ad_request_id):
        try:
            # Get the JSON data sent with the request
            data = request.get_json()

            # Ensure the sponsor is logged in
            current_user = get_jwt_identity()
            sponsor = Sponsor.query.filter_by(email=current_user['email']).first()

            # Find the ad request by ID and sponsor_id
            ad_request = AdRequest.query.filter_by(id=ad_request_id, sponsor_id=sponsor.id).first()

            if not ad_request:
                return jsonify({'error': 'Ad Request not found or unauthorized'}), 404

            # Update the ad request with new data
            ad_request.title = data.get('title', ad_request.title)
            ad_request.description = data.get('description', ad_request.description)
            ad_request.budget = data.get('budget', ad_request.budget)
            ad_request.category = data.get('category', ad_request.category)
            ad_request.status = data.get('status', ad_request.status)  # Assuming status is passed

            # Commit the changes to the database
            db.session.commit()

            return jsonify({'message': 'Ad Request updated successfully', 'ad_request': ad_request.to_dict()})

        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({'error': str(e)}), 500

    
#Delete ad request by Sponsor
    @app.route('/api/delete-ad-request/<int:id>', methods=['DELETE'])
    @jwt_required()
    def delete_ad_request(id):
        try:
            # Ensure the sponsor is logged in
            current_user = get_jwt_identity()
            sponsor = Sponsor.query.filter_by(email=current_user['email']).first()

            # Find the ad request by ID and sponsor_id
            ad_request = AdRequest.query.filter_by(id=id, sponsor_id=sponsor.id).first()

            if not ad_request:
                return jsonify({'error': 'Ad Request not found or unauthorized'}), 404

            # Delete the ad request from the database
            db.session.delete(ad_request)
            db.session.commit()

            return jsonify({'message': 'Ad Request deleted successfully'}), 200

        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({'error': str(e)}), 500






# Route to accept an ad request for influencer
    @app.route('/api/accept/<int:id>', methods=['POST'])
    @jwt_required()
    def accept_ad_request(id):
        ad_request = AdRequest.query.filter(AdRequest.id == id).first()
        if not ad_request:
            return jsonify({'error': 'AdRequest not found'}), 404

        ad_request.status = 'accepted'
        db.session.commit()
        return jsonify({'message': 'AdRequest accepted successfully', 'ad_request': ad_request.id}), 200
    

#Route to reject Ad-requests
    @app.route('/api/reject/<int:id>', methods=['POST'])
    @jwt_required()
    def reject_ad_request(id):
        ad_request = AdRequest.query.filter(AdRequest.id == id).first()
        if not ad_request:
            return jsonify({'error': 'AdRequest not found'}), 404

        ad_request.status = 'rejected'
        db.session.commit()
        return jsonify({'message': 'AdRequest rejected successfully', 'ad_request': ad_request.id}), 200

    
# Send campaign request by Influencer
    @app.route('/api/request_campaign/<int:id>', methods=['POST'])
    @jwt_required()
    def request_campaign(id):
        current_user = get_jwt_identity()
        user = Influencer.query.filter_by(email=current_user['email']).first()
        campaign = Campaign.query.get(id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404

        campaign.status = 'requested'
        campaign.infl_id = user.id
        db.session.commit()
        return jsonify({'message': 'Campaign request sent successfully', 'Campaign ID': campaign.id}), 200

# Route to negotiate an ad request for influencer
    @app.route('/api/negotiate/<int:id>', methods=['PUT'])
    def negotiate_ad_request(id):
        ad_request = AdRequest.query.get(id)
        if not ad_request:
            return jsonify({'error': 'AdRequest not found'}), 404

        new_price = request.json.get('negotiate_price')
        if not new_price:
            return jsonify({'error': 'Negotiate price not provided'}), 400

        ad_request.negotiate_price = new_price
        ad_request.status = 'under negotiation' 
        db.session.commit()
        return jsonify({'message': 'AdRequest negotiation updated successfully', 'ad_request': ad_request.id, 'negotiate_price': ad_request.negotiate_price}), 200
#Approve campaign request by Sponsor
    @app.route('/api/approve_campaign/<int:id>', methods=['POST'])
    def approve_campaign(id):
        try:
            # Log the incoming request
            app.logger.info(f"Approve request received for campaign ID: {id}")
            
            # Fetch the campaign from the database
            campaign = Campaign.query.get(id)
            if not campaign:
                app.logger.error(f"Campaign with ID {id} not found.")
                return jsonify({'error': 'Campaign not found'}), 404
            
            # Update the campaign status
            campaign.status = 'accepted'
            db.session.commit()

            # Log the success and return a confirmation response
            app.logger.info(f"Campaign with ID {id} approved successfully.")
            return jsonify({'message': 'Campaign approved successfully', 'Campaign ID': campaign.id}), 200
        except Exception as e:
            # Log the error and return an error response
            app.logger.error(f"Error approving campaign: {e}")
            return jsonify({'error': 'Failed to approve campaign'}), 500


    

#Reject campaign request for sponsor
    @app.route('/reject_campaign/<int:id>', methods=['POST'])
    def reject_campaign(id):
        campaign = Campaign.query.get(id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404

        campaign.status = 'rejected'
        db.session.commit()
        return jsonify({'message': 'Campaign rejected successfully', 'Campaign ID': campaign.id}), 200
    
    from sqlalchemy.orm import joinedload


# get campaign request for sponsor
    @app.route('/api/get_campaign_requests', methods=['GET'])
    def get_campaign_requests():
        # Fetch campaign requests with 'requested' status
        campaign_requests = Campaign.query.filter_by(status='requested').all()

        result = []
        for campaign in campaign_requests:
            influencer = Influencer.query.get(campaign.infl_id)
            name=influencer.name
            result.append({
                'id': campaign.id,
                'title': campaign.title,
                'description': campaign.description,
                'budget': campaign.budget,
                'category': campaign.category,
                'status': campaign.status,
                'influencerName': name if influencer else 'Unknown',  # Get name if exists
            })

        return jsonify({'campaignRequests': result}), 200
    



    @app.route('/api/active-campaigns', methods=['GET'])
    @jwt_required()
    def get_active_campaigns():
        try:
            # Get the current user from the JWT token
            current_user = get_jwt_identity()

            # Fetch the influencer's record based on their email
            user = Influencer.query.filter_by(email=current_user['email']).first()
            if not user:
                return jsonify({'error': 'Influencer not found'}), 404

            # Query active campaigns for this influencer (status = 'accepted')
            active_campaigns = Campaign.query.filter(
                Campaign.infl_id == user.id,
                Campaign.status.in_(['accepted', 'completed', 'in progress'])
            ).all()

            # Format the response
            result = [campaign.to_dict() for campaign in active_campaigns]
            return jsonify({'activeCampaigns': result}), 200

        except Exception as e:
            app.logger.error(f"Error fetching active campaigns: {e}")
            return jsonify({'error': 'Failed to fetch active campaigns'}), 500
    @app.route('/api/update_campaign_status/<int:campaign_id>', methods=['PUT'])
    @jwt_required()
    def update_campaign_status(campaign_id):
        try:
            # Get the current user from the JWT token
            current_user = get_jwt_identity()

            # Fetch the influencer's record
            influencer = Influencer.query.filter_by(email=current_user['email']).first()
            if not influencer:
                return jsonify({'error': 'Influencer not found'}), 404

            # Fetch the campaign by ID and ensure it belongs to the influencer
            campaign = Campaign.query.filter_by(id=campaign_id, infl_id=influencer.id).first()
            if not campaign:
                return jsonify({'error': 'Campaign not found or not authorized to update'}), 404

            # Parse the request body to get the updated status
            data = request.get_json()
            new_status = data.get('status')

            if new_status not in ['in progress', 'completed']:
                return jsonify({'error': 'Invalid status value'}), 400

            # Update the campaign status
            campaign.status = new_status
            db.session.commit()

            return jsonify({'message': 'Campaign status updated successfully', 'Campaign ID': campaign.id}), 200

        except Exception as e:
            app.logger.error(f"Error updating campaign status: {e}")
            return jsonify({'error': 'Failed to update campaign status'}), 500
        


        
    @app.route('/api/update-ad-request-status/<int:ad_request_id>', methods=['PUT'])
    @jwt_required()
    def update_ad_request_status(ad_request_id):
        try:
            # Get the request JSON data
            data = request.get_json()
            
            # Validate the presence of 'status' in the request
            if 'status' not in data:
                return jsonify({'error': 'Status field is required'}), 400

            # Find the Ad Request by its ID
            ad_request = AdRequest.query.filter_by(id=ad_request_id).first()
            
            if not ad_request:
                return jsonify({'error': 'Ad Request not found'}), 404

            # Update the status field
            ad_request.status = data['status']
            db.session.commit()

            # Return success response
            return jsonify({
                'message': 'Ad Request status updated successfully',
                'ad_request': {
                    'id': ad_request.id,
                    'status': ad_request.status,
                }
            }), 200
        except Exception as e:
            db.session.rollback()  # Rollback any failed transactions
            return jsonify({'error': str(e)}), 500

    @app.route('/api/influencer-profile/<int:id>', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def get_influencer_profile(id):
        try:
            # Fetch influencer by ID
            influencer = Influencer.query.get(id)
            if not influencer:
                return jsonify({'error': 'Influencer not found'}), 404

            # Serialize influencer data using the to_dict method
            influencer_data = influencer.to_dict()
            return jsonify(influencer_data), 200

        except Exception as e:
            app.logger.error(f"Error fetching influencer profile: {e}")
            return jsonify({'error': 'Failed to fetch influencer profile'}), 500

        
    @app.route('/api/edit-profile/<int:id>', methods=['PUT'])
    @jwt_required()  # Ensures the user is authenticated with a JWT token
    def edit_influencer_profile(id):
        try:
            # Get the current user's email from the JWT token
            current_user_identity = get_jwt_identity()
            current_user_email = current_user_identity.get('email')   # Assumes the JWT identity contains the user's email
            print(current_user_email)

            # Fetch influencer by ID
            influencer = Influencer.query.get(id)
            if not influencer:
                return jsonify({'error': 'Influencer not found'}), 404

            # Ensure the authenticated user is authorized to edit their own profile
            if influencer.email != current_user_email:
                return jsonify({'error': 'Unauthorized to edit this profile'}), 403

            # Get data from the request body
            data = request.get_json()

            # Validate and update influencer fields
            influencer.profile_summary = data.get('profile_summary', influencer.profile_summary)
            influencer.niche = data.get('niche', influencer.niche)
            influencer.reach = data.get('reach', influencer.reach)
            influencer.location = data.get('location', influencer.location)
            influencer.cost_per_ad = data.get('cost_per_ad', influencer.cost_per_ad)

            # Commit the changes to the database
            db.session.commit()

            # Return the updated influencer profile
            return jsonify(influencer.to_dict()), 200

        except Exception as e:
            app.logger.error(f"Error updating influencer profile: {e}")
            return jsonify({'error': 'Failed to update influencer profile'}), 500


        
    @app.route('/api/accept-negotiation/<int:id>', methods=['PUT'])
    @jwt_required()
    def accept_negotiation(id):
        try:
            ad_request = AdRequest.query.get_or_404(id)
            current_user = get_jwt_identity()
            user = Sponsor.query.filter_by(email=current_user['email']).first()

            if not user or ad_request.sponsor_id != user.id:
                return jsonify({'error': 'Unauthorized action'}), 403

            if ad_request.status != 'under negotiation':
                return jsonify({'error': 'AdRequest is not under negotiation'}), 400

            # Update status and budget
            ad_request.status = 'accepted'
            ad_request.budget = ad_request.negotiate_price

            db.session.commit()

            return jsonify({
                'message': 'Negotiation accepted successfully',
                'ad_request': ad_request.to_dict()
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    @app.route('/api/reject-negotiation/<int:id>', methods=['PUT'])
    @jwt_required()
    def reject_negotiation(id):
        try:
            ad_request = AdRequest.query.get_or_404(id)
            current_user = get_jwt_identity()
            user = Sponsor.query.filter_by(email=current_user['email']).first()

            if not user or ad_request.sponsor_id != user.id:
                return jsonify({'error': 'Unauthorized action'}), 403

            if ad_request.status != 'under negotiation':
                return jsonify({'error': 'AdRequest is not under negotiation'}), 400

            # Update the status to 'rejected'
            ad_request.status = 'rejected'
            db.session.commit()

            return jsonify({
                'message': 'Negotiation rejected successfully',
                'ad_request': ad_request.to_dict()
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    @app.route('/api/campaigns_admin', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def get_campaigns_admin():
        current_user = get_jwt_identity()  # Get current user from JWT token
        user = Admin.query.filter_by(email=current_user['email']).first()  # Ensure the user is an admin

        if not user:
            return jsonify({"msg": "User is not authorized"}), 403

        # Fetching all campaigns
        campaigns = Campaign.query.all()

        # Fetching sponsor names based on sponsor_id
        campaigns_with_sponsors = []
        for campaign in campaigns:
            sponsor = Sponsor.query.get(campaign.sponsor_id)  # Fetch sponsor based on sponsor_id
            campaigns_with_sponsors.append({
                **campaign.to_dict(),
                "sponsor_name": sponsor.name if sponsor else "Unknown Sponsor"  # Use sponsor name if found
            })

        return jsonify(campaigns_with_sponsors), 200



    @app.route('/api/flag_campaign/<int:campaign_id>', methods=['POST'])
    @jwt_required()
    def flag_campaign(campaign_id):
        current_user = get_jwt_identity()
        user = Admin.query.filter_by(email=current_user['email']).first()

        if not user:
            return jsonify({"msg": "User is not authorized"}), 403

        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({"msg": "Campaign not found"}), 404

        campaign.flag = True
        db.session.commit()
        return jsonify({"msg": "Campaign flagged successfully"}), 200

    @app.route('/api/unflag_campaign/<int:campaign_id>', methods=['POST'])
    @jwt_required()
    def unflag_campaign(campaign_id):
        current_user = get_jwt_identity()
        user = Admin.query.filter_by(email=current_user['email']).first()

        if not user:
            return jsonify({"msg": "User is not authorized"}), 403

        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({"msg": "Campaign not found"}), 404

        campaign.flag = False
        db.session.commit()
        return jsonify({"msg": "Campaign unflagged successfully"}), 200



    @app.route('/api/campaign_details/<int:campaign_id>', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout = 5)
    def get_campaign_details(campaign_id):
        current_user = get_jwt_identity()
        user = Admin.query.filter_by(email=current_user['email']).first()

        if not user:
            return jsonify({"msg": "User is not authorized"}), 403

        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({"msg": "Campaign not found"}), 404

        return jsonify(campaign.to_dict()), 200



    @app.route('/api/sponsor-profile/<int:id>', methods=['GET'])
    @jwt_required()
    @cache.cached(timeout=5)
    def get_sponsor_profile(id):
        try:
            sponsor = Sponsor.query.get(id)
            if not sponsor:
                return jsonify({'error': 'Sponsor not found'}), 404

            sponsor_data = sponsor.to_dict()
            return jsonify(sponsor_data), 200

        except Exception as e:
            app.logger.error(f"Error fetching sponsor profile: {e}")
            return jsonify({'error': 'Failed to fetch sponsor profile'}), 500
        
    @app.route('/api/edit-sponsor-profile/<int:id>', methods=['PUT'])
    @jwt_required()
    def edit_sponsor_profile(id):
        try:
            current_user_identity = get_jwt_identity()
            current_user_email = current_user_identity.get('email')

            sponsor = Sponsor.query.get(id)
            if not sponsor:
                return jsonify({'error': 'Sponsor not found'}), 404

            # Ensure the authenticated user is authorized to edit their own profile
            if sponsor.email != current_user_email:
                return jsonify({'error': 'Unauthorized to edit this profile'}), 403

            data = request.get_json()

            # Update fields
            sponsor.description = data.get('description', sponsor.description)
            sponsor.industry_type = data.get('industry_type', sponsor.industry_type)
            sponsor.industry_scale = data.get('industry_scale', sponsor.industry_scale)
            sponsor.budget_for_ad = data.get('budget_for_ad', sponsor.budget_for_ad)

            # Commit changes to the database
            db.session.commit()

            return jsonify(sponsor.to_dict()), 200

        except Exception as e:
            app.logger.error(f"Error updating sponsor profile: {e}")
            return jsonify({'error': 'Failed to update sponsor profile'}), 500
        

#Tasks

    @app.get('/celery/export_campaigns_adrequests')
    def export_campaigns():
        # Trigger the Celery task to export completed campaigns and adrequests
        from tasks import export_completed_campaigns_and_adrequests
        task = export_completed_campaigns_and_adrequests.apply_async()

        # Return the task ID and status as a JSON response
        return jsonify({
            'task_id': task.id,
            'status': task.status
        })

