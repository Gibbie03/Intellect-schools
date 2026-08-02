export const CLASSES = [
  'Nursery 1',
  'Nursery 2',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SSS 1',
  'SSS 2',
  'SSS 3',
];

export const STAFF_ROLES = ['Teacher', 'Head Teacher', 'Admin', 'Bursar', 'Non-Teaching Staff'] as const;

// Senior Secondary students stream into a department, not a "faculty" (that's
// university terminology) -- Science/Arts/Commercial/Social Science, starting
// at SSS 1.
export const DEPARTMENTS = ['Science', 'Arts', 'Social Science', 'Commercial'] as const;

export function isSeniorSecondaryClass(className: string): boolean {
  return className.trim().toUpperCase().startsWith('SSS');
}

export function isValidDepartment(value: string): boolean {
  return (DEPARTMENTS as readonly string[]).includes(value);
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const STUDENT_TEMPLATE_HEADERS = [
  'Student ID',
  'Full Name',
  'Class',
  'Department',
  'Gender',
  'Date of Birth',
  'Parent Name',
  'Parent Email',
  'Parent Phone',
  'Address',
];
