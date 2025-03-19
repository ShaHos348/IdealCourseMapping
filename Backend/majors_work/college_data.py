from bs4 import BeautifulSoup
import requests
import json
from urllib.parse import urljoin
import pprint

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
    college_name = college.text.strip().replace("\xa0", " ")
    college_key = college_name.replace(" ", "-").lower()

    # create structure for this college
    collegeData[college_key] = {"name": college_name, "majors": {} }

    # URL that lists every major for this college
    collegeURL = baseURL + college.get("href") + "/#programstextcontainer"

    programs = requests.get(collegeURL)
    soup2 = BeautifulSoup(programs.text, "lxml")
    program_container = soup2.find("div", id="programstextcontainer")  # Locates body of text that lists all majors

    program_list = program_container.find_all("li")  # Creates list of majors

    print("Working...")

    # Manually adding Scheller College of Business data, as the site format is different
    if "scheller-college-of-business" in collegeData:
        collegeData["scheller-college-of-business"]["majors"]["business-administration"] = {
            "name": "Business Administration",
            "concentrations": [
                {
                    "value": "accounting",
                    "label": "Accounting"
                },
                {
                    "value": "finance",
                    "label": "Finance"
                },
                {
                    "value": "general-management",
                    "label": "General Management"
                },
                {
                    "value": "it-management",
                    "label": "IT management"
                },
                {
                    "value": "leadership-and-organizational-change",
                    "label": "Leadership and Organizational Change"
                },
                {
                    "value": "marketing",
                    "label": "Marketing"
                },
                {
                    "value": "operations-and-supply-chain-management",
                    "label": "Operations and Supply Chain Management"
                },
                {
                    "value": "strategy-and-innovation",
                    "label": "Strategy and Innovation"
                }
            ]
        }

    for program in program_list:
        program_name = program.text.split('.')[0].strip().replace(",", "").replace("\xa0", " ")
        links = program.find_all("a", href=True)
        bs_link = [urljoin(baseURL, link["href"]) for link in links if link.text.strip() == "BS"]  # Finds links for BS majors

        if bs_link:
            program_key = program_name.replace(" ", "-").lower()

            # Add major to the college's dictionary
            collegeData[college_key]["majors"][program_key] = {"name": program_name}

            major_page = requests.get(bs_link[0])
            major_soup = BeautifulSoup(major_page.text, "lxml")

            major_info = {"name": program_name}

            conc_container = major_soup.find("div", id = "concentrationstextcontainer")
            thread_container = major_soup.find("div", id = "threadstextcontainer")

            if conc_container:
                li_elements = conc_container.find_all("li")  # Check for <li> elements first

                if li_elements:
                    # Extract only from <li> elements if they exist
                    conc_list = li_elements
                else:
                    # Fallback to <p> elements if no <li> elements exist
                    conc_list = [p for p in conc_container.find_all("p") if p.find("a")]

                concentrations = [{
                    "value": "-".join(item.text.strip().replace("\u2013", " ").replace("\u00a0", " ").split(" - ", 1)[-1].lower().split()).replace("---", "-"),
                    "label": item.text.strip().replace("\u2013", " ").replace("\u00a0", " ").split(" - ", 1)[-1]
                } for item in conc_list]

                if program_key == "mathematics":
                    major_info["concentrations"] = [
                        {"value": "applied-mathematics", "label": "Applied Mathematics"},
                        {"value": "discrete-mathematics", "label": "Discrete Mathematics"},
                        {"value": "mathematical-foundations-in-data-science", "label": "Mathematical Foundations in Data Science"},
                        {"value": "pure-mathematics", "label": "Pure Mathematics"},
                        {"value": "probability-and-statistics", "label": "Probability and Statistics"}
                    ]

                else:
                    major_info["concentrations"] = concentrations

            elif thread_container:
                thread_list = thread_container.find_all(["li", "p"])
                threads = [{
                    "value": item.text.strip().replace("\u2013", " ").replace("\u00a0", " ").replace(" ", "-").lower().replace("---", "-"),
                    "label": item.text.strip().replace("\u2013", " ").replace("\u00a0", " ").replace("   ", " - ") }
                    for item in thread_list if item.name == "li" or item.find("a")]  # Filter <p> that contain links

                # Manually adding CS threads as website format is different.
                if program_key == "computer-science":
                    major_info["threads"] = [
                        {"value": "cybersecurity-and-privacy", "label": "Cybersecurity and Privacy"},
                        {"value": "devices", "label": "Devices"},
                        {"value": "information-internetworks", "label": "Information Internetworks"},
                        {"value": "intelligence", "label": "Intelligence"},
                        {"value": "media", "label": "Media"},
                        {"value": "modeling-and-simulation", "label": "Modeling and Simulation"},
                        {"value": "people", "label": "People"},
                        {"value": "systems-and-architecture", "label": "Systems and Architecture"},
                        {"value": "theory", "label": "Theory"}
                    ]

                elif program_key == "literature-media-and-communication":
                    major_info["threads"] = [
                        {"value": "literature-&-media", "label": "Literature & Media"},
                        {"value": "literature-&-communication", "label": "Literature & Communication"},
                        {"value": "literature-&-design", "label": "Literature & Design"},
                        {"value": "literature-&-social-justice", "label": "Literature & Social Justice"},
                        {"value": "literature-&-science,-technology,-and-culture", "label": "Literature & Science, Technology, and Culture"},
                        {"value": "media-&-communication", "label": "Media & Communication"},
                        {"value": "media-&-design", "label": "Media & Design"},
                        {"value": "media-&-social-justice", "label": "Media & Social Justice"},
                        {"value": "media-&-science,-technology,-and-culture", "label": "Media & Science, Technology, and Culture"},
                        {"value": "communication-&-design", "label": "Communication & Design"},
                        {"value": "communication-&-social-justice", "label": "Communication & Social Justice"},
                        {"value": "communication-&-science,-technology,-and-culture", "label": "Communication & Science, Technology, and Culture"},
                        {"value": "design-&-social-justice", "label": "Design & Social Justice"},
                        {"value": "design-&-science,-technology,-and-culture", "label": "Design & Science, Technology, and Culture"},
                        {"value": "social-justice-and-science,-technology,-and-culture", "label": "Social Justice and Science, Technology, and Culture"}

                    ]

                else:
                    major_info["threads"] = threads

            else:
                major_info["requirements"] = [{"value": "requirements", "label": "Requirements"}]

            # Save the formatted major info
            collegeData[college_key]["majors"][program_key] = major_info

            # To help with seeing which majors have concentrations, threads, or neither.
            # if concentration_container:
            #     print(f"{program_key} has Concentrations!")
            # elif thread_container:
            #     print(f"{program_key} has Threads!")
            # else:
            #     print(f"{program_key} has neither (just Requirements).")


print(json.dumps(collegeData, indent=4))

#Coverts the dictionary into a json file
with open("./Backend/frontend_files/college_data.json", "w") as f:
    f.write(json.dumps(collegeData, indent=2))