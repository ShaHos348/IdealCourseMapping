"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const CourseMapPage = () => {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [courseData, setCourseData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [takenData, setTakenData] = useState<any>(null); // State for college/major/thread data

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/data/program_courses.json');
        const data = await response.json();
        setCourseData(data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }

      // Retrieve the selected courses from localStorage
      let storedCourses = localStorage.getItem("takenCourses");
      if (storedCourses) {
        // Parse the stored courses and use them
        const coursesArray = JSON.parse(storedCourses);
        setTakenData(coursesArray);
      }
    };

    loadInitialData();
  }, []);

  // Log updated taken data when it changes
  useEffect(() => {
    if (takenData) {
      console.log(takenData);
    }
  }, [takenData]);


  const filteredCourses = Object.entries(courseData)
    .flatMap(([dept, courses]) => 
      courses.filter(course => 
        course.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const toggleCourse = (course) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(course)) {
      newSelected.delete(course);
    } else {
      newSelected.add(course);
    }
    setSelectedCourses(newSelected);
  };

  const handleMakeGraph = () => {
    // This will be implemented later
    console.log('Making graph with courses:', [...selectedCourses]);
  };

  const handleEnterCourses = () => {
    // This will be implemented later
    console.log('Entering courses:', [...selectedCourses]);
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
          <Button 
            onClick={handleMakeGraph}
          >
            Make Graph
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graph visualization will be implemented here</p>
          </div>
        </CardContent>
      </Card>

      {/* Messages Box */}
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

      {/* Course Box */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Course suggestions will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Course Search</CardTitle>
          <div className="flex gap-4">
            <Button
              onClick={handleEnterCourses}
              variant="outline"
            >
              Enter Courses
            </Button>
            <Button
              onClick={() => setShowSearch(!showSearch)}
            >
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
                {filteredCourses.map(course => (
                  <div
                    key={course}
                    className="flex items-center p-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      id={course}
                      checked={selectedCourses.has(course)}
                      onChange={() => toggleCourse(course)}
                      className="mr-3"
                    />
                    <label htmlFor={course} className="flex-1 cursor-pointer">
                      {course}
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