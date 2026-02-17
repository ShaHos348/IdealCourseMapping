import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getData, storeData } from "@/util/storage";

type Ctx = {
  selectedCourses: Set<string>;
  toggleCourse: (course: string) => void;
  addMany: (courses: string[]) => void;
  clearAll: () => void;
};

const CourseMapCtx = createContext<Ctx | null>(null);

export function useCourseMap() {
  const v = useContext(CourseMapCtx);
  if (!v) throw new Error("useCourseMap must be used inside CourseMapProvider");
  return v;
}

export function CourseMapProvider({ children }: { children: React.ReactNode }) {
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  // Load initial selected courses for page 3 from storage if present
  useEffect(() => {
    (async () => {
      const stored = await getData("selectedCoursesForGraph"); // page3 working set
      if (Array.isArray(stored)) setSelectedCourses(new Set(stored));
      else {
        // fallback: previously saved takenCourses from page 2
        const taken = await getData("takenCourses");
        if (Array.isArray(taken)) setSelectedCourses(new Set(taken));
      }
    })();
  }, []);

  // Persist whenever it changes so switching tabs never loses it
  useEffect(() => {
    storeData("selectedCoursesForGraph", Array.from(selectedCourses));
  }, [selectedCourses]);

  const toggleCourse = (course: string) => {
    const normalized = course.trim().toUpperCase();
    if (!normalized) return;

    setSelectedCourses((prev) => {
      const next = new Set(prev);
      next.has(normalized) ? next.delete(normalized) : next.add(normalized);
      return next;
    });
  };

  const addMany = (courses: string[]) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      courses.forEach((c) => {
        const normalized = String(c).trim().toUpperCase();
        if (normalized) next.add(normalized);
      });
      return next;
    });
  };

  const clearAll = () => setSelectedCourses(new Set());

  const value = useMemo(
    () => ({ selectedCourses, toggleCourse, addMany, clearAll }),
    [selectedCourses]
  );

  return <CourseMapCtx.Provider value={value}>{children}</CourseMapCtx.Provider>;
}