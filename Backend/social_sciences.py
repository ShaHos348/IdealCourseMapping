from bs4 import BeautifulSoup
import requests
import pandas as pd
import json
import array

social_sciences_url = "https://catalog.gatech.edu/academics/undergraduate/core-curriculum/core-area-e/#"
catalog_base_url = "https://catalog.gatech.edu"

programs_response = requests.get(social_sciences_url)
soup = BeautifulSoup(programs_response.text, 'lxml')
table = soup.findAll('table')
every_social_science = []
for tr_entry in table[-2].find('tbody').find_all('tr'):
    course_entry = []
    for td_entry in tr_entry.find_all('td'):
        course_entry.append(td_entry.text.replace("\xa0", "").strip())
    link = tr_entry.find('a')
    if link is not None:
        course_entry.append(catalog_base_url + link.get('href'))
    every_social_science.append(course_entry)

print("Every social science:", every_social_science)
with (open("social_sciences.json", "w")) as f:
    f.write(json.dumps(every_social_science, indent=2))
