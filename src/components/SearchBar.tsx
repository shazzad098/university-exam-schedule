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
    <form onSubmit={handleSubmit} className="relative z-10 flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
        <Input
          type="text"
          placeholder="Enter course code (e.g., CSE1201.7)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 rounded-xl border-2 border-border/50 bg-card/80 pl-12 pr-5 text-base shadow-soft backdrop-blur-md transition-all duration-300 hover:shadow-glow focus:border-primary focus:bg-card"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-14 shrink-0 rounded-xl bg-gradient-primary px-8 text-base font-semibold shadow-glow transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
      >
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}