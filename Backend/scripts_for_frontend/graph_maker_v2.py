import json
import networkx as nx
import matplotlib.pyplot as plt
import random
import matplotlib.patheffects as path_effects
from io import BytesIO
import base64

# Flatten the JSON structure to get a dictionary that maps each course to its prerequisites
def build_prereq_graph(program_courses):
    prereq_graph = {}
    for program, courses in program_courses.items():
        prereq_graph.update(courses)
    return prereq_graph

# Function to build a directed graph based on selected courses and their prerequisites
def build_selected_courses_graph(selected_courses, prereq_graph):
    G = nx.DiGraph()

    # Add all selected courses as nodes in the graph
    for course in selected_courses:
        G.add_node(course)  # Ensure each selected course is represented in the graph

        # Add edges between each course and its direct prerequisite if found in prereq_graph
        if course in prereq_graph:
            for prereq in prereq_graph[course]:
                prereq_options = prereq.split('/')  # Prerequisites may have multiple options
                
                # Only add an edge if the selected prerequisite is in selected_courses
                for option in prereq_options:
                    option = option.strip()  # Clean up the option
                    if option in selected_courses:
                        G.add_edge(option, course)  # Add edge from prerequisite to course
                        break  # Only add the first valid prerequisite found

    return G

# Assign random colors to each node and ensure edges have the color of the originating node
def assign_colors(G):
    # Assign a unique color to each node
    node_colors = {node: [random.random() for _ in range(3)] for node in G.nodes()}

    # Create a list of edge colors based on the starting node color
    edge_colors = [node_colors[edge[0]] for edge in G.edges()]
    
    return node_colors, edge_colors

# Function to visualize the selected courses graph and return the image as base64 string
def visualize_selected_courses_graph(G):
    plt.switch_backend('Agg')

    plt.figure(figsize=(12, 8))
    
    # Create a grid layout for the nodes
    grid_size = int(len(G.nodes)**0.5) + 1  # Determine the grid size
    num_nodes = len(G.nodes)
    num_columns = 6
    num_rows = (num_nodes + num_columns - 1) // num_columns
    pos = {}

    for idx, node in enumerate(G.nodes):
        # Calculate the row and column for the grid
        row = idx // num_columns
        col = idx % num_columns
        
        # Position nodes in a grid format
        pos[node] = (col, -row)  # Negate row to display in a standard Cartesian layout

    # Get colors for nodes and edges
    node_colors, edge_colors = assign_colors(G)
    
    # Draw the graph nodes and edges without labels
    nx.draw(G, pos, with_labels=False, node_size=4000, 
            node_color=[node_colors[node] for node in G.nodes()], 
            arrows=True, edge_color=edge_colors)

    # Manually add labels with a black outline and white center
    for node, (x, y) in pos.items():
        plt.text(x, y, node, fontsize=10, fontweight='bold', ha='center', va='center',
                 color='white',  # White text color
                 path_effects=[plt.matplotlib.patheffects.Stroke(linewidth=2, foreground='black'), 
                               plt.matplotlib.patheffects.Normal()])

    
    # Add title and grid
    plt.title("Selected Courses Prerequisite Graph")
    plt.grid(True, linestyle='--', linewidth=0.5)
    plt.xlim(-1, num_columns)
    plt.ylim(-num_rows, 1)

    # Save the image to a buffer
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()

    return img_base64
