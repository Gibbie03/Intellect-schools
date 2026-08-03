import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { requireSchoolSession } from '@/lib/auth';
import { CLASSES, isSeniorSecondaryClass, isValidDepartment, getSectionClasses } from '@/lib/constants';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

type StudentInsert = Database['public']['Tables']['students']['Insert'];

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

const HEADER_MAP: Record<string, keyof StudentInsert> = {
  studentid: 'student_id',
  fullname: 'full_name',
  name: 'full_name',
  class: 'class',
  department: 'department',
  campus: 'campus',
  gender: 'gender',
  dateofbirth: 'date_of_birth',
  dob: 'date_of_birth',
  parentname: 'parent_name',
  guardianname: 'parent_name',
  parentemail: 'parent_email',
  parentphone: 'parent_phone',
  guardianphone: 'parent_phone',
  address: 'address',
};

export async function POST(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school, session } = staff;
    const sectionClasses = getSectionClasses(session.role);

    const supabase = getSupabaseClient();
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ error: 'The uploaded file has no sheets.' }, { status: 400 });
    }

    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
      defval: '',
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'The uploaded file has no data rows.' }, { status: 400 });
    }

    const errors: { row: number; reason: string }[] = [];
    const toInsert: StudentInsert[] = [];
    const seenIds = new Set<string>();

    rows.forEach((row, index) => {
      const mapped: Partial<StudentInsert> = {};

      for (const [rawKey, value] of Object.entries(row)) {
        const key = HEADER_MAP[normalizeHeader(rawKey)];
        if (!key) continue;

        if (key === 'date_of_birth' && value instanceof Date) {
          mapped[key] = value.toISOString().slice(0, 10);
        } else if (value !== '' && value !== null && value !== undefined) {
          mapped[key] = String(value).trim() as never;
        }
      }

      const rowNumber = index + 2; // header is row 1

      if (!mapped.student_id || !mapped.full_name || !mapped.class) {
        errors.push({ row: rowNumber, reason: 'Missing Student ID, Full Name, or Class.' });
        return;
      }

      if (!CLASSES.includes(mapped.class)) {
        errors.push({ row: rowNumber, reason: `"${mapped.class}" is not a recognized class (e.g. "SSS 2", not "SS2").` });
        return;
      }

      if (sectionClasses && !sectionClasses.includes(mapped.class)) {
        errors.push({ row: rowNumber, reason: `You do not have access to create students in "${mapped.class}".` });
        return;
      }

      if (mapped.department && !isSeniorSecondaryClass(mapped.class)) {
        mapped.department = undefined;
      } else if (mapped.department && !isValidDepartment(mapped.department)) {
        errors.push({
          row: rowNumber,
          reason: `"${mapped.department}" is not a recognized department (Science, Arts, Social Science, or Commercial).`,
        });
        return;
      }

      if (seenIds.has(mapped.student_id)) {
        errors.push({ row: rowNumber, reason: `Duplicate Student ID "${mapped.student_id}" in file.` });
        return;
      }
      seenIds.add(mapped.student_id);

      toInsert.push({ ...mapped, school_id: school.id, status: 'Active' } as StudentInsert);
    });

    let created = 0;
    if (toInsert.length > 0) {
      const { data, error } = await supabase.from('students').insert(toInsert).select('id');
      if (error) {
        return NextResponse.json(
          {
            error: `Database rejected the batch: ${error.message}. This usually means a Student ID in the file already exists.`,
            errors,
          },
          { status: 409 }
        );
      }
      created = data?.length ?? 0;
    }

    return NextResponse.json({ created, skipped: errors.length, errors });
  } catch (error) {
    return apiError(error);
  }
}
