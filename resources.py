## API calls/ CRUD goes from here

from flask import request
from extentions import db
from flask_restful import Resource,  Api, fields, marshal_with, reqparse
from models import Subject, Question, Quiz,  Chapter

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


# Question fields
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


#CRUD op on question


class QuestionResource(Resource):
    @marshal_with(question_fields)
    def get(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {'message': 'Question not found'}, 404
        return question

    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {'message': 'Question not found'}, 404
        db.session.delete(question)
        db.session.commit()
        return {'message': 'Question deleted'}


#############################################################################


#parser for quiz
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('chapter_id', type=int, required=True, help="Chapter ID is required")
quiz_parser.add_argument('date_of_quiz', type=str, required=True, help="Date of quiz is required (YYYY-MM-DD)")
quiz_parser.add_argument('time_duration', type=str, required=False, help="Time duration in HH:MM format")
quiz_parser.add_argument('remarks', type=str, required=False, help="Remarks for the quiz")



# Quiz fields (includes questions)
quiz_fields = {
    'id': fields.Integer,
    'chapter_id': fields.Integer,
    'date_of_quiz': fields.String,  # Convert date to string format
    'time_duration': fields.String,
    'remarks': fields.String,
    'questions': fields.List(fields.Nested(question_fields))  # Includes related questions
}


#CRUP op on question


class QuizResource(Resource):
    @marshal_with(quiz_fields)
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        return quiz

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
        quiz.date_of_quiz = args['date_of_quiz']
        quiz.time_duration = args['time_duration']
        quiz.remarks = args['remarks']
        db.session.commit()
        return quiz



#####################################################################



# Parser for chapters
chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help="Chapter name is required")
chapter_parser.add_argument('description', type=str, required=False, help="Description of the chapter")
chapter_parser.add_argument('subject_id', type=int, required=True, help="Subject ID is required")


# Chapter fields (includes quizzes)
chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer,
    'quizzes': fields.List(fields.Nested(quiz_fields))  # Includes related quizzes
}

#CRUD oop on chapters


class ChapterResource(Resource):
    @marshal_with(chapter_fields)
    def get(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {'message': 'Chapter not found'}, 404
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
    'chapters': fields.List(fields.Nested(chapter_fields))  # Includes related chapters
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
        new_subject = Subject(name=args['name'], description=args['description'])
        db.session.add(new_subject)
        db.session.commit()
        return new_subject, 201



#################### API END POINTS #########################


api.add_resource(SubjectListResource, "/subjects")  # This handles the list
api.add_resource(SubjectResource, "/subjects/<int:subject_id>")
api.add_resource(ChapterResource, "/chapters", "/chapters/<int:chapter_id>")
api.add_resource(QuizResource, "/quizzes", "/quizzes/<int:quiz_id>")
api.add_resource(QuestionResource, "/questions", "/questions/<int:question_id>")
