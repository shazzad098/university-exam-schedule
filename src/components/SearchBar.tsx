import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder="Enter course code (e.g., CSE265.15, ENG101.01)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-14 pr-6 h-16 text-lg bg-card/80 backdrop-blur-md border-2 border-border/50 focus:border-primary focus:bg-card transition-all duration-300 rounded-xl shadow-soft hover:shadow-glow"
        />
      </div>
      <Button 
        onClick={onSearch}
        size="lg"
        className="h-16 px-10 text-lg bg-gradient-primary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-glow rounded-xl font-semibold"
      >
        Search
      </Button>
    </div>
  );
}
