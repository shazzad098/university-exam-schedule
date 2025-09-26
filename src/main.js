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

// FIXED PDF generation function - only captures table, excludes buttons
async function downloadPdf() {
  if (
    timetableContainer.classList.contains("hidden") ||
    timetableBody.children.length === 0
  ) {
    alert(
      "Please generate a timetable first before trying to download the PDF."
    );
    return;
  }

  try {
    console.log("Starting PDF generation...");

    // Show loading state
    downloadPdfBtn.textContent = "Generating PDF...";
    downloadPdfBtn.disabled = true;

    // Get only the table wrapper div (excluding buttons)
    const tableWrapper = timetableContainer.querySelector(".overflow-x-auto");

    // Create a container for PDF with title
    const pdfContainer = document.createElement("div");
    pdfContainer.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  // FIX: এই তিনটি লাইন PDF কন্টেন্ট ক্যাপচার নিশ্চিত করবে
  opacity: 0; 
  z-index: -1000; 
  transform: translate3d(20000px, 0, 0); // এলিমেন্টকে ২০০০০ পিক্সেল ডানে সরিয়ে দিন

  width: 800px;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #000000;
  padding: 20px;
`;

    // Add title
    const title = document.createElement("h1");
    title.textContent = "University Exam Schedule";
    title.style.cssText = `
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #1f2937;
    `;

    // Clone only the table part
    const tableClone = tableWrapper.cloneNode(true);

    // Apply safe inline styles to the table
    const table = tableClone.querySelector("table");
    if (table) {
      table.style.cssText = `
        width: 100%;
        background-color: #ffffff;
        border-collapse: collapse;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
    }

    const thead = tableClone.querySelector("thead");
    if (thead) {
      thead.style.cssText = `
        background-color: #1f2937;
        color: #ffffff;
      `;
    }

    const thElements = tableClone.querySelectorAll("th");
    thElements.forEach((th) => {
      th.style.cssText = `
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        background-color: #1f2937;
        color: #ffffff;
        border: none;
      `;
    });

    const tbody = tableClone.querySelector("tbody");
    if (tbody) {
      tbody.style.cssText = `
        background-color: #ffffff;
      `;
    }

    const tdElements = tableClone.querySelectorAll("td");
    tdElements.forEach((td, index) => {
      const row = Math.floor(index / 5);
      const isEvenRow = row % 2 === 0;

      td.style.cssText = `
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        background-color: ${isEvenRow ? "#ffffff" : "#f9fafb"};
        color: #374151;
      `;

      if (td.classList.contains("font-medium")) {
        td.style.fontWeight = "600";
      }
    });

    // Assemble the PDF content
    pdfContainer.appendChild(title);
    pdfContainer.appendChild(tableClone);

    document.body.appendChild(pdfContainer);

    // Use html2canvas with minimal options to avoid color parsing issues
    const canvas = await html2canvas(pdfContainer, {
      backgroundColor: "#ffffff",
      scale: 1.0,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: 800,
      height: pdfContainer.scrollHeight,
      foreignObjectRendering: true,
      ignoreElements: function (element) {
        // Ignore any elements that might cause issues
        return element.tagName === "SCRIPT" || element.tagName === "STYLE";
      },
    });

    // Remove the temporary container
    document.body.removeChild(pdfContainer);

    console.log("Canvas created successfully");

    const imgData = canvas.toDataURL("image/png", 0.95);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const aspectRatio = canvasHeight / canvasWidth;
    const imgWidth = pdfWidth - 20;
    const imgHeight = imgWidth * aspectRatio;

    let heightLeft = imgHeight;
    let position = 10;

    // Add first page
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position -= pageHeight - 20;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `exam-timetable-${currentDate}.pdf`;

    pdf.save(filename);
    console.log("PDF saved successfully");
  } catch (error) {
    console.error("Detailed PDF generation error:", error);
    alert(
      `Error generating PDF: ${error.message}. Please try again or check the browser console for details.`
    );
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
