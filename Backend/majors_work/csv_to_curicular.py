import os
import csv
import typing
from typing import List, Tuple
import json


def return_all_majors_json(filepath="Backend/majors/"):
    f = []
    for (dirpath, dirnames, filenames) in os.walk(filepath):
        f.extend(filenames)
        break
    return f


def curricular_metadata(filename):
    # TODO: Convert filename to actually readable format
    answer: str = ""
    answer += "Curriculum," + filename + ",,,,,,,," + "\n"
    answer += "Institution,Georgia Institute of Technology,,,,,,,," + "\n"
    answer += "Degree Type, BS,,,,,,,," + "\n"
    answer += "Semester Type, Semester,,,,,,,," + "\n"
    answer += "CIP,,,,,,,,," + "\n"
    answer += "Courses,,,,,,,,," + "\n"
    answer += ("Course ID,Course Name,Prefix,Number,Prerequisites,Corequisites,Strict-Corequisites,Credit Hours,"
               "Institution,Canonical Name") + "\n"
    return answer


# https://docs.python.org/3/library/csv.html
def category_separator(file: str, mode: str = "json"):
    # Don't use excel mode, why
    if (mode == "excel"):
        unique_categories = {}
        banned_categories = ["Category", "Course Code", "Course Name", "Credits", "URL"]
        with open(file, 'r') as csvfile:
            reader = csv.reader(csvfile, delimiter=",")
            for row in reader:
                if len(row) >= 1 and row[0] not in banned_categories and row[0] not in unique_categories.keys():
                    unique_categories[row[0]] = []
                if row[0] in unique_categories.keys():
                    unique_categories[row[0]].append(row[1:])
            return unique_categories
    elif (mode == "json"):
        unique_categories = {}
        with open(file, 'r') as jsonfile:
            data = json.load(jsonfile)
            return data
    pass


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


def main():
    filepath = "majors/"
    majors = return_all_majors_json(filepath)
    categories = category_separator(filepath + majors[0])
    proper_names = [i for i in categories.keys()]
    (proper_names[0], categories[proper_names[0]])
    courseEntries = couse_entry_creator(proper_names[0], categories[proper_names[0]])
    #print(courseEntries)
    final_csv_output = curricular_metadata(majors[0])
    print(final_csv_output)
    """filepath = "majors/"
    majors = return_all_majors_json(filepath)
    categories = category_separator(filepath + majors[0], mode="json")
    all_course_entries = []
    for i in categories.keys():
        course_entries = couse_entry_creator(i, categories[i])
        if course_entries is not None and len(course_entries) > 0:
            # at this point is when we start writing to the new csv file
            print(course_entries)
            [all_course_entries.append(j) for j in course_entries]"""
    # Specify the output CSV file path
    csv_filename = "curricular_metadata_output.csv"

    # Write the string directly to a CSV file
    with open(csv_filename, mode='w', newline='', encoding='utf-8') as csvfile:
        csvfile.write(final_csv_output)

    print(f"CSV file '{csv_filename}' has been created successfully.")


if __name__ == "__main__":
    main()
