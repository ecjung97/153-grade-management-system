import type { ClassGroup, Student, GradeLevel, Teacher } from '../types';
import studentsData from '../data/students.json';

export const mockCurrentUser: Teacher = {
    id: 'teacher-peter',
    name: '정은총',
    englishName: 'Mr. Peter',
    role: 'Teacher'
};

const studentsDict = studentsData as Record<string, string[]>;

export const mockStudents: Student[] = Object.keys(studentsDict).flatMap((className, classIndex) => {
  const classNameSlug = className.split(' ')[1] ? className.split(' ')[1].toLowerCase().replace('반', '') : `group-${classIndex}`;
  const classId = `class-${classIndex + 1}-${classNameSlug}`;
  const gradeMatch = className.match(/^(\d+)학년/);
  let gradeStr = 'Other';
  if (gradeMatch) {
    const num = parseInt(gradeMatch[1], 10);
    if (num === 3) gradeStr = '3rd Grade';
    else if (num === 4) gradeStr = '4th Grade';
    else if (num === 6) gradeStr = '6th Grade';
    else if (num === 7) gradeStr = '7th Grade';
  }
  const gradeLevel = gradeStr as GradeLevel;

  return studentsDict[className].map((studentName, studentIndex) => ({
    id: `stu-${classId}-${studentIndex}`,
    firstName: studentName,
    lastName: '',
    gradeLevel,
    classGroupId: classId,
    scores: []
  }));
});

export const mockClasses: ClassGroup[] = [
  // Mr. Peter's Subject Classes
  {
      id: 'sub-comp-3',
      gradeLevel: '3rd Grade',
      name: '3학년 컴퓨터',
      academicYear: '2026',
      teacherId: 'teacher-peter',
      studentIds: mockStudents.filter(s => s.gradeLevel === '3rd Grade').map(s => s.id)
  },
  {
      id: 'sub-comp-4',
      gradeLevel: '4th Grade',
      name: '4학년 컴퓨터',
      academicYear: '2026',
      teacherId: 'teacher-peter',
      studentIds: mockStudents.filter(s => s.gradeLevel === '4th Grade').map(s => s.id)
  },
  {
      id: 'sub-eng-6',
      gradeLevel: '6th Grade',
      name: '6학년 영어',
      academicYear: '2026',
      teacherId: 'teacher-peter',
      studentIds: mockStudents.filter(s => s.gradeLevel === '6th Grade').map(s => s.id)
  },
  {
      id: 'sub-eng-7',
      gradeLevel: '7th Grade',
      name: '7학년 영어',
      academicYear: '2026',
      teacherId: 'teacher-peter',
      studentIds: mockStudents.filter(s => s.gradeLevel === '7th Grade').map(s => s.id)
  },
  {
      id: 'sub-eng-grammar-7',
      gradeLevel: '7th Grade',
      name: '7학년 영문법',
      academicYear: '2026',
      teacherId: 'teacher-peter',
      studentIds: mockStudents.filter(s => s.gradeLevel === '7th Grade').map(s => s.id)
  }
];
