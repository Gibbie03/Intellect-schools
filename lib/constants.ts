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

// Schools spanning Nursery through Secondary often split administration
// between a Primary-section head and a Secondary-section head (Principal).
// Section-scoped school_users roles ('primary_admin', 'secondary_admin')
// are restricted to these class lists; the plain 'admin' role stays
// unrestricted (sees every class), matching a single-admin school's
// existing behavior unchanged.
export const SECTION_CLASSES: Record<'Primary' | 'Secondary', string[]> = {
  Primary: ['Nursery 1', 'Nursery 2', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
  Secondary: ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'],
};

export type AdminRole = 'admin' | 'primary_admin' | 'secondary_admin';

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  admin: 'Admin (Full School)',
  primary_admin: 'Primary Admin',
  secondary_admin: 'Secondary Admin',
};

// null return = unrestricted (the plain 'admin' role, or any non-admin role
// this helper wasn't meant for).
export function getSectionClasses(role: string): string[] | null {
  if (role === 'primary_admin') return SECTION_CLASSES.Primary;
  if (role === 'secondary_admin') return SECTION_CLASSES.Secondary;
  return null;
}

export const STUDENT_TEMPLATE_HEADERS = [
  'Student ID',
  'Full Name',
  'Class',
  'Department',
  'Campus',
  'Gender',
  'Date of Birth',
  'Parent Name',
  'Parent Email',
  'Parent Phone',
  'Address',
];
