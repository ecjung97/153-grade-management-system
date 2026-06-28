// src/types/index.ts

export type AssessmentType = string;
export type GradeLevel = '3rd Grade' | '4th Grade' | '6th Grade' | '7th Grade' | 'Other';

export interface RubricLevel {
    label: string; // e.g., "상", "중", "하"
    score: number;
    description: string;
}

export interface RubricCriteria {
    id: string;
    name: string;
    levels: RubricLevel[];
}

export interface Score {
    id: string;          // The Firestore document ID
    type: AssessmentType;
    title: string;       // e.g., "Fractions Quiz" or "Excel Basics"
    value: number;       // e.g., 95
    date: string;        // ISO string format (e.g., "2026-06-24")
    notes?: string;      // Optional: helpful for parent-teacher conferences
    isAbsent?: boolean;  // True if the student was absent for this assessment
    rubricScores?: Record<string, number>; // Maps criteria ID to score
}

export interface Assessment {
    id: string;
    classId: string;
    teacherId: string;
    title: string;
    type: AssessmentType;
    date: string;
    maxScore: number;
    gradingMode?: 'Standard' | 'Rubric' | 'Homework';
    rubric?: RubricCriteria[];
    results: Record<string, { 
        value: number | ''; 
        rubricScores?: Record<string, number>;
        notes: string; 
        isAbsent?: boolean 
    }>;
    createdAt?: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
}

export interface Student {
    id: string;          // The Firestore document ID
    firstName: string;
    lastName: string;
    gradeLevel: GradeLevel;
    classGroupId: string; // Links the student to a specific class

    // Notice this is optional (?). In Firebase, we will likely fetch the 
    // student document first, and then fetch their scores from a sub-collection 
    // only when we click into their specific profile.
    scores?: Score[];
}

export interface ClassGroup {
    id: string;           // e.g., "class-6-homeroom"
    gradeLevel: GradeLevel;
    name: string;         // e.g., "Homeroom" or "Excel Class"
    academicYear: string; // e.g., "2026"
    teacherId?: string;   // Reference to the Teacher in charge
    
    // We store an array of student IDs rather than the whole student object.
    // This keeps the class document lightweight.
    studentIds: string[];
}

export interface Teacher {
    id: string;
    name: string;
    englishName: string;
    role: string;
    assessmentTypes?: string[]; // Custom assessment types created by the teacher
}