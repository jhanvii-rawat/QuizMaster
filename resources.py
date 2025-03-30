## API calls/ CRUD goes from here

from io import StringIO
import io
import random
from flask import Response, jsonify, make_response, request
from flask_login import current_user, login_required
from sqlalchemy import distinct, func, text
from sqlalchemy.orm import joinedload
from extentions import db, cache
from flask_restful import Resource,  Api, fields, marshal_with, reqparse
from models import Score, Subject, Question, Quiz,  Chapter, User
from datetime import datetime, time
import csv

from flask_security import auth_required

api= Api(prefix='/api')




## automatically converts the returned data 
## into a properly formatted JSON response

#Parser for question for better validation


question_parser = reqparse.RequestParser()
question_parser.add_argument('quiz_id', type=int, required=True, help="Quiz ID is required")
question_parser.add_argument('question_statement', type=str, required=True, help="Question statement is required")
question_parser.add_argument('option1', type=str, required=True, help="Option 1 is required")
question_parser.add_argument('option2', type=str, required=True, help="Option 2 is required")
question_parser.add_argument('option3', type=str, required=False, help="Option 3 is optional")
question_parser.add_argument('option4', type=str, required=False, help="Option 4 is optional")
question_parser.add_argument('correct_option', type=str, required=True, help="Correct option is required")

question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'question_statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.String
}

# Question Resource
class QuestionResource(Resource):
    def post(self):
        args = question_parser.parse_args()

        quiz = Quiz.query.get(args['quiz_id'])
        if not quiz:
            return {'message': 'Quiz not found'}, 404

     
        valid_options = [args['option1'], args['option2'], args.get('option3'), args.get('option4')]
        if args['correct_option'] not in valid_options:
            return {'message': 'Correct option must match one of the provided options'}, 400

 
        try:
            new_question = Question(
                quiz_id=args['quiz_id'],
                question_statement=args['question_statement'],
                option1=args['option1'],
                option2=args['option2'],
                option3=args.get('option3'), 
                option4=args.get('option4'),
                correct_option=args['correct_option']
            )
            db.session.add(new_question)
            db.session.commit()
            return {
                'id': new_question.id,
                'quiz_id': new_question.quiz_id,
                'question_statement': new_question.question_statement,
                'option1': new_question.option1,
                'option2': new_question.option2,
                'option3': new_question.option3,
                'option4': new_question.option4,
                'correct_option': new_question.correct_option
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error saving question: {str(e)}'}, 500
        
    def put(self, question_id):
        args = question_parser.parse_args()


        question = Question.query.get(question_id)
        if not question:
            return {'message': 'Question not found'}, 404

        valid_options = [args['option1'], args['option2'], args.get('option3'), args.get('option4')]
        if args['correct_option'] not in valid_options:
            return {'message': 'Correct option must match one of the provided options'}, 400

        try:
            question.question_statement = args['question_statement']
            question.option1 = args['option1']
            question.option2 = args['option2']
            question.option3 = args.get('option3')
            question.option4 = args.get('option4')
            question.correct_option = args['correct_option']
            db.session.commit()
            return {
                'id': question.id,
                'quiz_id': question.quiz_id,
                'question_statement': question.question_statement,
                'option1': question.option1,
                'option2': question.option2,
                'option3': question.option3,
                'option4': question.option4,
                'correct_option': question.correct_option
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error updating question: {str(e)}'}, 500
        
    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {'message': 'Question not found'}, 404

        try:
            db.session.delete(question)
            db.session.commit()
            return {'message': 'Question deleted'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error deleting question: {str(e)}'}, 500


#############################################################################


#parser for quiz


quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('chapter_id', type=int, required=True, help="Chapter ID is required")
quiz_parser.add_argument('date_of_quiz', type=str, required=True, help="Date of quiz is required (YYYY-MM-DD)")
quiz_parser.add_argument('time_duration', type=str, required=False, help="Time duration is required (HH:MM format)")
quiz_parser.add_argument('remarks', type=str, required=False, help="Remarks for the quiz")


quiz_fields = {
    'id': fields.Integer,
    'chapter_id': fields.Integer,
    'date_of_quiz': fields.String,  
    'time_duration': fields.String,  
    'remarks': fields.String,
    'questions': fields.List(fields.Nested(question_fields)) 
}


#CRUP op on Quiz


from datetime import datetime

class QuizResource(Resource):
    
    
    @marshal_with(quiz_fields)
    def post(self):
        args = quiz_parser.parse_args()

        # Convert date_of_quiz to Date object
        try:
            date_of_quiz = datetime.strptime(args['date_of_quiz'], "%Y-%m-%d").date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

        time_duration = None
        if args.get('time_duration'):
            try:
                time_parts = args['time_duration'].split(':')  
                time_duration = time(int(time_parts[0]), int(time_parts[1]))
            except (ValueError, IndexError):
                return {'message': 'Invalid time format. Use HH:MM'}, 400

        new_quiz = Quiz(
            chapter_id=args['chapter_id'],
            date_of_quiz=date_of_quiz,
            time_duration=time_duration,
            remarks=args.get('remarks', None)
        )

        db.session.add(new_quiz)
        db.session.commit()

        return new_quiz, 201

    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        db.session.delete(quiz)
        db.session.commit()
        return {'message': 'Quiz deleted'}

    @marshal_with(quiz_fields)
    def put(self, quiz_id):
        args = request.json
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404

        # Convert date of quiz
        try:
            quiz.date_of_quiz = datetime.strptime(args['date_of_quiz'], "%Y-%m-%d").date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

        #Convert time
        if args.get('time_duration'):
            try:
                time_parts = args['time_duration'].split(':')
                quiz.time_duration = time(int(time_parts[0]), int(time_parts[1]))
            except (ValueError, IndexError):
                return {'message': 'Invalid time format. Use HH:MM'}, 400

        quiz.remarks = args.get('remarks', None)
        db.session.commit()
        return quiz
 
  
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz is not found'}, 404
        
        chapter = Chapter.query.get(quiz.chapter_id)
        subject = Subject.query.get(chapter.subject_id) if chapter else None
       

        return {
            'id': quiz.id,
            'date_of_quiz': quiz.date_of_quiz.strftime('%Y-%m-%d'),
            'time_duration': str(quiz.time_duration),
            'remarks': quiz.remarks,
            'chapter_name': chapter.name if chapter else "Unknown",
            'subject_name': subject.name if subject else "Unknown",
            'total_questions': len(quiz.questions),  
           
            'questions': [
                {
                    'id': q.id,
                    'question_statement': q.question_statement,
                    'option1': q.option1,
                    'option2': q.option2,
                    'option3': q.option3,
                    'option4': q.option4,
                    'correct_option': q.correct_option
                }
                for q in quiz.questions
            ],
        }

    


api.add_resource(QuizResource, "/quiz", "/quiz/<int:quiz_id>")
#####################################################################



# Parser for chapters
chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help="Chapter name is required")
chapter_parser.add_argument('description', type=str, required=False, help="Description of the chapter")
chapter_parser.add_argument('subject_id', type=int, required=True, help="Subject ID is required")


chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer,
    'quizzes': fields.List(fields.Nested(quiz_fields))  
}

#CRUD oop on chapters


class ChapterResource(Resource):
    @marshal_with(chapter_fields)
    def get(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {'message': 'Chapter is not found'}, 404
        return chapter
    
    

    def delete(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {'message': 'Chapter not found'}, 404
        db.session.delete(chapter)
        db.session.commit()
        return {'message': 'Chapter deleted'}

    @marshal_with(chapter_fields)
    def put(self, chapter_id):
        args = request.json
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {'message': 'Chapter not found'}, 404
        chapter.name = args['name']
        chapter.description = args['description']
        db.session.commit()
        return chapter


    @marshal_with(chapter_fields)
    def post(self):
  
        args = chapter_parser.parse_args()

        new_chapter = Chapter(
            name=args['name'],
            description=args['description'],
            subject_id=args['subject_id']
        )

       
        db.session.add(new_chapter)
        db.session.commit()

        return new_chapter, 201  


#############################################################################

# Subject Pasrser : for 
subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help="Subject name is required")
subject_parser.add_argument('description', type=str, required=False, help="Description of the subject")



# Subject fields (includes chapters)


subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'chapters': fields.List(fields.Nested(chapter_fields))  
}


#subject CRUD op

class SubjectResource(Resource):
    @marshal_with(subject_fields)
    def get(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        return subject

    def delete(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        db.session.delete(subject)
        db.session.commit()
        return {'message': 'Subject deleted'}

    @marshal_with(subject_fields)
    def put(self, subject_id):
        args = request.json
        subject = Subject.query.get(subject_id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        subject.name = args['name']
        subject.description = args['description']
        db.session.commit()
        return subject

class SubjectListResource(Resource):
    @marshal_with(subject_fields)
    def get(self):
        subjects = Subject.query.all()
        return subjects

    @marshal_with(subject_fields)
    def post(self):
        args = request.json

        # Validate that fields are not blank
        name = args.get('name', '').strip()
        description = args.get('description', '').strip()

        if not name or not description:
            return {"message": "Name and description cannot be blank."}, 400  # Bad Request

        # Create and store the new subject
        new_subject = Subject(name=name, description=description)
        db.session.add(new_subject)
        db.session.commit()

        return new_subject, 201  # Created
    

#######################################

# Score Parser
score_parser = reqparse.RequestParser()
score_parser.add_argument('quiz_id', type=int, required=True, help="Quiz ID is required")
score_parser.add_argument('user_id', type=int, required=True, help="User ID is required")
score_parser.add_argument('time_stamp_of_attempt', type=str, required=True, help="Timestamp is required")
score_parser.add_argument('total_scored', type=float, required=True, help="Total scored is required")

# Function to handle timestamp conversion
def parse_timestamp(timestamp_str):
    try:
        return datetime.fromisoformat(timestamp_str.replace("Z", ""))
    except ValueError:
        return None

# Score fields for response marshalling
score_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'user_id': fields.Integer,
    'time_stamp_of_attempt': fields.String,
    'total_scored': fields.Float
}

# Score CRUD Operations
class ScoreResource(Resource):
    @marshal_with(score_fields)
    def get(self, score_id):
        score = Score.query.get(score_id)
        if not score:
            return {'message': 'Score not found'}, 404
        return score

    def delete(self, score_id):
        score = Score.query.get(score_id)
        if not score:
            return {'message': 'Score not found'}, 404
        db.session.delete(score)
        db.session.commit()
        return {'message': 'Score deleted'}

    @marshal_with(score_fields)
    @login_required
    def put(self, score_id):
        args = request.json
        score = Score.query.get(score_id)

        if not score:
            return jsonify({"message": "Score not found"}), 404

        if score.user_id != current_user.id:
            return jsonify({"message": "Unauthorized access"}), 403

        quiz = Quiz.query.get(score.quiz_id)
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        user_answers = args.get("answers", {})
        if not user_answers:
            return jsonify({"message": "No answers provided"}), 400

        # Validate number of questions to avoid division by zero
        total_questions = len(quiz.questions)
        if total_questions == 0:
            return jsonify({"message": "Quiz has no questions"}), 400

        total_score = sum(
            1 for question in quiz.questions
            if user_answers.get(str(question.id), "").strip().lower() == question.correct_option.strip().lower()
        )

        score.total_scored = (total_score / total_questions) * 100

        if "time_stamp_of_attempt" in args:
            parsed_time = parse_timestamp(args["time_stamp_of_attempt"])
            if parsed_time is None:
                return jsonify({"message": "Invalid timestamp format"}), 400
            score.time_stamp_of_attempt = parsed_time

        db.session.commit()
        return jsonify({"message": "Score updated", "total_scored": score.total_scored}), 200

class ScoreListResource(Resource):
    @marshal_with(score_fields)
    def get(self):
        scores = Score.query.all()
        return scores

    @marshal_with(score_fields)
    def post(self):
        args = request.json

        quiz_id = args.get('quiz_id')
        user_id = args.get('user_id')
        time_stamp_of_attempt = args.get('time_stamp_of_attempt', "").strip()
        total_scored = args.get('total_scored')

        if not quiz_id or not user_id or not time_stamp_of_attempt or total_scored is None:
            return {"message": "All fields are required"}, 400  

        # Validate timestamp
        parsed_time = parse_timestamp(time_stamp_of_attempt)
        if parsed_time is None:
            return {"message": "Invalid timestamp format"}, 400

        # Check if the user has already submitted a score for the quiz
        existing_score = Score.query.filter_by(quiz_id=quiz_id, user_id=user_id).first()
        if existing_score:
            return {"message": "User has already submitted a score for this quiz"}, 400  

        new_score = Score(
            quiz_id=quiz_id,
            user_id=user_id,
            time_stamp_of_attempt=parsed_time,
            total_scored=total_scored
        )
        db.session.add(new_score)
        db.session.commit()

        return new_score, 201  # Created

api.add_resource(ScoreListResource, "/scores")  
api.add_resource(ScoreResource, "/scores/<int:score_id>")


#################### API END POINTS #########################


api.add_resource(SubjectListResource, "/subjects")  # list
api.add_resource(SubjectResource, "/subjects/<int:subject_id>")
api.add_resource(ChapterResource, "/chapters", "/chapters/<int:chapter_id>")

api.add_resource(QuestionResource, "/questions", "/questions/<int:question_id>")
 


# API for Reports


class ReportResource(Resource):
    def get(self):
        report_type = request.args.get('type')
        filter_value = request.args.get('filter')

        if report_type == 'registered_users':
            return self.get_registered_users()
        
        elif report_type == 'registered_users_over_time':
            return self.get_registered_users_over_time()
        
        elif report_type == 'quiz_per_subject':
            return self.get_quiz_per_subject()
  
        elif report_type == 'user_quiz':
            return self.get_user_quiz(filter_value)

        elif report_type == 'quiz_bubble':
            return self.get_quiz_bubble()

        elif report_type == 'total_registered_users':  
            return self.get_total_registered_users()
        
        elif report_type == 'subjects_chapters_quizzes':  
            return self.get_subjects_chapters_quizzes()
        
        elif report_type == 'total_in_year_2025':
            return self.get_total_in_year_2025()


        return {'error': 'Invalid report type'}, 400

    def get_total_registered_users(self):
        total_users = User.query.count()  #ets the total number of registered users
        return jsonify({"total": total_users})


    def get_registered_users(self):
        users = User.query.all()
        return jsonify([
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "active": user.active,
                "date_created": user.date_created.strftime('%Y-%m-%d %H:%M:%S')
            }
            for user in users
        ])

    def get_registered_users_over_time(self):
        current_year = datetime.now().year
        monthly_counts = (
            db.session.query(
                func.strftime('%m', User.date_created), func.count(User.id)
            )
            .filter(func.strftime('%Y', User.date_created) == str(current_year))
            .group_by(func.strftime('%m', User.date_created))
            .order_by(func.strftime('%m', User.date_created))
            .all()
        )

        return jsonify([{"month": month, "count": count} for month, count in monthly_counts])

    def get_quiz_bubble(self): 
        subjects = Subject.query.options(joinedload(Subject.chapters).joinedload(Chapter.quizzes)).all()
        response = []
        for subject in subjects:
            chapter_count = len(subject.chapters)
            quiz_count = sum(len(chapter.quizzes) for chapter in subject.chapters)
            response.append({
                "name": subject.name,
                "chapter_count": chapter_count,
                "quiz_count": quiz_count
            })
        return jsonify({"subjects": response})
    
    def get_subjects_chapters_quizzes(self):
        total_subjects = Subject.query.count()
        total_chapters = Chapter.query.count()
        total_quizzes = Quiz.query.count()

        return jsonify({
            "subjects": total_subjects,
            "chapters": total_chapters,
            "quizzes": total_quizzes
        })
    
    def get_user_quiz(self, filter_value):
        try:
            if filter_value == "daily":
                quizzes = (
                    db.session.query(func.date(Score.time_stamp_of_attempt), func.count(Score.id))
                    .group_by(func.date(Score.time_stamp_of_attempt))
                    .all()
                )
            elif filter_value == "monthly":
                quizzes = (
                    db.session.query(func.strftime('%m', Score.time_stamp_of_attempt), func.count(Score.id))
                    .group_by(func.strftime('%m', Score.time_stamp_of_attempt))
                    .all()
                )
            elif filter_value == "yearly":
                quizzes = (
                    db.session.query(func.strftime('%Y', Score.time_stamp_of_attempt), func.count(Score.id))
                    .group_by(func.strftime('%Y', Score.time_stamp_of_attempt))
                    .all()
                )
            else:
                return jsonify({"error": "Invalid filter"}), 400

            return jsonify([{"label": str(label), "count": count} for label, count in quizzes])

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    def get_quiz_per_subject(self):
        quizzes_per_subject = (
            db.session.query(Subject.name, func.count(Quiz.id))
            .join(Chapter)
            .join(Quiz)
            .group_by(Subject.name)
            .all()
        )
        return jsonify([{"subject": subject, "quiz_count": count} for subject, count in quizzes_per_subject])
    
    def get_total_in_year_2025(self):
        total_quizzes_2025 = (
            db.session.query(func.count(Score.id))
            .filter(func.strftime('%Y', Score.time_stamp_of_attempt) == '2025')
            .scalar()
        )
        return jsonify({"year": 2025, "total_quizzes": total_quizzes_2025})
    

    




api.add_resource(ReportResource, '/report')



####################################################### QUIZ related ##############################

class QuizQuestionResource(Resource):
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return {'message': 'Quiz not found'}, 404
            
        return {
            'id': quiz.id,
            'date_of_quiz': quiz.date_of_quiz.strftime('%Y-%m-%d'),
            'time_duration': str(quiz.time_duration),
            'remarks': quiz.remarks,
            'chapter_name': quiz.chapter.name if quiz.chapter else "Unknown",
            'subject_name': quiz.chapter.subject.name if quiz.chapter and quiz.chapter.subject else "Unknown",
            'questions': [
                {
                    'id': q.id,
                    'question_statement': q.question_statement,
                    'options': [q.option1, q.option2, q.option3, q.option4],
                   
                }
                for q in quiz.questions
            ]
        }
api.add_resource(QuizQuestionResource, "/quizzes/<int:quiz_id>/attempt")




class QuizSubmissionResource(Resource):
    @login_required
    def post(self, quiz_id):
        data = request.get_json()

        if not data:
            return {"message": "Invalid JSON body"}, 400

        try:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return {"message": "Quiz not found"}, 404

            
            try:
                attempt_time = datetime.fromisoformat(data.get("time_stamp_of_attempt").replace("Z", ""))
            except ValueError:
                return {"message": "Invalid datetime format"}, 400

            
            total_score = 0
            for question in quiz.questions:
                selected_answer = data.get("answers", {}).get(str(question.id), "").strip().lower()
                correct_answer = question.correct_option.strip().lower()
                if selected_answer == correct_answer:
                    total_score += 1

            total_scored = (total_score / len(quiz.questions)) * 100

           
            new_score = Score(
                quiz_id=quiz_id,
                user_id=current_user.id,
                time_stamp_of_attempt=attempt_time,
                total_scored=total_scored
            )

            db.session.add(new_score)
            db.session.commit()

            score_id = Score.query.filter_by(
        quiz_id=quiz_id, user_id=current_user.id
    ).first().id

           
            return {
                "message": "Quiz submitted successfully",
                "total_scored": total_scored,
                "score_id": score_id  
            }, 201
            
        except Exception as e:
            return {"message": str(e)}, 500

api.add_resource(QuizSubmissionResource, "/quizzes/<int:quiz_id>/submit")



class QuizListResource(Resource):
    @login_required
   
    def get(self, chapter_id=None):
        try:
            query = Quiz.query.options(
                db.joinedload(Quiz.questions),
                db.joinedload(Quiz.chapter).joinedload(Chapter.subject)
            )

            if chapter_id is not None:
                chapter = Chapter.query.get(chapter_id)
                if not chapter:
                    return {"error": "Chapter not found"}, 404
                query = query.filter_by(chapter_id=chapter_id)

            quizzes = query.all()
            quiz_list = []

            for quiz in quizzes:
                score = Score.query.filter_by(
                    user_id=current_user.id,
                    quiz_id=quiz.id
                ).order_by(Score.time_stamp_of_attempt.desc()).first()

                quiz_list.append({
                    'id': quiz.id,
                    'chapter_id': quiz.chapter_id,
                    'chapter_name': quiz.chapter.name if quiz.chapter else "Unknown",
                    'subject_name': quiz.chapter.subject.name if quiz.chapter and quiz.chapter.subject else "Unknown",
                    'date_of_quiz': quiz.date_of_quiz.strftime('%Y-%m-%d'),
                    'remarks': quiz.remarks,
                    'total_questions': len(quiz.questions),
                    'time_duration': str(quiz.time_duration),
                    'marks': score.total_scored if score else None,
                    'score_id' : score.id if score else None,
                    'retake_quiz': bool(score),
                    'view_answers': bool(score)
                })

            return jsonify(quiz_list)

        except Exception as e:
            return {"error": str(e)}, 500

api.add_resource(QuizListResource, '/quizzes', '/quizzes/<int:chapter_id>')



class QuizAnswersResource(Resource):
    @login_required
    def get(self, quiz_id):
        try:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return {"error": f"Quiz with ID {quiz_id} not found"}, 404
            
            attempt = Score.query.filter_by(
                user_id=current_user.id,
                quiz_id=quiz_id
            ).first()

            if not attempt:
                return {"error": "You must attempt the quiz before viewing answers"}, 403

            questions = [{
                'id': q.id,
                'question_statement': q.question_statement,
                'options': [
                    {'text': q.option1, 'is_correct': q.correct_option == "1"},
                    {'text': q.option2, 'is_correct': q.correct_option == "2"},
                    {'text': q.option3, 'is_correct': q.correct_option == "3"},
                    {'text': q.option4, 'is_correct': q.correct_option == "4"},
                ],
                'correct_option': q.correct_option
            } for q in quiz.questions]

            return {
                'quiz_title': quiz.remarks,
                'questions': questions,
                'score': attempt.total_scored,
                'total_questions': len(questions)
            }

        except Exception as e:
            return {"error": str(e)}, 500

api.add_resource(QuizAnswersResource, '/quiz/<int:quiz_id>/answers')






class QuizReattemptResource(Resource):
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404 

        chapter = Chapter.query.get(quiz.chapter_id)
        subject = Subject.query.get(chapter.subject_id) if chapter else None

        return {
            'id': quiz.id,
            'date_of_quiz': quiz.date_of_quiz.strftime('%Y-%m-%d'),
            'time_duration': str(quiz.time_duration),
            'remarks': quiz.remarks,
            'total_questions': len(quiz.questions),
            'chapter_name': chapter.name if chapter else "Unknown",
            'subject_name': subject.name if subject else "Unknown",
            'questions': [
                {
                    'id': q.id,
                    'question_statement': q.question_statement,
                    'options': [q.option1, q.option2, q.option3, q.option4], 
                    'correct_option': q.correct_option
                }
                for q in quiz.questions
            ]
        }
api.add_resource(QuizReattemptResource, "/api/quiz/<int:quiz_id>/reattempt")




class QuizzUpdateScoreResource(Resource):
    @login_required
    def put(self, quiz_id):
        data = request.get_json()

        if not data:
            return {"message": "Invalid JSON body"}, 400

        try:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return {"message": "Quiz not found"}, 404

           
            existing_score = Score.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).first()

            if not existing_score:
                return {"message": "Score record not found for this user and quiz"}, 404

           
            try:
                attempt_time = datetime.fromisoformat(data.get("time_stamp_of_attempt").replace("Z", ""))
            except ValueError:
                return {"message": "Invalid datetime format"}, 400

           
            total_score = 0
            for question in quiz.questions:
                selected_answer = data.get("answers", {}).get(str(question.id), "").strip().lower()
                correct_answer = question.correct_option.strip().lower()
                if selected_answer == correct_answer:
                    total_score += 1

            total_scored = (total_score / len(quiz.questions)) * 100

           
            existing_score.total_scored = total_scored
            existing_score.time_stamp_of_attempt = attempt_time

            db.session.commit()

            return {"message": "Score updated successfully", "total_scored": total_scored}, 200
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(QuizzUpdateScoreResource, "/quizzes/<int:quiz_id>/update-score")




class ScoreRedirectionResource(Resource):
    @login_required
    def post(self):
        data = request.get_json()

        if not data or "quiz_id" not in data:
            return {"message": "Invalid request body"}, 400

        quiz_id = data["quiz_id"]

        # Fetch the latest score for the current user and quiz
        latest_score = Score.query.filter_by(
            quiz_id=quiz_id,
            user_id=current_user.id
        ).order_by(Score.time_stamp_of_attempt.desc()).first()

        if not latest_score:
            return {"message": "No score found for this quiz"}, 404

        # Return the score_id for redirection
        return {
            "message": "Redirecting to ShowScore",
            "score_id": latest_score.id,
        }, 200



api.add_resource(ScoreRedirectionResource, "/score/redirect")


class AttemptedQuizzesResource(Resource):
    @login_required
    def get(self):
        try:
            # Fetch all scores for the current user with related data
            results = db.session.query(
                Score,
                Quiz,
                Chapter,
                Subject
            ).join(
                Quiz, Score.quiz_id == Quiz.id
            ).join(
                Chapter, Quiz.chapter_id == Chapter.id
            ).join(
                Subject, Chapter.subject_id == Subject.id
            ).filter(
                Score.user_id == current_user.id
            ).all()

            if not results:
                return {
                    "success": True,
                    "quizzes": [],
                    "message": "No attempted quizzes found"
                }, 200

            quizzes = []
            for score, quiz, chapter, subject in results:
                quizzes.append({
                    "id": quiz.id,
                    "title": quiz.title if hasattr(quiz, 'title') else quiz.remarks,
                    "chapter": chapter.name,
                    "subject": subject.name,
                    "score": score.total_scored,
                    "time_taken": score.time_stamp_of_attempt.isoformat() if score.time_stamp_of_attempt else "N/A",
                })

            return {
                "success": True,
                "quizzes": quizzes,
            }, 200

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }, 500

api.add_resource(AttemptedQuizzesResource, "/attempted-quizzes")



class DashboardUserResource(Resource):
    @login_required
    def get(self):
        user_id = current_user.id
        print(f"Dashboard accessed by user ID: {user_id}")

        # Get all unique chapters the user has attempted quizzes in
        attempted_chapters = db.session.query(
            Chapter.id,
            Chapter.name.label('chapter_name'),
            Subject.name.label('subject_name'),
            Subject.id.label('subject_id'),
            func.count(distinct(Quiz.id)).label('total_quizzes'),
            func.count(distinct(Score.quiz_id)).label('attempted_quizzes')
        ).join(
            Quiz, Chapter.id == Quiz.chapter_id
        ).join(
            Score, Quiz.id == Score.quiz_id
        ).join(
            Subject, Chapter.subject_id == Subject.id
        ).filter(
            Score.user_id == user_id
        ).group_by(
            Chapter.id, Chapter.name, Subject.name, Subject.id
        ).all()

        # Prepare continue_chapters with progress
        continue_chapters = []
        for chapter in attempted_chapters:
            # Get all quizzes in this chapter
            total_quizzes = Quiz.query.filter_by(chapter_id=chapter.id).count()
            
            # Get quizzes attempted by user in this chapter
            attempted_quizzes = Score.query.join(Quiz).filter(
                Score.user_id == user_id,
                Quiz.chapter_id == chapter.id
            ).distinct(Score.quiz_id).count()

            if attempted_quizzes < total_quizzes:
                progress = (attempted_quizzes / total_quizzes) * 100
                continue_chapters.append({
                    "chapter_id": chapter.id,
                    "chapter_name": chapter.chapter_name,
                    "subject_name": chapter.subject_name,
                    "progress": round(progress, 2)
                })

        # Get unique subjects from attempted chapters
        continue_subjects = []
        if attempted_chapters:
            # Get distinct subject IDs from attempted chapters
            subject_ids = {chapter.subject_id for chapter in attempted_chapters}
            
            # Get subjects with progress data
            subjects = Subject.query.filter(Subject.id.in_(subject_ids)).all()
            for subject in subjects:
                # Calculate subject progress
                total_quizzes = Quiz.query.join(Chapter).filter(
                    Chapter.subject_id == subject.id
                ).count()
                
                attempted_quizzes = Score.query.join(Quiz).join(Chapter).filter(
                    Score.user_id == user_id,
                    Chapter.subject_id == subject.id
                ).distinct(Score.quiz_id).count()

                continue_subjects.append({
                    "subject_id": subject.id,
                    "subject_name": subject.name,
                    "attempted_quizzes": attempted_quizzes,
                    "total_quizzes": total_quizzes
                })

        return {
            "success": True,
            "continue_chapters": continue_chapters,
            "continue_subjects": continue_subjects,
        }

api.add_resource(DashboardUserResource, "/dashboard-user")




class ExploreSubjectsResource(Resource):
    @login_required
   
    def get(self):
        try:
            subjects = Subject.query.all()
            subject_list = []
            
            for subject in subjects:
                chapter_count = Chapter.query.filter_by(subject_id=subject.id).count()
                
                quiz_count = db.session.query(Quiz)\
                    .join(Chapter, Chapter.id == Quiz.chapter_id)\
                    .filter(Chapter.subject_id == subject.id)\
                    .count()
                
                subject_list.append({
                    'id': subject.id,
                    'name': subject.name,
                    'description': subject.description,  
                    'chapter_count': chapter_count,
                    'quiz_count': quiz_count
                })
            
            return jsonify(subject_list)
        
        except Exception as e:
            return {"error": str(e)}, 500

api.add_resource(ExploreSubjectsResource, '/explore-subjects')



class ExploreChaptersResource(Resource):
    def get(self, subject_id):
        try:
            subject = Subject.query.get(subject_id)
            if not subject:
                return {"error": "Subject not found"}, 404
                
            chapters = Chapter.query.filter_by(subject_id=subject_id).all()
            chapter_list = []
            
            for chapter in chapters:
                quiz_count = Quiz.query.filter_by(chapter_id=chapter.id).count()
                chapter_list.append({
                    'id': chapter.id,
                    'name': chapter.name,
                    'description': chapter.description,
                    'quiz_count': quiz_count
                })

            return {
                'subject_name': subject.name,  # Make sure this is included
                'chapters': chapter_list
            }

        except Exception as e:
            return {"error": str(e)}, 500

api.add_resource(ExploreChaptersResource, '/explore-chapters/<int:subject_id>')



class SubjectExportResource(Resource):
    def get(self):
        # Query all subjects with their chapters and quizzes
        subjects = Subject.query.options(
            db.joinedload(Subject.chapters).joinedload(Chapter.quizzes)
        ).all()
        
        # Create in-memory CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Subject ID', 'Subject Name', 'Description', 'Chapter Count', 'Quiz Count'])
        
        # Write data
        for subject in subjects:
            quiz_count = sum(len(chapter.quizzes) for chapter in subject.chapters)
            writer.writerow([
                subject.id,
                subject.name,
                subject.description,
                len(subject.chapters),
                quiz_count
            ])
        
        # Create response
        response = make_response(output.getvalue())
        response.headers['Content-Disposition'] = 'attachment; filename=subjects_export.csv'
        response.headers['Content-type'] = 'text/csv'
        
        return response

api.add_resource(SubjectExportResource, '/export/subjects')



class ExportSubjectsResource(Resource):
    def get(self):
        subjects = Subject.query.all()

        # Create CSV response
        def generate():
            yield "ID,Name,Description,Chapters Count\n"  # CSV header
            for subject in subjects:
                yield f"{subject.id},{subject.name},{subject.description},{len(subject.chapters)}\n"

        response = Response(generate(), content_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=subjects.csv"
        return response

# Add to API
api.add_resource(ExportSubjectsResource, "/export-subjects")



class QuizRankingsResource(Resource):
    def get(self, quizId):
      
        # Get top 10 scores for this quiz
        rankings = Score.query.filter_by(quiz_id=quizId)\
            .order_by(Score.total_scored.desc())\
            .limit(10)\
            .all()

        if not rankings:
            return {"success": True, "rankings": [], "message": "No scores yet for this quiz"}, 200

        result = []
        for rank, score in enumerate(rankings, 1):
            user = User.query.get(score.user_id)
            result.append({
                "rank": rank,
                "user_id": user.id,
                "full_name": user.name,
                "score": score.total_scored
            })

        return {"success": True, "rankings": result}, 200



class QuizAttemptStatus(Resource):
    @login_required
    def get(self, quiz_id):
        current_user = current_user.id
        # Check if user already attempted this quiz
        existing_score = Score.query.filter_by(
            user_id=current_user,
            quiz_id=quiz_id
        ).first()
        
        if existing_score:
            return {
                'previously_attempted': True,
                'score_id': existing_score.id,
                'previous_answers': [
                    {
                        'question_id': a.question_id,
                        'selected_option': a.selected_option
                    }
                    for a in existing_score.answers
                ]
            }
        return {'previously_attempted': False}

api.add_resource(QuizAttemptStatus, '/api/quiz/<int:quiz_id>/attempt-status')

