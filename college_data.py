from bs4 import BeautifulSoup
import requests
import json
from urllib.parse import urljoin


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
TODO For each BS major, find if the major has threads, concentrations, or neither.2d
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

# Will store all the mapping
collegeData = {}
baseURL = "https://catalog.gatech.edu"

# First page to access
collegesURL = baseURL + "/academics/colleges-and-schools"
programsResponse = requests.get(collegesURL)
soup = BeautifulSoup(programsResponse.text, "lxml")
collegesContainer = soup.find("div", id="textcontainer")
colleges = collegesContainer.find_all("a")

for college in colleges:
    college_name = college.text.strip()
    college_key = college_name.replace(" ", "-").lower()

    # create structure for this college
    collegeData[college_key] = {"name": college_name, "majors": {} }

    # URL that lists every major for this college
    collegeURL = baseURL + college.get("href") + "/#programstextcontainer"

    programs = requests.get(collegeURL)
    soup2 = BeautifulSoup(programs.text, "lxml")
    program_container = soup2.find("div", id="programstextcontainer")  # Locates body of text that lists all majors

    program_list = program_container.find_all("li")  # Creates list of majors

    for program in program_list:
        program_name = program.text.split('.')[0].strip().replace(",", "")
        links = program.find_all("a", href=True)
        bs_link = [urljoin(baseURL, link["href"]) for link in links if link.text.strip() == "BS"]  # Finds links for BS majors

        if bs_link:
            program_key = program_name.replace(" ", "-").lower()

            # Add major to the college's dictionary
            collegeData[college_key]["majors"][program_key] = {"name": program_name}

            major_page = requests.get(bs_link[0])
            major_soup = BeautifulSoup(major_page.text, "lxml")

            major_info = {"name": program_name}

            concentration_container = major_soup.find("div", id = "concentrationstextcontainer")
            thread_container = major_soup.find("div", id = "threadstextcontainer")

            # if concentration_container:
            #     print(f"{program_key} has Concentrations!")
            # elif thread_container:
            #     print(f"{program_key} has Threads!")
            # else:
            #     print(f"{program_key} has neither (just Requirements).")

print(collegeData)

#Coverts the dictionary into a json file
# with open("./Backend/frontend_files/college_data.json", "w") as f:
#     f.write(json.dumps(collegeData, indent=2))


