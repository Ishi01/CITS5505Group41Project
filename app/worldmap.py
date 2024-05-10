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
from app.models import QuizQuestion
from flask_session import Session


worldmap = Blueprint('worldmap', __name__)

@worldmap.route('/world')
def world():
    svg_path = os.path.join(current_app.root_path, 'static', 'world.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()
    # Query for unique locations where the category is 'countries'
    locations = QuizQuestion.query \
        .filter(QuizQuestion.category == 'countries') \
        .with_entities(QuizQuestion.location) \
        .distinct() \
        .all()
    locations = [loc.location for loc in locations]  # Extract the locations from the tuples
    return render_template('world.html', svg_content=svg_content, script="game", locations=locations)


@worldmap.route('/set-location', methods=['POST'])
def set_location():
    data = request.get_json()
    session['location'] = data['location']
    return jsonify(success=True)

@worldmap.route('/start-game-session')
def start_game_session():
    location = session.get('location', 'global')
    questions = QuizQuestion.query.filter_by(category='countries', location=location).order_by(sa.func.random()).all()
    session['questions'] = [q.question_text for q in questions]
    session['answers'] = json.dumps({q.question_text: q.answer for q in questions})
    session['current_index'] = 0
    session['results'] = {}
    start_time = int(time.time())
    session['start_time'] = start_time
    return jsonify(success=True, start_time=start_time)



@worldmap.route('/get-next-question')
def get_next_question():
    if 'questions' not in session or session['current_index'] >= len(session['questions']):
        return jsonify(success=True, error="No more questions or session not started")

    previous_time = time.time()
    session['previous_time'] = previous_time
    question_text = session['questions'][session['current_index']]
    session['current_index'] += 1  # Increment to next question
    # Deserialize the answers before use
    answers = json.loads(session['answers'])
    is_multiple_choice = len(json.loads(answers[question_text])) > 1

    return jsonify(success=True, question=question_text, is_multiple_choice=is_multiple_choice, location=session['location'])

@worldmap.route('/game-answer', methods=['POST'])
def check_answer():
    data = request.json
    question_text = data['question']
    # Deserialize answers before checking
    if 'answers' in session and question_text in json.loads(session['answers']):
        correct_answers = json.loads(session['answers'])[question_text]
        if 'answer' in data:
            user_answers = set(map(str.lower, data['answer']))
            correct_answers_set = set(map(str.lower, json.loads(correct_answers)))
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


@worldmap.route('/skip-question', methods=['POST'])
def skip_question():
    if 'questions' not in session or 'current_index' not in session:
        return jsonify(error="Session not started or invalid"), 400
    return jsonify(success=True, current_index=session['current_index'])

@worldmap.route('/end-game-session')
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

    # Clear all session variables
    session.clear()
    return jsonify(success=True, total_time_spent=round(total_time_spent,2), score=score, total_questions=total_questions)
