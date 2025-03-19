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
import college_data_proto from "../public/data/college_data.json";

// Structured data for colleges and majors
const collegeData = college_data_proto;

export default function GTCoursePicker() {
  const [showPopup, setShowPopup] = useState(true);
  const router = useRouter();
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [hasThreads, setHasThreads] = useState(false);
  const [hasConcentration, setHasConcentration] = useState(false);
  const [thread1, setThread1] = useState("");
  const [thread2, setThread2] = useState("");
  const [concentration, setConcentraion] = useState("");

  const canContinue = () => {
    if (!selectedCollege || !selectedMajor)
      return false;
    if ("threads" in collegeData[selectedCollege].majors[selectedMajor])
      return (thread1 !== "" && thread2 !== "");
    else if ("concentrations" in collegeData[selectedCollege].majors[selectedMajor])
      return concentration !== "";
    else
      return true;
  }

  const handleCollegeChange = (value) => {
    setSelectedCollege(value);
    setSelectedMajor("");
    setHasThreads(false);
    setHasConcentration(false);
    setThread1("");
    setThread2("");
    setConcentraion("");
  };

  const handleMajorChange = (value, college, collegeData) => {    
    setSelectedMajor(value);
    setHasThreads(false);
    setHasConcentration(false);
    setThread1("");
    setThread2("");
    setConcentraion("");

    if ("threads" in collegeData[college].majors[value])
      setHasThreads(true);
    if ("concentrations" in collegeData[college].majors[value])
      setHasConcentration(true);
  };

  const getAvailableThreads = () => {
    if (
      !selectedCollege || !selectedMajor || 
      !("threads" in collegeData[selectedCollege].majors[selectedMajor])
    ) 
      return [];
    const threads = collegeData[selectedCollege].majors[selectedMajor].threads;
    return threads.filter(thread => 
      thread.value !== thread1 && thread.value !== thread2
    );
  };

  const getAvailableConcentrations = () => {
    if (
      !selectedCollege || !selectedMajor || 
      !("concentrations" in collegeData[selectedCollege].majors[selectedMajor])
    ) 
      return [];
    const concentrations = collegeData[selectedCollege].majors[selectedMajor].concentrations;
    return concentrations.filter(c => c.value !== concentration);
  };

  const getCurrentThreads = () => {
    if (!selectedCollege || !selectedMajor) return [];
    return collegeData[selectedCollege].majors[selectedMajor].threads;
  };

  const getLabel = (threadValue, field) => {
    if (!threadValue || !selectedCollege || !selectedMajor) return "";
    const data = collegeData[selectedCollege].majors[selectedMajor][field]
      .find(t => t.value === threadValue);
    return data ? data.label : "";
  };

  const handleContinue = () => {
    // Create a query string with the selected data
    const majorObj = collegeData[selectedCollege]['majors'][selectedMajor];

    const selections = {
      college: collegeData[selectedCollege]['name'],
      major: collegeData[selectedCollege]['majors'][selectedMajor]['name'],
      concentration: hasConcentration ? majorObj['concentrations'].find(t => t.value === concentration).label : null,
      thread1: hasThreads ? majorObj['threads'].find(t => t.value === thread1).label : null,
      thread2: hasThreads ? majorObj['threads'].find(t => t.value === thread2).label : null,
    };
    
    // Navigate to the course selection page with the parameters
    localStorage.setItem("gtCourseSelections", JSON.stringify(selections));
    router.push(`/course-selection`);
  };

  if (showPopup) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
        <h2 className="text-lg font-semibold mb-4">Consent Required</h2>
        <p className="mb-4">The data collected is stored only for the current session and will be deleted if this tab is closed. We do not hold or keep in file any data collected from here.</p>
        <button
          onClick={() => setShowPopup(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Accept
        </button>
      </div>
    </div>
  );
}


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
              <Select 
                value={selectedMajor} 
                onValueChange={(major) => handleMajorChange(major, selectedCollege, collegeData)}>
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
          {/* Concentration Selection */}
          {selectedMajor && hasConcentration && (
            <div>
              <label htmlFor="concentration" className="block text-sm font-medium mb-2">
              Concentration
              </label>
              <Select 
                value={concentration} 
                onValueChange={setConcentraion}>
                <SelectTrigger id="concentration">
                  <SelectValue placeholder="Select a concentration">
                  {getLabel(concentration, "concentrations") || "Select a concentration"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getAvailableConcentrations().map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Thread Selection */}
          {selectedMajor && hasThreads && (
            <div className="space-y-4">
              <div>
                <label htmlFor="thread1" className="block text-sm font-medium mb-2">
                  First Thread
                </label>
                <Select value={thread1} onValueChange={setThread1}>
                  <SelectTrigger id="thread1">
                    <SelectValue placeholder="Select your first thread">
                      {getLabel(thread1, "threads") || "Select your first thread"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreads().map(thread => (
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
                      {getLabel(thread2, "threads") || "Select your second thread"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreads().map(thread => (
                      <SelectItem key={thread.value} value={thread.value}>
                        {thread.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button className="w-full" onClick={handleContinue} disabled={!canContinue()}>
            Continue to Course Map
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
