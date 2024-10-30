import os
import csv
import typing
from typing import List, Tuple, Dict, Union, Any
import json
import pandas as pd

def return_all_majors_json(filepath="majors/"): #grabs all of the majors from the majors folder
    f = []
    for (dirpath, dirnames, filenames) in os.walk(filepath):
        f.extend(filenames)
        break
    return f
    
def read_json_data(file_path: str) -> Dict[str, Any]: #reads the json files in the majors folder
    with open(file_path, 'r') as jsonfile:
        data = json.load(jsonfile)
    return data

def grab_prefix_number(course_name_combo: str) -> Tuple[str, str]:
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


def couse_entry_creator(proper_names: str, options: List[str]) -> str:
    prefixes_pre_join = []
    for i in options:
        prefixes_pre_join.append(grab_prefix_number(i[0]))
    # Any course that has a prefix starting with "or" and having the same prefix after the "or" should be joined
    prefixes_post_join = {}
    for i in prefixes_pre_join:
        # print(i)
        if i is not None and len(i) > 0:
            if i[0].startswith("or") and i[0][2:] in prefixes_post_join.keys():
                prefixes_post_join[i[0][2:]].append(i[1])
            else:
                prefixes_post_join[i[0]] = [i[1]]
    # print(prefixes_post_join)
    return prefixes_post_join

def save_to_excel(df: pd.DataFrame, df2: pd.DataFrame, filename: str): #creates an excel file that is in the correct format
    with pd.ExcelWriter(filename, engine="openpyxl") as writer:
        df2.to_excel(writer, index=False, header=False, sheet_name="data", startrow = 0, startcol = 0)
        df.to_excel(writer, index=False, sheet_name="data", startrow = len(df2), startcol = 0)


def main():
    filepath = "majors/"
    output_folder = "majors_xlsx/"
    majors = return_all_majors_json(filepath)
    
    for major in majors: #creates a dataframe for each major
        file_path = os.path.join(filepath, major)
        course_data = read_json_data(file_path)
        major_name = major.replace(".json", "")
        all_courses = []
        index = 1
        for category, courses in course_data.items():
            for course in courses:
                if (len(course) == 4):
                    course_entry = {
                        "Course ID": index,
                        "Course Name": course[0],
                        "Prefix": "",
                        "Number": "",
                        "Prerequisites": "",
                        "Corequesites": "",
                        "Strict-Corequesites": "",
                        "Credit Hours": course[2],
                        "Institution": "GT",
                        "Canonical Name": course[1]
                    }
                else:
                    course_entry = {
                        "Course ID": index,
                        "Course Name": course[0],
                        "Prefix": "",
                        "Number": "",
                        "Prerequisites": "",
                        "Corequesites": "",
                        "Strict-Corequesites": "",
                        "Credit Hours": course[1],
                        "Institution": "GT",
                        "Canonical Name": category
                }
                all_courses.append(course_entry)

        metadata = [
            {"Field": "Curriculum", "Value": major_name},
            {"Field": "Institution", "Value": "Georgia Institute of Technology"},
            {"Field": "Degree Type", "Value": "BS"},
            {"Field": "System Type", "Value": "Semester"},
            {"Field": "CIP", "Value": ""},
            {"Field": "Courses", "Value": ""}
        ]
        df2 = pd.DataFrame(metadata)
        df = pd.DataFrame(all_courses)
        output_file = os.path.join(output_folder, f"{major_name}.xlsx")
        save_to_excel(df, df2, output_file)


if __name__ == "__main__":
    main()