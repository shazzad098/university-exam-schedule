import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExamSchedule } from './excelParser';

export function generatePDF(schedules: ExamSchedule[], courseCode: string) {
  const doc = new jsPDF();
  
  // --- সর্টিং লজিক শুরু ---
  // তারিখ অনুযায়ী ডাটা সাজানোর জন্য এই অংশটি যোগ করা হয়েছে
  const sortedSchedules = [...schedules].sort((a, b) => {
    const parseDate = (dateStr: string) => {
      // DD.MM.YYYY ফরম্যাটকে parse করার জন্য
      const [day, month, year] = dateStr.split('.').map(Number);
      return new Date(year, month - 1, day).getTime();
    };
    return parseDate(a.date) - parseDate(b.date);
  });
  // --- সর্টিং লজিক শেষ ---

  // University logo centered at top
  const logoUrl = '/data/logo.png';
  const logoWidth = 35;
  const logoHeight = 35;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  try {
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoUrl, 'PNG', logoX, 15, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Logo not found, continuing without logo');
  }
  
  // University name
  doc.setFontSize(26);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text('SOUTHEAST UNIVERSITY', pageWidth / 2, 60, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(98, 60, 185); 
  doc.setFont("helvetica", "bold");
  doc.text('Exam Schedule', pageWidth / 2, 75, { align: 'center' });
  
  // Course codes display
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  const courseCodes = [...new Set(sortedSchedules.map(s => s.courseCode))].join(', ');
  doc.text(`Courses: ${courseCodes}`, 20, 85);
  
  // Generation date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 92);
  
  // Prepare table data using sorted results
  const tableData = sortedSchedules.map(schedule => [
    schedule.courseCode,
    schedule.courseTitle,
    schedule.date,
    schedule.dayOfWeek || '',
    `${schedule.startTime} - ${schedule.endTime}`,
    schedule.faculty,
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 100,
    head: [['Course Code', 'Course Title', 'Date', 'Day', 'Time', 'Faculty']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [98, 60, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 12,
      cellPadding: 4,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 11,
      textColor: [40, 40, 40],
      cellPadding: 4,
      fontStyle: 'normal',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
    styles: {
      lineColor: [150, 150, 150],
      lineWidth: 0.2,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 27, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 28 },
      3: { cellWidth: 25 },
      4: { cellWidth: 40 },
      5: { cellWidth: 35 },
    },
    margin: { 
      left: (pageWidth - 195) / 2,  
      right: (pageWidth - 195) / 2 
    },
  });
  
  // Save PDF
  doc.save(`exam-schedule-${courseCode}.pdf`);
}