import os
import shutil
import time
import unittest
import sys
import subprocess
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from sqlalchemy import text
from app import create_app, db
from config import TestConfig, Config
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from flask_migrate import upgrade

class SeleniumTests(unittest.TestCase):
    localhost = "http://localhost:5000/"

    def setUp(self):
        # Create app with the test configuration
        self.testApp = create_app(Config)
        self.app_context = self.testApp.app_context()
        self.app_context.push()
        # Delete the database file if it exists
        db_path = os.path.join("./", 'app.db')
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"Deleted existing database at {db_path}")
        # Extract the database URI from the app configuration
        database_uri = self.testApp.config['SQLALCHEMY_DATABASE_URI']
        if database_uri.startswith("sqlite:///"):
            db_path = database_uri[10:]  # strip the sqlite:/// prefix
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"Deleted existing database at {db_path}")

        # After pushing the app context, run migrations
        upgrade()

        # Start the Flask server in a background thread
        python_executable = sys.executable
        self.server_process = subprocess.Popen([python_executable, "-m", "flask", "run"])

        # Set up Selenium WebDriver
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        self.driver = webdriver.Chrome(options=options)
        self.driver.get(self.localhost)

    def tearDown(self):
        self.driver.quit()
        self.server_process.terminate()
        self.server_process.wait()
        with self.app_context:
            db.session.remove()
            # Connect to the database and drop the view if it exists
            with db.engine.connect() as connection:
                connection.execute(text('DROP VIEW IF EXISTS game_leaderboard'))
                connection.execute(text('DROP TABLE IF EXISTS alembic_version'))
                connection.execute(text('DROP TABLE IF EXISTS sessions'))
            # Now attempt to drop all tables
            db.drop_all()
            db.engine.dispose()
            db_path = os.path.join("./", 'app.db')
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"Deleted existing database at {db_path}")

        self.app_context.pop()
        shutil.rmtree('./flask_session', ignore_errors=True)

    ## Creates a user named "creator"
    ## Logins in as "creator"
    ## Creates a game name "Global Geography Quiz"
    ## Adds two questions to the game
    ## Submits game
    ## Goes to the world page
    ## Clicks on the game "Global Geography Quiz"
    ## Answers the questions
    ## Checks for "Game Over!" text
    ## Goes to the leaderboard page
    ## Checks if the user "creator" is at the top of the leaderboard
    def test_register_login_create(self):
        # Register
        self.driver.get(self.localhost + "/register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("creator")
        self.driver.find_element(By.NAME, "email").send_keys("creator@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("creator")
        self.driver.find_element(By.NAME, "password2").send_keys("creator")
        self.driver.find_element(By.NAME, "submit").click()
        success_text = "Congratulations, you are now a registered user!"
        self.assertTrue(success_text in self.driver.page_source)
        
        # Log in
        self.driver.get(self.localhost + "login")
        self.assertTrue("<title>Sign In - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("creator")
        self.driver.find_element(By.NAME, "password").send_keys("creator")
        self.driver.find_element(By.NAME, "submit").click()
        self.assertTrue("Please Select a Quiz to Start" in self.driver.page_source)
        
        # Navigate to Create Game
        self.driver.get(self.localhost + "creategame")
        self.assertTrue("<title>Quick Quiz</title>" in self.driver.page_source)

        # Fill in the form to create a game
        self.driver.find_element(By.ID, "game_name").send_keys("Global Geography Quiz")
        self.driver.find_element(By.ID, "description").send_keys("Test your knowledge of global geography!")
        
        # Add questions
        self.driver.find_element(By.NAME, "question_text[]").send_keys("Where is Paris located?")
        self.driver.find_element(By.NAME, "location[]").send_keys("Europe")
        self.driver.find_element(By.NAME, "data[]").send_keys("France")
        
        # Explicit wait for the button to be clickable
        button = self.driver.find_element(By.ID, "addQuestion")
        self.driver.execute_script("arguments[0].click();", button)

        time.sleep(1)

        # Second question
        question_blocks = self.driver.find_elements(By.CLASS_NAME, "question_block")
        question_blocks[1].find_element(By.NAME, "question_text[]").send_keys("Which country is known as the Land of the Rising Sun?")
        question_blocks[1].find_element(By.NAME, "location[]").send_keys("East Asia")
        question_blocks[1].find_element(By.NAME, "data[]").send_keys("Japan")
        
        # Submit the form
        submit_button = self.driver.find_element(By.XPATH, "//button[@class='btn btn-primary' and text()='Submit Game']")
        self.driver.execute_script("arguments[0].click();", submit_button)

        time.sleep(1) # REQUIRED

        # Check for submission success
        self.assertTrue("created successfully!" in self.driver.page_source)

        self.driver.get(self.localhost + "world")
        self.assertTrue("Global Geography Quiz" in self.driver.page_source)

        # Find the element with text "Global Geography Quiz" and click it
        game_name_element = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//td[text()='Global Geography Quiz']"))
        )
        game_name_element.click()

        # Verify that the overlay is hidden
        overlay = self.driver.find_element(By.ID, "overlay")

        time.sleep(1) # REQUIRED

        # Check if the overlay has been hidden
        overlay_style = overlay.get_attribute("style")
        self.assertTrue("display: none" in overlay_style)

        # Get the question element
        question_element = self.driver.find_element(By.ID, "question")
        initial_question_text = question_element.text.strip()

        if initial_question_text == "Which country is known as the Land of the Rising Sun?":
            first_question = {"text": "Which country is known as the Land of the Rising Sun?", "answer": "Japan"}
            second_question = {"text": "Where is Paris located?", "answer": "France"}
        elif initial_question_text == "Where is Paris located?":
            first_question = {"text": "Where is Paris located?", "answer": "France"}
            second_question = {"text": "Which country is known as the Land of the Rising Sun?", "answer": "Japan"}

        # Enter and submit the first answer
        answer_input = self.driver.find_element(By.ID, "answerInput")
        answer_input.clear()
        answer_input.send_keys(first_question["answer"])
        answer_input.send_keys(Keys.ENTER)

        submit_button = self.driver.find_element(By.ID, "submitAnswerButton")
        self.driver.execute_script("arguments[0].click();", submit_button)

        time.sleep(1)

        print("Question 1 pair")
        print(initial_question_text)
        print(first_question["text"])

        # Verify the question changed and enter the second answer
        new_question_text = self.driver.find_element(By.ID, "question").text.strip()

        print("Question 2 pair")
        print(new_question_text)
        print(second_question["text"])

        self.assertEqual(new_question_text, second_question["text"], "The new question text does not match expected")

        # Enter and submit the second answer
        answer_input = self.driver.find_element(By.ID, "answerInput")
        answer_input.clear()
        answer_input.send_keys(second_question["answer"])
        answer_input.send_keys(Keys.ENTER)

        submit_button = self.driver.find_element(By.ID, "submitAnswerButton")
        self.driver.execute_script("arguments[0].click();", submit_button)

        # Now check for the "Game Over!" text in the #feedback element
        feedback_element = WebDriverWait(self.driver, 10).until(
            EC.text_to_be_present_in_element((By.ID, "feedback"), "Game Over!")
        )

        # Get the text and assert "Game Over!" is present
        feedback_text = self.driver.find_element(By.ID, "feedback").text
        self.assertIn("Game Over!", feedback_text)

        # Go to the /leaderboard page
        self.driver.get(self.localhost + "/leaderboard")

        # Wait for the specific game section "Global Geography Quiz" to load
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h3[text()='Global Geography Quiz']/following-sibling::table"))
        )

        # Directly access the first row under "Global Geography Quiz"
        first_row_username = self.driver.find_element(
            By.XPATH, "//h3[text()='Global Geography Quiz']/following-sibling::table//tbody/tr[1]/td[2]/a").text

        # Assert if you are the first player
        self.assertEqual(first_row_username, "creator", "creator is not the leaderboard for Global Geography Quiz")

        




if __name__ == '__main__':
    unittest.main()