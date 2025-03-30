import csv
from datetime import datetime
import io
from celery import shared_task
from flask_excel import make_response_from_query_sets
import time
from mail_service import send_email
from models import Chapter, Quiz, Score, Subject, User
from sqlalchemy.orm import joinedload
from utility import format_report


# igonre_resuls mean you dont store the result, where results don't matter

@shared_task(ignore_result = False)
def export_job():
    all_quizzes = Quiz.query.with_entities(Subject.id, Subject.name)

    csv_out = make_response_from_query_sets(all_quizzes,['ID', 'Name of subject'], 'csv', file_name="All_Quizzes.csv")

   
    with open('./user-downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)
    

    return 'file.csv'

@shared_task(ignore_result=False, name="monthly_report")
def monthly_report():
    users = User.query.filter(User.id != 1).all()
    
    for user in users:
        user_data = {}
        user_data["username"] = user.name
        user_data["email"] = user.email

        
        user_scores = Score.query.filter_by(user_id=user.id).all()
        #print("User Scores:", user_scores)  ## debug steps
        
        subject_scores = {}  
        best_quiz = None
        best_score = 0

        for score in user_scores:
            quiz = Quiz.query.get(score.quiz_id) 
            subject = quiz.chapter.subject.name  
            
            if score.total_scored > best_score:
                best_score = score.total_scored
                best_quiz = quiz.remarks 
          
            if subject not in subject_scores:
                subject_scores[subject] = []
            subject_scores[subject].append(score.total_scored)

        
        user_data["tota_quizzes"] = len(user_scores)

       
        if subject_scores:
            top_subject = max(subject_scores, key=lambda s: sum(subject_scores[s]) / len(subject_scores[s]))
        else:
            top_subject = "N/A"

       
        user_data["top_subject"] = top_subject
        user_data["best_quiz"] = best_quiz if best_quiz else "N/A"
        user_data["best_score"] = best_score if best_quiz else "N/A"

       
        #print("User Data:", user_data)   ## debugging steps
        message = format_report("templates/MonthlyReport.html", user_data)
        #print("###  Message ##", message)  ## debuggingsteps
        send_email(user.email, subject="Your Monthly Report", message=message)

    return "Monthly Report sent"


@shared_task(ignore_result=False, name="daily_reminder")
def daily_reminder():
    users = User.query.filter(User.id != 1).all()
    
    #print("Total users:", len(users))  # Debugging step
    
    if not users:
        print("No users found!")  # Debugging step
        return "No users to send reminders"

    for user in users:
        user_data = {
            "username": user.name,
            "email": user.email
        }
       # print(f"Processing user: {user.email}")

        message = format_report("templates/DailyReminder.html", user_data)
        #print("### Message ##", message)  # Debugging
        send_email(user.email, subject="Daily Learning Reminder", message=message)

    return "Daily reminders sent"





     ##celery -A app:celery_app worker -l INFO
     ##celery -A app:celery_app beat -l INFO
     ##~/go/bin/MailHog
