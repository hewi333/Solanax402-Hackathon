import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { LEARNING_MODULES, getModuleById } from '../learningModules'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { ChevronRight, CheckCircle2, Lightbulb, Trophy, Play, Home } from 'lucide-react'
import { cn } from '../lib/utils'

export default function ChatInterface({ onModuleCompleted, onSessionComplete, onReturnHome, walletAddress, isEmbeddedWallet }) {
  const { publicKey } = useWallet()
  const [viewMode, setViewMode] = useState('welcome') // welcome, lesson, question, feedback
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentModuleId, setCurrentModuleId] = useState(1)
  const [completedModules, setCompletedModules] = useState([])
  const [attemptCount, setAttemptCount] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [currentTxSignature, setCurrentTxSignature] = useState(null)
  const [aiFeedback, setAiFeedback] = useState('')
  const [evaluationMethod, setEvaluationMethod] = useState('') // 'ai' or 'fallback'
  const inputRef = useRef(null)

  const INITIAL_DEPOSIT = 0.033  // 3 modules x 0.011 SOL each
  const currentModule = getModuleById(currentModuleId)

  // Allow disabling fallback for testing (set VITE_DISABLE_FALLBACK=true in .env)
  const DISABLE_FALLBACK = import.meta.env.VITE_DISABLE_FALLBACK === 'true'

  // Log fallback status on mount
  useEffect(() => {
    if (DISABLE_FALLBACK) {
      console.warn('⚠️ Keyword fallback is DISABLED - AI must work or evaluation will fail')
    } else {
      console.log('✅ Keyword fallback is ENABLED (will activate after 10s timeout or AI failure)')
    }
  }, [])

  // Keyword matching fallback (original evaluation)
  const evaluateAnswerWithKeywords = (userAnswer) => {
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

  // AI-powered evaluation (primary method)
  const evaluateAnswerWithAI = async (userAnswer) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const address = walletAddress || (publicKey ? publicKey.toBase58() : null)

      console.log('🔍 AI Evaluation - Starting...')
      console.log('  API URL:', apiUrl)
      console.log('  Wallet:', address)
      console.log('  Module:', currentModule.id)

      if (!address) {
        throw new Error('No wallet address available')
      }

      console.log('📡 Calling /api/evaluate-with-ai...')
      const response = await fetch(`${apiUrl}/api/evaluate-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userAnswer,
          moduleId: currentModule.id,
          walletAddress: address,
          question: currentModule.question,
          expectedConcepts: currentModule.evaluationKeywords,
          lessonContext: currentModule.lessonContent
        })
      })

      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)

      if (!response.ok && !data.fallbackAvailable) {
        throw new Error(data.error || 'AI evaluation failed')
      }

      // AI evaluation succeeded
      if (data.aiEvaluated) {
        console.log('✅ AI evaluation succeeded!')
        return {
          passed: data.passed,
          score: data.score,
          feedback: data.feedback,
          payment: data.payment,
          method: 'ai'
        }
      }

      // AI not available, return null to trigger fallback
      console.warn('⚠️ AI evaluation not available (aiEvaluated=false)')
      return null
    } catch (error) {
      console.error('❌ AI evaluation failed:', error)
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
      return null
    }
  }

  const sendReward = async (moduleId, amount) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      // Get wallet address from either external wallet or embedded wallet
      const address = walletAddress || (publicKey ? publicKey.toBase58() : null)

      if (!address) {
        throw new Error('No wallet address available')
      }

      const response = await fetch(`${apiUrl}/api/reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: address,
          amount: amount,
          moduleId: moduleId
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reward')
      }
      return data.signature
    } catch (error) {
      console.error('Reward error:', error)
      throw error
    }
  }

  const handleSubmitAnswer = async () => {
    if (!inputMessage.trim() || isLoading) return

    setIsLoading(true)
    const userInput = inputMessage
    setInputMessage('')
    setAiFeedback('')
    setEvaluationMethod('')

    try {
      // Auto-pass after 2 incorrect attempts
      if (attemptCount >= 2) {
        console.log('👍 Auto-passing after 2 attempts')
        const evaluation = {
          passed: true,
          score: 50,
          feedback: `That's not exactly right, but this is just a demo so let's move on! The answer is: ${currentModule.correctAnswerExample}`,
          method: 'auto-pass'
        }

        setEvaluationMethod(evaluation.method)
        setAiFeedback(evaluation.feedback)
        setFeedbackMessage('correct')

        try {
          const signature = await sendReward(currentModule.id, currentModule.reward)
          const newTotalEarned = totalEarned + currentModule.reward
          setTotalEarned(newTotalEarned)
          setCurrentTxSignature(signature)

          onModuleCompleted({
            detected: true,
            module: currentModule.title,
            reward: currentModule.reward,
            signature: signature,
            evaluatedBy: 'auto-pass'
          })

          setCompletedModules(prev => [...prev, currentModule.id])
          setAttemptCount(0)

          if (currentModuleId >= LEARNING_MODULES.length) {
            setTimeout(() => {
              setSessionComplete(true)
            }, 2000)
          } else {
            setTimeout(() => {
              setCurrentModuleId(prev => prev + 1)
              setViewMode('lesson')
              setFeedbackMessage('')
              setShowHint(false)
              setCurrentTxSignature(null)
              setAiFeedback('')
              setEvaluationMethod('')
            }, 2000)
          }
        } catch (error) {
          console.error('Error sending reward:', error)
          setFeedbackMessage('error')
        }

        setIsLoading(false)
        return
      }

      // Try AI evaluation first with timeout
      console.log('🤖 Attempting AI evaluation...')

      // Add timeout wrapper (10 seconds)
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI evaluation timeout (10s)')), 10000)
      )

      let evaluation = null
      try {
        evaluation = await Promise.race([
          evaluateAnswerWithAI(userInput),
          timeout
        ])
      } catch (timeoutError) {
        console.error('⏱️ AI evaluation timed out:', timeoutError.message)
        evaluation = null
      }

      // Fall back to keyword matching if AI fails or times out (unless disabled)
      if (!evaluation) {
        if (DISABLE_FALLBACK) {
          console.error('❌ AI evaluation failed and fallback is disabled')
          setFeedbackMessage('error')
          setIsLoading(false)
          return
        }

        console.log('⚠️ AI unavailable, using keyword fallback')
        const keywordEval = evaluateAnswerWithKeywords(userInput)
        evaluation = {
          passed: keywordEval.passed,
          score: keywordEval.passed ? 100 : 0,
          feedback: keywordEval.passed
            ? 'Good job! Your answer contains the key concepts.'
            : 'Try to include more key concepts in your answer.',
          method: 'fallback'
        }
      }

      setEvaluationMethod(evaluation.method)
      setAiFeedback(evaluation.feedback)

      if (evaluation.passed) {
        // Correct answer
        setFeedbackMessage('correct')

        try {
          let signature = null

          // If AI already sent the payment, use that signature
          if (evaluation.payment && evaluation.payment.success) {
            signature = evaluation.payment.signature
            console.log('✅ AI Agent already sent payment:', signature)
          } else {
            // Otherwise, send reward manually (fallback case)
            signature = await sendReward(currentModule.id, currentModule.reward)
            console.log('✅ Manual reward sent:', signature)
          }

          const newTotalEarned = totalEarned + currentModule.reward
          setTotalEarned(newTotalEarned)
          setCurrentTxSignature(signature)

          onModuleCompleted({
            detected: true,
            module: currentModule.title,
            reward: currentModule.reward,
            signature: signature,
            evaluatedBy: evaluation.method
          })

          setCompletedModules(prev => [...prev, currentModule.id])
          setAttemptCount(0)

          // Check if all modules are complete
          if (currentModuleId >= LEARNING_MODULES.length) {
            setTimeout(() => {
              setSessionComplete(true)
            }, 2000)
          } else {
            // Move to next module
            setTimeout(() => {
              setCurrentModuleId(prev => prev + 1)
              setViewMode('lesson')
              setFeedbackMessage('')
              setShowHint(false)
              setCurrentTxSignature(null)
              setAiFeedback('')
              setEvaluationMethod('')
            }, 2000)
          }
        } catch (error) {
          console.error('Error sending reward:', error)
          setFeedbackMessage('error')
        }
      } else {
        // Incorrect answer
        setFeedbackMessage('incorrect')
        setShowHint(true)
        setAttemptCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error:', error)
      setFeedbackMessage('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  // Welcome Screen
  if (viewMode === 'welcome') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-12 text-center space-y-6">
          <div className="space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-solana-green" />
            <h2 className="text-3xl font-bold">Payment Successful!</h2>
            <p className="text-lg text-muted-foreground">
              You've unlocked 3 modules about Solana x402 AI agents.
            </p>
            <p className="text-base text-muted-foreground">
              Complete all modules to earn back your <span className="text-solana-green font-semibold">{INITIAL_DEPOSIT} SOL</span>
            </p>
          </div>

          <div className="py-6">
            <pre className="text-sm text-center font-mono text-muted-foreground">
{`╔═══════════════════════════╗
║   3 MODULES UNLOCKED      ║
║   0.011 SOL PER MODULE    ║
╚═══════════════════════════╝`}
            </pre>
          </div>

          <Button
            onClick={() => setViewMode('lesson')}
            variant="solana"
            size="lg"
            className="w-full"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Learning
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Session Complete Screen
  if (sessionComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-12 text-center space-y-6">
          <Trophy className="w-20 h-20 mx-auto text-solana-green" />
          <h2 className="text-4xl font-bold">Session Complete!</h2>
          <p className="text-2xl font-semibold text-solana-green">
            Total Earned: {totalEarned.toFixed(2)} SOL
          </p>
          <p className="text-lg text-muted-foreground">
            You've earned back your full {INITIAL_DEPOSIT} SOL deposit!
          </p>

          <div className="py-6">
            <pre className="text-sm text-center font-mono text-solana-green">
{`    ★ ★ ★ ★ ★
  ALL MODULES COMPLETE!`}
            </pre>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                if (onSessionComplete) onSessionComplete()
              }}
              variant="solana"
              size="lg"
              className="w-full"
            >
              Start New Session (Pay {INITIAL_DEPOSIT} SOL)
            </Button>
            <Button
              onClick={() => {
                if (onReturnHome) onReturnHome()
              }}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Starting a new session requires another {INITIAL_DEPOSIT} SOL deposit.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Lesson View
  if (viewMode === 'lesson') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className="font-mono">
              MODULE {currentModule.id}/{LEARNING_MODULES.length}
            </Badge>
            <span className="text-muted-foreground">
              {totalEarned.toFixed(1)} / {INITIAL_DEPOSIT} SOL
            </span>
          </div>
          <Progress value={(totalEarned / INITIAL_DEPOSIT) * 100} />
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <pre className="text-center font-mono text-sm text-solana-purple">
{`╔════════════════════════════╗
║     MODULE ${currentModule.id}/3           ║
╚════════════════════════════╝`}
              </pre>
              <CardTitle className="text-2xl text-center">{currentModule.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {currentModule.lessonContent}
              </p>
            </div>

            <Button
              onClick={() => {
                setViewMode('question')
                setShowHint(false)
                setFeedbackMessage('')
              }}
              variant="solana"
              size="lg"
              className="w-full"
            >
              Continue to Question
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Question View
  if (viewMode === 'question') {
    const hintIndex = Math.min(attemptCount, currentModule.hints.length - 1)

    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className="font-mono">
              MODULE {currentModule.id}/{LEARNING_MODULES.length}
            </Badge>
            <span className="text-muted-foreground">
              {totalEarned.toFixed(1)} / {INITIAL_DEPOSIT} SOL
            </span>
          </div>
          <Progress value={(totalEarned / INITIAL_DEPOSIT) * 100} />
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <pre className="text-center font-mono text-sm text-solana-green">
{`┌─────────────────────────┐
│       QUESTION          │
└─────────────────────────┘`}
              </pre>
              <CardTitle className="text-xl">{currentModule.question}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feedback Messages */}
            {feedbackMessage === 'correct' && (
              <div className="p-4 bg-solana-green/10 border border-solana-green/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-solana-green flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-solana-green">Excellent! You got it!</p>
                      {evaluationMethod === 'ai' && (
                        <Badge variant="outline" className="text-xs bg-solana-purple/20 text-solana-purple border-solana-purple/30">
                          🤖 AI Evaluated
                        </Badge>
                      )}
                    </div>
                    {aiFeedback && (
                      <p className="text-sm text-foreground mt-2 mb-2">
                        {aiFeedback}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Reward: {currentModule.reward} SOL sent to your wallet!
                    </p>
                    {currentTxSignature && (
                      <a
                        href={`https://explorer.solana.com/tx/${currentTxSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-solana-green hover:underline mt-2 inline-block"
                      >
                        View transaction on Solana Explorer →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {feedbackMessage === 'incorrect' && showHint && (
              <div className="p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">Not quite there yet!</p>
                      {evaluationMethod === 'ai' && (
                        <Badge variant="outline" className="text-xs bg-solana-purple/20 text-solana-purple border-solana-purple/30">
                          🤖 AI Evaluated
                        </Badge>
                      )}
                    </div>
                    {aiFeedback && evaluationMethod === 'ai' && (
                      <p className="text-sm text-foreground mt-2 mb-2">
                        {aiFeedback}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Hint:</span> {currentModule.hints[hintIndex]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {feedbackMessage === 'error' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Error sending reward. Your answer was correct - please contact support.
                </p>
              </div>
            )}

            {/* Answer Input */}
            <div className="space-y-4">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                disabled={isLoading || feedbackMessage === 'correct'}
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows="5"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => setViewMode('lesson')}
                  variant="outline"
                  disabled={isLoading || feedbackMessage === 'correct'}
                >
                  Back to Lesson
                </Button>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !inputMessage.trim() || feedbackMessage === 'correct'}
                  variant="solana"
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">🤖 AI Evaluating</span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Answer in your own words - AI agent will evaluate and send payment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
