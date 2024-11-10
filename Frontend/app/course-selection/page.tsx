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
  const [expandedDepts, setExpandedDepts] = useState(new Set(["CS"]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const response = await fetch("/data/full_program_courses.json");
        const data = await response.json();
        setCourseData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading course data:", error);
        setLoading(false);
      }
    };

    loadCourseData();
  }, []);

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
    const coursesParam = encodeURIComponent([...selectedCourses].join(','));
    router.push(`/course-map?courses=${coursesParam}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
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
                    {expandedDepts.has(department) ? '−' : '+'}
                  </span>
                </Button>

                {expandedDepts.has(department) && (
                  <CardContent className="space-y-2">
                    {courses.map((course) => (
                      <div key={course["name"]} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
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
                          {course["name"]} - {course["long_name"]} ({course["hours"]} hours)
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
          <Button
            onClick={handleContinue}
            className="px-6"
          >
            Continue ({selectedCourses.size} selected)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
