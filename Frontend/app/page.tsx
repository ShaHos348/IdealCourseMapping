"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";  

// Structured data for colleges and majors
const collegeData = {
  'college-of-computing': {
    name: 'College of Computing',
    majors: {
      'computer-science': {
        name: 'Computer Science',
        threads: [
          { value: 'devices', label: 'Devices' },
          { value: 'info-internetworks', label: 'Information Internetworks' },
          { value: 'intelligence', label: 'Intelligence' },
          { value: 'media', label: 'Media' },
          { value: 'modeling-simulation', label: 'Modeling and Simulation' },
          { value: 'people', label: 'People' },
          { value: 'systems-architecture', label: 'Systems and Architecture' },
          { value: 'theory', label: 'Theory' }
        ]
      }
    }
  }
};

export default function GTCoursePicker() {
  const router = useRouter();
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [thread1, setThread1] = useState("");
  const [thread2, setThread2] = useState("");

  const handleCollegeChange = (value) => {
    setSelectedCollege(value);
    setSelectedMajor("");
    setThread1("");
    setThread2("");
  };

  const handleMajorChange = (value) => {
    setSelectedMajor(value);
    setThread1("");
    setThread2("");
  };

  const getAvailableThreads = (selectedThread) => {
    if (!selectedCollege || !selectedMajor) return [];
    const threads = collegeData[selectedCollege].majors[selectedMajor].threads;
    return threads.filter(thread => 
      thread.value !== thread1 && thread.value !== thread2
    );
  };

  const getCurrentThreads = () => {
    if (!selectedCollege || !selectedMajor) return [];
    return collegeData[selectedCollege].majors[selectedMajor].threads;
  };

  const getThreadLabel = (threadValue) => {
    if (!threadValue || !selectedCollege || !selectedMajor) return "";
    const thread = collegeData[selectedCollege].majors[selectedMajor].threads
      .find(t => t.value === threadValue);
    return thread ? thread.label : "";
  };

  const handleContinue = () => {
    // Create a query string with the selected data
    const selections = {
      college: selectedCollege,
      major: selectedMajor,
      thread1: thread1,
      thread2: thread2,
    };
    
    // Navigate to the course selection page with the parameters
    localStorage.setItem("gtCourseSelections", JSON.stringify(selections));
    router.push(`/course-selection`);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Georgia Institute of Technology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* College Selection */}
          <div>
            <label htmlFor="college" className="block text-sm font-medium mb-2">
              College
            </label>
            <Select value={selectedCollege} onValueChange={handleCollegeChange}>
              <SelectTrigger id="college">
                <SelectValue placeholder="Select a college">
                  {selectedCollege ? collegeData[selectedCollege].name : "Select a college"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(collegeData).map(([value, college]) => (
                  <SelectItem key={value} value={value}>
                    {college.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Major Selection */}
          {selectedCollege && (
            <div>
              <label htmlFor="major" className="block text-sm font-medium mb-2">
                Major
              </label>
              <Select value={selectedMajor} onValueChange={handleMajorChange}>
                <SelectTrigger id="major">
                  <SelectValue placeholder="Select a major">
                    {selectedMajor ? collegeData[selectedCollege].majors[selectedMajor].name : "Select a major"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(collegeData[selectedCollege].majors).map(([value, major]) => (
                    <SelectItem key={value} value={value}>
                      {major.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Thread Selection */}
          {selectedMajor && (
            <div className="space-y-4">
              <div>
                <label htmlFor="thread1" className="block text-sm font-medium mb-2">
                  First Thread
                </label>
                <Select value={thread1} onValueChange={setThread1}>
                  <SelectTrigger id="thread1">
                    <SelectValue placeholder="Select your first thread">
                      {getThreadLabel(thread1) || "Select your first thread"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreads(thread2).map(thread => (
                      <SelectItem key={thread.value} value={thread.value}>
                        {thread.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="thread2" className="block text-sm font-medium mb-2">
                  Second Thread
                </label>
                <Select value={thread2} onValueChange={setThread2}>
                  <SelectTrigger id="thread2">
                    <SelectValue placeholder="Select your second thread">
                      {getThreadLabel(thread2) || "Select your second thread"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreads(thread1).map(thread => (
                      <SelectItem key={thread.value} value={thread.value}>
                        {thread.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {thread1 && thread2 && (
            <Button className="w-full" onClick={handleContinue}>
              Continue to Course Map
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}