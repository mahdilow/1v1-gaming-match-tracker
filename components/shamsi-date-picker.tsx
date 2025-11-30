"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronDown } from "lucide-react"

const shamsiMonths = [
  { value: 1, label: "فروردین" },
  { value: 2, label: "اردیبهشت" },
  { value: 3, label: "خرداد" },
  { value: 4, label: "تیر" },
  { value: 5, label: "مرداد" },
  { value: 6, label: "شهریور" },
  { value: 7, label: "مهر" },
  { value: 8, label: "آبان" },
  { value: 9, label: "آذر" },
  { value: 10, label: "دی" },
  { value: 11, label: "بهمن" },
  { value: 12, label: "اسفند" },
]

function gregorianToShamsi(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy = gy > 1600 ? 979 : 0
  gy = gy > 1600 ? gy - 1600 : gy - 621
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
  return [jy, jm, jd]
}

function shamsiToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy > 979 ? 1600 : 621
  if (jy > 979) jy -= 979
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
  gy += 400 * Math.floor(days / 146097)
  days %= 146097
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524)
    days %= 36524
    if (days >= 365) days++
  }
  gy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    gy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  let gd = days + 1
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]
  let gm = 0
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm]
  return [gy, gm, gd]
}

function isShamsiLeap(year: number): boolean {
  const breaks = [1, 5, 9, 13, 17, 22, 26, 30]
  return breaks.includes(year % 33)
}

function getDaysInMonth(year: number, month: number): number {
  if (month <= 6) return 31
  if (month <= 11) return 30
  return isShamsiLeap(year) ? 30 : 29
}

interface ShamsiDatePickerProps {
  value: string
  onChange: (value: string) => void
}

export function ShamsiDatePicker({ value, onChange }: ShamsiDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const parseValue = (): [number, number, number] => {
    if (!value) {
      const now = new Date()
      return gregorianToShamsi(now.getFullYear(), now.getMonth() + 1, now.getDate())
    }
    const [gy, gm, gd] = value.split("-").map(Number)
    return gregorianToShamsi(gy, gm, gd)
  }

  const [year, month, day] = parseValue()
  const years = Array.from({ length: 21 }, (_, i) => 1390 + i)
  const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1)
  const monthLabel = shamsiMonths.find((m) => m.value === month)?.label || ""

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (newYear: number, newMonth: number, newDay: number) => {
    const maxDays = getDaysInMonth(newYear, newMonth)
    if (newDay > maxDays) newDay = maxDays
    const [gy, gm, gd] = shamsiToGregorian(newYear, newMonth, newDay)
    onChange(`${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-3 bg-secondary rounded-xl flex items-center justify-between text-sm"
      >
        <span>
          {day} {monthLabel} {year}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {day} {monthLabel} {year}
            </span>
          </div>

          {/* Year */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">سال</label>
            <div className="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleChange(y, month, day)}
                  className={`h-8 rounded-lg text-xs font-medium transition-colors ${
                    y === year ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Month */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">ماه</label>
            <div className="grid grid-cols-3 gap-1">
              {shamsiMonths.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleChange(year, m.value, day)}
                  className={`h-8 rounded-lg text-xs font-medium transition-colors ${
                    m.value === month ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">روز</label>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    handleChange(year, month, d)
                    setIsOpen(false)
                  }}
                  className={`h-8 rounded-lg text-xs font-medium transition-colors ${
                    d === day ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
