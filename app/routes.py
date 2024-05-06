import json
from flask import Blueprint, jsonify, render_template, request, current_app
import random
import os
from . import db
from app.forms import LoginForm, RegistrationForm
from flask import flash, redirect, url_for
from flask_login import current_user, login_user, logout_user, login_required
import sqlalchemy as sa
from app.models import User, QuizQuestion
from urllib.parse import urlsplit

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index')
def index():
    return render_template('index.html', title='Home')

@main.route('/get-random-qa')
def get_random_qa():
    referer_url = request.headers.get('Referer')
    print(request.headers)

    if 'index' in referer_url:
        category = 'countries'
        location = 'global'
    elif 'world' in referer_url:
        category = 'countries'
        location = 'global'
    elif 'periodictable' in referer_url:
        category = 'elements'
        location = 'Various'
    else:
        return jsonify(error="Unable to determine the category from the referer"), 400

    question = QuizQuestion.query.filter_by(category=category, location=location).order_by(sa.func.random()).first()

    if question:
        answer_length = len(question.answer)
        is_multiple_choice = answer_length > 1
        return jsonify(question=question.question_text, is_multiple_choice=is_multiple_choice)
    else:
        return jsonify(error="No questions found for the specified category and location"), 404

@main.route('/check-answer', methods=['POST'])
def check_answer():
    data = request.json
    print(data)
    print("??")
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
        correct_answer = question.answer
        is_correct = set(map(str.lower, user_answer)) == set(map(str.lower, correct_answer))
        return jsonify(is_correct=is_correct)
    else:
        return jsonify(error="Question not found"), 404

@main.route('/periodictable')
def periodic_table():
    svg_path = os.path.join(current_app.root_path, 'static', 'pt.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()
    return render_template('periodic_table.html', svg_content=svg_content)

@main.route('/world')
# @login_required
def world():
    svg_path = os.path.join(current_app.root_path, 'static', 'world.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()
    return render_template('world.html', svg_content=svg_content)


@main.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(
            sa.select(User).where(User.username == form.username.data))
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password,please try again.')
            flash('If you are a new user, please register first.')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or urlsplit(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@main.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

@main.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)