import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTable } from "@/components/ResultsTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ExamSchedule, parseExcelFile, searchByCourseCode } from "@/utils/excelParser";
import { generatePDF } from "@/utils/pdfGenerator";
import { Download, GraduationCap } from "lucide-react";
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
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a course code",
        description: "Enter a course code to search for exam schedules.",
        variant: "destructive",
      });
      return;
    }

    const searchResults = searchByCourseCode(allSchedules, searchTerm);

    // Check if course already exists in results
    const existingCodes = results.map(r => r.courseCode.toLowerCase());
    const newResults = searchResults.filter(
      r => !existingCodes.includes(r.courseCode.toLowerCase())
    );

    if (newResults.length === 0 && searchResults.length > 0) {
      toast({
        title: "Already added",
        description: `"${searchTerm}" is already in your results.`,
      });
      return;
    }

    if (searchResults.length === 0) {
      toast({
        title: "No results found",
        description: `No exam schedules found for "${searchTerm}".`,
      });
      return;
    }

    // Add to existing results instead of replacing
    setResults([...results, ...newResults]);
    setSearchTerm(""); // Clear search after adding

    toast({
      title: "Course added",
      description: `Added ${newResults.length} exam schedule(s).`,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

        {/* Floating icons */}
        <div className="absolute top-20 left-1/4 opacity-20 animate-float" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>
          <GraduationCap className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute bottom-32 right-1/3 opacity-20 animate-float" style={{ animationDelay: '1.5s', animationDuration: '5s' }}>
          <GraduationCap className="h-16 w-16 text-accent" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-50 animate-pulse" />
              <div className="relative bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg">
                <img 
                  src="/data/logo.png" 
                  alt="Southeast University Logo" 
                  className="h-12 w-12 object-contain"

                />
                <div className="hidden items-center justify-center h-12 w-12">
                  <GraduationCap className="h-8 w-8 text-violet-600" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                SEU Exam Routine Finder
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Southeast University</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 animate-slide-up">
            <span className="text-sm font-medium text-primary">📚 Academic Year 2024-25</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight animate-gradient bg-[length:200%_auto]">
            Find Your Exam Schedule
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
            Search for your exam routine by entering your course code. Get instant access to exam dates, times, and faculty information.
          </p>
          <div className="flex sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="font-medium">Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="font-medium">PDF Download</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="font-medium">Multi-Course Support</span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-16 animate-slide-up">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-20 animate-pulse" />
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-soft">
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                  Your Exam Schedule
                  <span className="ml-2 inline-flex items-center gap-2 px-2 py-1 bg-gradient-primary rounded-full text-xs sm:text-sm text-primary-foreground">
                    {results.length} course{results.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">Review your upcoming exams and download as PDF</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleClearResults}
                  variant="outline"
                  className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  className="gap-2 bg-gradient-primary hover:opacity-90 shadow-glow transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
            <ResultsTable results={results} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading exam schedules...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !searchTerm && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-card/30 backdrop-blur-sm rounded-3xl p-16 max-w-2xl mx-auto border border-border/50 shadow-soft">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-primary p-6 rounded-2xl">
                  <GraduationCap className="h-16 w-16 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                Ready to Find Your Exams?
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6">
                Enter your course code above to get started
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="px-4 py-2 bg-primary/10 rounded-full text-sm text-primary border border-primary/20">CSE265.15</span>
                <span className="px-4 py-2 bg-accent/10 rounded-full text-sm text-accent border border-accent/20">ENG101.01</span>
                <span className="px-4 py-2 bg-primary/10 rounded-full text-sm text-primary border border-primary/20">MAT201.03</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-sm border-t border-border/50 mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-muted-foreground text-sm">
              © 2025 Exam Routine Finder. <br />
              Developed by{" "}
              <a
                href="https://www.facebook.com/shazzad.hasan.22103361"
                target="_blank"
                rel="noopener noreferrer"
                className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:from-violet-600 hover:to-purple-700 transition-all duration-300 cursor-pointer"
              >
                Shazzad Haque Prince
              </a>
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>Helping students plan their exams efficiently</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
