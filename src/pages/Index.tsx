import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTable } from "@/components/ResultsTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ExamSchedule, parseExcelFile, searchByCourseCode } from "@/utils/excelParser";
import { generatePDF } from "@/utils/pdfGenerator";
import { Download, BookOpen, Search } from "lucide-react";
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
      const schedules = await parseExcelFile('/data/exam_routine.xlsx');
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
      title: "Course added ✓",
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
    /* h-screen + overflow-hidden = exact viewport fit, no page scroll */
    <div className="h-screen overflow-hidden flex flex-col">

      {/* Decorative Background Orbs — fixed so they don't affect layout */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-accent/15 to-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── Header ── compact, fixed height */}
      <header className="shrink-0 z-10 backdrop-blur-md bg-background/75 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="bg-white dark:bg-gray-800/80 p-1 rounded-lg shadow border border-border/30">
              <img src="/data/logo.png" alt="SEU Logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-primary leading-tight tracking-tight">
                SEU Exam Routine Finder
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">Southeast University</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main — flex-1 so it fills all remaining space, overflow-hidden to keep scroll inside */}
      <main className="relative z-10 flex-1 overflow-hidden flex flex-col container mx-auto px-4 sm:px-6 py-6">

        {/* Hero Section — compact */}
        <section className="text-center mb-5 animate-fade-in shrink-0">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/25 backdrop-blur-sm">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Academic Year 2025–26</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Find Your Exam Schedule
          </h2>

          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Search by course code to instantly find your exam dates, times, and faculty.
          </p>
        </section>

        {/* Search Bar — fixed height */}
        <div className="max-w-3xl mx-auto w-full mb-4 shrink-0">
          <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Example: <code className="bg-muted px-1 py-0.5 rounded font-mono">CSE265.15</code>
            {" "}or{" "}
            <code className="bg-muted px-1 py-0.5 rounded font-mono">ENG101.01</code>
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="inline-flex items-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              <p className="text-muted-foreground font-medium text-sm">Loading schedules...</p>
            </div>
          </div>
        )}

        {/* Results Section — flex-1 + overflow-y-auto = internal scroll only here */}
        {results.length > 0 && (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden animate-slide-up min-h-0">
            {/* Results toolbar */}
            <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card/70 dark:bg-card/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-border/60 shadow-soft">
              <div>
                <h3 className="text-base font-bold text-foreground">Your Exam Schedule</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {results.length} course{results.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={handleClearResults}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs hover:text-destructive hover:border-destructive/50 transition-colors"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  size="sm"
                  className="h-8 text-xs bg-gradient-primary hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md font-semibold"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Scrollable table area — only this scrolls */}
            <div className="flex-1 overflow-y-auto min-h-0 rounded-xl">
              <ResultsTable results={results} onDelete={handleDeleteCourse} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Search className="h-9 w-9 mb-2 opacity-25" />
            <p className="text-sm">Search a course code above to see exam schedules.</p>
          </div>
        )}
      </main>

      {/* ── Footer — compact, fixed at bottom */}
      <footer className="shrink-0 z-10 border-t border-border/50 bg-background/60 backdrop-blur-sm py-2.5">
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap overflow-hidden">
          © 2025 SEU Exam Routine Finder &nbsp;·&nbsp; Developed by{" "}
          <a
            href="https://www.facebook.com/shazzad.hasan.22103361"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary/80 hover:text-primary underline-offset-2 hover:underline transition-colors duration-200"
          >
            Shazzad Haque Prince
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;