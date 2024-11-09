import os
import csv
import typing
from typing import List, Tuple, Dict, Union, Any
import json
import pandas as pd

def return_all_courses_json(filepath=str) -> List[Dict[str, Any]]:
    file_path = "Backend/frontend_files/courses_picked.json"
    try:
        with open(file_path, 'r') as jsonfile:
            data = json.load(jsonfile)
            return data
    except FileNotFoundError:
        print("File not found: {file_path}")
        return []
    
def read_json_data(file_path: str) -> Dict[str, Any]: #reads the json file which contains the courses that are picked
    with open(file_path, 'r') as jsonfile:
        data = json.load(jsonfile)
    return data

def grab_prefix_number(course_name_combo: str) -> Tuple[str, str]: #separates the course name into prefix and abbreviation
    prefix = []
    number = []
    for i in course_name_combo:
        if i.isalpha():
            prefix.append(i)
    for i in course_name_combo:
        if i.isdigit():
            number.append(i)
    prefix = "".join(prefix)
    number = "".join(number)
    if len(number) == 0:
        prefix = course_name_combo
        number = "0000"
    # print(course_name_combo)
    return prefix, number

def index_courses(courses: List[str]) -> Dict[int, List[str]]: #finds the index for each course
    indexed_courses = {}
    for index, course in enumerate(courses, start=1):
        indexed_courses[index] = [course] + [''] * 8
    return indexed_courses

def info_courses(all_courses: Dict[int, List[str]]): #finds the information needed for each course: credit hours + canonical name
    filepath = "Backend/frontend_files/full_program_courses.json"
    try:
        with open(filepath, 'r') as jsonfile:
            data = json.load(jsonfile)
    except FileNotFoundError:
        print("File not found: {filepath}")
    for department, course_list in data.items():
        for course in course_list:
            course_name = course["name"]
            for index, name in all_courses.items():
                coursename = name[0]
                if (course_name == coursename):
                    credits = course["hours"]
                    long_name = course["long_name"]
                    all_courses[index][6] = credits
                    all_courses[index][8] = long_name

def prereq_courses(all_courses: Dict[int, List[str]]): #finds the prereqs for each course
    filepath = "Backend/frontend_files/prereqs.json"
    try:
        with open(filepath, 'r') as jsonfile:
            data = json.load(jsonfile)
    except FileNotFoundError:
        print("File not found: {filepath}")
    for course_list in data.values():
        for course, prereqs in course_list.items():
            for index, name in all_courses.items():
                coursename = name[0]
                if (coursename == course):
                    prereq_list = []
                    prereq_list = find_prereq_index(all_courses, prereqs, course)
                    prereq_string = ""
                    for prereq in prereq_list:
                        prereq_string += str(prereq) + ","
                    if (len(prereq_string) != 0):
                        prereq_string = prereq_string[:-1]
                    all_courses[index][3] = prereq_string

def find_prereq_index(all_courses: Dict[int, List[str]], prereqs: List[str], course: str) -> List[str]: #finds the index for the prereqs
    prereqlist = []
    if (len(prereqs) == 0):
        return prereqlist
    for prereq in prereqs:
        if "/" in prereq:
            small_list = prereq.split("/")
            orlist = ""
            for small in small_list:
                for index, name in all_courses.items():
                    if (small == name[0]):
                        orlist += str(index) + ";"
            if (len(orlist) != 0):
                orlist = orlist[:-1]
                prereqlist.append(orlist)
        else:
            for index, name in all_courses.items():
                if (prereq == name[0]):
                    prereqlist.append(index)
    return prereqlist

def save_to_excel(df: pd.DataFrame, df2: pd.DataFrame, filename: str): #creates an excel file that is in the correct format
    with pd.ExcelWriter(filename, engine="openpyxl") as writer:
        df2.to_excel(writer, index=False, header=False, sheet_name="data", startrow = 0, startcol = 0)
        df.to_excel(writer, index=False, sheet_name="data", startrow = len(df2), startcol = 0)


def main():
    filepath = "frontend_files/"
    output_folder = "Backend/"
    courses = return_all_courses_json(filepath)
    all_courses = index_courses(courses)
    info_courses(all_courses)
    prereq_courses(all_courses)
    courses_info = []
    for index, course in all_courses.items():
        if (course[6] == ''):
            course_entry = {
            "Course ID": index,
            "Course Name": course[0],
            "Prefix": course[1],
            "Number": course[2],
            "Prerequisites": course[3],
            "Corequisites": course[4],
            "Strict-Corequisites": course[5],
            "Credit Hours": course[6],
            "Institution": "GT",
            "Canonical Name": course[8]
        }
        else:
            course_entry = {
            "Course ID": index,
            "Course Name": course[0],
            "Prefix": course[1],
            "Number": course[2],
            "Prerequisites": course[3],
            "Corequisites": course[4],
            "Strict-Corequisites": course[5],
            "Credit Hours": int(course[6]),
            "Institution": "GT",
            "Canonical Name": course[8]
        }
        courses_info.append(course_entry)
    metadata = [
            {"Field": "Curriculum", "Value": "Major"},
            {"Field": "Institution", "Value": "Georgia Institute of Technology"},
            {"Field": "Degree Type", "Value": "BS"},
            {"Field": "System Type", "Value": "Semester"},
            {"Field": "CIP", "Value": ""},
            {"Field": "Courses", "Value": ""}
        ]
    df2 = pd.DataFrame(metadata)
    df = pd.DataFrame(courses_info)
    output_file = os.path.join(output_folder, f"test_prereqs.xlsx")
    save_to_excel(df, df2, output_file)


if __name__ == "__main__":
    main()