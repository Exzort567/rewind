import { motion } from 'framer-motion'
import { Upload, RotateCcw } from 'lucide-react'

const Header = ({ showReset, onReset }) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="header"
    >
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon-wrapper">
            <RotateCcw className="logo-icon" />
          </div>
          <div className="logo-text">
            <h1>Rewind</h1>
            <span className="logo-subtitle">Rewind your social life.</span>
          </div>
        </div>
        {showReset && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onReset} 
            className="reset-btn"
          >
            <Upload size={18} />
            New Upload
          </motion.button>
        )}
      </div>
    </motion.header>
  )
}

export default Header
