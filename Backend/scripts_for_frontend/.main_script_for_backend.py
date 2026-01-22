from flask import Flask, Response, jsonify, request, send_file
from graph_maker_v2 import build_prereq_graph, build_selected_courses_graph, visualize_selected_courses_graph
import json
from flask_cors import CORS
import os
from csv_to_curricular import generate_curricular_csv
import csv
import io


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

# Endpoint to generate CSV file
@app.route("/make-csv/", methods=["POST"])
def generate_csv():
    # Get the JSON data from the request
    data = request.get_json()
    selected_courses = data.get("courses", [])

    if not selected_courses:
        print("No selected courses provided.")
        return jsonify({"error": "No selected courses provided"}), 400

    try:
        output_file = generate_curricular_csv(selected_courses)
        print(f"CSV generated at: {output_file}")

        return output_file

    except Exception as e:
        print(f"Error generating CSV: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/make-csv-mobile/", methods=["POST"])
def generate_csv_mobile():
    data = request.get_json()
    selected_courses = data.get("courses", [])

    if not selected_courses:
        return jsonify({"error": "No selected courses provided"}), 400

    try:
        csv_text = generate_curricular_csv(selected_courses)  # <-- must be a string
        return Response(
            csv_text,
            mimetype="text/csv",
            headers={
                "Content-Disposition": 'attachment; filename="courses.csv"'
            },
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint that takes program and returns the program table for it
@app.route("/get-program-table/", methods=["POST"])
def get_program_table():
    try:
        # Get JSON data from the request
        data = request.get_json()
        selected_program = data.get("selected_program", [])

        # Ensure selected_program is a list and convert to lowercase
        selected_program = [word.strip().replace(" ", "-").lower() for word in selected_program if word and word.strip()]
        
        print("Received selected program:", selected_program)

        BACKEND_PATH = os.path.join(os.getcwd(), "Backend/majors")

        # Get list of all JSON files in Backend/majors
        try:
            files = [f for f in os.listdir(BACKEND_PATH) if f.endswith(".json")]
        except FileNotFoundError:
            return jsonify({"error": "Directory not found"}), 500

        #print("Available files:", files)

        # Look for a file containing all requested words in any order
        matching_file = None
        for file in files:
            normalized_filename = file.replace(".json", "").lower()  # Normalize filename
            #print(f"Checking file: {file} => Filename: {normalized_filename}")

            if all(word in normalized_filename for word in selected_program):
                if file.split("-")[0] in selected_program[0]:
                    matching_file = file
                    break  # Stop at the first match

        if not matching_file:
            print("No matching file found.")
            return jsonify({"error": "File not found"}), 404

        print(f"Matched file: {matching_file}")

        # Read and return JSON file content
        file_path = os.path.join(BACKEND_PATH, matching_file)
        with open(file_path, "r", encoding="utf-8") as f:
            file_contents = f.read()

        return jsonify(file_contents)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
