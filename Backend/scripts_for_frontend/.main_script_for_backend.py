from flask import Flask, jsonify, request, send_file
from graph_maker_v2 import build_prereq_graph, build_selected_courses_graph, visualize_selected_courses_graph
import json
from flask_cors import CORS, cross_origin
import os
from csv_to_curricular import generate_curricular_csv

import csv
import io


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow requests from any origin for now



def load_picked_courses():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, 'courses_picked.json')
    
    with open(file_path, 'r') as json_file:
        program_courses = json.load(json_file)
    return program_courses

# Load program_courses from prereqs.json file
def load_program_courses():
    # Get the current directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))  # Absolute path of the current directory (app.py)
    
    # Join the current directory with the JSON file name (prereqs.json)
    file_path = os.path.join(script_dir, 'prereqs.json')
    
    # Open and load the JSON file
    with open(file_path, 'r') as json_file:
        program_courses = json.load(json_file)
    return program_courses

# Endpoint to generate course graph
@app.route("/generate-graph/", methods=["POST"])
def generate_graph():
    # Get the JSON data from the request
    data = request.get_json()

    selected_courses = data.get("selected_courses", [])
    #selected_courses = load_picked_courses()
    program_courses = load_program_courses()
    print(selected_courses)

    # Build the prerequisite graph
    prereq_graph = build_prereq_graph(program_courses)

    # Build the course graph
    G = build_selected_courses_graph(selected_courses, prereq_graph)

    # Visualize and get the base64 image
    image_base64 = visualize_selected_courses_graph(G)

    return jsonify({"image": image_base64})

# TODO
# Endpoint to generate CSV file
@app.route("/make-csv/", methods=["POST", "OPTIONS"])
@cross_origin(origins="*")  # Adjust as needed for security
def generate_csv():
    if request.method == "OPTIONS":
        print("Handling preflight request.")
        return jsonify({"status": "OK"}), 200

    # Handle POST request
    data = request.get_json()
    print(f"Received data: {data}")

    # 🔧 Accepting 'courses' instead of 'selected_courses'
    selected_courses = data.get("courses", [])
    print(f"Selected courses: {selected_courses}")

    if not selected_courses:
        print("No selected courses provided.")
        return jsonify({"error": "No selected courses provided"}), 400

    try:
        output_file = generate_curricular_csv(selected_courses)
        print(f"CSV generated at: {output_file}")

        return send_file(output_file, mimetype="text/csv", as_attachment=True, download_name="curriculum.csv")

    except Exception as e:
        print(f"Error generating CSV: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
