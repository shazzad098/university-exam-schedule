import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExamSchedule } from './excelParser';

export function generatePDF(schedules: ExamSchedule[], courseCode: string) {
  const doc = new jsPDF();
  
  // Add university logo - centered at top
  const logoUrl = '/data/logo.png'; // Path from public folder
  const logoWidth = 35;
  const logoHeight = 35;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  try {
    // Center the logo horizontally
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoUrl, 'PNG', logoX, 15, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Logo not found, continuing without logo');
  }
  
  // Add university name below logo - centered
  doc.setFontSize(26);
  doc.setTextColor(0, 0, 0); // Black color
  doc.setFont("helvetica", "bold");
  doc.text('SOUTHEAST UNIVERSITY', pageWidth / 2, 60, { align: 'center' });
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(98, 60, 185); // Primary color
  doc.setFont("helvetica", "bold");
  doc.text('Exam Schedule', pageWidth / 2, 75, { align: 'center' });
  
  // Add course codes
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  const courseCodes = [...new Set(schedules.map(s => s.courseCode))].join(', ');
  doc.text(`Courses: ${courseCodes}`, 20, 85);
  
  // Add current date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 92);
  
  // Prepare table data
  const tableData = schedules.map(schedule => [
    schedule.courseCode,
    schedule.courseTitle,
    schedule.date,
    schedule.dayOfWeek || '',
    `${schedule.startTime} - ${schedule.endTime}`,
    schedule.faculty,
  ]);
  
  // Add table with centered position
  autoTable(doc, {
    startY: 100,
    head: [['Course Code', 'Course Title', 'Date', 'Day', 'Time', 'Faculty']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [98, 60, 185], // Primary color
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
    // Center the table using horizontal alignment
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
    columnStyles: {
      0: { cellWidth: 27, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 28 },
      3: { cellWidth: 25 },
      4: { cellWidth: 40 },
      5: { cellWidth: 35 },
    },
    // Calculate margins to center the table
    didDrawPage: function (data) {
      // This ensures proper centering
    },
    margin: { 
      left: (pageWidth - 195) / 2,  
      right: (pageWidth - 295) / 2 
    },
  });
  
  // Save the PDF
  doc.save(`exam-schedule-${courseCode}.pdf`);
}