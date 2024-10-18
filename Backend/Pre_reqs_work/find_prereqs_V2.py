from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
import json
import os

course_links = {}

# Load JSON data from the file
with open('Backend/pre_reqs_work/course_links.json', 'r') as json_file:
    subject_courses = json.load(json_file)

# Set up the WebDriver (e.g., for Chrome)
driver = webdriver.Chrome()

term = "Spring 2023 (View only)"

# Merthod to get the term
def select_term():
    driver.get("https://oscar.gatech.edu/pls/bprod/bwckschd.p_disp_dyn_sched") # Load the webpage
    
    dropdown = Select(driver.find_element(By.NAME, "p_term")) # Select an option from a dropdown
    dropdown.select_by_visible_text(term)
    
    link = driver.find_element(By.XPATH, "//input[@type='submit' and @value='Submit']") # Submit
    link.click()

# method to loop through all subjects and go to class schedule listings for each undergrad subject (Uses JSON file)
def select_subject():

    print(driver.current_url)
    subject_pick = Select(driver.find_element(By.XPATH, "//*[@id='subj_id']"))

   # List to store the options
    subject_list = []
    # Iterate through all options in the dropdown
    for option in subject_pick.options:
        option_value = option.get_attribute("value")  # Value attribute
        subject_list.append(option_value) 
# Print all options and their values
    print("Available Subjects and their Values:")
    for subject in subject_courses.keys():
        if subject in subject_list:
            print(f"Subject: {subject}")

            # Selects subject
            subject_pick = Select(driver.find_element(By.XPATH, "//*[@id='subj_id']"))
            subject_pick.deselect_all()
            subject_pick.select_by_value(subject)

            course_links[subject] = []

            # Get the list of courses for the specified subject
            courses = subject_courses.get(subject, [])
            for courselist in courses:
                course = courselist[0]
                link = courselist[1]
                 # Selects subject
                subject_pick = Select(driver.find_element(By.XPATH, "//*[@id='subj_id']"))
                subject_pick.deselect_all()
                subject_pick.select_by_value(subject)

                #only goes through courses that do not have links
                if (link == 0): 
                    # Enters the course number into the search bar
                    course_num = driver.find_element(By.XPATH, "//*[@id='crse_id']")
                    course_num.clear()
                    course_num.send_keys(course.split(" ")[1])

                    driver.find_element(By.XPATH, "//input[@type='submit' and @value='Class Search']").click() # Submit 

                    #gets link for course
                    new_link = get_link(course)
                    
                    #print(new_link)
                    if new_link != 0: #if there is a link for the course, we will add it to the list
                        #course_links[subject].append((course, courselist[1]))
                        courselist[1] = new_link
                        print("Subject: ", subject, "--", course_links[subject])
                    else: #if there is no link for the course, we will display NONE
                        #course_links[subject].append((course, "NONE"))
                        courselist[1] = "NONE"
                        #print("Link not found")
                    driver.find_element(By.XPATH, "/html/body/div[3]/table[2]/tbody/tr/td/a").click() #Return to this page
                
                else: #adds courses that already has links to the list
                    #course_links[subject].append((course, link))
                    #print("Link there")
                    filler = 0
           
        else:
            print(f"{subject} not there")
    print("Selected all subjects")

def get_link(course):
    # Locate the table
    try:
        link = driver.find_element(By.XPATH, "/html/body/div[3]/table[1]/tbody/tr/th//a")
        print(course + ": " + link.get_attribute("href"))
        return link.get_attribute("href")
    except:
        print(f"{course} not found")
        return 0

select_term()
select_subject()

# Close the browser
driver.quit()

# Print the final course links dictionary
print("Final course links dictionary:")
print(json.dumps(subject_courses, indent=4))

if os.path.exists('Backend/pre_reqs_work/course_linksV2.json'):
    os.remove('Backend/pre_reqs_work/course_linksV3.json')

# Optionally save the course_links dictionary to a JSON file
with open('Backend/pre_reqs_work/course_linksV2.json', 'w') as outfile:
    json.dump(subject_courses, outfile, indent=4)