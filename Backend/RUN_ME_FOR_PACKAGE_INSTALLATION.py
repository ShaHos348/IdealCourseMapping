import os
import subprocess

def generate_and_install_requirements(script_directory):
    try:
        # Normalize the script directory path
        script_directory = os.path.abspath(script_directory)
        print(f"Target script directory: {script_directory}")

        # Change to the specified directory
        os.chdir(script_directory)
        print(f"Changed directory to: {script_directory}")

        # Run pipreqs to generate requirements.txt
        print("Running pipreqs...")
        subprocess.run(["pipreqs", ".", "--force"], check=True)
        print("requirements.txt generated.")

        # Construct the full path for requirements.txt
        requirements_file = os.path.join(script_directory, "requirements.txt")
        print(f"Requirements file path: {requirements_file}")

        # Check if requirements.txt exists
        if os.path.exists(requirements_file):
            print("Installing packages from requirements.txt...")
            # Use the full path for the requirements file
            subprocess.run(["pip", "install", "-r", requirements_file], check=True)
            print("All packages installed successfully.")
        else:
            print("requirements.txt not found. Ensure pipreqs executed correctly.")
    
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while executing: {e.cmd}")
        print(f"Error details: {e.output}")
    except Exception as ex:
        print(f"An unexpected error occurred: {ex}")

if __name__ == "__main__":
    # Replace with your script directory
    script_directory = "./Backend/scripts_for_frontend"
    generate_and_install_requirements(script_directory)
