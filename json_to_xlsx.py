import os
import pandas as pd
import json

# Define the file path for the Excel file
excel_file_path = 'program_courses.xlsx'

# Remove the Excel file if it already exists
if os.path.exists(excel_file_path):
    os.remove(excel_file_path)

# Load JSON data from the file
with open('program_courses.json', 'r') as json_file:
    program_courses = json.load(json_file)

# Create a Pandas Excel writer using openpyxl as the engine
with pd.ExcelWriter('program_courses.xlsx', engine='openpyxl') as writer:
    for program_name, courses in program_courses.items():
        # Create an output DataFrame with empty cells
        num_columns = 10  # Number of columns you want
        num_rows = len(courses)  # Total number of courses
        
        # Create an empty DataFrame with the desired number of rows and columns
        output_df = pd.DataFrame(index=range(num_rows), columns=range(num_columns))

        # Fill the first column with the courses
        output_df[0] = courses

        # Number the first row (columns)
        output_df.columns = [str(i + 1) for i in range(num_columns)]  # Numbering columns from 1 to num_columns

        # Write the DataFrame to the corresponding sheet with the program name
        output_df.to_excel(writer, sheet_name=program_name, index=False)

print("Excel file created successfully.")
