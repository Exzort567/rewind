import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Download, FileJson, CheckCircle, Clock, AlertTriangle, Coffee, CheckSquare, Square } from "lucide-react";

const ExportInstructions = ({ isOpen, onClose }) => {
  const steps = [
    {
      icon: <Settings size={20} />,
      title: "Navigate to Settings",
      description: "Click your profile picture in the top right corner (you know, that little circle with your face), then click 'Settings & privacy' → 'Settings'"
    },
    {
      icon: <Download size={20} />,
      title: "Find Export Option",
      description: "Click 'Accounts Center' → 'Your information and permissions' → 'Export your information' → 'Create export'"
    },
    {
      icon: <CheckCircle size={20} />,
      title: "Select Profile & Export Type",
      description: "Pick the profile you want to export (probably yours, unless you're being sneaky) and select 'Export to device'"
    },
    {
      icon: <FileJson size={20} />,
      title: "Choose Specific Info (IMPORTANT!)",
      description: "Don't be greedy! Under 'Choose specific info to export', select only 'Your Facebook activity' → 'Stories' and 'Posts'. Trust me, you don't need 47GB of random data clogging up your download."
    },
    {
      icon: <Clock size={20} />,
      title: "Set Date Range",
      description: "Pick your date range. Want all your posts from 2015? Sure, but that's gonna take a while... but again, you can just wait it 😉"
    },
    {
      icon: <FileJson size={20} />,
      title: "Choose Format: JSON",
      description: "Select JSON format. HTML is for viewing in browsers, but we're not cavemen here."
    },
    {
      icon: <Download size={20} />,
      title: "Media Quality",
      description: "Choose your media quality. High quality = beautiful memories but longer wait times. Low quality = potato pixels but faster downloads. Your choice, but again... you can just wait it 🤷‍♂️"
    }
  ]

  const dataChecklist = [
    { label: 'Posts', checked: true, description: 'Your timeline posts, photos, videos, and status updates' },
    { label: 'Stories', checked: true, description: 'Your archived Stories content' },
    { label: 'Profile information', checked: false, description: 'Optional - includes your avatar' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="export-modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="export-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Download size={24} className="text-accent" />
                <h2>How to Export Your Facebook Data</h2>
              </div>
              <button onClick={onClose} className="close-button">
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="warning-box">
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Fair Warning:</strong> This process might take anywhere from 30 minutes to several hours depending on how much digital baggage you've accumulated. 
                  Perfect time to make some coffee, binge a Netflix series, or contemplate your life choices.
                </div>
              </div>

              {/* Data Selection Checklist */}
              <div className="data-checklist">
                <h4>📋 What to Select When Exporting</h4>
                <div className="checklist-items">
                  {dataChecklist.map((item, idx) => (
                    <div key={idx} className={`checklist-item ${item.checked ? 'recommended' : 'optional'}`}>
                      {item.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                      <div className="checklist-content">
                        <span className="checklist-label">{item.label}</span>
                        <span className="checklist-desc">{item.description}</span>
                      </div>
                      <span className={`checklist-badge ${item.checked ? 'required' : 'optional'}`}>
                        {item.checked ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="steps-list">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="step-item"
                  >
                    <div className="step-number">
                      {index + 1}
                    </div>
                    <div className="step-icon-wrapper">
                      {step.icon}
                    </div>
                    <div className="step-content">
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pro-tips">
                <h4>
                  <Coffee size={20} />
                  Pro Tips for the Impatient
                </h4>
                <ul>
                  <li><strong>Don't sit there refreshing:</strong> Facebook will email you when it's ready. Go live your life!</li>
                  <li><strong>Keep it lean:</strong> Only export what you need. Your 10,000 pokes from 2012 can stay buried.</li>
                  <li><strong>Download expires:</strong> You have a few days to download once it's ready, so don't procrastinate... too much.</li>
                  <li><strong>ZIP file incoming:</strong> You'll get a ZIP file. That's what you upload to this app!</li>
                </ul>
              </div>

              <div className="final-note">
                <p>
                  Once you click "Start export", Facebook will work its magic in the background. 
                  You'll get an email when it's ready. Until then, just chill! 
                  <span className="emoji">🍕☕📺</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExportInstructions