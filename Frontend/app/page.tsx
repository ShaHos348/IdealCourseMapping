"use client";
import React, { useState } from 'react';
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
          { value: 'devices', label: 'Devices', description: 'Focus on the interface between hardware and software' },
          { value: 'info-internetworks', label: 'Information Internetworks', description: 'Emphasizes computer networks and related technologies' },
          { value: 'intelligence', label: 'Intelligence', description: 'Concentrates on AI and machine learning' },
          { value: 'media', label: 'Media', description: 'Explores graphics, animation, and digital media' },
          { value: 'modeling-simulation', label: 'Modeling and Simulation', description: 'Focuses on computational modeling and data analytics' },
          { value: 'people', label: 'People', description: 'Emphasizes social computing and human-computer interaction' },
          { value: 'systems-architecture', label: 'Systems and Architecture', description: 'Covers computer systems design and implementation' },
          { value: 'theory', label: 'Theory', description: 'Explores theoretical computer science and algorithms' }
        ]
      }
      // Future majors can be added here
    }
  }
  // Future colleges can be added here
};

export default function GTCoursePicker() {
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
                <SelectValue placeholder="Select a college" />
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
                  <SelectValue placeholder="Select a major" />
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
                    <SelectValue placeholder="Select your first thread" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreads(thread2).map(thread => (
                      <SelectItem key={thread.value} value={thread.value}>
                        {thread.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {thread1 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {getCurrentThreads().find(t => t.value === thread1)?.description}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="thread2" className="block text-sm font-medium mb-2">
                  Second Thread
                </label>
                <Select value={thread2} onValueChange={setThread2}>
                  <SelectTrigger id="thread2">
                    <SelectValue placeholder="Select your second thread" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreads(thread1).map(thread => (
                      <SelectItem key={thread.value} value={thread.value}>
                        {thread.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {thread2 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {getCurrentThreads().find(t => t.value === thread2)?.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {thread1 && thread2 && (
            <Button className="w-full">
              Continue to Course Map
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
