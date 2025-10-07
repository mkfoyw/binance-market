import Link from "next/link"
import { Activity, BarChart3 } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 mx-auto max-w-screen-2xl">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span className="font-bold">币安市场分析</span>
          </Link>
          <Link 
            href="/market-analysis" 
            className="flex items-center space-x-2 font-bold hover:opacity-80 transition-opacity"
          >
            <BarChart3 className="h-6 w-6" />
            <span>市场分析</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
