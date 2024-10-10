import os
import json
import csv

def convert_json_to_csv(json_file, csv_file):
    with open(json_file, 'r') as jf:
        data = json.load(jf)
        with open(csv_file, 'w', newline='', encoding='utf-8') as cf:
            cf.write("Category,Course Code,Course Name,Credits,URL\n")
            for category, courses in data.items():
                for course in courses:
                    course_info = [category] + course[:4]
                    cf.write(','.join(map(str, course_info)) + '\n')

json_folder = 'majors'
csv_folder = 'majors_csv'

if not os.path.exists(csv_folder):
    os.makedirs(csv_folder)
else:
    for file_name in os.listdir(csv_folder):
        file_path = os.path.join(csv_folder, file_name)
        if os.path.isfile(file_path):
            os.remove(file_path)
for file in os.listdir(json_folder):
    if file.endswith('.json'):
        json_path = os.path.join(json_folder, file)
        csv_path = os.path.join(csv_folder, file.replace('.json', '.csv'))
        convert_json_to_csv(json_path, csv_path)
