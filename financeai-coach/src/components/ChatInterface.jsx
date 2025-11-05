import { useState, useRef, useEffect } from 'react'
import './ChatInterface.css'

export default function ChatInterface({ onHabitCompleted }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your FinanceAI Coach. I\'m here to help you build better financial habits. What are your financial goals?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
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

  const detectHabit = async (userMessage, aiResponse) => {
    // Simple keyword-based habit detection
    const habits = {
      'budget': {
        keywords: ['budget', 'spending limit', 'monthly budget', 'set budget'],
        reward: 0.05,
        type: 'Budget Creation'
      },
      'savings': {
        keywords: ['save', 'saving', 'savings goal', 'save money', 'save for'],
        reward: 0.05,
        type: 'Savings Goal'
      },
      'expense': {
        keywords: ['spent', 'bought', 'expense', 'purchase', 'cost'],
        reward: 0.02,
        type: 'Expense Tracking'
      },
      'checkin': {
        keywords: ['daily check', 'checking in', 'report', 'update'],
        reward: 0.01,
        type: 'Daily Check-in'
      },
      'learning': {
        keywords: ['learn', 'understand', 'teach me', 'explain'],
        reward: 0.03,
        type: 'Learning Module'
      }
    }

    const combinedText = `${userMessage} ${aiResponse}`.toLowerCase()

    for (const [habitKey, habitData] of Object.entries(habits)) {
      for (const keyword of habitData.keywords) {
        if (combinedText.includes(keyword)) {
          return {
            detected: true,
            habit: habitData.type,
            reward: habitData.reward
          }
        }
      }
    }

    return { detected: false }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Get backend API URL from environment or use default
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      // Call backend API
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content }))
            .concat({ role: userMessage.role, content: userMessage.content })
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      const aiMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // Detect if a habit was completed
      const habitResult = await detectHabit(userMessage.content, aiMessage.content)
      if (habitResult.detected && onHabitCompleted) {
        onHabitCompleted(habitResult)
      }

    } catch (error) {
      console.error('Error sending message:', error)

      let errorText = 'Sorry, I encountered an error. '

      if (error.message.includes('API key')) {
        errorText += 'Please make sure the backend server is running and OpenAI API key is configured in backend/.env'
      } else if (error.message.includes('fetch')) {
        errorText += 'Cannot connect to the backend server. Make sure it\'s running on http://localhost:3001'
      } else {
        errorText += error.message
      }

      const errorMessage = {
        role: 'assistant',
        content: errorText,
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
        <div className="chat-header-icon">💬</div>
        <div>
          <h3>AI Finance Coach</h3>
          <p className="chat-status">
            {isLoading ? '🤖 Thinking...' : '🟢 Ready to help'}
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
              <p>{message.content}</p>
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
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (e.g., 'I want to save for a vacation')"
            disabled={isLoading}
            className="chat-input"
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
          💡 Tip: Tell me about your financial goals, budgets, or spending to earn rewards!
        </p>
      </div>
    </div>
  )
}
