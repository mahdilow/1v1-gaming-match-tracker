// Compress and convert image to base64 for Supabase storage
export async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedBase64)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = event.target?.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

function base64ToBlob(base64Data: string): Blob {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const parts = base64Data.split(",")
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg"
  const base64 = parts[1]

  // Decode base64 string
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// Upload image to Supabase storage and return public URL
export async function uploadImageToSupabase(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  base64Data: string,
  folder: "matches" | "tournaments",
): Promise<string | null> {
  try {
    const blob = base64ToBlob(base64Data)

    // Generate unique filename
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage.from("images").upload(filename, blob, {
      contentType: "image/jpeg",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error.message)
      throw new Error(error.message)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(data.path)

    return publicUrl
  } catch (err) {
    console.error("Upload error:", err instanceof Error ? err.message : err)
    throw err
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}
