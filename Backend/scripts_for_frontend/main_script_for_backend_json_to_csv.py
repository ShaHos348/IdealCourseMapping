from flask import Flask, jsonify, request, send_file
from graph_maker_v2 import build_prereq_graph, build_selected_courses_graph, visualize_selected_courses_graph
from csv_to_curricular import return_all_courses_json, index_courses, info_courses, prereq_courses, prefix_courses, save_to_csv  # Import necessary functions
import json
from flask_cors import CORS
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

def load_picked_courses():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, 'courses_picked.json')

    with open(file_path, 'r') as json_file:
        program_courses = json.load(json_file)
    return program_courses

# Load program_courses from prereqs.json file
def load_program_courses():
    script_dir = os.path.dirname(os.path.abspath(__file__))  # Absolute path of the current directory
    file_path = os.path.join(script_dir, 'prereqs.json')

    with open(file_path, 'r') as json_file:
        program_courses = json.load(json_file)
    return program_courses

# Endpoint to generate course graph
@app.route("/generate-graph/", methods=["POST"])
def generate_graph():
    data = request.get_json()
    selected_courses = data.get("selected_courses", [])
    program_courses = load_program_courses()

    # Build the prerequisite graph
    prereq_graph = build_prereq_graph(program_courses)

    # Build the course graph
    G = build_selected_courses_graph(selected_courses, prereq_graph)

    # Visualize and get the base64 image
    image_base64 = visualize_selected_courses_graph(G)

    return jsonify({"image": image_base64})


# implemented CSV generation endpoint
@app.route("/make-csv/", methods=["POST"])
def generate_csv():
    data = request.get_json()
    selected_courses = data.get("selected_courses", [])

    if not selected_courses:
        return jsonify({"error": "No selected courses provided"}), 400

    try:
        # generate the csv
        output_folder = "Backend/frontend_files/"
        output_file = os.path.join(output_folder, "csv_for_display.csv")

        # select courses
        courses = return_all_courses_json("Backend/frontend_files/courses_picked.json")

    
        all_courses = index_courses(courses)
        info_courses(all_courses)
        prereq_courses(all_courses)
        prefix_courses(all_courses)

        # course data for csv
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

        # metadata for csv
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

        # Send the generated CSV file
        return send_file(output_file, mimetype="text/csv", as_attachment=True, download_name="curriculum.csv")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
