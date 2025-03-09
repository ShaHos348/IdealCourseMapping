"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function CourseSelectionPage() {
  const router = useRouter();
  const [courseData, setCourseData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [expandedDepts, setExpandedDepts] = useState(new Set([]));
  const [loading, setLoading] = useState(true);
  const [selectionData, setSelectionData] = useState<any>(null); // State for college/major/thread data
  const [tableData, setTableData] = useState({}); // State for college/major/thread data
  const [program, setProgram] = useState(""); // State for college/major/thread data

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const response = await fetch("/data/full_program_courses.json");
        const data = await response.json();
        setCourseData(data);
        //setLoading(false);
      } catch (error) {
        console.error("Error loading course data:", error);
        setLoading(false);
      }
    };

    // Retrieve college/major/thread data from localStorage
    let storedSelectionData = localStorage.getItem("gtCourseSelections");
    if (storedSelectionData) {
      storedSelectionData = JSON.parse(storedSelectionData);
      if (storedSelectionData) {
        storedSelectionData = {
          major: storedSelectionData.major,
          focus: [storedSelectionData.thread1 || storedSelectionData.concentration, storedSelectionData.thread2],
        };
        setSelectionData(storedSelectionData);
      }
    }

    loadCourseData();
  }, []);

  // Log updated selection data when it changes
  useEffect(() => {
    if (!selectionData) {
      return;
    }

    // TODO: Change this to an server request
    console.log("Updated selection data:", selectionData); // This will log updated value
    const loadTableData = async () => {
      console.log(selectionData.focus);
      console.log("CHECKING");
      let program = selectionData.major;
      const focus1 = selectionData.focus[0];
      const focus2 = selectionData.focus[1];
      if (focus1 && focus2) {
        program += ": " + focus1 + " & " + focus2;
      } else if (focus1) {
        program += ": " + focus1;
      } else if (focus2) {
        program += ": " + focus2;
      }
      setProgram(program);

      const json_file_path = program.replace(": ", "-").replace(/ /g, "_");

      console.log(json_file_path);

      try {
        const response = await fetch(`/api/majors/${json_file_path}`);
        console.log("Response: ", response);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        setTableData(data);
        //console.log(data);
      } catch (error) {
        console.error("Error loading course data:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadTableData();
  }, [selectionData]); // Dependency array means this runs when selectionData changes

  const filteredDepartments = Object.entries(courseData)
    .map(([dept, courses]) => ({
      department: dept,
      courses: courses.filter((course) =>
        course["name"].toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(({ courses }) => courses.length > 0);

  const toggleDepartment = (dept) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept);
    } else {
      newExpanded.add(dept);
    }
    setExpandedDepts(newExpanded);
  };

  const handleCourseToggle = (course) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(course)) {
      newSelected.delete(course);
    } else {
      newSelected.add(course);
    }
    setSelectedCourses(newSelected);
  };

  const handleContinue = () => {
    // Store selected courses in localStorage before navigating
    const selectedCoursesArray = [...selectedCourses];
    localStorage.setItem("takenCourses", JSON.stringify(selectedCoursesArray));
    //localStorage.setItem("neededCourses", "/data/majors/" + program.replace(": ","-").replace(/ /g, "_") + ".json");
    localStorage.setItem("neededCourses", JSON.stringify(tableData));

    router.push(`/course-map`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 flex space-x-4">
      <Card className="flex-1">
        <CardHeader className="space-y-6">
          <CardTitle className="text-2xl">Program Requirements</CardTitle>
        </CardHeader>

        <CardContent className="max-h-[600px] overflow-y-auto space-y-4">
          <h1>{program}</h1>
          {Object.entries(tableData).map(([category, courses]) => (
            <div key={category}>
              <h3 className="font-bold text-lg">{category}</h3>
              <table className="min-w-full table-fixed border border-gray-300 border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left w-1/4 border border-gray-300">
                      Code
                    </th>
                    <th className="px-4 py-2 text-left w-2/4 border border-gray-300">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left w-1/4 border border-gray-300">
                      Credits
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => {
                    const [code, title, credits, link] = course;
                    return (
                      <tr key={index} className="border-b border-gray-300">
                        {course.length >= 3 && (
                          <td className="px-4 py-2 border border-gray-300">
                            {code}
                          </td>
                        )}

                        {/* Conditionally render title based on course length */}

                        {/* Length 4 */}
                        {course.length === 4 && (
                          <td className="px-4 py-2 border border-gray-300">
                            {title}
                          </td>
                        )}
                        {course.length === 4 && (
                          <td className="px-4 py-2 border border-gray-300">
                            {credits}
                          </td>
                        )}

                        {/* Length 3 */}
                        {course.length === 3 && (
                          <td className="px-4 py-2 border border-gray-300"></td>
                        )}
                        {course.length === 3 && (
                          <td className="px-4 py-2 border border-gray-300">
                            {title}
                          </td>
                        )}

                        {/* Length 2 */}
                        {course.length === 2 && (
                          <td
                            colSpan="2"
                            className="px-4 py-2 border border-gray-300"
                          >
                            {code}
                          </td>
                        )}
                        {course.length === 2 && (
                          <td className="px-4 py-2 border border-gray-300">
                            {title}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="space-y-6">
          <CardTitle className="text-2xl">Select Completed Courses</CardTitle>
          <div>
            <input
              type="text"
              placeholder="Search courses (e.g. CS 1301)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </CardHeader>

        <CardContent className="max-h-[600px] overflow-y-auto space-y-4">
          {filteredDepartments.map(({ department, courses }) => (
            <div key={department}>
              <Card>
                <Button
                  variant="ghost"
                  onClick={() => toggleDepartment(department)}
                  className="w-full justify-between h-auto p-4 font-medium"
                >
                  <span>
                    {department} ({courses.length} courses)
                  </span>
                  <span className="text-xl">
                    {expandedDepts.has(department) ? "+" : "-"}
                  </span>
                </Button>

                {!expandedDepts.has(department) && (
                  <CardContent className="space-y-2">
                    {courses.map((course) => (
                      <div
                        key={course["name"]}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          id={course["name"]}
                          checked={selectedCourses.has(course["name"])}
                          onChange={() => handleCourseToggle(course["name"])}
                          className="rounded cursor-pointer" // Ensuring cursor is pointer
                        />
                        <label
                          htmlFor={course["name"]}
                          className="cursor-pointer hover:text-blue-600 flex-1"
                        >
                          {course["name"]} - {course["long_name"]} (
                          {course["hours"]} hours)
                        </label>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="px-6"
          >
            Back to Thread Selection
          </Button>
          <Button onClick={handleContinue} className="px-6">
            Continue ({selectedCourses.size} selected)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
