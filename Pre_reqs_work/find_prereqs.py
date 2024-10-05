from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
import json

import time

# Load JSON data from the file
with open('Pre_reqs_work/program_courses.json', 'r') as json_file:
    subject_courses = json.load(json_file)

# Set up the WebDriver (e.g., for Chrome)
driver = webdriver.Chrome()

# Merthod to get the term
def select_term():
    driver.get("https://oscar.gatech.edu/pls/bprod/bwckschd.p_disp_dyn_sched") # Load the webpage
    
    dropdown = Select(driver.find_element(By.NAME, "p_term")) # Select an option from a dropdown
    dropdown.select_by_visible_text("Fall 2024")
    
    link = driver.find_element(By.XPATH, "//input[@type='submit' and @value='Submit']") # Submit
    link.click()

    time.sleep(3) #Wait

# method to loop through all subjects and go to class schedule listings for each undergrad subject (Uses JSON file)
def select_subject():

    print(driver.current_url)
    subject_pick = Select(driver.find_element(By.XPATH, "//*[@id='subj_id']"))

   # List to store the options
    options_list = []
    # Iterate through all options in the dropdown
    for option in subject_pick.options:
        option_value = option.get_attribute("value")  # Value attribute
        options_list.append(option_value) 

    # Print all options and their values
    print("Available Subjects and their Values:")
    for subject in options_list:
        if subject in subject_courses.keys():
            print(f"Subject: {subject}")
            subject_pick = Select(driver.find_element(By.XPATH, "//*[@id='subj_id']"))
            subject_pick.deselect_all()
            subject_pick.select_by_value(subject)
            driver.find_element(By.XPATH, "//input[@type='submit' and @value='Class Search']").click() # Submit
            time.sleep(3) #Wait
            get_links(subject)
        else:
            print(f"{subject} not there")
    print("Selected all subjects")

def get_links(subject):
    # Locate the table
    links = driver.find_elements(By.XPATH, "/html/body/div[3]/table[1]/tbody/tr/th//a")

    for link in links:
        print(link.text + " " + link.get_attribute("href"))

    # Dictionary to store links by subject
    links_list = {subject: []}  # Initialize dictionary with the subject as key

    # Get the list of courses for the specified subject
    courses = subject_courses.get(subject, [])

    for course in courses:
        # Iterate over each <a> tag to get the href and text
        for link in links:
            href = link.get_attribute("href")  # Get the href attribute
            text = link.text.strip()  # Get the visible text of the link
            # Check if the current link text matches the course
            if course in text:
                links_list[subject].append([course, href])
                break  # Stop after finding the first link for this course

    # Print the results
    print(f"Links found for subject '{subject}':")
    for course_link in links_list[subject]:
        print(f"Course: {course_link[0]}, Href: {course_link[1]}")

    driver.find_element(By.XPATH, "/html/body/div[3]/table[2]/tbody/tr/td/a").click()
    time.sleep(3) #Wait


select_term()
select_subject()

# Close the browser
driver.quit()
"""
try:

    # Perform some actions on the new page (e.g., filling another form or scraping data)
    search_box = driver.find_element(By.NAME, "search")
    search_box.send_keys("Search Term")
    search_box.send_keys(Keys.RETURN)

    # Wait for results to load (optional)
    time.sleep(3)

finally:
    # Close the browser when done
    driver.quit()"""
