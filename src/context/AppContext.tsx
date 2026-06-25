import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Teacher, ClassGroup, Student, Assessment } from '../types';
import { getClassesForTeacher } from '../services/db';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AppContextType {
    currentUser: Teacher | null;
    classes: ClassGroup[];
    students: Student[];
    assessments: Assessment[];
    assessmentTypes: string[];
    isLoading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [assessmentTypes, setAssessmentTypes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (isMounted = true) => {
        try {
            if (!db) {
                throw new Error("Firebase is not initialized");
            }

                // 1. Fetch Current User (Hardcoded Mr. Peter for now)
                const teacherId = 'teacher-peter';
                const teacherDocRef = doc(db, 'teachers', teacherId);
                const teacherSnap = await getDoc(teacherDocRef);
                
                if (teacherSnap.exists()) {
                    const data = teacherSnap.data() as Teacher;
                    setCurrentUser({ id: teacherSnap.id, ...data });
                    
                    if (data.assessmentTypes && data.assessmentTypes.length > 0) {
                        setAssessmentTypes(data.assessmentTypes);
                    } else {
                        setAssessmentTypes(['Quiz', 'Test', 'Midterm', 'Final']);
                    }
                } else {
                    console.warn("Teacher not found in DB. Did you run the migration?");
                }

                // 2. Fetch Classes for Teacher
                const fetchedClasses = await getClassesForTeacher(teacherId);
                if (isMounted) setClasses(fetchedClasses);

                // 3. Fetch all Students
                // For a real app, you'd only fetch students for the classes the teacher has access to.
                // Since this is a demo and we need them for the rosters, we fetch all.
                const studentsRef = collection(db, 'students');
                const studentsSnap = await getDocs(studentsRef);
                const fetchedStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
                
                // Sort students alphabetically (Korean support)
                fetchedStudents.sort((a, b) => a.firstName.localeCompare(b.firstName, 'ko-KR'));
                
                // 4. Fetch Assessments and map to students
                const assessmentsRef = collection(db, 'assessments');
                const assessmentsQuery = query(assessmentsRef, where('teacherId', '==', teacherId));
                const assessmentsSnap = await getDocs(assessmentsQuery);
                
                // Initialize empty scores array
                fetchedStudents.forEach(s => s.scores = []);
                
                const fetchedAssessments: Assessment[] = [];

                assessmentsSnap.forEach(docSnap => {
                    const assessment = docSnap.data() as Assessment;
                    assessment.id = docSnap.id;
                    fetchedAssessments.push(assessment);
                    
                    const assessmentId = docSnap.id;
                    const results = assessment.results || {};
                    
                    Object.entries(results).forEach(([studentId, result]: [string, any]) => {
                        const student = fetchedStudents.find(s => s.id === studentId);
                        if (student) {
                            student.scores!.push({
                                assessmentId: assessmentId,
                                classId: assessment.classId,
                                value: result.value,
                                maxScore: assessment.maxScore,
                                date: assessment.date,
                                notes: result.notes,
                                isAbsent: result.isAbsent
                            } as any);
                        }
                    });
                });

                if (isMounted) {
                    setStudents(fetchedStudents);
                    setAssessments(fetchedAssessments);
                }

            } catch (err: any) {
                console.error("Failed to load initial data", err);
                if (isMounted) setError(err.message || "Failed to load data");
            } finally {
                if (isMounted) setIsLoading(false);
            }
    };

    useEffect(() => {
        let isMounted = true;
        loadData(isMounted);

        return () => {
            isMounted = false;
        };
    }, []);

    const refreshData = async () => {
        await loadData(true);
    };

    return (
        <AppContext.Provider value={{ currentUser, classes, students, assessments, assessmentTypes, isLoading, error, refreshData }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
