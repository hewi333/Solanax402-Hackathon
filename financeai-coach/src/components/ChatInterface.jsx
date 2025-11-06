import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { LEARNING_MODULES, getModuleById } from '../learningModules'
import './ChatInterface.css'

export default function ChatInterface({ onHabitCompleted, onSessionComplete }) {
  const { publicKey } = useWallet()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentModuleId, setCurrentModuleId] = useState(1)
  const [completedModules, setCompletedModules] = useState([])
  const [attemptCount, setAttemptCount] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const INITIAL_DEPOSIT = 0.5 // SOL

  const currentModule = getModuleById(currentModuleId)

  // Initialize with first module lesson
  useEffect(() => {
    if (messages.length === 0 && currentModule) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Welcome to the Solana x402 Learning Journey! 🚀\n\nI'm your AI agent guide. You've paid 0.5 SOL to unlock this experience. Complete all 5 modules and earn it back!\n\n**Module ${currentModule.id}/5: ${currentModule.title}**\n\n${currentModule.lessonContent}\n\n---\n\n**Question:** ${currentModule.question}\n\nTake your time and answer in your own words!`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [])

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Evaluate user's answer
  const evaluateAnswer = (userAnswer) => {
    const answer = userAnswer.toLowerCase()
    const keywords = currentModule.evaluationKeywords

    // Count how many keywords are present
    const matchedKeywords = keywords.filter(keyword =>
      answer.includes(keyword.toLowerCase())
    )

    // Need at least 1 keyword match to pass (lenient as requested)
    return {
      passed: matchedKeywords.length >= 1,
      matchedCount: matchedKeywords.length,
      totalKeywords: keywords.length
    }
  }

  // Send reward to user
  const sendReward = async (moduleId, amount) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          amount: amount,
          moduleId: moduleId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reward')
      }

      console.log(`✅ Reward sent: ${data.signature}`)
      return data.signature

    } catch (error) {
      console.error('Reward error:', error)
      throw error
    }
  }

  // Send message and evaluate
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || sessionComplete) return

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // Evaluate the answer
      const evaluation = evaluateAnswer(userInput)

      let aiResponse = ''
      let moduleCompleted = false

      if (evaluation.passed) {
        // CORRECT ANSWER!
        aiResponse = `🎉 **Excellent!** You got it!\n\n`

        if (currentModule.correctAnswerExample) {
          aiResponse += `Here's a complete answer: "${currentModule.correctAnswerExample}"\n\n`
        }

        aiResponse += `**Reward:** Sending you ${currentModule.reward} SOL now! 💰\n\n`

        // Check if this is the last module
        if (currentModuleId === LEARNING_MODULES.length) {
          aiResponse += `🏆 **CONGRATULATIONS!** You've completed all 5 modules!\n\nYou've learned about the Solana x402 Hackathon, and you've earned back your 0.5 SOL!\n\nThis entire experience was managed by an autonomous AI agent - me! I evaluated your answers, decided when to reward you, and sent payments without any human intervention.\n\nThat's the power of x402 AI agents on Solana! 🚀`
        } else {
          const nextModule = getModuleById(currentModuleId + 1)
          aiResponse += `---\n\n**Module ${nextModule.id}/5: ${nextModule.title}**\n\n${nextModule.lessonContent}\n\n---\n\n**Question:** ${nextModule.question}`
        }

        moduleCompleted = true

      } else {
        // INCORRECT OR INCOMPLETE
        const hintIndex = Math.min(attemptCount, currentModule.hints.length - 1)
        aiResponse = `Hmm, not quite there yet! 🤔\n\n**Hint:** ${currentModule.hints[hintIndex]}\n\nTry again! Remember, I'm looking for you to mention things related to: ${currentModule.evaluationKeywords.slice(0, 3).join(', ')}...`
        setAttemptCount(prev => prev + 1)
      }

      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // If answer was correct, send reward and move to next module
      if (moduleCompleted) {
        try {
          // Send the reward!
          const signature = await sendReward(currentModule.id, currentModule.reward)

          // Update total earned
          const newTotalEarned = totalEarned + currentModule.reward
          setTotalEarned(newTotalEarned)

          // Notify parent component
          onHabitCompleted({
            detected: true,
            habit: currentModule.title,
            reward: currentModule.reward,
            signature: signature
          })

          // Mark module as completed
          setCompletedModules(prev => [...prev, currentModule.id])
          setAttemptCount(0)

          // Check if user has earned back the full deposit
          if (newTotalEarned >= INITIAL_DEPOSIT) {
            setSessionComplete(true)

            // Add final completion message
            const completionMsg = {
              role: 'assistant',
              content: `🎊 **SESSION COMPLETE!** 🎊\n\nYou've earned back your full ${INITIAL_DEPOSIT} SOL deposit!\n\nTotal earned: ${newTotalEarned} SOL\n\nTo continue learning, start a new session with another ${INITIAL_DEPOSIT} SOL deposit.`,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, completionMsg])
          } else {
            // Move to next module (if not last)
            if (currentModuleId < LEARNING_MODULES.length) {
              setCurrentModuleId(prev => prev + 1)
            }
          }

        } catch (error) {
          const errorMsg = {
            role: 'assistant',
            content: `⚠️ Oops! I evaluated your answer as correct, but there was an error sending your reward: ${error.message}\n\nDon't worry - you still completed the module! The issue is likely with the treasury wallet configuration.`,
            timestamp: new Date(),
            isError: true
          }
          setMessages(prev => [...prev, errorMsg])
        }
      }

    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-icon">🤖</div>
        <div className="chat-header-info">
          <h3>AI Agent Guide</h3>
          <p className="chat-status">
            {currentModuleId <= LEARNING_MODULES.length
              ? `Module ${currentModuleId}/${LEARNING_MODULES.length}: ${currentModule?.title || 'Loading...'}`
              : '🎉 All Modules Complete!'}
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-avatar">
              {message.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {sessionComplete ? (
          <div className="session-complete-container">
            <div className="completion-message">
              <h3>🎊 Session Complete! 🎊</h3>
              <p className="earned-amount">Total Earned: {totalEarned} SOL</p>
              <p className="completion-text">
                You've earned back your {INITIAL_DEPOSIT} SOL deposit!
              </p>
            </div>
            <button
              onClick={() => {
                if (onSessionComplete) onSessionComplete()
              }}
              className="new-session-button"
            >
              Start New Session (Pay {INITIAL_DEPOSIT} SOL)
            </button>
            <p className="session-hint">
              Starting a new session requires another {INITIAL_DEPOSIT} SOL deposit to unlock more learning modules.
            </p>
          </div>
        ) : currentModuleId <= LEARNING_MODULES.length ? (
          <>
            <div className="progress-bar-container">
              <div className="progress-info">
                <span>Earned: {totalEarned.toFixed(1)} SOL</span>
                <span>Goal: {INITIAL_DEPOSIT} SOL</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(totalEarned / INITIAL_DEPOSIT) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                disabled={isLoading}
                className="chat-input"
                rows="3"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="send-button"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
            <p className="chat-hint">
              💡 Answer in your own words - I'll evaluate and reward you if correct!
            </p>
          </>
        ) : (
          <div className="completion-message">
            <h3>🎉 Journey Complete!</h3>
            <p>You've mastered the Solana x402 concepts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
