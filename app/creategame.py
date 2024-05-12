import json
import os
import time
import re

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
from flask_login import current_user, login_required
from app import db

creategame = Blueprint('creategame', __name__)

@login_required
@creategame.route('/creategame')
def loadpage():

    svg_path = os.path.join(current_app.root_path, 'static', 'world.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()

    pattern = re.compile(r'<path.*?class="(.*?)"')
    class_names = pattern.findall(svg_content)
    country_names = sorted(set(class_names))

    return render_template('creategame.html', countries=country_names)

@login_required
@creategame.route('/submit_game', methods=['POST'])
def submit_game():
    if current_user.is_authenticated:
        data = request.get_json()  # Get data as JSON
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400

        try:
            game_name = data['game_name']
            description = data['description']
            questions = data['questions']  # This should be an array of question objects

            existing_game = QuizQuestion.query.filter_by(game_name=game_name).first()
            if existing_game:
                return jsonify({'status': 'error', 'message': f'Game name "{game_name}" already exists. Please choose a different name.'})

            for question in questions:
                question_text = question['question_text']
                location = question['location']
                countries = question['countries']  # Already a list from JSON, no need to load

                # Remove empty countries and duplicates
                countries = [country for country in countries if country]
                countries = list(set(countries))

                # Debug print to check what's being processed
                print(f"Processing question: {question_text}, Location: {location}, Countries: {countries}")

                try:
                    question = QuizQuestion(
                        category="countries",
                        game_name=game_name,
                        description=description,
                        user_id=current_user.id if current_user.is_authenticated else 0,
                        question_text=question_text,
                        answer=json.dumps(countries),  # Store countries as JSON
                        location=location
                    )
                    db.session.add(question)
                except Exception as e:
                    db.session.rollback()
                    return jsonify({'status': 'error', 'message': 'An error occurred while saving the game: ' + str(e)}), 500
            db.session.commit()
            return jsonify({'status': 'success', 'message': f'Game "{game_name}" created successfully!'})
        except KeyError as e:  # Catching KeyErrors if keys are missing in the data
            print(f"KeyError: missing {e.args[0]} in JSON data")
            return jsonify({'status': 'error', 'message': f'Missing data: {e.args[0]}'})
        except Exception as e:
            print(f"Unhandled exception: {e}")
            return jsonify({'status': 'error', 'message': str(e)})
    return jsonify({'status': 'error', 'message': 'You must be logged in to create a game.'})

@creategame.route('/check_game_name', methods=['POST'])
def check_game_name():
    game_name = request.form['game_name']
    game_exists = QuizQuestion.query.filter_by(game_name=game_name).first() is not None
    return jsonify({'is_unique': not game_exists})

@creategame.route('/get-countries')
def get_countries():
    svg_path = os.path.join(current_app.root_path, 'static', 'world.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()

    pattern = re.compile(r'<path.*?class="(.*?)"')
    class_names = pattern.findall(svg_content)
    country_names = sorted(set(class_names))

    return jsonify(country_names)