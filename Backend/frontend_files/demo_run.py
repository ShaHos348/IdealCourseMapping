"""
Asks for college, major, and threads/concentration/requirement in page.tsx
    Given an dictionary with user choices for backend
Backend takes dictionary from first page to retrive the json file for major
    Displays all courses and allows user to continue to course taken page
Next page asks for all courses user has taken (using program_courses.json)
    Gives list of courses for user to select they have taken
Next page goes through the json file for major and asks which course to take for each area
    

"""
import json
from prereq_chooser import get_prereqs 
import re

with open('Backend/frontend_files/program_courses.json', 'r') as json_file:
    courses = json.load(json_file)

with open('Backend/frontend_files/college_data_proto.json', 'r') as json_file:
    collegeData = json.load(json_file)

chosen_program = {}

def program_selection():
    chosen_college_key = None
    chosen_major_key = None
    chosen_focus_key = None

    def college_selection():
        nonlocal chosen_college_key
        print("Choose your college:")
        college_names = list(collegeData.keys())
        for idx, name in enumerate(college_names, 1):
            print(f"{idx}. {name}")
        # Get user input as a number and validate it
        while(True):
            try:
                choice = int(input("Enter the number of your chosen college: ")) - 1
                if 0 <= choice < len(college_names):
                    chosen_college_key = college_names[choice]
                    chosen_college_name = collegeData[chosen_college_key]["name"]
                    print(f"You chose: {chosen_college_name}")
                    break
                else:
                    print("Invalid choice. Please select a number from the list.")
            except ValueError:
                print("Please enter a valid number.")
    
    def major_selection():
        nonlocal chosen_major_key
        print("Choose your major:")
        chosen_college_majors = collegeData[chosen_college_key]["majors"]
        major_names = list(chosen_college_majors)
        for idx, name in enumerate(major_names, 1):
            print(f"{idx}. {name}")
        # Get user input as a number and validate it
        while(True):
            try:
                choice = int(input("Enter the number of your chosen major: ")) - 1
                if 0 <= choice < len(major_names):
                    chosen_major_key = major_names[choice]
                    chosen_major_name = chosen_college_majors[chosen_major_key]["name"]
                    print(f"You chose: {chosen_major_name}")
                    break
                else:
                    print("Invalid choice. Please select a number from the list.")
            except ValueError:
                print("Please enter a valid number.")
    
    def focus_selection():
        nonlocal chosen_focus_key
        print("Choose your focus area:")

        chosen_major_focuses = collegeData[chosen_college_key]["majors"][chosen_major_key]

        # Determine the focus area type (threads, concentrations, or requirements)
        is_thread_selection = False
        if "threads" in chosen_major_focuses:
            focus_options = chosen_major_focuses["threads"]
            is_thread_selection = True
        elif "concentrations" in chosen_major_focuses:
            focus_options = chosen_major_focuses["concentrations"]
        elif "requirements" in chosen_major_focuses:
            focus_options = chosen_major_focuses["requirements"]
        else:
            print("No focus areas available for this major.")
            return

        for idx, focus in enumerate(focus_options, 1):
            print(f"{idx}. {focus['label']}: {focus['description']}")

        if is_thread_selection:
            chosen_focus_key = []

            # Get first thread choice
            while True:
                try:
                    choice1 = int(input("Enter the number of your first chosen thread: ")) - 1
                    if 0 <= choice1 < len(focus_options):
                        chosen_focus_key.append(focus_options[choice1]["label"])
                        print(f"First thread chosen: {focus_options[choice1]['label']}")
                        break
                    else:
                        print("Invalid choice. Please select a number from the list.")
                except ValueError:
                    print("Please enter a valid number.")

            # Get second thread choice, ensuring it's different from the first
            while True:
                try:
                    choice2 = int(input("Enter the number of your second chosen thread: ")) - 1
                    if choice2 == choice1:
                        print("Please select a different thread than the first one.")
                    elif 0 <= choice2 < len(focus_options):
                        chosen_focus_key.append(focus_options[choice2]["label"])
                        print(f"Second thread chosen: {focus_options[choice2]['label']}")
                        break
                    else:
                        print("Invalid choice. Please select a number from the list.")
                except ValueError:
                    print("Please enter a valid number.")

        # For concentrations (Breaks if Requirements)
        else:
            while True:
                if focus_options[0]["value"] == "requirements":
                    chosen_focus_key = []
                    print("Your major has no threads/concentrations to choose from")
                    break
                try:
                    choice = int(input("Enter the number of your chosen focus area: ")) - 1
                    if 0 <= choice < len(focus_options):
                        chosen_focus_key = [focus_options[choice]["label"]]
                        print(f"You chose: {focus_options[choice]['label']}")
                        break
                    else:
                        print("Invalid choice. Please select a number from the list.")
                except ValueError:
                    print("Please enter a valid number.")

    college_selection()
    major_selection()
    focus_selection()

    chosen_program.update({
        "college": collegeData[chosen_college_key]["name"],
        "major": collegeData[chosen_college_key]["majors"][chosen_major_key]["name"],
        "focus": chosen_focus_key
    })
    print(chosen_program)
    print(
        f"You have chosen {chosen_program['major']} in {chosen_program['college']}"
        + (f" focusing on {chosen_program['focus'][0]}."
        if len(chosen_program['focus']) == 1
        else f" focusing on {chosen_program['focus'][0]} plus {chosen_program['focus'][1]}."
        if len(chosen_program['focus']) == 2
        else "")
    )

course_data = {}
courses_needed = {}
def program_json_finder():
    print("Here is the courses needed file:")
    # Formats the input
    json_file_path = (
    f"{chosen_program['major'].replace(' ', '_')}"
    + (f"-{'_&_'.join(focus.replace(' ', '_') for focus in chosen_program['focus'])}"
       if chosen_program['focus'] else "")
    )

    # Outputs the formatted string
    full_path = "Backend/majors/" + json_file_path + ".json"
    print(full_path)
    print("\n----Here is the course list for chosen program:")
    
    try:
        with open(full_path, 'r') as json_file:
            course_data.update(json.load(json_file))

        if course_data:
            for category, courses in course_data.items():
                print(f"{category}:")
                for course in courses:
                    if len(course) == 4:  
                        code, title, credits, link = course
                        print(f"  - {code}: {title} - {credits} credits")
                    elif len(course) == 3:  
                        code, title, credits = course
                        print(f"  - {code}: {title} - {credits} credits")
                    else:
                        code, credits = course
                        print(f"  - {code}: SELECT - {credits} credits")
                    #courses_needed.append(course[0])
                print()  # Print a newline for better readability
        else:
            print("No course information found for the formatted string.")

    except FileNotFoundError:
        print("The JSON file was not found.")
    except json.JSONDecodeError:
        print("Error decoding JSON file.")

courses_taken = []
def courses_taker():
    print("Type all courses you have already taken:")
    while(True):
        if courses_taken: 
            print(f"Courses taken: {courses_taken}")
        userInput = (input("Enter a course in 'CODE ####' format to be inserted. Include 'r' at the end if you want it removed from list '(CODE #### r)'. Type 'end' to stop giving courses:\n")).strip().split(" ")
        userInput = [item for item in userInput if item]
        print(f"Given: {userInput}")
        if len(userInput) < 1 or (len(userInput) < 2 and userInput[0] != "end"):
            print("Invalid Input. Try again")
        elif userInput[0] == "end":
            print("No more courses given.")
            break
        else:
            code, num = userInput[0], userInput[1]
            if code not in courses.keys():
                print(f"Code {code} is invalid. Try again")
                continue
            elif len(num) != 4:
                print(f"Number {num} is not length 4")
                continue
            
            course_name = code + " " + num
            print(course_name)

            if len(userInput) > 2 and userInput[2] == "r":
                if course_name in courses_taken:
                    courses_taken.remove(course_name)
                    print(f"{course_name} has been removed from courses taken list")
                else:
                    print(f"{course_name} is not in the courses taken list, cannot remove")
            else:
                if course_name in courses[code]:
                    if course_name not in courses_taken:
                        courses_taken.append(course_name)
                        print(f"{course_name} has been added to courses taken list")
                    else:
                        print(f"{course_name} is already in courses taken list")
                else:
                    cont = input(f"{course_name} was not found, type 'y' if still add:")
                    if cont == "y":
                        courses_taken.append(course_name)
                        print(f"{course_name} has been added to courses taken list")
                    else:
                        print(f"{course_name} was not added to courses taken list")
    if courses_taken: 
        print(f"Courses taken: {courses_taken}\n")

def course_formatter():
    print("\nOrganizing courses into group\n")
    for area in course_data.keys():
        courses = course_data[area]
        courses_needed[area] = []
        i, courses_length = 0, len(courses)
        while i < courses_length:
            course = courses[i]
            code = course[0]
            print(code)
            if "Select" in code:
                selection_group = ["Select", []]
                j = i + 1
                
                # Collect all courses until another "Select" or end of list
                while j < courses_length and "Select" not in courses[j][0]:
                    selection_group[1].append(courses[j][0])
                    j += 1
                
                # Add the selection group to courses_needed[area]
                courses_needed[area].append(selection_group)
                
                # Move the outer loop index forward to skip over grouped items
                i = j - 1
            else:
                if code[0:2] == "or":
                    courses_needed[area][-1] += code
                else:
                    courses_needed[area].append(course[0])
            i += 1
    with open("./Backend/frontend_files/courses_needed.json", "w") as f:
        f.write(json.dumps(courses_needed, indent=2))

courses_to_take = []

def has_space(s):
    return s.find(' ') != -1

def format_course_code(course_code):
    # Use regex to find the position of the first digit
    match = re.search(r'\d', course_code)
    if not has_space(course_code) and match:
        split_index = match.start()  # Get the index of the first digit
        # Create the formatted course code with a space
        formatted_code = course_code[:split_index] + " " + course_code[split_index:]
        return formatted_code
    else:
        return course_code  # Return the original if no digits found

def is_course_taken(target_string):
    for course in courses_taken:
        # Remove spaces from the course string
        formatted_course = course.replace(" ", "")
        
        # Check if the formatted course is in the target string
        if formatted_course in target_string:
            return True  # Return True if any course is found
    return False  # Return False if no courses are found

def select_humanities():
    print("Pick humanity courses:")

def select_social_sciences():
    print("Pick social science courses:")

def choose_courses():
    print("Choose the courses you want to take for your program")
    for area, course_list in courses_needed.items():
        if area == "Free Electives":
            continue
        if "Capstone" in area:
            courses_to_take.append("Capstone")
            continue
        #print(f"{area}: {course_list}")
        for course in course_list:
            print(course)
            if course == "Any HUM": select_humanities()
            elif course == "Any SS": select_social_sciences()
            else:
                # If option is a list with "Select", prompt the user to select one course from the list
                if isinstance(course, list) and course[0] == "Select":
                    if is_course_taken(course[1]):
                        continue
                    print(f"\nSelect one course for {area}:")
                    for idx, cour in enumerate(course[1], start=1):
                        print(f"  {idx}. {cour}")
                    choice = input(f"Enter the number of your choice (1-{len(course[1])}): ")
                    while not choice.isdigit() or not (1 <= int(choice) <= len(course[1])):
                        choice = input(f"Invalid choice. Please enter a valid option (1-{len(course[1])}): ")
                    course = format_course_code(course[1][int(choice) - 1])
                    courses_to_take.append(course)
                
                # If option contains "or", split and prompt user to choose one
                elif 'or' in course:
                    if is_course_taken(course):
                        continue
                    choices = course.split('or')
                    print(f"\nChoose one course for {area}:")
                    for idx, course in enumerate(choices, start=1):
                        print(f"  {idx}. {course.strip()}")
                    choice = input(f"Enter the number of your choice (1-{len(choices)}): ")
                    while not choice.isdigit() or not (1 <= int(choice) <= len(choices)):
                        choice = input(f"Invalid choice. Please enter a valid option (1-{len(choices)}): ")
                    course = format_course_code(choices[int(choice) - 1].strip())
                    courses_to_take.append(course)
                
                # If option is a single course, automatically add it
                else:
                    if is_course_taken(course):
                        continue
                    course = format_course_code(course)
                    courses_to_take.append(course)
                prereqs = get_prereqs(course, courses_to_take)
                if type(prereqs) == "list":
                    for prereq in prereqs:
                        courses_to_take.append(prereq)

print("Welcome to Ideal Course Mapping")
# Function call to choose the program user
program_selection()

input("Press any button to display all courses for program:")
# function call to retrieve json file for program
program_json_finder()
# function call to enter taken courses
courses_taker()
# function call to oraganize the courses into groups
course_formatter()

# function call to choose courses to take
choose_courses()
courses_to_take = list(set(courses_to_take))
#courses_to_take.sort()
print(courses_to_take)
with open("./Backend/frontend_files/courses_picked.json", "w") as f:
    f.write(json.dumps(courses_to_take, indent=2))



