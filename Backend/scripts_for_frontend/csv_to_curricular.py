import os
import csv
import typing
from typing import List, Tuple, Dict, Union, Any
import json
import pandas as pd

def return_all_courses_json(filepath=str) -> List[Dict[str, Any]]: # retrieves the courses picked
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
        prefix = ''
        number = ''
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
                if (course_name == coursename): # adds credit hours and long_name if course found
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
                    for prereq in prereq_list: # adds list of prereqs
                        prereq_string += str(prereq) + ";"
                    if (len(prereq_string) != 0):
                        prereq_string = prereq_string[:-1]
                    all_courses[index][3] = prereq_string # adds prereqs to array of courses to be taken

def prefix_courses(all_courses: Dict[int, List[str]]): #finds the prefix and abbreviation for each course
    for index, name in all_courses.items():
        courseTuple = grab_prefix_number(name[0])
        all_courses[index][1] = courseTuple[0]
        all_courses[index][2] = courseTuple[1]
        

def find_prereq_index(all_courses: Dict[int, List[str]], prereqs: List[str], course: str) -> List[str]: #finds the index for the prereqs
    prereqlist = []
    if (len(prereqs) == 0):
        return prereqlist
    for prereq in prereqs:
        if "/" in prereq: # checks if there are multiple options
            small_list = prereq.split("/")
            orlist = ""
            for small in small_list:
                for index, name in all_courses.items():
                    if (small == name[0]): # adds if course is found
                        orlist += str(index) + ";"
            if (len(orlist) != 0):
                orlist = orlist[:-1]
                prereqlist.append(orlist)
        else:
            for index, name in all_courses.items():
                if (prereq == name[0]): # adds if course is found
                    prereqlist.append(index)
    return prereqlist

def save_to_csv(df: pd.DataFrame, df2: pd.DataFrame, filename: str): #creates an csv file that is in the correct format
    df2.to_csv(filename, index=False, header=False, mode='w')  # 'w' mode overwrites any existing content
    df.to_csv(filename, index=False, header=True, mode='a')    # 'a' mode appends below df2

#new function

def generate_curricular_csv(selected_courses: List[str]) -> str:
    """ Generates CSV for curricular analytics site based on selected courses. """
    output_file = "Backend/frontend_files/csv_for_display.csv"

    # Process course data using selected courses
    all_courses = index_courses(selected_courses)
    info_courses(all_courses)

    # Prepare course data for CSV
    courses_info = [
        {
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
        for index, course in all_courses.items()
    ]

    # Prepare metadata for CSV
    metadata = [
        {"Field": "Curriculum", "Value": "Major"},
        {"Field": "Institution", "Value": "Georgia Institute of Technology"},
        {"Field": "Degree Type", "Value": "BS"},
        {"Field": "System Type", "Value": "Semester"},
        {"Field": "CIP", "Value": ""},
        {"Field": "Courses", "Value": ""}
    ]

    # Save CSV
    df2 = pd.DataFrame(metadata)
    df = pd.DataFrame(courses_info)
    df2.to_csv(output_file, index=False, header=False, mode='w')
    df.to_csv(output_file, index=False, header=True, mode='a')

    return output_file  
