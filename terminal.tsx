"use client"

import { useState, useEffect, useRef } from "react"
import { processCommand } from "@/utils/commands"
import { CyberAgent } from "@/utils/cyber-agent"
import { asciiArt } from "@/utils/ascii-art"

export default function Terminal() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [currentDir, setCurrentDir] = useState("~/")
  const terminalRef = useRef<HTMLDivElement>(null)
  const agent = new CyberAgent()

  useEffect(() => {
    // Display welcome message on mount
    setHistory([asciiArt, "Welcome to Cyber Forge Terminal. Type 'help' for available commands."])
    
    // Auto-scroll to bottom when history updates
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return
    
    // Add command to history
    setHistory(prev => [...prev, `${currentDir}> ${input}`])
    
    try {
      // Process command and get result
      const result = await processCommand(input, agent)
      setHistory(prev => [...prev, result])
    } catch (error) {
      setHistory(prev => [...prev, `Error: ${error.message}`])
    }
    
    setInput("")
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div 
        ref={terminalRef}
        className="overflow-y-auto max-h-[calc(100vh-8rem)]"
      >
        {history.map((line, i) => (
          <pre key={i} className="whitespace-pre-wrap">{line}</pre>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-green-400"
          autoFocus
          aria-label="Terminal input"
        />
      </form>
    </div>
  )
}

