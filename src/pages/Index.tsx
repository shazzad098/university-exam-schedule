import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTable } from "@/components/ResultsTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExamSchedule, parseExcelFile, searchByCourseCode } from "@/utils/excelParser";
import { generatePDF } from "@/utils/pdfGenerator";
import {
  Download,
  Search,
  FileText,
  CalendarDays,
  ShieldCheck,
  BookOpen,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allSchedules, setAllSchedules] = useState<ExamSchedule[]>([]);
  const [results, setResults] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExcelData();
  }, []);

  const loadExcelData = async () => {
    try {
      setIsLoading(true);
      const schedules = await parseExcelFile('/data/exam_routine.xls');
      setAllSchedules(schedules);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();

    if (!trimmedSearchTerm) {
      toast({
        title: "Please enter a course code",
        description: "Enter a course code to search for exam schedules.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) {
      toast({
        title: "Loading data",
        description: "Please wait while we load the exam schedules.",
      });
      return;
    }

    const searchResults = searchByCourseCode(allSchedules, trimmedSearchTerm);

    if (searchResults.length === 0) {
      toast({
        title: "No results found",
        description: `No exam schedules found for "${trimmedSearchTerm}".`,
        variant: "destructive",
      });
      return;
    }

    const existingCodes = results.map(r => r.courseCode.toLowerCase());
    const newResults = searchResults.filter(
      r => !existingCodes.includes(r.courseCode.toLowerCase())
    );

    if (newResults.length === 0) {
      toast({
        title: "Already added",
        description: `"${trimmedSearchTerm}" is already in your results.`,
      });
      setSearchTerm("");
      return;
    }

    setResults([...results, ...newResults]);
    setSearchTerm("");

    toast({
      title: "Course added",
      description: `Added ${newResults.length} exam schedule(s).`,
    });
  };

  const handleDeleteCourse = (courseCode: string) => {
    setResults(results.filter(r => r.courseCode !== courseCode));
    toast({
      title: "Course removed",
      description: `${courseCode} has been removed from your list.`,
    });
  };

  const handleClearResults = () => {
    setResults([]);
    toast({
      title: "Results cleared",
      description: "All exam schedules removed.",
    });
  };

  const handleDownloadPDF = () => {
    if (results.length === 0) {
      toast({
        title: "No data to download",
        description: "Please search for a course code first.",
        variant: "destructive",
      });
      return;
    }

    const courseCodes = [...new Set(results.map(r => r.courseCode))].join('-');
    generatePDF(results, courseCodes);
    toast({
      title: "PDF downloaded",
      description: "Your exam schedule has been downloaded.",
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Campus background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <img src="/seu.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-[1px] dark:bg-background/88" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-background/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Top utility bar */}
      <div className="relative z-10 border-b border-border/70 bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-1.5 text-[12px] sm:px-6">
          <p className="font-medium tracking-wide opacity-90">
            Southeast University &middot; Office of the Controller of Examinations
          </p>
          <p className="hidden font-medium opacity-90 sm:block">Final Exam &middot; Summer 2026</p>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-1">
              <img src="/data/logo.png" alt="SEU Logo" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Southeast University
              </p>
              <h1 className="font-serif-display text-[19px] font-bold leading-tight text-foreground">
                Exam Routine Finder
              </h1>
            </div>
          </a>
          <div className="flex items-center gap-2">
            {!isLoading && allSchedules.length > 0 && (
              <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {allSchedules.length} exams loaded
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-10 sm:px-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-soft backdrop-blur-md">
          <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_80%_at_50%_0%,black,transparent)]" />
          <div className="relative px-6 py-10 text-center sm:px-12 sm:py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Official Exam Routine &middot; Final Exam &middot; Summer 2026
            </span>
            <h2 className="font-serif-display mx-auto mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Find your exam schedule by course code
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Search any course code to view exam dates, times, and faculty assignments.
              Add multiple courses and export a clean PDF for your records.
            </p>

            <div className="mx-auto mt-7 max-w-2xl">
              <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Try:</span>
                {["CSE1201.7", "CSE161.1", "MAT141.1"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setSearchTerm(code);
                    }}
                    className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-14">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-soft">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              <p className="text-sm text-muted-foreground">Loading official exam routine&hellip;</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <section className="mt-8 space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">Your Exam Schedule</h3>
                  <p className="text-[13px] text-muted-foreground">
                    {results.length} course{results.length !== 1 ? "s" : ""} selected &middot; sorted by date
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  onClick={handleClearResults}
                  variant="outline"
                  size="sm"
                  className="font-medium"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Clear
                </Button>
                <Button onClick={handleDownloadPDF} size="sm" className="font-semibold">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export PDF
                </Button>
              </div>
            </div>
            <ResultsTable results={results} onDelete={handleDeleteCourse} />
          </section>
        )}

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <section className="mt-8">
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/80 px-6 py-12 text-center backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                No courses added yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Search a course code above. Each result is added to your list below for review and PDF export.
              </p>
            </div>

            {/* How it works */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "1. Search",
                  text: "Enter a course code such as CSE1201.7",
                },
                {
                  icon: FileText,
                  title: "2. Review",
                  text: "Verify date, time slot, and faculty",
                },
                {
                  icon: Download,
                  title: "3. Export",
                  text: "Download a formatted PDF schedule",
                },
              ].map((step) => (
                <Card key={step.title} className="border-border bg-card/90 p-4 shadow-soft backdrop-blur">
                  <step.icon className="h-5 w-5 text-primary" />
                  <p className="mt-2.5 text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/70 bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              Southeast University &middot; Exam Routine Finder
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Final Exam Schedule, Summer 2026. Always confirm with your department.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Developed by{" "}
            <a
              href="https://www.facebook.com/shazzad.hasan.22103361"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Shazzad Haque Prince
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
