import os
import pandas as pd
import json

# Define the file path for the Excel file
excel_file_path = 'Backend/pre_reqs_work/program_courses.xlsx'

# Remove the Excel file if it already exists
if os.path.exists(excel_file_path):
    os.remove(excel_file_path)

# Load JSON data from the file
with open('Backend/pre_reqs_work/prereqs.json', 'r') as json_file:
    program_courses = json.load(json_file)

# Create a Pandas Excel writer using openpyxl as the engine
with pd.ExcelWriter(excel_file_path, engine='openpyxl') as writer:
    for program_name, courses in program_courses.items():
        # Create a DataFrame to hold the courses and their prerequisites
        data = []
        
        # Iterate over courses and add the course along with its prerequisites
        for course, prereqs in courses.items():
            row = [course]  # Start the row with the course name
            if isinstance(prereqs, list):  # If prerequisites are a list
                row.extend(prereqs)  # Add the prerequisites to the row
            else:
                row.append("NULL")
            data.append(row)

        # Create the DataFrame, fill NA for missing values, and set up to 10 columns
        output_df = pd.DataFrame(data).fillna('')

        # Ensure there are exactly 10 columns by adding blank columns if necessary
        num_columns = 10
        output_df = output_df.reindex(columns=range(num_columns), fill_value='')

        # Number the first row (columns) from 1 to 10
        output_df.columns = [str(i + 1) for i in range(num_columns)]

        # Write the DataFrame to the corresponding sheet with the program name as the sheet name
        output_df.to_excel(writer, sheet_name=program_name, index=False)

print("Excel file with numbered columns and subject-specific sheets created successfully.")
