"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseSelectionPage() {
  const router = useRouter();
  const [courseData, setCourseData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [expandedDepts, setExpandedDepts] = useState(new Set(['CS']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const response = await fetch('/data/program_courses.json');
        const data = await response.json();
        setCourseData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading course data:', error);
        setLoading(false);
      }
    };

    loadCourseData();
  }, []);

  const filteredDepartments = Object.entries(courseData)
    .map(([dept, courses]) => ({
      department: dept,
      courses: courses.filter((course) =>
        course.toLowerCase().includes(searchQuery.toLowerCase())
      )
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow border">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Select Completed Courses</h1>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search courses (e.g. CS 1301)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Course List */}
        <div className="max-h-[600px] overflow-y-auto p-4">
          {filteredDepartments.map(({ department, courses }) => (
            <div key={department} className="mb-4 border rounded">
              <button
                onClick={() => toggleDepartment(department)}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
              >
                <span className="font-medium">
                  {department} ({courses.length} courses)
                </span>
                <span className="text-xl">
                  {expandedDepts.has(department) ? '−' : '+'}
                </span>
              </button>

              {expandedDepts.has(department) && (
                <div className="p-3 space-y-2">
                  {courses.map((course) => (
                    <div key={course} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={course}
                        checked={selectedCourses.has(course)}
                        onChange={() => handleCourseToggle(course)}
                        className="rounded"
                      />
                      <label
                        htmlFor={course}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {course}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Back to Thread Selection
          </button>
          <button
            onClick={() => {
              console.log('Selected courses:', [...selectedCourses]);
              // Handle continuing to next step
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continue ({selectedCourses.size} selected)
          </button>
        </div>
      </div>
    </div>
  );
}