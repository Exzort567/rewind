import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Video, Camera, Calendar, FolderOpen, Clock } from 'lucide-react'
import ExportInstructions from './ExportInstructions'
import ProgressBar from './ProgressBar'

const UploadSection = ({ onFileUpload, isUploading, uploadProgress }) => {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="upload-section"
      >
        <div className="upload-card">
          <motion.div 
            className="upload-icon"
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <FolderOpen size={56} strokeWidth={1.5} />
          </motion.div>
          <h2>Upload Your Facebook Archive</h2>
          <p className="upload-desc">
            Select your Facebook data archive (ZIP file) to view your archived stories and timeline posts in a clean, ad-free interface
          </p>
          <p className="upload-instructions">
            <button 
              onClick={() => setShowInstructions(true)}
              className="instructions-link"
            >
              📖 Click here to learn how to Export your Facebook Data
            </button>
          </p>
          <div className="upload-info">
            <div className="info-item">
              <Video size={16} />
              <span>View videos</span>
            </div>
            <div className="info-item">
              <Camera size={16} />
              <span>View photos</span>
            </div>
            <div className="info-item">
              <Calendar size={16} />
              <span>Filter by date</span>
            </div>
            <div className="info-item">
              <Clock size={16} />
              <span>Timeline view</span>
            </div>
          </div>
          <label className="file-input-label">
            <input 
              type="file" 
              accept=".zip" 
              onChange={onFileUpload}
              disabled={isUploading}
              className="file-input"
            />
            <span className="btn-content">
              {isUploading ? (
                <div className="upload-progress">
                  <div className="progress-container">
                    <motion.div 
                      className="progress-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="progress-text">
                      <div className="progress-main">{uploadProgress || 'Processing...'}</div>
                      <div className="progress-subtitle">Please wait, this may take a while for large files</div>
                    </div>
                  </div>
                  <ProgressBar label={uploadProgress} />
                </div>
              ) : (
                <>
                  <Upload size={20} />
                  Choose ZIP File
                </>
              )}
            </span>
          </label>
          <p className="upload-note">
            <strong>🔒 Privacy Note: </strong> Your files are processed entirely on your device. Nothing is uploaded to any server or database.
          </p>
        </div>
      </motion.div>

      <ExportInstructions 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </>
  )
}

export default UploadSection
