import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Sparkles, Coins, CheckCircle2, ChevronRight } from 'lucide-react'

export default function RewardsModal({ isOpen, reward, onClose }) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setShowConfetti(false)
    }
  }, [isOpen, onClose])

  if (!reward) return null

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 opacity-80 animate-[confettiFall_3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#9945FF', '#14F195', '#c084fc', '#19FB9B', '#7d38d9', '#00D18C'][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center animate-bounce">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-3xl">Module Completed!</DialogTitle>
            <DialogDescription className="text-base">
              Great job! You've earned a reward for completing this learning module.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            <Badge variant="solana" className="text-2xl px-6 py-3 font-bold">
              <Coins className="w-5 h-5 mr-2" />
              {reward.reward} SOL
            </Badge>

            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {reward.module}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-solana-green" />
              <span>Reward sent to your wallet!</span>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="solana"
            size="lg"
            className="w-full"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
