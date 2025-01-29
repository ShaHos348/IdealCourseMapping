from flask import Flask, jsonify, request
from graph_maker_v2 import build_prereq_graph, build_selected_courses_graph, visualize_selected_courses_graph
import json
from flask_cors import CORS
import os


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


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
@app.route("/make-csv/", methods=["POST"])
def generate_csv():
    # Get the JSON data from the request
    data = request.get_json()

    selected_courses = data.get("selected_courses", [])

    return

# TODO endpoint that takes program and returns the program table for it

if __name__ == "__main__":
    app.run(debug=True)
