import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
    <Card className="overflow-hidden border-border bg-card/95 shadow-soft backdrop-blur">
      <CardHeader className="border-b border-border bg-muted/50 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Examination Schedule
          </p>
          <p className="text-[13px] font-medium text-muted-foreground">
            {sortedResults.length} {sortedResults.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-transparent hover:bg-transparent">
                <TableHead className="h-11 whitespace-nowrap px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Course
                </TableHead>
                <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Title
                </TableHead>
                <TableHead className="h-11 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Day
                </TableHead>
                <TableHead className="h-11 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Time
                </TableHead>
                <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Faculty
                </TableHead>
                <TableHead className="h-11 pr-5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.map((schedule, index) => (
                <TableRow
                  key={`${schedule.courseCode}-${index}`}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                >
                  <TableCell className="px-5 py-3.5">
                    <span className="whitespace-nowrap font-mono text-[13px] font-semibold text-primary">
                      {schedule.courseCode}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[220px] py-3.5 text-sm text-foreground">
                    <span title={schedule.courseTitle}>{schedule.courseTitle}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3.5 text-sm tabular-nums text-foreground">
                    {schedule.date}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3.5 text-sm text-muted-foreground">
                    {schedule.dayOfWeek}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3.5 text-sm tabular-nums text-foreground">
                    {schedule.startTime}
                    <span className="text-muted-foreground"> – {schedule.endTime}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate py-3.5 text-sm text-muted-foreground">
                    <span title={schedule.faculty}>{schedule.faculty}</span>
                  </TableCell>
                  <TableCell className="py-3.5 pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(schedule.courseCode)}
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
