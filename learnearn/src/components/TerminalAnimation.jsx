import { useState, useEffect } from 'react'

const TerminalAnimation = () => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const commands = [
    {
      command: '$ answer_3_questions:',
      output: 'too easy'
    },
    {
      command: '$ earn_back_deposit:',
      output: 'sweet'
    },
    {
      command: '$ good_vibes:',
      output: 'successfully executed'
    }
  ]

  const fullText = commands
    .map(cmd => `${cmd.command}\n${cmd.output}`)
    .join('\n')

  useEffect(() => {
    let timeout

    if (isTyping && displayedText.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1))
      }, 30) // Typing speed
    } else if (displayedText.length >= fullText.length) {
      // Animation complete, stop typing
      setIsTyping(false)
    }

    return () => clearTimeout(timeout)
  }, [displayedText, fullText, isTyping])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="font-mono text-left text-sm leading-tight bg-black/50 p-4 rounded-lg border border-solana-green/50 shadow-lg shadow-solana-green/20 relative overflow-hidden min-h-[180px]">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-solana-green/5 to-transparent pointer-events-none animate-scanline" />

        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-solana-green/20">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-400/60 ml-1">learn_earn@terminal:~</span>
        </div>

        {/* Terminal content with typing animation */}
        <pre className="whitespace-pre-wrap break-words">
          {displayedText.split('\n').map((line, i) => {
            const isCommand = line.startsWith('$')

            return (
              <div key={i} className="leading-snug">
                {isCommand ? (
                  <>
                    <span className="text-solana-green font-bold">$</span>
                    <span className="text-white ml-1">{line.slice(2)}</span>
                  </>
                ) : line ? (
                  <span className="text-solana-green/90">{line}</span>
                ) : null}
              </div>
            )
          })}
          {/* Blinking cursor */}
          {isTyping && displayedText.length < fullText.length && (
            <span className="inline-block w-1.5 h-3.5 bg-solana-green animate-pulse ml-0.5" />
          )}
        </pre>
      </div>
    </div>
  )
}

export default TerminalAnimation
