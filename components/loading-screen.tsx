"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if the splash has been shown in the current session
    const hasShownSplash = sessionStorage.getItem("hasShownSplash")

    if (!hasShownSplash) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        sessionStorage.setItem("hasShownSplash", "true")
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 tracking-tight">
              with love <span className="text-red-500">❤️</span> for my friends
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
