from flask import Flask, jsonify, render_template, request
import random
from app import app

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='Home')

qa_dict = {
    "Where is the Eiffel Tower found?": "France",
    "Where is the Statue of Liberty found?": "United States",
    "Where is the Taj Mahal found?": "India"
}

@app.route('/get-random-qa')
def get_random_qa():
    question, answer = random.choice(list(qa_dict.items()))
    return jsonify(question=question)

@app.route('/check-answer', methods=['POST'])
def check_answer():
    user_answer = request.json['answer']
    question = request.json['question']
    correct_answer = qa_dict[question]
    is_correct = (user_answer.strip().lower() == correct_answer.strip().lower())
    return jsonify(is_correct=is_correct)