import celery
from flask import Flask

import views
from extentions import db, security, cache
from initial_data import create_data
from dotenv import load_dotenv
import os
from worker import celery_init_app
import resources
import flask_excel as excel
from celery.schedules import crontab
from task import daily_reminder, monthly_report



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

    app.config["CACHE_DEFAULT_TIMEOUT"] = 300
    app.config["DEBUG"] = True
    app.config["CACHE_TYPE"] = "RedisCache"
    app.config["CACHE_REDIS_PORT"] = 6379
    app.config['CACHE_REDIS_DB'] = 0
    app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
    

    cache.init_app(app)



    db.init_app(app)
    
    with app.app_context():
        from models import User, Role
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role) 

        security.init_app(app, user_datastore)

        db.create_all()
            
        create_data(user_datastore)

    app.config["WTF_CSRF_CHECK_DEFAULT"] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True
    views.create_view(app, user_datastore,db)

    resources.api.init_app(app)

    return app

celery_app = None
app = create_app()

    # cerating celery application
celery = celery_init_app(app)
excel.init_excel(app)
celery.autodiscover_tasks



@celery.on_after_finalize.connect
def setup_periodic_task(sender, **kwargs):
    sender.add_periodic_task(
        #monthly- on day 1 at 9 AM
        #crontab(day_of_month='1', hour='9'),
        crontab('*/1'),
        monthly_report.s(),
    )

    sender.add_periodic_task(
        #daily 10 AM
        #crontab(hour=10, minute=0),
        crontab('*/1'),
        daily_reminder.s(),
    )


if __name__ == "__main__":
   
    app.run(debug=True)