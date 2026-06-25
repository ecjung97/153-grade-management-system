import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import type { Student, ClassGroup, Assessment } from '../types';

export default function Migration() {
    const [status, setStatus] = useState<string>('Ready to run');
    const [isLoading, setIsLoading] = useState(false);

    const runMigration = async () => {
        if (!window.confirm("Are you sure you want to run the migration? This will modify the database directly.")) {
            return;
        }

        setIsLoading(true);
        setStatus('Fetching data...');
        try {
            if (!db) throw new Error("Firebase not initialized");

            const studentsSnap = await getDocs(collection(db, 'students'));
            const classesSnap = await getDocs(collection(db, 'classes'));
            const assessmentsSnap = await getDocs(collection(db, 'assessments'));

            const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
            const classes = classesSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClassGroup));
            const assessments = assessmentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Assessment));

            setStatus('Calculating new IDs...');

            // Group students
            const grouped: Record<string, Student[]> = {};
            students.forEach(s => {
                if (!grouped[s.gradeLevel]) grouped[s.gradeLevel] = [];
                grouped[s.gradeLevel].push(s);
            });

            const idMapping: Record<string, string> = {}; // oldId -> newId

            const getPrefix = (grade: string) => {
                if (grade === '3rd Grade') return 'stu-class-3-hope';
                if (grade === '4th Grade') return 'stu-class-4-love';
                if (grade === '6th Grade') return 'stu-class-6-promise';
                if (grade === '7th Grade') return 'stu-class-7-sincerity';
                return 'stu-class-other';
            };

            // Sort and map
            Object.keys(grouped).forEach(grade => {
                const groupStudents = grouped[grade];
                groupStudents.sort((a, b) => a.firstName.localeCompare(b.firstName, 'ko-KR'));
                
                const prefix = getPrefix(grade);
                groupStudents.forEach((student, index) => {
                    const newId = `${prefix}-${index + 1}`;
                    idMapping[student.id] = newId;
                });
            });

            setStatus('Building batch operations...');

            // Firestore batches are limited to 500 operations. We'll track it.
            let batch = writeBatch(db);
            let opCount = 0;

            const commitBatchIfFull = async () => {
                if (opCount > 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    opCount = 0;
                }
            };

            // 1. Process Students
            for (const student of students) {
                const newId = idMapping[student.id];
                if (!newId || newId === student.id) continue;

                // Create new doc
                const newStudentRef = doc(db, 'students', newId);
                const { id: _, scores: __, ...studentData } = student as any; // remove id and local scores array from data
                batch.set(newStudentRef, studentData);
                opCount++;
                await commitBatchIfFull();

                // Delete old doc
                const oldStudentRef = doc(db, 'students', student.id);
                batch.delete(oldStudentRef);
                opCount++;
                await commitBatchIfFull();
            }

            // 2. Process Classes
            for (const cls of classes) {
                let changed = false;
                const newStudentIds = cls.studentIds.map(oldId => {
                    if (idMapping[oldId] && idMapping[oldId] !== oldId) {
                        changed = true;
                        return idMapping[oldId];
                    }
                    return oldId;
                });

                if (changed) {
                    const classRef = doc(db, 'classes', cls.id);
                    batch.update(classRef, { studentIds: newStudentIds });
                    opCount++;
                    await commitBatchIfFull();
                }
            }

            // 3. Process Assessments
            for (const assessment of assessments) {
                let changed = false;
                const newResults: Record<string, any> = {};
                
                Object.entries(assessment.results || {}).forEach(([oldId, result]) => {
                    const newId = idMapping[oldId];
                    if (newId && newId !== oldId) {
                        changed = true;
                        newResults[newId] = result;
                    } else {
                        newResults[oldId] = result;
                    }
                });

                if (changed) {
                    const assessmentRef = doc(db, 'assessments', assessment.id);
                    batch.update(assessmentRef, { results: newResults });
                    opCount++;
                    await commitBatchIfFull();
                }
            }

            if (opCount > 0) {
                await batch.commit();
            }

            setStatus('Migration completed successfully! Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            console.error('Migration failed:', error);
            setStatus(`Migration failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Database Migration</h1>
            <p className="mb-4 text-slate-600">
                This will rename all student IDs sequentially (alphabetical order) according to their grade level, and update all references in classes and assessments.
            </p>
            <div className="bg-slate-100 p-4 rounded-lg mb-6 text-sm font-mono text-slate-700">
                Status: {status}
            </div>
            <button 
                onClick={runMigration} 
                disabled={isLoading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-red-700 transition-colors"
            >
                {isLoading ? 'Migrating...' : 'Run Migration'}
            </button>
        </div>
    );
}
