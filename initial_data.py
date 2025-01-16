from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extentions import db




def create_data(user_datastore : SQLAlchemyUserDatastore):
    # create roles
    user_datastore.find_or_create_role(name= 'admin', description = "Administrator")
    user_datastore.find_or_create_role(name= 'user', description = "User")

    # create user data

    if not user_datastore.find_user(email = "admin@iitm.ac.in"):
        user_datastore.create_user(email = "admin@iitm.ac.in", password = hash_password('pass'),name="admin",active = True, roles=['admin'])
    if not user_datastore.find_user(email = "user@iitm.ac.in"):
        user_datastore.create_user(email = "user@iitm.ac.in", password = hash_password('pass'),name= "user",active = True, roles=['user'])

    db.session.commit()