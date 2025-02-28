import os
import json
import pandas as pd
from typing import List, Dict, Any

def return_all_courses_json(filepath: str) -> List[Dict[str, Any]]:
    """ Retrieves selected courses from JSON file. """
    file_path = "Backend/frontend_files/courses_picked.json"
    try:
        with open(file_path, 'r') as jsonfile:
            return json.load(jsonfile)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return []

def index_courses(courses: List[str]) -> Dict[int, List[str]]:
    """ Creates a dictionary of indexed courses. """
    return {index: [course] + [''] * 8 for index, course in enumerate(courses, start=1)}

def info_courses(all_courses: Dict[int, List[str]]):
    """ Adds course information like credit hours and long name. """
    filepath = "Backend/frontend_files/full_program_courses.json"
    try:
        with open(filepath, 'r') as jsonfile:
            data = json.load(jsonfile)
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return
    for department, course_list in data.items():
        for course in course_list:
            course_name = course["name"]
            for index, name in all_courses.items():
                if course_name == name[0]:
                    name[6] = course["hours"]
                    name[8] = course["long_name"]

def save_to_csv(df: pd.DataFrame, df2: pd.DataFrame, filename: str):
    """ Saves metadata and course data to a CSV file. """
    df2.to_csv(filename, index=False, header=False, mode='w')  # Metadata
    df.to_csv(filename, index=False, header=True, mode='a')  # Courses


def generate_curricular_csv(selected_courses: List[str]) -> str:
   # generates CSV for curricular analytics site based on selected courses
    output_file = "Backend/frontend_files/csv_for_display.csv"

    # process course data using selected courses
    all_courses = index_courses(selected_courses)
    info_courses(all_courses)

    # prepare course data for CSV
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

    # prepare metadata for CSV
    metadata = [
        {"Field": "Curriculum", "Value": "Major"},
        {"Field": "Institution", "Value": "Georgia Institute of Technology"},
        {"Field": "Degree Type", "Value": "BS"},
        {"Field": "System Type", "Value": "Semester"},
        {"Field": "CIP", "Value": ""},
        {"Field": "Courses", "Value": ""}
    ]

    # save CSV
    df2 = pd.DataFrame(metadata)
    df = pd.DataFrame(courses_info)
    save_to_csv(df, df2, output_file)

    return output_file  # return the path to the generated CSV file
