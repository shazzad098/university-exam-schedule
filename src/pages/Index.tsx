import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTable } from "@/components/ResultsTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ExamSchedule, parseExcelFile, searchByCourseCode } from "@/utils/excelParser";
import { generatePDF } from "@/utils/pdfGenerator";
import { Download, GraduationCap, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allSchedules, setAllSchedules] = useState<ExamSchedule[]>([]);
  const [results, setResults] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ডাটা লোড করা
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

  // সার্চ হ্যান্ডলার
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

    // ডুপ্লিকেট কোর্স চেক করা
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

    // রেজাল্টে নতুন কোর্স যোগ করা
    setResults([...results, ...newResults]);
    setSearchTerm("");

    toast({
      title: "Course added ✓",
      description: `Added ${newResults.length} exam schedule(s).`,
    });
  };

  // নির্দিষ্ট কোর্স রিমুভ করার ফাংশন
  const handleDeleteCourse = (courseCode: string) => {
    setResults(results.filter(r => r.courseCode !== courseCode));
    toast({
      title: "Course removed",
      description: `${courseCode} has been removed from your list.`,
    });
  };

  // সব রেজাল্ট ক্লিয়ার করা
  const handleClearResults = () => {
    setResults([]);
    toast({
      title: "Results cleared",
      description: "All exam schedules removed.",
    });
  };

  // PDF ডাউনলোড হ্যান্ডলার
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
      {/* Campus background image with readability overlay */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <img src="/seu.jpg" alt="SEU Campus" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/90" />
      </div>

      {/* Header */}
      <header className="relative z-10 shrink-0 border-b border-white/10 bg-background/55 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 p-1 shadow-lg ring-1 ring-border/40 dark:bg-gray-800">
              <img src="/data/logo.png" alt="SEU Logo" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Southeast University
              </p>
              <h1 className="text-lg font-extrabold tracking-tight">Exam Routine Finder</h1>
            </div>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        {/* Hero */}
        <section className="mb-8 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur">
            <GraduationCap className="h-4 w-4" />
            Academic Year 2025–26
          </span>
          <h2 className="mt-5 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
            Find Your Exam Schedule
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Enter any course code to instantly view your exam dates, times and faculty — all in one place.
          </p>
        </section>

        {/* Search */}
        <div className="mb-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Try: <code className="rounded bg-card/70 px-1.5 py-0.5 font-mono text-primary">CSE1201.7</code>
            <span className="mx-1">or</span>
            <code className="rounded bg-card/70 px-1.5 py-0.5 font-mono text-primary">CSE161.1</code>
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              <p className="text-sm text-muted-foreground">Loading schedules...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="animate-slide-up space-y-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/70 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h3 className="text-lg font-bold">Your Exam Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  {results.length} course{results.length !== 1 ? "s" : ""} selected
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Button
                  onClick={handleClearResults}
                  variant="outline"
                  className="hover:border-destructive/40 hover:text-destructive"
                >
                  Clear All
                </Button>
                <Button onClick={handleDownloadPDF} className="bg-gradient-primary shadow-glow hover:opacity-90">
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>
            <ResultsTable results={results} onDelete={handleDeleteCourse} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-card/60 backdrop-blur">
              <Search className="h-7 w-7 opacity-40" />
            </div>
            <p className="text-sm">Search a course code above to see exam schedules.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 shrink-0 border-t border-white/10 bg-background/55 py-5 backdrop-blur-lg">
        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          © 2025 SEU Exam Routine Finder &nbsp;·&nbsp; Developed by{" "}
          <a
            href="https://www.facebook.com/shazzad.hasan.22103361"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary/90 underline-offset-2 hover:underline"
          >
            Shazzad Haque Prince
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;