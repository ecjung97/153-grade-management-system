import { collection, doc, getDocs, getDoc, setDoc, query, where, writeBatch, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Teacher, ClassGroup, Student, Score } from '../types';
import { mockCurrentUser, mockClasses, mockStudents } from '../utils/mockData';

// --- Application Data Services ---

export const getClassesForTeacher = async (teacherId: string): Promise<ClassGroup[]> => {
    if (!db) throw new Error("Firebase is not initialized");
    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('teacherId', '==', teacherId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassGroup));
};

export const getStudentsByIds = async (studentIds: string[]): Promise<Student[]> => {
    if (!db) throw new Error("Firebase is not initialized");
    if (studentIds.length === 0) return [];
    
    // Firestore 'in' query supports up to 10 items. For larger arrays, 
    // you need to chunk the array or fetch all students and filter locally.
    // For this simple example, we fetch all and filter.
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);
    const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    return allStudents.filter(s => studentIds.includes(s.id));
};

export const saveAssessmentResults = async (assessmentData: any) => {
    if (!db) throw new Error("Firebase is not initialized");
    const assessmentsRef = collection(db, 'assessments');
    const docRef = await addDoc(assessmentsRef, {
        ...assessmentData,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const updateAssessmentResults = async (assessmentId: string, assessmentData: any) => {
    if (!db) throw new Error("Firebase is not initialized");
    const docRef = doc(db, 'assessments', assessmentId);
    await updateDoc(docRef, {
        ...assessmentData,
        updatedAt: serverTimestamp()
    });
};

export const deleteAssessment = async (assessmentId: string) => {
    if (!db) throw new Error("Firebase is not initialized");
    const docRef = doc(db, 'assessments', assessmentId);
    await deleteDoc(docRef);
};

export const addStudentToClass = async (classId: string, studentName: string, gradeLevel: string) => {
    if (!db) throw new Error("Firebase is not initialized");
    
    // 1. Create the student document
    const studentsRef = collection(db, 'students');
    const newStudentRef = await addDoc(studentsRef, {
        firstName: studentName,
        lastName: "",
        gradeLevel: gradeLevel
    });
    
    // 2. Add the student ID to the class document
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
        studentIds: arrayUnion(newStudentRef.id)
    });
    
    return newStudentRef.id;
};

export const removeStudentFromClass = async (classId: string, studentId: string) => {
    if (!db) throw new Error("Firebase is not initialized");
    
    // Remove the student ID from the class's studentIds array
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
        studentIds: arrayRemove(studentId)
    });
};

export const updateTeacherAssessmentTypes = async (teacherId: string, assessmentTypes: string[]) => {
    if (!db) throw new Error("Firebase is not initialized");
    const teacherRef = doc(db, 'teachers', teacherId);
    await updateDoc(teacherRef, {
        assessmentTypes: assessmentTypes
    });
};

export const batchUpdateAssessmentTypes = async (teacherId: string, oldType: string, newType: string) => {
    if (!db) throw new Error("Firebase is not initialized");
    const assessmentsRef = collection(db, 'assessments');
    const q = query(assessmentsRef, where('teacherId', '==', teacherId), where('type', '==', oldType));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, { type: newType, updatedAt: serverTimestamp() });
    });
    
    await batch.commit();
};

// --- Migration Service (Run Once) ---

export const runFirebaseMigration = async () => {
    if (!db) {
        alert("Please configure Firebase in .env.local first!");
        return;
    }

    try {
        const batch = writeBatch(db);

        // 1. Upload Teacher
        const teacherRef = doc(db, 'teachers', mockCurrentUser.id);
        batch.set(teacherRef, mockCurrentUser);

        // 2. Upload Classes
        mockClasses.forEach(cls => {
            const classRef = doc(db, 'classes', cls.id);
            batch.set(classRef, cls);
        });

        // 3. Upload Students
        mockStudents.forEach(student => {
            const studentRef = doc(db, 'students', student.id);
            batch.set(studentRef, student);
        });

        await batch.commit();
        alert("Migration completed successfully! All mock data is now in Firestore.");
    } catch (error) {
        console.error("Migration failed:", error);
        alert("Migration failed. Check console for details.");
    }
};
