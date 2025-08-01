import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDarkMode } from "@/hooks/use-dark-mode";

export function ThemeToggle() {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme, isDark } = useDarkMode();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="transition-all duration-200 hover:bg-accent"
        >
          {isDark ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">테마 변경</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={setLightTheme}
          className={`cursor-pointer ${theme === 'light' ? 'bg-accent' : ''}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>라이트</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={setDarkTheme}
          className={`cursor-pointer ${theme === 'dark' ? 'bg-accent' : ''}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>다크</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={setSystemTheme}
          className={`cursor-pointer ${theme === 'system' ? 'bg-accent' : ''}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>시스템</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 더 간단한 토글 버전 (단순 라이트/다크 전환)
export function SimpleThemeToggle() {
  const { isDark, setLightTheme, setDarkTheme } = useDarkMode();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={isDark ? setLightTheme : setDarkTheme}
      className="transition-all duration-200 hover:bg-accent"
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">테마 변경</span>
    </Button>
  );
}