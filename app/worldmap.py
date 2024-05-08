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

worldmap = Blueprint('worldmap', __name__)

@worldmap.route('/world')
def world():
    svg_path = os.path.join(current_app.root_path, 'static', 'world.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()
    return render_template('world.html', svg_content=svg_content, script="game")


@worldmap.route('/start-game-session')
def start_game_session():
    location = 'global'
    questions = QuizQuestion.query.filter_by(category='countries', location=location).order_by(sa.func.random()).all()
    session['questions'] = [q.question_text for q in questions]
    session['answers'] = {q.question_text: q.answer for q in questions}
    session['current_index'] = 0
    start_time = int(time.time())
    session['start_time'] = start_time
    return jsonify(success=True, start_time=start_time)

@worldmap.route('/get-next-question')
def get_next_question():
    if 'questions' not in session or session['current_index'] >= len(session['questions']):
        return jsonify(error="No more questions or session not started"), 404

    question_text = session['questions'][session['current_index']]
    session['current_index'] += 1  # Increment to next question
    return jsonify(question=question_text, is_multiple_choice=len(session['answers'][question_text]) > 1)

@worldmap.route('/game-answer', methods=['POST'])
def check_answer():
    data = request.json
    print(data)
    referer_url = request.headers.get('Referer')
    print(referer_url)

    category = 'countries' if 'world' in referer_url else 'elements' if 'elements' in referer_url else None
    location = 'global' if category == 'countries' else 'Various' if category == 'elements' else None

    if category is None or location is None:
        return jsonify(error="Unable to determine the category and location from the referer"), 400

    user_answer = data['answer']
    question_text = data['question']

    question = QuizQuestion.query.filter_by(category=category, location=location, question_text=question_text).first()

    if question:
        # Deserialize the JSON text to a Python list
        correct_answers = json.loads(question.answer)
        # Compare the sets of the user's answer and the correct answer, case insensitive
        is_correct = set(map(str.lower, user_answer)) == set(map(str.lower, correct_answers))
        return jsonify(is_correct=is_correct)
    else:
        return jsonify(error="Question not found"), 404