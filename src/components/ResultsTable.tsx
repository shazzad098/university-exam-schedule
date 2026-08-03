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

  // তারিখ অনুযায়ী ছোট থেকে বড় ক্রমে সাজানো
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
    <Card className="overflow-hidden rounded-2xl border border-white/10 bg-card/70 shadow-soft backdrop-blur-md transition-shadow duration-300 hover:shadow-glow animate-slide-up">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 hover:bg-transparent">
              <TableHead className="h-12 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-primary">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Course Code
                </div>
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-primary">Course Title</TableHead>
              <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-primary">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-primary">Day</TableHead>
              <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-primary">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Time
                </div>
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-primary">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Faculty
                </div>
              </TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-primary">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((schedule, index) => (
              <TableRow
                key={index}
                className="border-b border-border/30 transition-colors duration-150 hover:bg-primary/5 last:border-0 dark:hover:bg-primary/10"
              >
                <TableCell className="font-bold">
                  <span className="rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent">
                    {schedule.courseCode}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] text-sm font-medium">
                  <span title={schedule.courseTitle}>{schedule.courseTitle}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm font-medium">{schedule.date}</TableCell>
                <TableCell>
                  <span className="whitespace-nowrap rounded-lg bg-gradient-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    {schedule.dayOfWeek}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="whitespace-nowrap text-sm">
                    <span className="font-semibold">{schedule.startTime}</span>
                    <span className="text-xs text-muted-foreground"> to {schedule.endTime}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">{schedule.faculty}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(schedule.courseCode)}
                    className="h-8 w-8 rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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