"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, BellRing, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NotificationToggleProps {
  showLabel?: boolean
  className?: string
}

type NotificationState = "loading" | "unsupported" | "denied" | "enabled" | "disabled"

const STORAGE_KEY = "blacklist_notifications_enabled"

export function NotificationToggle({ showLabel = false, className }: NotificationToggleProps) {
  const [state, setState] = useState<NotificationState>("loading")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  function checkStatus() {
    // Check if browser supports notifications
    if (typeof window === "undefined" || !("Notification" in window)) {
      setState("unsupported")
      return
    }

    const permission = Notification.permission

    if (permission === "denied") {
      setState("denied")
      return
    }

    // Check localStorage for user preference
    const savedPreference = localStorage.getItem(STORAGE_KEY)

    if (permission === "granted" && savedPreference === "true") {
      setState("enabled")
    } else {
      setState("disabled")
    }
  }

  async function handleToggle() {
    if (isProcessing) return

    setIsProcessing(true)
    setMessage(null)

    try {
      if (state === "enabled") {
        // Disable notifications
        localStorage.setItem(STORAGE_KEY, "false")
        setState("disabled")
        showToast("اعلان‌ها غیرفعال شدند", false)
      } else {
        // Request permission if needed
        let permission = Notification.permission

        if (permission === "default") {
          permission = await Notification.requestPermission()
        }

        if (permission === "denied") {
          setState("denied")
          showToast("دسترسی اعلان‌ها رد شد. از تنظیمات مرورگر اجازه دهید", true)
          return
        }

        if (permission === "granted") {
          localStorage.setItem(STORAGE_KEY, "true")
          setState("enabled")
          showToast("اعلان‌ها فعال شدند! وقتی برنامه باز است اعلان دریافت می‌کنید", false)

          // Show a test notification
          new Notification("بلک لیست 🎮", {
            body: "اعلان‌ها با موفقیت فعال شدند!",
            icon: "/logo.png",
            tag: "test-notification",
          })
        }
      }
    } catch (error) {
      console.error("Notification toggle error:", error)
      showToast("خطایی رخ داد", true)
    } finally {
      setIsProcessing(false)
    }
  }

  function showToast(text: string, isError: boolean) {
    setMessage({ text, isError })
    setTimeout(() => setMessage(null), 4000)
  }

  function getIcon() {
    if (isProcessing) return <Loader2 className="h-5 w-5 animate-spin" />

    switch (state) {
      case "enabled":
        return <BellRing className="h-5 w-5" />
      case "denied":
        return <X className="h-5 w-5" />
      case "unsupported":
        return <BellOff className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  function getLabel() {
    switch (state) {
      case "loading":
        return "در حال بررسی..."
      case "unsupported":
        return "پشتیبانی نمی‌شود"
      case "denied":
        return "دسترسی رد شده"
      case "enabled":
        return "اعلان‌ها فعال"
      case "disabled":
        return "فعال‌سازی اعلان"
    }
  }

  const isDisabled = state === "loading" || state === "unsupported" || isProcessing

  return (
    <div className={cn("relative group", className)}>
      <Button
        variant="ghost"
        size={showLabel ? "default" : "icon"}
        onClick={handleToggle}
        disabled={isDisabled}
        className={cn(
          "relative transition-colors",
          showLabel ? "gap-2" : "h-10 w-10",
          state === "enabled" && "text-primary",
          state === "denied" && "text-destructive opacity-70",
          state === "unsupported" && "text-muted-foreground opacity-50",
        )}
      >
        {getIcon()}
        {showLabel && <span className="text-sm">{getLabel()}</span>}

        {/* Active indicator dot */}
        {state === "enabled" && !showLabel && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-success animate-pulse" />
        )}
      </Button>

      {/* Toast message */}
      {message && (
        <div
          className={cn(
            "fixed bottom-20 left-4 right-4 mx-auto max-w-sm z-50",
            "px-4 py-3 rounded-xl text-sm font-medium",
            "shadow-lg border",
            message.isError
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : "bg-success/10 border-success/20 text-success",
            "animate-in fade-in slide-in-from-bottom-4 duration-300",
          )}
        >
          <div className="flex items-center gap-3">
            {message.isError ? <X className="h-5 w-5 flex-shrink-0" /> : <Check className="h-5 w-5 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Hover tooltip for denied/unsupported */}
      {(state === "denied" || state === "unsupported") && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <div className="px-3 py-2 rounded-lg bg-popover border text-xs text-muted-foreground shadow-lg">
            {state === "denied" ? "از تنظیمات مرورگر دسترسی اعلان را فعال کنید" : "مرورگر شما از اعلان پشتیبانی نمی‌کند"}
          </div>
        </div>
      )}
    </div>
  )
}

export function areNotificationsEnabled(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }
  return Notification.permission === "granted" && localStorage.getItem(STORAGE_KEY) === "true"
}

export function showBrowserNotification(title: string, body: string, tag?: string) {
  if (!areNotificationsEnabled()) return

  try {
    new Notification(title, {
      body,
      icon: "/logo.png",
      tag: tag || `blacklist-${Date.now()}`,
      badge: "/logo.png",
    })
  } catch (error) {
    console.error("Failed to show notification:", error)
  }
}
