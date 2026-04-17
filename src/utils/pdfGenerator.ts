import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExamSchedule } from './excelParser';

export function generatePDF(schedules: ExamSchedule[], courseCode: string) {
  const doc = new jsPDF();

  // Sort by date
  const sortedSchedules = [...schedules].sort((a, b) => {
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('.').map(Number);
      return new Date(year, month - 1, day).getTime();
    };
    return parseDate(a.date) - parseDate(b.date);
  });

  // Emerald green palette (matches website theme)
  const emeraldDark: [number, number, number] = [22, 101, 74];   // hsl(160 56% 28%)
  const emeraldMid: [number, number, number] = [52, 148, 114];
  const emeraldLight: [number, number, number] = [236, 253, 245];
  const gold: [number, number, number] = [202, 138, 4];   // hsl(38 88% 48%)

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Logo ──────────────────────────────────────────────
  const logoWidth = 30;
  const logoHeight = 30;
  try {
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage('/data/logo.png', 'PNG', logoX, 14, logoWidth, logoHeight);
  } catch {
    console.warn('Logo not found, continuing without logo');
  }

  // ── University name ───────────────────────────────────
  doc.setFontSize(22);
  doc.setTextColor(...emeraldDark);
  doc.setFont('helvetica', 'bold');
  doc.text('SOUTHEAST UNIVERSITY', pageWidth / 2, 52, { align: 'center' });

  // ── Title ─────────────────────────────────────────────
  doc.setFontSize(15);
  doc.setTextColor(...gold);
  doc.setFont('helvetica', 'bold');
  doc.text('Exam Schedule', pageWidth / 2, 62, { align: 'center' });

  // ── Divider line ──────────────────────────────────────
  doc.setDrawColor(...emeraldDark);
  doc.setLineWidth(0.6);
  doc.line(15, 66, pageWidth - 15, 66);

  // ── Course codes & date ───────────────────────────────
  const courseCodes = [...new Set(sortedSchedules.map(s => s.courseCode))].join(', ');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Courses: ${courseCodes}`, 15, 73);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, 73, { align: 'right' });

  // ── Table ─────────────────────────────────────────────
  const tableData = sortedSchedules.map(s => [
    s.courseCode,
    s.courseTitle,
    s.date,
    s.dayOfWeek || '',
    `${s.startTime} – ${s.endTime}`,
    s.faculty,
  ]);

  autoTable(doc, {
    startY: 79,
    head: [['Course Code', 'Course Title', 'Date', 'Day', 'Time', 'Faculty']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: emeraldDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 3.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: [30, 30, 30],
      cellPadding: 3,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: emeraldLight,
    },
    styles: {
      lineColor: emeraldMid,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 27, fontStyle: 'bold', textColor: emeraldDark },
      1: { cellWidth: 42 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22 },
      4: { cellWidth: 38 },
      5: { cellWidth: 35 },
    },
    margin: {
      left: (pageWidth - 190) / 2,
      right: (pageWidth - 190) / 2,
    },
  });

  // ── Footer credit (bottom of last page) ──────────────
  const finalY = (doc as any).lastAutoTable?.finalY ?? 150;
  const creditY = Math.max(finalY + 14, pageHeight - 22);

  // Thin rule above credit
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, creditY - 5, pageWidth - 15, creditY - 5);

  // "Developed by" label
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Developed by', pageWidth / 2, creditY, { align: 'center' });

  // Clickable name — rendered as styled text + link overlay
  const nameText = 'Shazzad Haque Prince';
  const nameY = creditY + 7;
  doc.setFontSize(11);
  doc.setTextColor(...emeraldDark);
  doc.setFont('helvetica', 'bold');
  doc.text(nameText, pageWidth / 2, nameY, { align: 'center' });

  // Underline the name
  const textWidth = doc.getTextWidth(nameText);
  const nameX = (pageWidth - textWidth) / 2;
  doc.setDrawColor(...emeraldDark);
  doc.setLineWidth(0.4);
  doc.line(nameX, nameY + 0.8, nameX + textWidth, nameY + 0.8);

  // Invisible clickable link overlay over the name
  doc.link(nameX, nameY - 5, textWidth, 7, {
    url: 'https://www.facebook.com/shazzad.hasan.22103361',
  });

  // SEU Exam Routine Finder label beneath
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.setFont('helvetica', 'normal');
  doc.text('SEU Exam Routine Finder · Southeast University', pageWidth / 2, nameY + 13, { align: 'center' });

  // ── Save ──────────────────────────────────────────────
  doc.save(`exam-schedule-${courseCode}.pdf`);
}