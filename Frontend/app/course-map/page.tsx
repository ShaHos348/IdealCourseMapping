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
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [courseData, setCourseData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [neededCourses, setNeededCourses] = useState("");
  const [takenCourses, setTakenCourses] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch("/data/full_program_courses.json");
        const data = await response.json();
        setCourseData(data);

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
      //console.log(needCourses);
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

  const toggleCourse = (course) => {
    course = course.trim();
    if (course.length > 0) {
      if (takenCourses.includes(course)) {
        alert("Course already taken!");
        return;
      }
      const newSelected = new Set(selectedCourses);
      if (newSelected.has(course)) {
        newSelected.delete(course);
      } else {
        newSelected.add(course);
      }
      setSelectedCourses(newSelected);
    }
  };

  const handleMakeGraph = async () => {
    if (selectedCourses.size == 0) {
      setImageSrc(null);
      //alert("No Courses Selected!");
      return;
    }

    try {
      setLoadingGraph(true);
      console.log(selectedCourses);

      const selectedCoursesArray = Array.from(selectedCourses);

      const response = await axios.post(
        "http://127.0.0.1:5000/generate-graph/",
        {
          selected_courses: selectedCoursesArray,
        }
      );

      if (response.data.image) {
        setImageSrc(`data:image/png;base64,${response.data.image}`);
        setLoadingGraph(false);
        //console.log("image set", response.data.image);
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
      console.log("Entering courses:", [...selectedCourses]);
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

      {/* Messages Box }
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Messages will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Course Box }
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Course suggestions will appear here</p>
          </div>
        </CardContent>
      </Card>*/}

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

      {selectedCourses.size > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Selected Courses</CardTitle>
          </CardHeader>
          <CardContent>{[...selectedCourses].join(" | ")}</CardContent>
        </Card>
      )}

      {/* Search Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Course Search</CardTitle>
          <div className="flex gap-4">
            <Button onClick={() => handleEnterCourses()} variant="outline">
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
                    className="flex items-center p-2 hover:bg-gray-50 border-b last:border-b-0"
                    onClick={() => toggleCourse(course["name"])}
                  >
                    <input
                      type="checkbox"
                      id={course}
                      checked={selectedCourses.has(course["name"])}
                      onChange={() => {}}
                      className="mr-3"
                    />
                    <label
                      htmlFor={course["name"]}
                      className="flex-1 cursor-pointer hover:text-blue-600"
                    >
                      {course["name"]} - {course["long_name"]} (
                      {course["hours"]} hours)
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CourseMapPage;
