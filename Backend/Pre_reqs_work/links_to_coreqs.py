import os
from bs4 import BeautifulSoup
import requests
import json
import text_prereq_parser as parser

fileName = 'Backend/pre_reqs_work\coreqs'
map = {}

# Load JSON data from the file
with open('Backend/pre_reqs_work/course_links.json', 'r') as json_file:
    program_courses = json.load(json_file)

def find_coreqs(link):
    page = requests.get(link)
    soup = BeautifulSoup(page.text, "html.parser")
    #print(soup.prettify)
    coreq_label = soup.find("span", string="Corequisites: ")
    #print(coreq_label)

    coreq_text = ""
    if coreq_label:
        for sibling in coreq_label.next_siblings:
            # Stop when you encounter a break or empty string
            if sibling.name == 'br':
                continue
            # Stop when you encounter a span
            if sibling.name == 'span':
                break
            # Append text or link text
            coreq_text = coreq_text + sibling.get_text(strip=True)
    #print(coreq_text)

    # Remove empty strings from the list
    return [course for course in parser.parse_courses(coreq_text) if course]

subject_count0 = 1
course_count = 1
subject_length = len(program_courses.keys())
for subject in program_courses.keys():
    print(f"Subject = {subject}")
    if subject not in map.keys():
        map[subject] = {}

    for course, link in program_courses[subject]:
        print(f"Current Subject Num: {subject_count0}/{subject_length} Course = {course} Course_Count: {course_count}")
        if link != 'NONE':
            coreqs = find_coreqs(link)
        else:
            coreqs = ""
        if len(coreqs) != 0:
            for coreq in range(len(coreqs)):
                if coreqs[coreq] == course:
                    coreqs[coreq] = coreqs[coreq] + "L"
            print(coreqs)
            map[subject][course] = coreqs
        course_count += 1
    subject_count0 += 1

program_courses = {key: value for key, value in program_courses.items() if len(value) > 0}

if os.path.exists(f'{fileName}.json'):
    os.remove(f'{fileName}.json')

with open(fileName + ".json", "w") as f:
    f.write(json.dumps(map, indent=2))

print("JSON file created successfully.")
