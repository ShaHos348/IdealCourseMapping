from bs4 import BeautifulSoup
import requests
import json

baseURL = "https://catalog.gatech.edu"
programsURL = baseURL + "/courses-undergrad"
programsResponse = requests.get(programsURL)
soup = BeautifulSoup(programsResponse.text, "lxml")
courses = soup.find("div", id="atozindex")
titles = courses.find_all("li")

program_courses = {}

for i in range(len(titles)):
    titles[i] = titles[i].text.split(".")[0].replace(" ", "_").replace("_&_", "_and_")
links = courses.find_all("a")

for i in range(len(links)):
    links[i] = links[i].get("href")
    if links[i] != None and "www.catalog.gatech.edu" in links[i]:
        links[i] = links[i].split(".edu")[1]
links = [link for link in links if link is not None]

for program in range(len(links)):
    url = baseURL + str(links[program])
    print(url)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")
    course_titles = soup.find_all("p", class_="courseblocktitle")
    updated_course_titles = []
    for title in course_titles:
        title = title.get_text().split(".")[0]
        title = title.replace('\u00a0', ' ').strip()
        if title[-1] != 'R' and 'X' not in title[-4:] and title[-1] != 'L':
            updated_course_titles.append(title)
        else:
            print(title)
    
    for title in updated_course_titles:
        print(title)
    
    program_name = str(links[program])  # Or extract program name from URL if needed
    program_courses[program_name] = updated_course_titles  # Store the filtered courses

with open('program_courses.json', 'w') as json_file:
    json.dump(program_courses, json_file, indent=4)

print("JSON file created successfully.")