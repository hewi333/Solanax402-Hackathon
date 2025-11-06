import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { LEARNING_MODULES, getModuleById } from '../learningModules'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Bot, User, Send, Loader2, Trophy } from 'lucide-react'
import { cn } from '../lib/utils'

export default function ChatInterface({ onModuleCompleted, onSessionComplete }) {
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

  const INITIAL_DEPOSIT = 0.5

  const currentModule = getModuleById(currentModuleId)

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const evaluateAnswer = (userAnswer) => {
    const answer = userAnswer.toLowerCase()
    const keywords = currentModule.evaluationKeywords

    const matchedKeywords = keywords.filter(keyword =>
      answer.includes(keyword.toLowerCase())
    )

    return {
      passed: matchedKeywords.length >= 1,
      matchedCount: matchedKeywords.length,
      totalKeywords: keywords.length
    }
  }

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
      const evaluation = evaluateAnswer(userInput)

      let aiResponse = ''
      let moduleCompleted = false

      if (evaluation.passed) {
        aiResponse = `🎉 **Excellent!** You got it!\n\n`

        if (currentModule.correctAnswerExample) {
          aiResponse += `Here's a complete answer: "${currentModule.correctAnswerExample}"\n\n`
        }

        aiResponse += `**Reward:** Sending you ${currentModule.reward} SOL now! 💰\n\n`

        if (currentModuleId === LEARNING_MODULES.length) {
          aiResponse += `🏆 **CONGRATULATIONS!** You've completed all 5 modules!\n\nYou've learned about the Solana x402 Hackathon, and you've earned back your 0.5 SOL!\n\nThis entire experience was managed by an autonomous AI agent - me! I evaluated your answers, decided when to reward you, and sent payments without any human intervention.\n\nThat's the power of x402 AI agents on Solana! 🚀`
        } else {
          const nextModule = getModuleById(currentModuleId + 1)
          aiResponse += `---\n\n**Module ${nextModule.id}/5: ${nextModule.title}**\n\n${nextModule.lessonContent}\n\n---\n\n**Question:** ${nextModule.question}`
        }

        moduleCompleted = true

      } else {
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

      if (moduleCompleted) {
        try {
          const signature = await sendReward(currentModule.id, currentModule.reward)

          const newTotalEarned = totalEarned + currentModule.reward
          setTotalEarned(newTotalEarned)

          onModuleCompleted({
            detected: true,
            module: currentModule.title,
            reward: currentModule.reward,
            signature: signature
          })

          setCompletedModules(prev => [...prev, currentModule.id])
          setAttemptCount(0)

          if (newTotalEarned >= INITIAL_DEPOSIT) {
            setSessionComplete(true)

            const completionMsg = {
              role: 'assistant',
              content: `🎊 **SESSION COMPLETE!** 🎊\n\nYou've earned back your full ${INITIAL_DEPOSIT} SOL deposit!\n\nTotal earned: ${newTotalEarned} SOL\n\nTo continue learning, start a new session with another ${INITIAL_DEPOSIT} SOL deposit.`,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, completionMsg])
          } else {
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
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-solana-purple to-solana-green">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-white">AI Agent Guide</CardTitle>
            <p className="text-sm text-white/80 mt-1">
              {currentModuleId <= LEARNING_MODULES.length
                ? `Module ${currentModuleId}/${LEARNING_MODULES.length}: ${currentModule?.title || 'Loading...'}`
                : '🎉 All Modules Complete!'}
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-none">
            {completedModules.length}/{LEARNING_MODULES.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-muted/20">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 animate-in slide-in-from-bottom-2",
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === 'assistant'
                  ? 'bg-gradient-to-r from-solana-purple to-solana-green'
                  : 'bg-muted'
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className={cn(
                "flex flex-col gap-1 max-w-[80%]",
                message.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  "rounded-lg px-4 py-3 whitespace-pre-wrap",
                  message.role === 'assistant'
                    ? 'bg-card border text-card-foreground'
                    : 'bg-gradient-to-r from-solana-purple to-solana-green text-white',
                  message.isError && 'border-destructive bg-destructive/10 text-destructive'
                )}>
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground px-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-card border rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-solana-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-solana-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-solana-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t bg-card space-y-4">
          {sessionComplete ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-4xl">🎊</div>
                <h3 className="text-2xl font-bold">Session Complete!</h3>
                <p className="text-xl font-semibold text-solana-green">
                  Total Earned: {totalEarned} SOL
                </p>
                <p className="text-muted-foreground">
                  You've earned back your {INITIAL_DEPOSIT} SOL deposit!
                </p>
              </div>
              <Button
                onClick={() => {
                  if (onSessionComplete) onSessionComplete()
                }}
                variant="solana"
                size="lg"
                className="w-full"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Start New Session (Pay {INITIAL_DEPOSIT} SOL)
              </Button>
              <p className="text-sm text-muted-foreground">
                Starting a new session requires another {INITIAL_DEPOSIT} SOL deposit to unlock more learning modules.
              </p>
            </div>
          ) : currentModuleId <= LEARNING_MODULES.length ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {totalEarned.toFixed(1)} / {INITIAL_DEPOSIT} SOL
                  </span>
                </div>
                <Progress value={(totalEarned / INITIAL_DEPOSIT) * 100} />
              </div>

              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  disabled={isLoading}
                  className="flex-1 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  rows="3"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  variant="solana"
                  size="lg"
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                💡 Answer in your own words - I'll evaluate and reward you if correct!
              </p>
            </>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-2xl font-bold">Journey Complete!</h3>
              <p className="text-muted-foreground">You've mastered the Solana x402 concepts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
