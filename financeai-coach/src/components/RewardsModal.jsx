import { useEffect, useState } from 'react'
import './RewardsModal.css'

export default function RewardsModal({ isOpen, reward, onClose }) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setShowConfetti(false)
    }
  }, [isOpen, onClose])

  if (!isOpen || !reward) return null

  return (
    <>
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#667eea', '#764ba2', '#f6d365', '#fda085', '#a8edea', '#fed6e3'][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>
      )}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-icon">🎉</div>
          <h2>Habit Completed!</h2>
          <div className="reward-badge">
            <div className="reward-amount">{reward.reward} SOL</div>
            <div className="reward-habit">{reward.habit}</div>
          </div>
          <p className="reward-message">
            Great job! You've earned a reward for completing this financial habit.
          </p>
          <div className="reward-note">
            <span className="note-icon">💡</span>
            <span>Your reward will be sent to your wallet shortly!</span>
          </div>
          <button onClick={onClose} className="close-button">
            Awesome! 🚀
          </button>
        </div>
      </div>
    </>
  )
}
