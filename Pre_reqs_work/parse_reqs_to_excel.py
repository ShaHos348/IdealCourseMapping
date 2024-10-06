import re

def parse_courses_for_excel(input_text):
    # Regular expression to match course code and number (e.g., MATH 3215 or MATH 2X51)
    course_pattern = r"([A-Z]{4} \d{4}|[A-Z]{4} [A-Z]\d{3})"
    
    # Split the input text by 'and' and process each section
    and_split = re.split(r'\)\s+and\s+\(', input_text)
    
    parsed_sections = []
    for section in and_split:
        section_courses = re.findall(course_pattern, section)
        parsed_sections.append('/'.join(section_courses))
    
    # Join sections with a tab '\t' so each "and" part goes to a new cell in Excel
    return '|'.join(parsed_sections)

# Parse and output the result
while True:
    input_text = input("Enter text to be parsed:")
    parsed_output = parse_courses_for_excel(input_text)
    print(f"\nPARSED: {parsed_output}\n")


