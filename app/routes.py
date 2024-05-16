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

#Starting route, sends to homepage labeled index.html
@main.route('/')
@main.route('/index')
def index():
    return render_template('index.html', title='Home')

#Get random question from the database, including 
@main.route('/get-random-qa')
def get_random_qa():
    #Select which table to get the question from, depending on the referer URL
    referer_url = request.headers.get('Referer')
    if 'index' in referer_url or 'world' in referer_url:
        category = 'countries'
    elif 'periodictable' in referer_url:
        category = 'elements'
    #Error handling for if the referer URL is not recognized
    else:
        return jsonify(error="Unable to determine the category from the referer"), 400

    question = db.session.query(
        QuizQuestion.question_text
    ).filter_by(category=category).order_by(sa.func.random()).first()

    if question:
        return jsonify(question=question.question_text)
    else:
        return jsonify(error="No questions found for the category"), 404


@main.route('/check-answer', methods=['POST'])
def check_answer():
    data = request.json

    referer_url = request.headers.get('Referer')
    if 'index' in referer_url or 'world' in referer_url:
        category = 'countries'
    elif 'periodictable' in referer_url:
        category = 'elements'
    else:
        return jsonify(error="Unable to determine the category from the referer"), 400

    question = data.get('question')
    user_answer = data.get('answer')

    if not question or not user_answer:
        return jsonify(error="Question and answer are required"), 400

    query = db.session.query(
        QuizQuestion.answer
    ).filter_by(question_text=question, category=category).first()

    if query:
        correct_answer = query.answer
        is_correct = (user_answer.strip().lower() == correct_answer.strip().lower())
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
        return redirect(url_for('main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(
            sa.select(User).where(User.username == form.username.data))
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password,please try again.')
            flash('If you are a new user, please register first.')
            return redirect(url_for('main.login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or urlsplit(next_page).netloc != '':
            next_page = url_for('main.index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@main.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@main.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('main.login'))
    return render_template('register.html', title='Register', form=form)