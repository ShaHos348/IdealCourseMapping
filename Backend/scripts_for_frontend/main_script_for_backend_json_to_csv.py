from flask import Flask, jsonify, request, send_file
from graph_maker_v2 import build_prereq_graph, build_selected_courses_graph, visualize_selected_courses_graph
from flask_cors import CORS
import os
import json
import csv_to_curricular  # Import CSV generation script

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
    script_dir = os.path.dirname(os.path.abspath(__file__))
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
    
    prereq_graph = build_prereq_graph(program_courses)
    G = build_selected_courses_graph(selected_courses, prereq_graph)
    image_base64 = visualize_selected_courses_graph(G)

    return jsonify({"image": image_base64})

# CSV generation endpoint 
@app.route("/make-csv/", methods=["POST"])
def generate_csv():
    data = request.get_json()
    selected_courses = data.get("selected_courses", [])

    if not selected_courses:
        return jsonify({"error": "No selected courses provided"}), 400

    try:
        # Run csv_to_curricular.main() to generate the CSV
        csv_to_curricular.main()

        # Define the CSV file path
        output_file = os.path.join("Backend/frontend_files", "csv_for_display.csv")

        # Send the CSV file directly
        return send_file(output_file, mimetype="text/csv", as_attachment=True, download_name="curriculum.csv")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
