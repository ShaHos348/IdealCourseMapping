from bs4 import BeautifulSoup
import requests
import json

baseURL = "https://catalog.gatech.edu"
programsURL = baseURL + "/programs/#bachelorstext"
programsResponse = requests.get(programsURL)
soup = BeautifulSoup(programsResponse.text, "lxml")
courses = soup.find("div", id="bachelorstextcontainer")
titles = courses.find_all("li")

for i in range(len(titles)):
    titles[i] = titles[i].text.split(".")[0].replace(" ", "_").replace("_&_", "_and_")
links = courses.find_all("a")

for i in range(len(links)):
    links[i] = links[i].get("href")
    if links[i] != None and "www.catalog.gatech.edu" in links[i]:
        links[i] = links[i].split(".edu")[1]
links.remove(None)

def make_json(fileName, map):
    map = {key: value for key, value in map.items() if value}  # Remove keys with empty lists
    with open("./majors/" + fileName + ".json", "w") as f:
        f.write(json.dumps(map, indent=2))

for program in range(len(links)):
    url = baseURL + str(links[program])
    print(url)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")
    concentration = soup.find("div", id="concentrationstextcontainer")
    threads = soup.find("div", id="threadstextcontainer")
    if concentration != None:
        concentration_titles = concentration.find_all("li")
        for i in range(len(concentration_titles)):
            concentration_titles[i] = (
                concentration_titles[i]
                .text.split(".")[0]
                .replace(" ", "_")
                .replace("\n", "")
            )
            if ":" in concentration_titles[i]:
                concentration_titles[i] = (
                    concentration_titles[i].split(":")[0]
                    + concentration_titles[i].split(":")[1]
                )
        concentration_links = concentration.find_all("a")
        temp = concentration_titles.copy()
        for i in range(len(concentration_links)):
            concentration_tag = concentration_links[i]
            concentration_links[i] = concentration_tag.get("href")
            if len(temp) == 0:
                concentration_titles.append(concentration_tag.text)
        concentration_links.remove(None)
        if "" in concentration_titles:
            concentration_titles.remove("")
        for concentration in range(len(concentration_links)):
            url = baseURL + str(concentration_links[concentration])
            print(url)
            response = requests.get(url)
            soup = BeautifulSoup(response.text, "lxml")
            table = soup.find("table", "sc_courselist")
            map = {}
            currArea = ""
            isSelect = False
            isSelectHour = 0
            for item in table.find_all("tr"):
                if "areaheader" in item["class"]:
                    currArea = item.text
                    map[item.text] = []
                elif currArea == "":
                    continue
                else:
                    course = []
                    for course_info in item.find_all("td"):
                        sup = course_info.find("sup")
                        if sup:
                            sup.decompose()
                        course.append(course_info.text.replace("\xa0", "").strip())
                    link = item.find("a")
                    if link != None:
                        course.append("https://catalog.gatech.edu" + link.get("href"))
                    map[currArea].append(course)
            creditHour = -1
            for area in map.keys():
                for course in map[area]:
                    if "Select one" in course[0]:
                        creditHour = course[1]
                    elif creditHour != -1:
                        if len(course) > 2:
                            course[2] = creditHour
                creditHour = -1
            creditHour = -1
            for area in map.keys():
                for j in range(len(map[area])):
                    currCourse = map[area][j]
                    if len(currCourse) > 2 and currCourse[2].isnumeric():
                        currCourse[2] = int(currCourse[2])
                        creditHour = currCourse[2]
                    if currCourse[0][0:2] == "or":
                        currCourse.insert(2, creditHour)
                creditHour = -1
            if "-" not in concentration_titles[concentration]:
                fileName = (
                    titles[program]
                    + "-"
                    + concentration_titles[concentration]
                    .replace(" ", "_")
                    .replace("_-_", "-")
                    .replace(",_", ",")
                    .replace("Bachelor_of_Science_in_Mathematics", "")
                    .replace("_with_a_concentration_in_", "")
                    .replace("Bachelor_of_Science_in_", "")
                    .replace("_with_a_concentration_is_", "")
                )
            else:
                fileName = (
                    concentration_titles[concentration]
                    .replace(" ", "_")
                    .replace("_-_", "-")
                    .replace("-_", "-")
                    .replace("Bachelor_of_Science_in_", "")
                    .replace("_Option", "")
                )
            make_json(fileName, map)
    elif threads != None:
        thread_titles = threads.find_all("a")
        thread_links = threads.find_all("a")
        for i in range(len(thread_titles)):
            thread_links[i] = thread_links[i].get("href")
            thread_titles[i] = thread_titles[i].text.replace(" ", "_").strip()
            if "Thread:" in thread_titles[i]:
                thread_titles[i] = thread_titles[i].split("Thread:")[1].strip()
        thread_links.remove(None)
        thread_titles.remove("")
        for threadIdx in range(len(thread_links)):
            url = baseURL + str(thread_links[threadIdx])
            print(url)
            response = requests.get(url)
            soup = BeautifulSoup(response.text, "lxml")
            table = soup.find("table", "sc_courselist")
            map = {}
            currArea = ""
            isSelect = False
            isSelectHour = 0
            for item in table.find_all("tr"):
                if "areaheader" in item["class"]:
                    currArea = item.text
                    map[item.text] = []
                elif currArea == "":
                    continue
                else:
                    course = []
                    for course_info in item.find_all("td"):
                        sup = course_info.find("sup")
                        if sup:
                            sup.decompose()
                        course.append(course_info.text.replace("\xa0", "").strip())
                    link = item.find("a")
                    if link != None:
                        course.append("https://catalog.gatech.edu" + link.get("href"))
                    map[currArea].append(course)
            creditHour = -1
            for area in map.keys():
                for course in map[area]:
                    if "Select one" in course[0]:
                        creditHour = course[1]
                    elif creditHour != -1:
                        if len(course) > 2:
                            course[2] = creditHour
                creditHour = -1
            creditHour = -1
            for area in map.keys():
                for j in range(len(map[area])):
                    currCourse = map[area][j]
                    if len(currCourse) > 2 and currCourse[2].isnumeric():
                        currCourse[2] = int(currCourse[2])
                        creditHour = currCourse[2]
                    if currCourse[0][0:2] == "or":
                        currCourse.insert(2, creditHour)
                creditHour = -1
            fileName = (
                (titles[program] + "-" + thread_titles[threadIdx])
                .replace("_-_", "-")
                .replace("-_", "-")
                .replace("_\u2013_", "-")
                .replace(",_", ",")
                .strip()
            )
            make_json(fileName, map)
    else:
        table = soup.find("table", "sc_courselist")
        map = {}
        currArea = ""
        isSelect = False
        isSelectHour = 0
        for item in table.find_all("tr"):
            if "areaheader" in item["class"]:
                currArea = item.text

                map[item.text] = []
            elif currArea == "":
                continue
            else:
                course = []
                for course_info in item.find_all("td"):
                    sup = course_info.find("sup")
                    if sup:
                        sup.decompose()
                    course.append(course_info.text.replace("\xa0", "").strip())
                link = item.find("a")
                if link != None:
                    course.append("https://catalog.gatech.edu" + link.get("href"))
                map[currArea].append(course)
        creditHour = -1
        for area in map.keys():
            for course in map[area]:
                if "Select one" in course[0]:
                    creditHour = course[1]
                elif creditHour != -1:
                    if len(course) > 2:
                        course[2] = creditHour
            creditHour = -1
        creditHour = -1
        for area in map.keys():
            for i in range(len(map[area])):
                currCourse = map[area][i]
                if len(currCourse) > 2 and currCourse[2].isnumeric():
                    currCourse[2] = int(currCourse[2])
                    creditHour = currCourse[2]
                if currCourse[0][0:2] == "or":
                    currCourse.insert(2, creditHour)
            creditHour = -1
        make_json(titles[program], map)