import time
import unittest
import subprocess
from flask_sqlalchemy import SQLAlchemy
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from app import create_app, db
from config import TestConfig

class SeleniumTests(unittest.TestCase):
    localhost = "http://localhost:5000/"

    def setUp(self):
        self.testApp = create_app(TestConfig)
        self.app_context = self.testApp.app_context()
        self.app_context.push()
        db.create_all()

        # Start Flask server as a subprocess
        #self.server_process = subprocess.Popen(["python", "-m", "flask", "run"])

        # Headless Selenium WebDriver setup
        self.driver = webdriver.Chrome()
        time.sleep(2)  # Add a 2-second delay
        self.driver.get(self.localhost)


    def tearDown(self):
        self.driver.quit()
        #self.server_process.terminate()
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_home_page(self):
        self.assertTrue("<title>Home - Quick Quiz</title>" in self.driver.page_source)

    def test_worldmap_page(self):
        self.driver.get(self.localhost + "worldmap")
        self.assertTrue("<title>World Map - Quick Quiz</title>" in self.driver.page_source)

    def test_periodictable_page(self):
        self.driver.get(self.localhost + "periodictable")
        self.assertTrue("<title>Periodic Table - Quick Quiz</title>" in self.driver.page_source)

    def test_register(self):
        # Navigate to the registration page
        self.driver.get(self.localhost + "/register")

        # Find form fields and submit them
        self.driver.find_element(By.NAME, "username").send_keys("newuser")
        self.driver.find_element(By.NAME, "email").send_keys("new@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "password2").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()

        # Check if registration was successful by looking for some confirmation in the page source
        success_text = "Congratulations, you are now a registered user!"
        self.assertTrue(success_text in self.driver.page_source)

    def test_register_page(self):
        self.driver.get(self.localhost + "register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("testuser")
        self.driver.find_element(By.NAME, "password").send_keys("testpassword")
        self.driver.find_element(By.NAME, "submit").click()
        self.assertTrue("Congratulations, you are now a registered user!" in self.driver.page_source)

    def test_login_page(self):
        self.driver.get(self.localhost + "login")
        self.assertTrue("<title>Sign In - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("testuser")
        self.driver.find_element(By.NAME, "password").send_keys("testpassword")
        self.driver.find_element(By.NAME, "submit").click()
        self.assertTrue("testuser" in self.driver.page_source)

    def test_manage_page(self):
        self.driver.get(self.localhost + "manage")
        self.assertTrue("<title>Manage - Quick Quiz</title>" in self.driver.page_source)

    def test_user_page(self):
        self.driver.get(self.localhost + "user/newuser")
        self.assertTrue("<title>newuser - Quick Quiz</title>" in self.driver.page_source)

    def test_leaderboard_page(self):
        self.driver.get(self.localhost + "leaderboard")
        self.assertTrue("<title>Leaderboard - Quick Quiz</title>" in self.driver.page_source)

if __name__ == '__main__':
    unittest.main()