import json

# Load JSON data from the file
with open('Backend/pre_reqs_work/prereqs.json', 'r') as json_file:
    program_courses = json.load(json_file)

chosen_courses = []
# Define a function to let the user choose options and find prerequisites recursively
def get_prereqs(course, chosen_prereqs):
    # Get the prerequisites for the given course
    print(course)
    code = course.split(" ")[0]
    print(code)
    if code not in list(program_courses.keys()):
        return
    prereqs = program_courses[code].get(course)

    # Output the prerequisites for this course
    print(f"\nCourse: {course}")
    if not prereqs:
        print("  No prerequisites.")
        # Add the chosen course to the list only if it's not already there
        if course not in chosen_courses:
            chosen_courses.append(course)
        return

    # We'll collect the user's choices here for each group of prerequisites
    #chosen_prereqs = []
    # Recursively find the prerequisites of the current course's prerequisites
    for prereq in prereqs:
        # Some prerequisites might have "or" clauses, split them and provide options
        prereq_options = prereq.split('/')  # Assuming "or" is indicated by "/"

        break_loop = False
        # Skip going through prereqs if a prereq has already been selected for another course
        for p in prereq_options:
            if p in chosen_courses:
                print(f"\n A {course} prereq has already been selected: {p}")
                break_loop = True
                break
        
        if break_loop:
            break
        
        # If there are multiple options, let the user choose
        if len(prereq_options) > 1:
            print(f"\nOptions for {course}:")
            for idx, option in enumerate(prereq_options, start=1):
                print(f"  {idx}. {option.strip()}")

            # Ask the user to choose one of the options
            choice = input(f"Choose an option for {course} (1-{len(prereq_options)}): ")
            while not choice.isdigit() or not (1 <= int(choice) <= len(prereq_options)):
                choice = input(f"Invalid choice. Please choose a valid option (1-{len(prereq_options)}): ")

            chosen_prereq = prereq_options[int(choice) - 1].strip()
            chosen_prereqs.append(chosen_prereq)
        else:
            # If there's only one option, automatically choose it
            chosen_prereq = prereq_options[0].strip()
            chosen_prereqs.append(chosen_prereq)

        print(f"\nChosen prerequisite for {course}: {chosen_prereq}")

    # Add the chosen course to the list only if it's not already there
    if course not in chosen_courses:
        chosen_courses.append(course)

    
    # Add the chosen course to the list only if it's not already there
    if course not in chosen_courses:
        chosen_courses.append(course)

    return chosen_prereqs

"""# Example usage:
start_course = input("Enter the course name to start from (e.g., AE 2010): ")
picked_courses = get_prereqs(start_course)

# List out all the courses picked
print("\nCourses picked during traversal:")
for course in picked_courses:
    print(f"  - {course}")"""
