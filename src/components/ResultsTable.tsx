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
  onDelete: (courseCode: string) => void; // রিমুভ করার ফাংশন প্রপস হিসেবে নেওয়া হয়েছে
}

export function ResultsTable({ results, onDelete }: ResultsTableProps) {
  if (results.length === 0) return null;

  // তারিখ অনুযায়ী ছোট থেকে বড় ক্রমে সাজানোর লজিক
  const sortedResults = [...results].sort((a, b) => {
    const parseDateStringForSorting = (dateStr: string) => {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD ফরম্যাট
      }
      return dateStr;
    };

    const dateA = new Date(parseDateStringForSorting(a.date));
    const dateB = new Date(parseDateStringForSorting(b.date));
    return dateA.getTime() - dateB.getTime();
  });

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
                  Date
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
              {/* Action কলাম যোগ করা হয়েছে */}
              <TableHead className="font-bold text-primary text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((schedule, index) => (
              <TableRow 
                key={index} 
                className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-200 border-b border-border/30"
              >
                <TableCell className="font-bold text-accent">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20 font-mono text-sm">
                    {schedule.courseCode}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs font-medium">{schedule.courseTitle}</TableCell>
                <TableCell className="font-medium">{schedule.date}</TableCell>
                <TableCell>
                  <span className="px-3 py-1.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold">
                    {schedule.dayOfWeek}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-semibold">{schedule.startTime}</span>
                    <span className="text-muted-foreground">to {schedule.endTime}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{schedule.faculty}</span>
                </TableCell>
                {/* Delete Button cell */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(schedule.courseCode)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Remove Course"
                  >
                    <Trash2 className="h-5 w-5" />
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