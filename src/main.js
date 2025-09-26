import "./style.css";

// Import libraries
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Global variables
let examData = [];
let selectedCourses = [];

// DOM elements
const uploadMessage = document.getElementById("upload-message");
const courseInput = document.getElementById("course-input");
const addCourseBtn = document.getElementById("add-course");
const courseList = document.getElementById("course-list");
const inputMessage = document.getElementById("input-message");
const generateTimetableBtn = document.getElementById("generate-timetable");
const timetableContainer = document.getElementById("timetable-container");
const timetableBody = document.getElementById("timetable-body");
const downloadPdfBtn = document.getElementById("download-pdf");
const resetAllBtn = document.getElementById("reset-all");

// Event listeners
addCourseBtn.addEventListener("click", addCourse);
courseInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") addCourse();
});
generateTimetableBtn.addEventListener("click", generateTimetable);
downloadPdfBtn.addEventListener("click", downloadPdf);
resetAllBtn.addEventListener("click", resetAll);

// Load Excel data when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadExcelData();
});

// Load Excel data from public folder - FIXED PATH
async function loadExcelData() {
  try {
    // Fixed the path to include 'public' folder
    const response = await fetch(
      "/public/Final_Summer_2025_Final_Exam_Routine.xlsx"
    );

    if (!response.ok) {
      throw new Error("Excel file not found");
    }

    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: "MM/DD/YYYY",
    });

    if (jsonData.length === 0) {
      showMessage(
        uploadMessage,
        "Excel file is empty or format is incorrect",
        "error"
      );
      return;
    }

    examData = jsonData;
    console.log("Excel file loaded. First row:", jsonData[0]);
    console.log("All column names:", Object.keys(jsonData[0]));
    showMessage(uploadMessage, "Exam schedule loaded successfully!", "success");
    generateTimetableBtn.classList.remove("hidden");
  } catch (error) {
    console.error("Error loading Excel file:", error);
    showMessage(
      uploadMessage,
      "Error loading exam schedule. Using sample data instead.",
      "error"
    );
    loadSampleData();
  }
}

// Fallback sample data
function loadSampleData() {
  examData = [
    {
      "Course Code": "CSE261.3",
      "Exam Date": "11/10/2025",
      "Starting Time": "09:00 AM",
      "Ending Time": "12:00 PM",
      Faculty: "[TMD] Tashreef Muhammad",
    },
    {
      "Course Code": "EEE241.5",
      "Exam Date": "7/10/2025",
      "Starting Time": "02:00 PM",
      "Ending Time": "05:00 PM",
      Faculty: "[ADMR] Adib Md. Ridwan",
    },
  ];
  generateTimetableBtn.classList.remove("hidden");
}

// Add course to the list
function addCourse() {
  const courseCode = courseInput.value.trim().toUpperCase();

  if (!courseCode) {
    showMessage(inputMessage, "Please enter a course code", "error");
    return;
  }

  if (selectedCourses.includes(courseCode)) {
    showMessage(inputMessage, "Course already added", "error");
    return;
  }

  selectedCourses.push(courseCode);

  const chip = document.createElement("div");
  chip.className = "course-chip";
  chip.innerHTML = `
        ${courseCode}
        <span onclick="removeCourse('${courseCode}')">×</span>
    `;

  courseList.appendChild(chip);
  courseInput.value = "";
  showMessage(inputMessage, "", "success");
  generateTimetable();
}

// Remove course from the list
window.removeCourse = function (courseCode) {
  selectedCourses = selectedCourses.filter((course) => course !== courseCode);
  const chips = courseList.getElementsByClassName("course-chip");
  for (let chip of chips) {
    if (chip.textContent.includes(courseCode)) {
      chip.remove();
      break;
    }
  }
  generateTimetable();
};

// Generate timetable based on selected courses
function generateTimetable() {
  if (selectedCourses.length === 0) {
    timetableContainer.classList.add("hidden");
    return;
  }

  if (examData.length === 0) {
    showMessage(uploadMessage, "Exam schedule data not loaded", "error");
    return;
  }

  timetableBody.innerHTML = "";
  let foundCourses = [];

  selectedCourses.forEach((courseCode) => {
    const course = examData.find((item) => {
      const itemCourseCode = getColumnValue(item, [
        "Course Code",
        "CourseCode",
        "Course",
        "COURSE CODE",
        "COURSE",
        "course code",
        "course",
        "Subject Code",
        "Subject",
      ]);
      return (
        itemCourseCode && itemCourseCode.toString().toUpperCase() === courseCode
      );
    });

    if (course) {
      foundCourses.push(course);
    }
  });

  foundCourses.sort((a, b) => {
    const dateA = parseDate(
      getColumnValue(a, ["Exam Date", "ExamDate", "Date", "DATE", "Exam_Date"])
    );
    const dateB = parseDate(
      getColumnValue(b, ["Exam Date", "ExamDate", "Date", "DATE", "Exam_Date"])
    );
    return dateA - dateB;
  });

  foundCourses.forEach((course) => {
    const row = document.createElement("tr");

    const code =
      getColumnValue(course, [
        "Course Code",
        "CourseCode",
        "Course",
        "COURSE CODE",
        "COURSE",
        "Subject Code",
        "Subject",
      ]) || "N/A";
    const title =
      getColumnValue(course, [
        "Course Title",
        "CourseTitle",
        "Course Name",
        "Subject Title",
      ]) || "N/A";
    const date = formatDisplayDate(
      getColumnValue(course, [
        "Exam Date",
        "ExamDate",
        "Date",
        "DATE",
        "Exam_Date",
      ])
    );
    const startTime =
      formatExcelTime(
        getColumnValue(course, [
          "Starting Time",
          "StartTime",
          "Start Time",
          "Start",
          "Time",
          "Exam Time",
          "ExamTime",
        ])
      ) || "N/A";
    const endTime =
      formatExcelTime(
        getColumnValue(course, ["Ending Time", "EndTime", "End Time", "End"])
      ) || "N/A";
    const faculty =
      getColumnValue(course, [
        "Faculty",
        "FACULTY",
        "Teacher",
        "Instructor",
        "Professor",
      ]) || "N/A";

    row.innerHTML = `
        <td class="py-3 px-4 font-medium">${code}</td>
        <td class="py-3 px-4">${title}</td> 
        <td class="py-3 px-4">${date}</td>
        <td class="py-3 px-4">${startTime} - ${endTime}</td>
        <td class="py-3 px-4">${faculty}</td>
    `;
    timetableBody.appendChild(row);
  });

  if (foundCourses.length > 0) {
    timetableContainer.classList.remove("hidden");
    showMessage(
      inputMessage,
      `Found ${foundCourses.length} of ${selectedCourses.length} courses`,
      "success"
    );
  } else {
    timetableContainer.classList.add("hidden");
    showMessage(inputMessage, "No matching courses found", "error");
  }
}

// Helper function to get value from multiple possible column names
function getColumnValue(obj, possibleKeys) {
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return null;
}

// Format Excel time (decimal or 24hr string) to readable 12-hour time with AM/PM
function formatExcelTime(timeValue) {
  if (!timeValue || timeValue === "N/A") return "N/A";

  if (
    typeof timeValue === "string" &&
    (timeValue.toUpperCase().includes("AM") ||
      timeValue.toUpperCase().includes("PM"))
  ) {
    return timeValue;
  }

  let hours24 = 0;
  let minutes = 0;

  if (typeof timeValue === "number") {
    const totalMinutes = Math.round(timeValue * 24 * 60);
    hours24 = Math.floor(totalMinutes / 60);
    minutes = totalMinutes % 60;
  } else if (typeof timeValue === "string" && timeValue.includes(":")) {
    const parts = timeValue.split(":");
    hours24 = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
  } else {
    return timeValue.toString();
  }

  if (isNaN(hours24) || isNaN(minutes)) {
    return timeValue.toString();
  }

  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) {
    hours12 = 12;
  }

  const formattedHours = hours12.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${period}`;
}

// More robust date parsing function
function parseDate(dateValue) {
  if (!dateValue) return new Date(NaN);

  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === "number" && dateValue > 0) {
    const utc_days = Math.floor(dateValue - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(
      date_info.getTime() + date_info.getTimezoneOffset() * 60 * 1000
    );
  }

  if (typeof dateValue === "string") {
    const formattedString = dateValue.replace(/[\.-]/g, "/");
    const parts = formattedString.split("/");

    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const fullYear = year < 100 ? 2000 + year : year;
        return new Date(fullYear, month - 1, day);
      }
    }
  }

  return new Date(NaN);
}

// Format date for display as DD/MM/YYYY
function formatDisplayDate(dateValue) {
  if (!dateValue || dateValue === "N/A") return "N/A";

  const date = parseDate(dateValue);
  if (isNaN(date.getTime())) {
    return dateValue.toString();
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Alternative: Manual PDF generation without autoTable
// Fixed PDF download function with proper table rendering
async function downloadPdf() {
  if (
    timetableContainer.classList.contains("hidden") ||
    timetableBody.children.length === 0
  ) {
    alert("Please generate a timetable first before trying to download the PDF.");
    return;
  }

  try {
    // Update button to show loading state
    downloadPdfBtn.textContent = "Generating PDF...";
    downloadPdfBtn.disabled = true;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add title with better styling
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = "University Exam Schedule";
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(title, titleX, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date().toLocaleDateString('en-GB');
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    // Table configuration
    const startY = 40;
    const rowHeight = 8;
    const headers = ["Course Code", "Course Title", "Date", "Time", "Faculty"];
    const colWidths = [40, 70, 30, 50, 70]; // Better proportions
    let currentY = startY;

    // Calculate table width and starting X position for centering
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const startX = (doc.internal.pageSize.width - tableWidth) / 2;

    // Draw table border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    // Draw header row
    let currentX = startX;
    
    // Header background
    doc.setFillColor(52, 73, 94); // Dark blue-gray
    doc.rect(startX, currentY, tableWidth, rowHeight, "F");
    
    // Header borders
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    
    // Draw vertical lines for header
    currentX = startX;
    for (let i = 0; i <= headers.length; i++) {
      doc.line(currentX, currentY, currentX, currentY + rowHeight);
      if (i < headers.length) {
        currentX += colWidths[i];
      }
    }
    
    // Draw horizontal lines for header
    doc.line(startX, currentY, startX + tableWidth, currentY);
    doc.line(startX, currentY + rowHeight, startX + tableWidth, currentY + rowHeight);

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    
    currentX = startX;
    headers.forEach((header, index) => {
      const textX = currentX + (colWidths[index] / 2);
      const textY = currentY + (rowHeight / 2) + 2;
      doc.text(header, textX, textY, { align: 'center' });
      currentX += colWidths[index];
    });

    currentY += rowHeight;

    // Reset styles for body
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);

    // Draw data rows
    const maxPageHeight = 200; // Leave space for margins

    for (let i = 0; i < timetableBody.children.length; i++) {
      const row = timetableBody.children[i];
      
      // Check if we need a new page
      if (currentY > maxPageHeight) {
        doc.addPage();
        currentY = 20;
        
        // Redraw header on new page
        currentX = startX;
        doc.setFillColor(52, 73, 94);
        doc.rect(startX, currentY, tableWidth, rowHeight, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        
        currentX = startX;
        headers.forEach((header, index) => {
          const textX = currentX + (colWidths[index] / 2);
          const textY = currentY + (rowHeight / 2) + 2;
          doc.text(header, textX, textY, { align: 'center' });
          currentX += colWidths[index];
        });
        
        // Draw header borders
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        currentX = startX;
        for (let j = 0; j <= headers.length; j++) {
          doc.line(currentX, currentY, currentX, currentY + rowHeight);
          if (j < headers.length) {
            currentX += colWidths[j];
          }
        }
        doc.line(startX, currentY, startX + tableWidth, currentY);
        doc.line(startX, currentY + rowHeight, startX + tableWidth, currentY + rowHeight);
        
        currentY += rowHeight;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
      }
      
      // Alternate row background
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 250); // Very light gray
        doc.rect(startX, currentY, tableWidth, rowHeight, "F");
      }
      
      // Draw cell borders
      currentX = startX;
      for (let j = 0; j <= colWidths.length; j++) {
        doc.line(currentX, currentY, currentX, currentY + rowHeight);
        if (j < colWidths.length) {
          currentX += colWidths[j];
        }
      }
      doc.line(startX, currentY, startX + tableWidth, currentY);
      doc.line(startX, currentY + rowHeight, startX + tableWidth, currentY + rowHeight);
      
      // Add cell data
      currentX = startX;
      for (let j = 0; j < row.children.length && j < colWidths.length; j++) {
        const cellText = row.children[j].textContent.trim();
        const cellWidth = colWidths[j];
        
        // Handle long text by truncating if necessary
        const maxTextWidth = cellWidth - 4; // Leave padding
        let displayText = cellText;
        
        // Check if text fits, if not truncate
        const textWidth = doc.getStringUnitWidth(displayText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        if (textWidth > maxTextWidth) {
          // Truncate text and add ellipsis
          while (doc.getStringUnitWidth(displayText + "...") * doc.internal.getFontSize() / doc.internal.scaleFactor > maxTextWidth && displayText.length > 0) {
            displayText = displayText.slice(0, -1);
          }
          displayText += "...";
        }
        
        const textX = currentX + 2; // Left padding
        const textY = currentY + (rowHeight / 2) + 2;
        doc.text(displayText, textX, textY);
        
        currentX += cellWidth;
      }
      
      currentY += rowHeight;
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    // Generate filename with current date
    const filename = `exam-timetable-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
    
    // Show success message
    showMessage(inputMessage, "PDF downloaded successfully!", "success");

  } catch (error) {
    console.error("PDF generation error:", error);
    alert("Error generating PDF. Please try again.");
    showMessage(inputMessage, "Error generating PDF", "error");
  } finally {
    // Reset button state
    downloadPdfBtn.textContent = "Download as PDF";
    downloadPdfBtn.disabled = false;
  }
}

// Reset everything
function resetAll() {
  selectedCourses = [];
  courseInput.value = "";
  courseList.innerHTML = "";
  timetableBody.innerHTML = "";
  timetableContainer.classList.add("hidden");
  showMessage(inputMessage, "", "success");
}

// Utility function to show messages
function showMessage(element, message, type) {
  if (!message) {
    element.classList.add("hidden");
    return;
  }

  element.textContent = message;
  element.className = "message";
  element.classList.add(type);
  element.classList.remove("hidden");

  if (type === "success") {
    setTimeout(() => {
      element.classList.add("hidden");
    }, 3000);
  }
}
