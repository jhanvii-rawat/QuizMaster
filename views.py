from flask import render_template, render_template_string
from flask_security import auth_required, current_user, roles_required, roles_accepted


def create_view(app):


    #homepage
    @app.route('/')
    def home():
        return render_template("index.html")
        
    

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
    @ roles_accepted('admin')  ##role based authentication
    def admin_dashboard():
        return render_template_string(

            '''
                <h1> Welcome to Dashboard<h1>
                <p> Welcome, {{current_user.name}}</p>
                <a href="/logout"> logout</a>
            '''

        ) 