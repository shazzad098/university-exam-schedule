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

  // ডাটা লোড করা
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Background Orbs & Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="relative bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg">
              <img src="/data/logo.png" alt="SEU Logo" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                SEU Exam Routine Finder
              </h1>
              <p className="text-xs text-muted-foreground">Southeast University</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-sm font-medium text-primary">📚 Academic Year 2024-25</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Find Your Exam Schedule
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Search by course code to get instant access to your exam dates and times.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-16">
          <SearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
              <div>
                <h3 className="text-xl font-bold">Your Exam Schedule</h3>
                <p className="text-sm text-muted-foreground">Total {results.length} course(s) selected</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleClearResults} variant="outline" className="hover:text-destructive">
                  Clear All
                </Button>
                <Button onClick={handleDownloadPDF} className="bg-gradient-primary">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>
            </div>
            {/* onDelete প্রপসটি পাস করা হয়েছে */}
            <ResultsTable results={results} onDelete={handleDeleteCourse} />
          </div>
        )}

        {/* Loading & Empty States */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading schedules...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 mt-auto">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 SEU Exam Routine Finder | Developed by Shazzad Haque Prince
        </p>
      </footer>
    </div>
  );
};

export default Index;