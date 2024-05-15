import json
import os
import time

import sqlalchemy as sa
from flask import (
    Blueprint,
    current_app,
    jsonify,
    render_template,
    request,
    session,
)
from app.models import QuizQuestion, User
from flask_session import Session

periodictable = Blueprint('periodictable', __name__)

import random
from flask import render_template, current_app
from os import path

@periodictable.route('/periodictable')
def periodic_table():

    print("fgdfgf")


    svg_path = path.join(current_app.root_path, 'static', 'pt.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()

    # Fetch location and question count from the database
    game_info = QuizQuestion.query \
        .filter(QuizQuestion.category == 'elements') \
        .with_entities(
            QuizQuestion.game_name,
            QuizQuestion.location,
            QuizQuestion.user_id,
            QuizQuestion.description,
            sa.func.count(QuizQuestion.question_id).label('question_count')  # Assuming the primary key is named 'question_id'
        ) \
        .group_by(QuizQuestion.game_name) \
        .all()
    print("fgdfgf")
    print(game_info)
    # Generate dummy data for the average rating
    locations = [{
        'name': game.game_name,
        'user': 'admin' if (game.user_id == 0) else User.query.get(game.user_id).username,
        'description': game.description,
        'question_count': game.question_count,
        'average_rating': round(random.uniform(1, 5), 2)  # Random average rating between 1 and 5
    } for game in game_info]

    # Sort locations by average rating in descending order
    locations.sort(key=lambda x: x['average_rating'], reverse=True)

    return render_template('periodic_table.html', svg_content=svg_content, locations=locations)


@periodictable.route('/start-game-session')
def start_game_session():
    game_name = session.get('game_name')
    questions = QuizQuestion.query.filter_by(game_name=game_name).order_by(sa.func.random()).all()
    session['questions'] = [q.question_text for q in questions]
    session['locations'] = [q.location for q in questions]
    session['answers'] = json.dumps({q.question_text: q.answer for q in questions})
    session['current_index'] = 0
    session['results'] = {}
    start_time = int(time.time())
    session['start_time'] = start_time
    return jsonify(success=True, start_time=start_time)


@periodictable.route('/get-next-question')
def get_next_question():
    if 'questions' not in session or session['current_index'] >= len(session['questions']):
        return jsonify(success=True, error="No more questions or session not started")

    previous_time = time.time()
    session['previous_time'] = previous_time
    question_text = session['questions'][session['current_index']]
    current_location = session['locations'][session['current_index']]
    session['current_index'] += 1  # Increment to next question
    # Deserialize the answers before use
    answers = json.loads(session['answers'])
    is_multiple_choice = len(json.loads(answers[question_text])) > 1

    return jsonify(success=True, question=question_text, is_multiple_choice=is_multiple_choice, location=current_location)

@periodictable.route('/game-answer', methods=['POST'])
def check_answer():
    data = request.json
    question_text = data['question']
    # Deserialize answers before checking
    if 'answers' in session and question_text in json.loads(session['answers']):
        correct_answers = json.loads(session['answers'])[question_text]
        if 'answer' in data:
            user_answers = set(map(str.lower, data['answer']))
            correct_answers_set = set(map(str.lower, json.loads(correct_answers)))
            print(user_answers)
            print(correct_answers_set)
            is_correct = user_answers == correct_answers_set
            next_question = is_correct
        else:
            is_correct = False
            next_question = True
        current_time = int(time.time())
        time_spent = current_time - session['previous_time']
        if question_text not in session.get('results', {}):
            session['results'][question_text] = [is_correct, time_spent, 1]
        else:
            session['results'][question_text][0] = is_correct
            session['results'][question_text][1] += time_spent
            session['results'][question_text][2] += 1

        return jsonify(success=True, is_correct=is_correct, next_question=next_question)
    else:
        return jsonify(error="Question not found or session invalid"), 404


@periodictable.route('/skip-question', methods=['POST'])
def skip_question():
    if 'questions' not in session or 'current_index' not in session:
        return jsonify(error="Session not started or invalid"), 400
    return jsonify(success=True, current_index=session['current_index'])

@periodictable.route('/end-game-session')
def end_game_session():
    if 'questions' not in session or 'start_time' not in session:
        return jsonify(error="Session not started or invalid"), 400

    if session['current_index'] < len(session['questions']):
        return jsonify(error="Game not yet finished"), 400

    end_time = time.time()
    total_time_spent = end_time - session['start_time']

    # Assuming each correct answer is stored as True in a list of results.
    score = sum(result[0] for result in session.get('results', {}).values())
    total_questions = len(session['questions'])

    print( session.get('results', {}).values())
    print( session.get('results'))
    print(score, total_questions)
    #### Write to leaderboard / database here ####

    # Clear game-specific session variables
    keys_to_clear = ['questions', 'locations', 'answers', 'current_index', 'results', 'start_time', 'previous_time']
    for key in keys_to_clear:
        session.pop(key, None)  # Remove each key safely
    return jsonify(success=True, total_time_spent=round(total_time_spent,2), score=score, total_questions=total_questions)
