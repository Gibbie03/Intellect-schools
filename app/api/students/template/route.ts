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
      'Female',
      '2016-04-12',
      'Mrs. Ngozi Nwosu',
      'ngozi.nwosu@example.com',
      '+2348012345678',
      '12 Palm Avenue, Lagos',
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
