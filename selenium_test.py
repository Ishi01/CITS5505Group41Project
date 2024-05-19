import json
import multiprocessing
import os
import shutil
import threading
import time
import unittest
import sys
import subprocess
from selenium import webdriver
from selenium.webdriver.common.by import By
from sqlalchemy import text
from app import create_app, db
from config import TestConfig, Config
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from flask_migrate import upgrade

class SeleniumTests(unittest.TestCase):

    localhost = "http://localhost:5000/"
    
    def setUp(self):
        self.server_process = multiprocessing.Process(target=os.system, args=('python app_server.py',))
        self.server_process.start()

        # Give the server time to start
        time.sleep(1)

        # Set up Selenium WebDriver
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        self.driver = webdriver.Chrome(options=options)
        self.driver.get('http://localhost:5000')


    def tearDown(self):
        
       # Terminate the Flask server process
        self.server_process.terminate()
        self.server_process.join()

        self.driver.quit()

        shutil.rmtree('./test_session', ignore_errors=True)

    def test_home_page(self):
        self.assertTrue("<title>Home - Quick Quiz</title>" in self.driver.page_source)

    def test_worldmap_page(self):
        self.driver.get(self.localhost + "world")
        self.assertTrue("<title>World Map - Quick Quiz</title>" in self.driver.page_source)

    def test_periodictable_page(self):
        self.driver.get(self.localhost + "periodictable")
        self.assertTrue("<title>Periodic Table - Quick Quiz</title>" in self.driver.page_source)

    def test_register(self):
        # Navigate to the registration page
        self.driver.get(self.localhost + "/register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("testuser0")
        self.driver.find_element(By.NAME, "email").send_keys("testuser0@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "password2").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()
        time.sleep(2)
        self.assertTrue("Congratulations, you are now a registered user!" in self.driver.page_source)
        self.driver.close()

    def test_register_alembic_user(self):
        self.driver.get(self.localhost + "register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("alembic_user")
        self.driver.find_element(By.NAME, "email").send_keys("alembic_user@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("alembic")
        self.driver.find_element(By.NAME, "password2").send_keys("alembic")
        self.driver.find_element(By.NAME, "submit").click()
        time.sleep(2)
        self.assertTrue("Congratulations, you are now a registered user!" in self.driver.page_source)
        self.driver.close()
        
    def test_login_page_newuser(self):
        self.driver.get(self.localhost + "register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("newuser")
        self.driver.find_element(By.NAME, "email").send_keys("newuser@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "password2").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()

        self.driver.get(self.localhost + "login")
        self.assertTrue("<title>Sign In - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("newuser")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()
        self.assertTrue("Please Select a Quiz to Start" in self.driver.page_source)

    def test_manage_page(self):
        self.driver.get(self.localhost + "manage")
        self.assertTrue("Please log in to access this page" in self.driver.page_source)

    def test_user_page(self):
        self.driver.get(self.localhost + "/register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("uniqueuser")
        self.driver.find_element(By.NAME, "email").send_keys("uniqueuser@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "password2").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()
        success_text = "Congratulations, you are now a registered user!"
        self.assertTrue(success_text in self.driver.page_source)
        self.driver.get(self.localhost + "user/uniqueuser")
        self.assertTrue("<title>uniqueuser - Quick Quiz</title>" in self.driver.page_source)
        self.driver.close()


if __name__ == '__main__':
    unittest.main()