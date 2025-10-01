import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, User, BookOpen } from "lucide-react";

interface ExamSchedule {
  courseCode: string;
  courseTitle: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  faculty: string;
}

interface ResultsTableProps {
  results: ExamSchedule[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) return null;

  // --- START: Fixed Sorting Logic Added Here ---
  // Helper function to convert DD.MM.YYYY string to YYYY-MM-DD string for reliable Date parsing
  const parseDateStringForSorting = (dateStr: string) => {
    // Assuming dateStr is in DD.MM.YYYY format (e.g., "11.10.2025")
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      // Reformat to YYYY-MM-DD: parts[2] (Year), parts[1] (Month), parts[0] (Day)
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    // Fallback for unexpected formats, though YYYY-MM-DD is preferred
    return dateStr;
  };

  // Create a sorted copy of the results array
  const sortedResults = [...results].sort((a, b) => {
    // Convert to ISO-like format (YYYY-MM-DD) before creating Date objects for accurate sorting
    const formattedDateA = parseDateStringForSorting(a.date);
    const formattedDateB = parseDateStringForSorting(b.date);

    const dateA = new Date(formattedDateA);
    const dateB = new Date(formattedDateB);

    // Sort in ascending order (earliest date first)
    return dateA.getTime() - dateB.getTime();
  });
  // --- END: Fixed Sorting Logic ---

  return (
    <Card className="overflow-hidden bg-card/60 backdrop-blur-md border border-border/50 shadow-soft hover:shadow-glow transition-all duration-300 animate-slide-up">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/20 hover:bg-transparent bg-gradient-to-r from-primary/5 to-accent/5">
              <TableHead className="font-bold text-primary h-14">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Code
                </div>
              </TableHead>
              <TableHead className="font-bold text-primary">Course Title</TableHead>
              <TableHead className="font-bold text-primary">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Exam Date
                </div>
              </TableHead>
              <TableHead className="font-bold text-primary">Day</TableHead>
              <TableHead className="font-bold text-primary">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time
                </div>
              </TableHead>
              <TableHead className="font-bold text-primary">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Faculty
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Use sortedResults for mapping */}
            {sortedResults.map((schedule, index) => (
              <TableRow 
                key={index} 
                className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-200 border-b border-border/30"
              >
                <TableCell className="font-bold text-accent">
                  <div className="flex items-center gap-2 py-2">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20 font-mono text-sm">
                      {schedule.courseCode}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs font-medium">
                  {schedule.courseTitle}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    {schedule.date}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-3 py-1.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-sm">
                    {schedule.dayOfWeek}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-foreground">{schedule.startTime}</span>
                    <span className="text-muted-foreground">to {schedule.endTime}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {schedule.faculty.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium">{schedule.faculty}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
