import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { STUDENT_TEMPLATE_HEADERS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    STUDENT_TEMPLATE_HEADERS,
    [
      'ICS/2025/001',
      'Chidera Nwosu',
      'Primary 4',
      '',
      '',
      'Female',
      '2016-04-12',
      'Mrs. Ngozi Nwosu',
      'ngozi.nwosu@example.com',
      '+2348012345678',
      '12 Palm Avenue, Lagos',
    ],
    [
      'ICS/2025/002',
      'Tunde Bakare',
      'SSS 2',
      'Science',
      '',
      'Male',
      '2010-09-03',
      'Mr. Femi Bakare',
      'femi.bakare@example.com',
      '+2348023456789',
      '4 Adekunle Street, Abeokuta',
    ],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="student-batch-template.xlsx"',
    },
  });
}
