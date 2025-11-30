"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, Swords, Trophy, Medal } from "lucide-react"
import Image from "next/image"

const navItems = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/players", label: "بازیکنان", icon: Users },
  { href: "/match", label: "ثبت مسابقه", icon: Swords },
  { href: "/tournament", label: "تورنمنت", icon: Trophy },
  { href: "/leaderboard", label: "جدول", icon: Medal },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function PageHeader({
  title,
  subtitle,
  showLogo = false,
}: { title: string; subtitle?: string; showLogo?: boolean }) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-4">
      <div className="flex items-center gap-3">
        {showLogo && <Image src="/logo.png" alt="بلک لیست" width={36} height={36} className="rounded-lg" />}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
