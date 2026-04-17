import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 w-full"
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 z-10 pointer-events-none" />
        <Input
          type="text"
          placeholder="Enter course code (e.g., CSE265.15)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 pr-5 h-14 text-base bg-card/80 dark:bg-card/60 backdrop-blur-md border-2 border-border/60 focus:border-primary focus:bg-card dark:focus:bg-card/80 transition-all duration-300 rounded-xl shadow-soft hover:shadow-glow placeholder:text-muted-foreground/50"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-14 px-8 text-base bg-gradient-primary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-glow rounded-xl font-semibold shrink-0"
      >
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
}