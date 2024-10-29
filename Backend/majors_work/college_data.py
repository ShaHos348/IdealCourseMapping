from bs4 import BeautifulSoup
import requests
import json

# Will store all the mapping
collegeData = {}

baseURL = "https://catalog.gatech.edu"

#First page to access
collegeURL = baseURL + "/academics/colleges-and-schools"
programsResponse = requests.get(collegeURL)
soup = BeautifulSoup(programsResponse.text, "lxml")
collegesContainer = soup.find("div", id="textcontainer")
colleges = collegesContainer.find_all("a")
Links = [(college.text,college.get('href')) for college in colleges]

#print(colleges)
print(Links)

#NOTE: Please look at majors_scrapper.py to see how soup works and Frontend\app\page.tsx on how collegeData is structured

"""
TODO For link in Links: add the title as a key (Replace spaces with '-'), set 'name' value to text (link[0]),
and go to url that is 'baseURL + link[1]'
"""

"""
TODO For each college accessed from link, find the 'programstextcontainer' div 
and extract all programs that contain BS as a major. 

Make a new map that will store all the majors (Key is name of major with spaces replaced with '-' and name value is the text).

For each BS program, go to the link using 'baseURL + href'
"""

"""
TODO For each BS major, find if the major has threads, concentrations, or neither.
Make new map where the key is 'Concentrations', Threads', or 'Requirements' (Neither) and value is an array with data

If concentration or thread, each item in array should be a dictionary 
where 'value' is the conectration/thread name (Spaces replaced with '-') and 'label' is the name itself

If neither, array should contain only one item where both the 'value' and 'label' are 'Requirements' 
"""

"""
TODO When a major is done, append it to the dictionary for its program, 
and when a program is done, append it to the dictionary for its college,
and when a college is done, append it to the collegeData dictionary.
"""

#Coverts the dictionary into a json file
with open("./Backend/frontend_files/college_data.json", "w") as f:
    f.write(json.dumps(collegeData, indent=2))