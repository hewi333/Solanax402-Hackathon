import { useState, useEffect } from 'react'

const TerminalAnimation = () => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  const commands = [
    {
      command: '$ answer_3_questions:',
      output: '✓ Loading AI agent quiz modules...'
    },
    {
      command: '$ earn_back_deposit:',
      output: '✓ Reward system initialized (0.011 SOL per module)'
    },
    {
      command: '$ good_vibes:',
      output: '✓ Ready to learn! 🚀'
    }
  ]

  const fullText = commands
    .map(cmd => `${cmd.command}\n${cmd.output}`)
    .join('\n\n')

  useEffect(() => {
    let timeout

    if (isTyping && displayedText.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1))
      }, 30) // Typing speed
    } else if (displayedText.length >= fullText.length) {
      // Animation complete, wait 2 seconds then restart
      timeout = setTimeout(() => {
        setDisplayedText('')
        setCurrentCommandIndex(0)
        setIsTyping(true)
      }, 3000)
    }

    return () => clearTimeout(timeout)
  }, [displayedText, fullText, isTyping])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="font-mono text-left text-sm md:text-base leading-relaxed bg-black/40 p-4 md:p-6 rounded-lg border border-solana-green/30 shadow-lg shadow-solana-green/10 relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-solana-green/5 to-transparent pointer-events-none animate-scanline" />

        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 ml-2">learn_earn@terminal:~</span>
        </div>

        {/* Terminal content with typing animation */}
        <pre className="whitespace-pre-wrap break-words">
          {displayedText.split('\n').map((line, i) => {
            const isCommand = line.startsWith('$')
            const isOutput = line.startsWith('✓')

            return (
              <div key={i} className="min-h-[1.5rem]">
                {isCommand && (
                  <>
                    <span className="text-solana-green">$</span>
                    <span className="text-gray-300 ml-1">{line.slice(2)}</span>
                  </>
                )}
                {isOutput && (
                  <span className="text-solana-purple/80 text-sm">{line}</span>
                )}
                {!isCommand && !isOutput && line && (
                  <span className="text-gray-400">{line}</span>
                )}
              </div>
            )
          })}
          {/* Blinking cursor */}
          {isTyping && displayedText.length < fullText.length && (
            <span className="inline-block w-2 h-4 bg-solana-green animate-pulse ml-0.5" />
          )}
        </pre>
      </div>
    </div>
  )
}

export default TerminalAnimation
