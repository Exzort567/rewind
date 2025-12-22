import { useState, useEffect } from 'react'
import { X, Smartphone, Monitor } from 'lucide-react'

const MobileWarning = () => {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const hasBeenDismissed = localStorage.getItem('mobileWarningDismissed')
    
    if (isMobile && !hasBeenDismissed && !dismissed) {
      setShow(true)
    }
  }, [dismissed])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('mobileWarningDismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="mobile-warning">
      <div className="mobile-warning-content">
        <div className="mobile-warning-header">
          <Smartphone size={24} className="mobile-warning-icon" />
          <h3>Mobile Device Detected</h3>
          <button onClick={handleDismiss} className="mobile-warning-close">
            <X size={20} />
          </button>
        </div>
        <div className="mobile-warning-body">
          <p>
            For the best experience with large Facebook archives, we recommend using a desktop computer.
          </p>
          <div className="mobile-warning-tips">
            <h4>Mobile limitations:</h4>
            <ul>
              <li>• File size limited to 100MB</li>
              <li>• Fewer media files processed</li>
              <li>• iOS Safari may have ZIP file issues</li>
            </ul>
          </div>
          <div className="mobile-warning-suggestion">
            <Monitor size={16} />
            <span>Use desktop for full functionality</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileWarning