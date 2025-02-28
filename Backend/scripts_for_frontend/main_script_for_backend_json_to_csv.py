from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import os
import pandas as pd
import io
from graph_maker_v2 import build_prereq_graph, build_selected_courses_graph, visualize_selected_courses_graph

app = Flask(__name__)
CORS(app)

# Function to load selected courses from a JSON file
def load_picked_courses():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, 'courses_picked.json')
    
    with open(file_path, 'r') as json_file:
        picked_courses = json.load(json_file)
    return picked_courses

# Function to load program courses from a JSON file
def load_program_courses():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, 'prereqs.json')
    
    with open(file_path, 'r') as json_file:
        program_courses = json.load(json_file)
    return program_courses

# Endpoint to generate a prerequisite course graph
@app.route("/generate-graph/", methods=["POST"])
def generate_graph():
    data = request.get_json()
    selected_courses = data.get("selected_courses", [])
    program_courses = load_program_courses()

    print(selected_courses)

    prereq_graph = build_prereq_graph(program_courses)
    G = build_selected_courses_graph(selected_courses, prereq_graph)
    image_base64 = visualize_selected_courses_graph(G)

    return jsonify({"image": image_base64})

# Endpoint to generate and return a CSV file of picked courses
@app.route("/make-csv/", methods=["POST"])
def generate_csv():
    try:
        data = request.get_json()

        if not data or "picked_courses" not in data:
            return jsonify({"error": "Missing 'picked_courses' in request body"}), 400

        picked_courses = data["picked_courses"]

        if not isinstance(picked_courses, list) or len(picked_courses) == 0:
            return jsonify({"error": "Invalid data format. 'picked_courses' must be a non-empty list"}), 400

        # Convert JSON data to a Pandas DataFrame
        df = pd.DataFrame(picked_courses)

        # Convert DataFrame to CSV format in memory
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)  # Move to the start of the stream

        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=picked_courses.csv"}
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
