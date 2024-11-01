import json
import networkx as nx
import matplotlib.pyplot as plt
import random

# Load the list of selected courses
with open('Backend/frontend_files/courses_picked.json', 'r') as json_file:
    selected_courses = json.load(json_file)

selected_courses = sorted(selected_courses)

# Load the prerequisites data
with open('Backend/frontend_files/prereqs.json', 'r') as json_file:
    program_courses = json.load(json_file)

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

# Generate random color for edges
def random_color():
    return [random.uniform(0, 0.5) for _ in range(3)]  # Generate dark RGB values

# Visualize the graph in a grid-like layout
def visualize_selected_courses_graph(G):
    plt.figure(figsize=(12, 8))
    
    # Create a grid layout for the nodes
    grid_size = int(len(G.nodes)**0.5) + 1  # Determine the grid size
    pos = {}

    for idx, node in enumerate(G.nodes):
        # Calculate the row and column for the grid
        row = idx // grid_size
        col = idx % grid_size
        
        # Position nodes in a grid format
        pos[node] = (col, -row)  # Negate row to display in a standard Cartesian layout

    # Draw the graph with edges and nodes
    edge_colors = [random_color() for _ in G.edges()]
    nx.draw(G, pos, with_labels=True, node_size=5000, node_color="lightgreen", 
            font_color='red',font_size=10, font_weight="bold", arrows=True, edge_color=edge_colors)
    
    # Add title and grid
    plt.title("Selected Courses Prerequisite Graph")
    plt.grid(True, linestyle='--', linewidth=0.5)
    plt.xlim(-1, grid_size)
    plt.ylim(-grid_size, 1)
    plt.show()

# Save the graph as an image
def save_graph_image(G):
    plt.figure(figsize=(12, 8))
    grid_size = int(len(G.nodes)**0.5) + 1
    pos = {}
    for idx, node in enumerate(G.nodes):
        row = idx // grid_size
        col = idx % grid_size
        pos[node] = (col * 2, -row * 2)

    edge_colors = [random_color() for _ in G.edges()]
    nx.draw(G, pos, with_labels=True, node_size=5000, node_color="lightgreen", 
            font_color='red', font_size=10, font_weight="bold", arrows=True, edge_color=edge_colors)
    
    plt.title("Selected Courses Prerequisite Graph")
    plt.grid(True, linestyle='--', linewidth=0.5)
    plt.xlim(-1, grid_size * 2)
    plt.ylim(-grid_size * 2, 1)
    
    # Save the image
    plt.savefig('Backend/frontend_files/graph_image.png')  # Save as PNG
    plt.close()  # Close the figure to free memory

# Build the prerequisite graph from the JSON data
prereq_graph = build_prereq_graph(program_courses)

# Build and visualize the graph based on selected courses
G = build_selected_courses_graph(selected_courses, prereq_graph)
visualize_selected_courses_graph(G)
save_graph_image(G)