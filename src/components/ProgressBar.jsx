import { motion } from 'framer-motion'

const ProgressBar = ({ progress, label, showPercentage = false }) => {
  // Extract percentage from label if it contains (x/y) format
  const getProgress = () => {
    if (showPercentage) return progress
    
    // Try to extract progress from label like "Extracting media files (50/100)..."
    const match = label?.match(/\((\d+)\/(\d+)\)/)
    if (match) {
      const [, current, total] = match
      return (parseInt(current) / parseInt(total)) * 100
    }
    
    // Default to indeterminate progress
    return null
  }

  const progressValue = getProgress()

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track">
        {progressValue !== null ? (
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, progressValue))}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        ) : (
          <motion.div
            className="progress-bar-indeterminate"
            animate={{ x: ["0%", "100%"] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatType: "reverse"
            }}
          />
        )}
      </div>
      {progressValue !== null && (
        <span className="progress-percentage">{Math.round(progressValue)}%</span>
      )}
    </div>
  )
}

export default ProgressBar