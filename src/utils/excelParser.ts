import * as XLSX from 'xlsx';

export interface ExamSchedule {
  program: string;
  slot: string;
  date: string;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseTitle: string;
  students: number;
  faculty: string;
  dayOfWeek?: string;
}

export async function parseExcelFile(filePath: string): Promise<ExamSchedule[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Actual file has sheets ['Routine', 'Invigilation'] — always use Routine when present
    const sheetName = workbook.SheetNames.includes('Routine')
      ? 'Routine'
      : workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

    // Actual column layout (row 0 = header):
    // 0: Slot | 1: Date | 2: Starting Time | 3: Ending Time |
    // 4: Course Code | 5: Course Title | 6: Student Count | 7: Faculty
    const schedules: ExamSchedule[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;

      const slot = String(row[0] ?? '').trim();
      const courseCode = String(row[4] ?? '').trim();
      // Skip day separator rows ([null, "Saturday"]), total rows ([null,...,297]), blanks
      if (!slot || !slot.toLowerCase().startsWith('slot')) continue;
      if (!courseCode || courseCode.toLowerCase() === 'course code') continue;

      const date = parseDate(row[1]);
      if (!date || isNaN(date.getTime())) continue;

      schedules.push({
        program: '',
        slot,
        date: formatDate(date),
        startTime: formatTime(row[2]),
        endTime: formatTime(row[3]),
        courseCode,
        courseTitle: String(row[5] ?? '').trim(),
        students: Number(row[6]) || parseInt(String(row[6])) || 0,
        faculty: String(row[7] ?? '').trim(),
        dayOfWeek: getDayOfWeek(date),
      });
    }

    return schedules;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}

function parseDate(dateStr: any): Date | null {
  if (dateStr === null || dateStr === undefined || dateStr === '') {
    return null;
  }
  // Handle DD.MM.YYYY format (actual file stores dates as "03.10.2026" strings)
  if (typeof dateStr === 'string' && dateStr.includes('.')) {
    const [day, month, year] = dateStr.split('.').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }

  // Handle Excel serial date
  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 86400000);
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function formatTime(time: any): string {
  if (time === null || time === undefined || time === '') {
    return '';
  }

  // If it's already a string in correct format, return it
  if (typeof time === 'string' && time.includes(':')) {
    return convertTo12Hour(time);
  }

  // Handle Excel decimal time format (0.5 = 12:00 PM)
  if (typeof time === 'number') {
    const totalMinutes = Math.round(time * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return convertTo12Hour(`${hours}:${minutes}`);
  }

  // Numeric string like "0.4375"
  if (typeof time === 'string' && !isNaN(Number(time)) && time.trim() !== '') {
    const num = Number(time);
    const totalMinutes = Math.round(num * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return convertTo12Hour(`${hours}:${minutes}`);
  }

  return String(time);
}

function convertTo12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteStr = String(minutes || 0).padStart(2, '0');
  return `${hour12}:${minuteStr} ${period}`;
}

function normalizeCode(code: any): string {
  return String(code ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function getBaseCourseCode(courseCode: any): string {
  const str = String(courseCode ?? '');
  const lastDotIndex = str.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return str;
  }
  return str.substring(0, lastDotIndex);
}

export function searchByCourseCode(schedules: ExamSchedule[], courseCode: string): ExamSchedule[] {
  const normalizedSearch = normalizeCode(courseCode);
  
  if (!normalizedSearch) {
    return [];
  }
  
  const results = schedules.filter(schedule => {
    const normalizedFull = normalizeCode(schedule.courseCode);
    const normalizedBase = normalizeCode(getBaseCourseCode(schedule.courseCode));
    
    return normalizedSearch === normalizedBase || normalizedSearch === normalizedFull;
  });
  
  // Sort by date
  return results.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return (dateA?.getTime() ?? 0) - (dateB?.getTime() ?? 0);
  });
}
