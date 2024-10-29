from bs4 import BeautifulSoup
import requests
import pandas as pd
import json
import array

humanities_url = "https://catalog.gatech.edu/academics/undergraduate/core-curriculum/core-area-c/#"
catalog_base_url = "https://catalog.gatech.edu"

programs_response = requests.get(humanities_url)
soup = BeautifulSoup(programs_response.text, 'lxml')
table = soup.findAll('table')
every_humanities = []
for tr_entry in table[-2].find('tbody').find_all('tr'):
    course_entry = []
    for td_entry in tr_entry.find_all('td'):
        course_entry.append(td_entry.text.replace("\xa0", " ").strip())
    link = tr_entry.find('a')
    if link is not None:
        course_entry.append(catalog_base_url + link.get('href'))
    every_humanities.append(course_entry)

print("Every humanities:", every_humanities)
with (open("Backend/frontend_files/humanities.json", "w")) as f:
    f.write(json.dumps(every_humanities, indent=2))
