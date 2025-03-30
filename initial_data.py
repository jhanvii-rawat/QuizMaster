from datetime import datetime
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extentions import db




def create_data(user_datastore : SQLAlchemyUserDatastore):
    # create roles
    user_datastore.find_or_create_role(name= 'admin', description = "Administrator")
    user_datastore.find_or_create_role(name= 'user', description = "User")

    # create user data

    if not user_datastore.find_user(email = "admin@iitm.ac.in"):
        user_datastore.create_user(email = "admin@iitm.ac.in", 
                                   password = hash_password('pass'),
                                   active= True,
                                   date_created = datetime(2025, 1, 30, 11, 21, 34, 818782),
                                   name="admin", 
                                   roles=['admin'])
        
    if not user_datastore.find_user(email = "user@iitm.ac.in"):
        user_datastore.create_user(email = "user@iitm.ac.in", 
                                   password = hash_password('pass'),
                                   active= True,
                                   date_created = datetime(2025, 2, 14, 11, 21, 34, 818782),
                                   name= "user",
                                   roles=['user'])
        
    if not user_datastore.find_user(email = "user2@iitm.ac.in"):
        user_datastore.create_user(email = "user2@iitm.ac.in", 
                                   password = hash_password('pass'),
                                   active= True,
                                   date_created = datetime(2025, 2, 14, 11, 21, 34, 818782),
                                   name= "user2",
                                   roles=['user'])

    db.session.commit()