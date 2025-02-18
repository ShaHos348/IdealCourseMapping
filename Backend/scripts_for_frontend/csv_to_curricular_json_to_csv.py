
import json
import csv
from typing import List, Dict, Any

def read_json_data(file_path: str) -> List[Dict[str, Any]]:
    """Reads the JSON file containing picked courses."""
    try:
        with open(file_path, 'r') as jsonfile:
            data = json.load(jsonfile)
        return data
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"Error decoding JSON from file: {file_path}")
        return []

def save_courses_to_csv(courses: List[Dict[str, Any]], output_csv: str):
    """Saves the courses to a CSV file."""
    if not courses:
        print("No courses provided to save.")
        return
    
    keys = courses[0].keys()
    with open(output_csv, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=keys)
        writer.writeheader()
        for course in courses:
            writer.writerow(course)
    print(f"Courses saved to {output_csv}")

def main(input_json: str, output_csv: str):
    courses = read_json_data(input_json)
    if not courses:
        print("No valid courses found in JSON.")
        return
    save_courses_to_csv(courses, output_csv)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Convert picked courses from JSON to CSV.")
    parser.add_argument("input_json", type=str, help="Path to the JSON file containing picked courses")
    parser.add_argument("output_csv", type=str, help="Path to save the generated CSV file")

    args = parser.parse_args()
    main(args.input_json, args.output_csv)
