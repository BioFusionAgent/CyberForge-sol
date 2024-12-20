'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Minus, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { executeCommand, type CommandResult } from '@/utils/commands'
import { generateAIResponse } from '@/utils/mock-ai'
import { simulateHack } from '@/utils/hacking'

interface Command {
  input: string
  output: string
  error?: boolean
  isAI?: boolean
}

const asciiArt = {
  logo: `
   ______      __           ______                    
  / ____/_  __/ /_  ___  __/ ____/___  _________ ____ 
 / /   / / / / __ \\/ _ \\/ /___ / __ \\/ ___/ __ \`/ _ \\
/ /___/ /_/ / /_/ /  __/ /___/ / /_/ / /  / /_/ /  __/
\\____/\\__, /_.___/\\___/_/_____/\\____/_/   \\__, /\\___/ 
     /____/                               /____/      
  `,
};

export default function Terminal() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Command[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const [isCyberAgentMode, setIsCyberAgentMode] = useState(false)
  const [glitchText, setGlitchText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const handleCommand = async (cmd: string): Promise<CommandResult> => {
    if (isCyberAgentMode) {
      const aiResponse = await generateAIResponse(cmd)
      return { output: aiResponse, isAI: true }
    }

    const parts = cmd.split(' ')
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    if (command === 'cyber-agent') {
      setIsCyberAgentMode(true)
      return { output: 'Cyber Agent activated. How may I assist you in our digital realm? (Type "exit" to end this interaction)' }
    } else if (command === 'hack') {
      setIsGlitching(true)
      setGlitchText('HACKING IN PROGRESS')
      const result = await simulateHack(args[0] || 'random')
      setIsGlitching(false)
      setGlitchText('')
      return result
    } else {
      return executeCommand(cmd)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const { output, error, isAI } = await handleCommand(input)
    setHistory([...history, { input, output, error, isAI }])
    setInput('')

    if (isCyberAgentMode && input.toLowerCase() === 'exit') {
      setIsCyberAgentMode(false)
      setHistory(prev => [...prev, { input: 'System', output: 'Exiting Cyber Agent mode.', isAI: true }])
    }

    // Trigger glitch effect
    setIsGlitching(true)
    setGlitchText(generateGlitchText())
    setTimeout(() => setIsGlitching(false), 1000)
  }

  const generateGlitchText = () => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    return Array(20).fill(0).map(() => glitchChars[Math.floor(Math.random() * glitchChars.length)]).join('')
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className={cn(
        "w-full max-w-3xl bg-[#0a0a0a] rounded-lg overflow-hidden shadow-2xl",
        "border border-red-900/50 shadow-red-500/20",
        isMinimized ? "h-12" : "h-[80vh]"
      )}>
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 h-12 bg-[#1a1a1a] border-b border-red-900/30">
          <div className="text-red-500 font-mono glitch-text" data-text="CyberForge@quantum-terminal:~">
            CyberForge@quantum-terminal:~
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.close()}
              className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        {!isMinimized && (
          <div className="p-4 h-[calc(80vh-3rem)] overflow-auto" ref={terminalRef}>
            <div className="font-mono text-red-500 space-y-2">
              <pre className="text-green-500">{asciiArt.logo}</pre>
              <div className="mb-4">
                Welcome to CyberForge Quantum Terminal v5.0.0
                <br />
                Type 'help' for available commands or 'cyber-agent' to engage the Cyber Agent.
              </div>

              {/* Command History */}
              {history.map((cmd, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-red-700">{cmd.isAI ? 'Cyber Agent>' : '$'}</span>
                    <span>{cmd.input}</span>
                  </div>
                  {cmd.output && (
                    <div className={cn(
                      "pl-6 whitespace-pre-wrap",
                      cmd.error ? "text-yellow-500" : cmd.isAI ? "text-green-400" : "text-red-400 opacity-90"
                    )}>
                      {cmd.output}
                    </div>
                  )}
                </div>
              ))}

              {/* Input Line */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <span className="text-red-700">{isCyberAgentMode ? 'Cyber Agent>' : '$'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-red-500 font-mono"
                  autoFocus
                  disabled={isGlitching}
                  placeholder={isCyberAgentMode ? "Engage with Cyber Agent (type 'exit' to disconnect)" : "Enter command..."}
                />
              </form>

              {/* Glitch Effect */}
              {isGlitching && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-red-500 font-mono text-2xl glitch-text" data-text={glitchText}>
                    {glitchText}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

