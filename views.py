import csv
import io
from argon2 import verify_password
from flask import Flask, jsonify, make_response, render_template, render_template_string, request, send_file, send_from_directory
from flask_login import login_required
from flask_security import auth_required, current_user, roles_required,SQLAlchemySessionUserDatastore, roles_accepted
from flask_security.utils import hash_password
from models import Subject, User

from celery.result import AsyncResult

def create_view(app : Flask, user_datastore : SQLAlchemySessionUserDatastore, db ):


    #homepage
    @app.route('/')
    def home():
        return render_template("index.html")
        
    
    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = 'user'  # Default role for all new signups
        

        if not email or not password or not name:
            return jsonify({"message": "Invalid inputs"}), 404
        
        # Check if a user with the given email already exists
        user = user_datastore.find_user(email=email)

        if user:
            return jsonify({"message": "You have already registered"}), 404

        try:
            # Create a new user with the default role
            user_datastore.create_user(email=email, password=hash_password(password), name=name, roles=[role], active=True)
            db.session.commit()
            return jsonify({"message": "User created"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Error creating user: {str(e)}"}), 400
            

    @app.route('/login', methods=['POST'])
    def user_login():

        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        
        if not email or not password:
            return jsonify({'message' : 'not valid email or password'}), 404
        
        user = user_datastore.find_user(email = email)

        if not user:
            return jsonify({'message' : 'invalid user'}), 404
        
        if verify_password(password, user.password):
            return jsonify({
        "success": True,
        "user_id": user.id,
        "role": user.role,  # 'admin' or 'user'
       
        "message": "Login successful"
    }), 200
        else:
            return jsonify({'message' : 'wrong password'})
        


    @app.route('/profile')
    @auth_required('session', 'token')
    def profile():
        return render_template_string(

            '''
                <h1> Welcome to profile<h1>
                <p> Welcome, {{current_user.name}}</p>
                <a href="/logout"> logout</a>
            '''

        ) 
    
    @app.route('/admin-dashboard')
    @roles_accepted('admin')  ##role based authentication
    def admin_dashboard():
        return render_template_string(

            '''
                <h1> Welcome to Dashboard<h1>
                <p> Welcome, {{current_user.name}}</p>
                <a href="/logout"> logout</a>
            '''

        ) 


############################# QUIZ related #####################

    @app.route('/add-subject')
    @roles_accepted('admin')  ##role based authentication
    def add_subject():
        return render_template_string(

            '''
                <h1> Welcome to Add Subject<h1>
                <p> Welcome, {{current_user.name}}</p>
                <a href="/logout"> logout</a>
            '''

        ) 
 

    ###### celery #########

   
    
    @app.route('/test')
    def test():
        return "Works!", 200

  
  