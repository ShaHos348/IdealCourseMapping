import re

def parse_courses(input_text):
    # Regular expression to match course codes with the prefix "Undergraduate Semester level"
    course_pattern = r"([A-Z]{2,4} \d{4}|[A-Z]{2,4} [A-Z]\d{3})"
    
    # Split the input text by 'and' and process each section
    # Note: Adjusting split to not remove parenthesis as they are not in the text
    and_split = re.split(r'\band\b', input_text)
    
    parsed_sections = []
    for section in and_split:
        # Find all course codes that match the pattern
        section_courses = re.findall(course_pattern, section)

        section_courses = [course for course in section_courses if not any(course in parsed for parsed in parsed_sections)]

        if section_courses:
            # Join found courses with '/'
            parsed_sections.append('/'.join(section_courses))
    
    # Join sections with a tab '\t' so each "and" part goes to a new cell in Excel
    return ('|'.join(parsed_sections)).split('|')

# Parse and output the result
"""
while True:
    input_text = input("Enter text to be parsed:")
    parsed_output = parse_courses_for_excel(input_text)
    print(f"\nPARSED: {parsed_output}\n")
"""

