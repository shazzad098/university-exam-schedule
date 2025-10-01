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
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
    
    // Skip header row and parse data
    const schedules: ExamSchedule[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row[0]) {
        const dateStr = row[2];
        const date = parseDate(dateStr);
        
        schedules.push({
          program: row[0],
          slot: row[1],
          date: formatDate(date),
          startTime: formatTime(row[3]),
          endTime: formatTime(row[4]),
          courseCode: row[5],
          courseTitle: row[6],
          students: parseInt(row[7]) || 0,
          faculty: row[8],
          dayOfWeek: getDayOfWeek(date),
        });
      }
    }
    
    return schedules;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}

function parseDate(dateStr: string): Date {
  // Handle DD.MM.YYYY format
  if (typeof dateStr === 'string' && dateStr.includes('.')) {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Handle Excel serial date
  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 86400000);
  }
  
  return new Date(dateStr);
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
  // If it's already a string in correct format, return it
  if (typeof time === 'string' && time.includes(':')) {
    return convertTo12Hour(time);
  }
  
  // Handle Excel decimal time format (0.5 = 12:00 PM)
  if (typeof time === 'number') {
    const hours = Math.floor(time * 24);
    const minutes = Math.round((time * 24 - hours) * 60);
    return convertTo12Hour(`${hours}:${minutes}`);
  }
  
  return time;
}

function convertTo12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteStr = String(minutes || 0).padStart(2, '0');
  return `${hour12}:${minuteStr} ${period}`;
}

export function searchByCourseCode(schedules: ExamSchedule[], courseCode: string): ExamSchedule[] {
  const searchTerm = courseCode.trim().toLowerCase();
  const results = schedules.filter(schedule => 
    schedule.courseCode.toLowerCase().includes(searchTerm)
  );
  
  // Sort by date
  return results.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });
}
