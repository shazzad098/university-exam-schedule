import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, BookOpen, Trash2 } from "lucide-react";

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
  onDelete: (courseCode: string) => void;
}

export function ResultsTable({ results, onDelete }: ResultsTableProps) {
  if (results.length === 0) return null;

  const sortedResults = [...results].sort((a, b) => {
    const parseDateStringForSorting = (dateStr: string) => {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    };
    const dateA = new Date(parseDateStringForSorting(a.date));
    const dateB = new Date(parseDateStringForSorting(b.date));
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card className="overflow-hidden bg-card/70 dark:bg-card/60 backdrop-blur-md border border-border/60 shadow-soft hover:shadow-glow transition-shadow duration-300 animate-slide-up">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/20 hover:bg-transparent bg-gradient-to-r from-primary/5 to-accent/5">
              <TableHead className="font-bold text-primary h-12 text-xs uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Course Code
                </div>
              </TableHead>
              <TableHead className="font-bold text-primary text-xs uppercase tracking-wider">Course Title</TableHead>
              <TableHead className="font-bold text-primary text-xs uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
              </TableHead>
              <TableHead className="font-bold text-primary text-xs uppercase tracking-wider">Day</TableHead>
              <TableHead className="font-bold text-primary text-xs uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Time
                </div>
              </TableHead>
              <TableHead className="font-bold text-primary text-xs uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Faculty
                </div>
              </TableHead>
              <TableHead className="font-bold text-primary text-xs uppercase tracking-wider text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((schedule, index) => (
              <TableRow
                key={index}
                className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-150 border-b border-border/30 last:border-0"
              >
                <TableCell className="font-bold">
                  <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-lg border border-accent/25 font-mono text-xs">
                    {schedule.courseCode}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-sm max-w-[200px]">
                  <span title={schedule.courseTitle}>{schedule.courseTitle}</span>
                </TableCell>
                <TableCell className="font-medium text-sm whitespace-nowrap">{schedule.date}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 bg-gradient-primary text-primary-foreground rounded-lg text-xs font-semibold whitespace-nowrap">
                    {schedule.dayOfWeek}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm whitespace-nowrap">
                    <span className="font-semibold">{schedule.startTime}</span>
                    <span className="text-muted-foreground text-xs">to {schedule.endTime}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="font-medium">{schedule.faculty}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(schedule.courseCode)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                    title="Remove Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}