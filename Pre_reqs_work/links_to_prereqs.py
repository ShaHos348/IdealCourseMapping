import os
from bs4 import BeautifulSoup
import requests
import json

fileName = 'Pre_reqs_work\prereqs'
map = {}

# Load JSON data from the file
with open('Pre_reqs_work/course_links.json', 'r') as json_file:
    program_courses = json.load(json_file)

def find_prereqs(link):
    page = requests.get(link)
    soup = BeautifulSoup(page.text, "html.parser")
    #print(soup.prettify)
    prereq_label = soup.find("span", string="Prerequisites: ")
    #print(prereq_label)

    prereq_text = []
    if prereq_label:
        for sibling in prereq_label.find_next_siblings():
            if sibling.name == 'br' or sibling == '':
                continue
            prereq_text.append(sibling.get_text())
    prereqs = '/'.join(prereq_text)

    print(prereqs)

    return prereqs.split("/")

subject_count0 = 1
subject_length = len(program_courses.keys())
for subject in program_courses.keys():
    print(f"Subject = {subject}")
    if subject not in map.keys():
        map[subject] = {}

    for course, link in program_courses[subject]:
        print(f"Current Subject Num: {subject_count0}/{subject_length} Course = {course}")
        if link != 'NONE':
            prereqs = find_prereqs(link)
        else:
            prereqs = ""
        map[subject][course] = prereqs
    subject_count0 += 1

program_courses = {key: value for key, value in program_courses.items() if len(value) > 0}

if os.path.exists(f'{fileName}.json'):
    os.remove(f'{fileName}.json')

with open(fileName + ".json", "w") as f:
    f.write(json.dumps(map, indent=2))

print("JSON file created successfully.")
