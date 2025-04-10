import { Moon, Sun } from 'lucide-react'
import { type Theme, useTheme } from '~/renderer/components/theme-provider'
import { Button } from '~/renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/renderer/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/renderer/components/ui/tooltip'

const THEME_DISPLAY_NAME_LOOKUP_TABLE = {
  light: '淺色模式',
  dark: '深色模式',
  system: '系統預設',
} as const satisfies Record<Theme, string>

const THEMES = Object.keys(THEME_DISPLAY_NAME_LOOKUP_TABLE) as Theme[]

export function ModeToggle() {
  const { theme: currentTheme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="bottom" align="end">
            <div className="flex flex-col items-center justify-center gap-y-1">
              <p>切換淺色模式 / 深色模式</p>
              <p>目前設定：{THEME_DISPLAY_NAME_LOOKUP_TABLE[currentTheme]}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end">
        {THEMES.map((theme) => (
          <DropdownMenuItem key={theme} className="text-lg" onClick={() => setTheme(theme)}>
            {THEME_DISPLAY_NAME_LOOKUP_TABLE[theme]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
