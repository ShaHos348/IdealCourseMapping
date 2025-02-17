"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import axios from "axios";

const CourseMapPage = () => {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<Array<string>>([]);
  const [courseData, setCourseData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [neededCourses, setNeededCourses] = useState("");
  const [takenCourses, setTakenCourses] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedCourseForPrereqs, setPickedCourseForPrereqs] = useState("");
  const [coursePrereqs, setCoursePrereqs] = useState("");
  const [coursePrereqData, setCoursePrereqData] = useState({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch("/data/full_program_courses.json");
        const data = await response.json();
        setCourseData(data);

        const prereqResponse = await fetch("/data/prereqs.json");
        const prereqData = await prereqResponse.json();
        setCoursePrereqData(prereqData);

        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }

      setLoadingGraph(false);

      // Retrieve the selected courses from localStorage
      let storedCourses = localStorage.getItem("takenCourses");
      if (storedCourses) {
        // Parse the stored courses and use them
        const coursesArray = JSON.parse(storedCourses);
        setTakenCourses(coursesArray);
      }

      // Retrieve the needed courses from localStorage
      let needCourses = localStorage.getItem("neededCourses");
      if (needCourses) {
        // Parse the stored courses and use them
        const coursesArray = JSON.parse(needCourses);
        setNeededCourses(coursesArray);
      }
    };

    loadInitialData();
  }, []);

  const filteredCourses = Object.entries(courseData).flatMap(
    ([dept, courses]) =>
      courses.filter((course) =>
        course["name"].toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const toggleCourse = (course: string) => {
    course = course.trim();
    if (course.length > 0) {
      if (takenCourses.includes(course)) {
        alert("Course already taken!");
        return;
      }

      setSelectedCourses((prevSelectedCourses) => {
        const newSelected = new Set(prevSelectedCourses);
        if (newSelected.has(course)) {
          newSelected.delete(course);
        } else {
          newSelected.add(course);
        }
        return Array.from(newSelected); // Convert back to an array
      });
    }
  };

  const togglePrereqs = (course: string) => {
    if (pickedCourseForPrereqs === course) {
      setPickedCourseForPrereqs("");
      setCoursePrereqs("");
      return;
    }

    setPickedCourseForPrereqs(course);

    // Find the course in the nested coursePrereqData structure
    let foundPrereqs = [];
    for (const dept in coursePrereqData) {
      if (coursePrereqData[dept][course] !== undefined) {
        foundPrereqs = coursePrereqData[dept][course];
        break;
      }
    }

    setCoursePrereqs(Array.isArray(foundPrereqs) ? foundPrereqs.join(" | ") : foundPrereqs || "No prerequisites");
  };

  const handleMakeGraph = async () => {
    if (selectedCourses.length === 0) {
      setImageSrc(null);
      //alert("No Courses Selected!");
      return;
    }

    try {
      setLoadingGraph(true);
      const selectedCoursesArray = selectedCourses;

      const response = await axios.post(
        "http://127.0.0.1:5000/generate-graph/",
        {
          selected_courses: selectedCoursesArray,
        }
      );

      if (response.data.image) {
        setImageSrc(`data:image/png;base64,${response.data.image}`);
        setLoadingGraph(false);
      }
    } catch (error) {
      console.error("Error generating graph:", error);
    }
  };

  const handleEnterCourses = () => {
    // This will be implemented later
    // Check if searchQuery matches any course name in filteredCourses
    const courseExists = filteredCourses.some(
      (course) => course.name.toUpperCase() === searchQuery.toUpperCase()
    );

    if (courseExists) {
      toggleCourse(searchQuery.toUpperCase());
      setSearchQuery(""); // Clear input after entering the course
    } else {
      console.log(`Course "${searchQuery}" not found in available courses.`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading course map...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          ← Back to Course Selection
        </Button>
      </div>

      {/* Graph Area */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Course Prerequisites Graph</CardTitle>
          <Button onClick={handleMakeGraph}>Make Graph</Button>
          {/*TODO: Add buttons to handle downloading csv file and going to CA site */}
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            {imageSrc ? (
              <img src={imageSrc} alt="Course Prerequisite Graph" />
            ) : (
              <p className="text-gray-500">
                {loadingGraph
                  ? "Graph loading!"
                  : "Graph visualization will display here!"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCourses.length > 0 && (
        <>
          {/*Courses selected Box */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Selected Courses</CardTitle>
            </CardHeader>


            <CardContent>
              {selectedCourses.map((course, index) => (
                <span
                  key={course}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => togglePrereqs(course)}
                >
                  {course}
                  {index < selectedCourses.length - 1 && " | "}
                </span>
              ))}
            </CardContent>
          </Card>

          {/*Prereqs Box */}
          <Card>
            <CardHeader>
              <CardTitle>Course Prereqs: {pickedCourseForPrereqs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                {pickedCourseForPrereqs ? (
                  <p className="text-gray-500">{coursePrereqs}</p>
                ) : (
                  <p className="text-gray-500">
                    Course Prereqs will appear here for a selected course
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}




      {/* Search Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Course Search</CardTitle>
          <div className="flex gap-4">
            <Button onClick={handleEnterCourses} variant="outline">
              Enter Courses
            </Button>
            <Button onClick={() => setShowSearch(!showSearch)}>
              {showSearch ? "Hide Search" : "Search Courses"}
            </Button>
          </div>
        </CardHeader>

        {showSearch && (
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search courses (e.g. CS 1301)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <div className="max-h-60 overflow-y-auto border rounded">
                {filteredCourses.map((course) => (
                  <div
                    key={course["name"]}
                    className="flex items-center p-2 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer w-full"
                    onClick={() => toggleCourse(course["name"])}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course["name"])}
                      readOnly
                      className="mr-3"
                    />
                    <div className="flex-1">{course["name"]} - {course["long_name"]} ({course["hours"]} hours)</div>
                  </div>
                ))}
              </div>

            </div>
          </CardContent>
        )}
      </Card>

      {/*Lists the courses for the program. Will be Changed Next Semester */}
      <Card className="flex-1">
        <CardHeader className="space-y-6">
          <CardTitle className="text-1xl">
            Program Requirements {"("}Choose courses you want to take{")"}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[200px] overflow-y-auto space-y-4">
          {Object.entries(neededCourses).map(([category, courses]) => (
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


    </div>
  );
};

export default CourseMapPage;
