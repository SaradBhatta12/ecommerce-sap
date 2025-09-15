"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function VoiceSearch() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (typeof window !== "undefined") {
      setIsSupported(!!window.SpeechRecognition || !!window.webkitSpeechRecognition)
    }
  }, [])

  const startListening = () => {
    setError("")
    setTranscript("")
    setIsListening(true)

    // In a real implementation, we would use the Web Speech API
    // For this demo, we'll simulate voice recognition
    setTimeout(() => {
      const mockPhrases = [
        "show me smartphones",
        "find laptops under 50000",
        "search for wireless headphones",
        "show me deals on electronics",
      ]
      const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)]
      setTranscript(randomPhrase)
      setIsListening(false)
    }, 3000)
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const handleSearch = () => {
    if (!transcript.trim()) return

    setIsProcessing(true)

    // Process the search query
    setTimeout(() => {
      setIsProcessing(false)
      setOpen(false)

      // Navigate to search results
      router.push(`/shop?q=${encodeURIComponent(transcript)}`)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Voice Search">
          <Mic className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Search</DialogTitle>
          <DialogDescription>Speak clearly to search for products</DialogDescription>
        </DialogHeader>

        {!isSupported ? (
          <div className="text-center py-8">
            <MicOff className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4">Voice search is not supported in your browser.</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center bg-primary/10 ${isListening ? "animate-pulse" : ""}`}
                >
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="icon"
                    className="h-16 w-16 rounded-full"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                </div>
                {isListening && (
                  <div className="absolute -top-2 -right-2 -bottom-2 -left-2 rounded-full border-4 border-primary animate-ping opacity-20"></div>
                )}
              </div>

              <div className="text-center">
                {isListening ? (
                  <p className="text-sm">Listening...</p>
                ) : transcript ? (
                  <p className="font-medium">&quot;{transcript}&quot;</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Tap the microphone to start</p>
                )}
              </div>
            </div>

            {error && <div className="text-center text-destructive text-sm">{error}</div>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleSearch} disabled={!transcript || isProcessing || isListening}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
