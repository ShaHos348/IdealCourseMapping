import os
import json
import csv

# Define the characters or strings you want to check for
check_strings = ["Any", "Option", "Free", "Select"]

def convert_json_to_csv(json_file, csv_file):
    with open(json_file, 'r', encoding='utf-8') as jf:
        data = json.load(jf)
        
        with open(csv_file, 'w', newline='', encoding='utf-8') as cf:
            writer = csv.writer(cf)
            writer.writerow(["Category", "Course Code", "Course Name", "Credits"])  # Writing the header
            
            for category, courses in data.items():
                for course in courses:
                    # Ensure that we do not access out of bounds if a course has less than 4 elements
                    attributes = course[:3]
                    if any(s in attributes[0] for s in check_strings):
                        attributes.insert(1,"SELECT")
                        attributes = attributes[:3]

                    course_info = [category] + attributes  # Include category and the first 4 course attributes
                    writer.writerow(course_info)  # Write the course information

# Directory paths
json_folder = 'Backend/majors'
csv_folder = 'Backend/majors_csv'

# Create CSV folder if it doesn't exist
if not os.path.exists(csv_folder):
    os.makedirs(csv_folder)
else:
    # Clear the existing CSV folder
    for file_name in os.listdir(csv_folder):
        file_path = os.path.join(csv_folder, file_name)
        if os.path.isfile(file_path):
            os.remove(file_path)

# Process each JSON file in the JSON folder
for file in os.listdir(json_folder):
    if file.endswith('.json'):
        json_path = os.path.join(json_folder, file)
        csv_path = os.path.join(csv_folder, file.replace('.json', '.csv'))
        convert_json_to_csv(json_path, csv_path)
