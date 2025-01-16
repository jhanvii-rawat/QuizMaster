from flask import Flask
import views
from extentions import db, security
from initial_data import create_data
from dotenv import load_dotenv
import os



def create_app():
    app = Flask(__name__)
    load_dotenv()  ##to load information from .env 

    app.config['SECRET_KEY']= os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI']=  "sqlite:///data.db"
    app.config['SECURITY_PASSWORD_SALT'] = os.getenv('SALT')

    # configure token
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = os.getenv('AUTHENTICATION_TOKEN')
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600 #1hr
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True


    # cache config

    #app.config["CACHE_DEFAULT_TIMEOUT"] = 300
    #app.config["DEBUG"] = True
    #app.config["CACHE_TYPE"] = "RedisCache"
    #app.config["CACHE_REDIS_PORT"] = 6379



    db.init_app(app)
    
    with app.app_context():
        from models import User, Role
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role) 

        security.init_app(app, user_datastore)

        db.create_all()
            
        create_data(user_datastore)

   
    views.create_view(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)