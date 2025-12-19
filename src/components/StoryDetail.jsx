import { motion } from 'framer-motion'
import { ArrowLeft, Video, Camera, FileText, Clock, FolderOpen } from 'lucide-react'

const StoryDetail = ({ story, onClose, formatDate, getMediaInfo }) => {
  const mediaInfo = getMediaInfo(story)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="story-detail"
    >
      <div className="story-detail-header">
        <motion.button 
          onClick={onClose} 
          className="back-button"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          Back to Stories
        </motion.button>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="story-detail-content"
      >
        {/* Media Display */}
        {mediaInfo?.blobUrl && (
          <div className="detail-media">
            {mediaInfo.type === 'video' ? (
              <video 
                src={mediaInfo.blobUrl} 
                controls 
                autoPlay
                className="media-player"
              />
            ) : (
              <img 
                src={mediaInfo.blobUrl} 
                alt="Story" 
                className="media-image"
              />
            )}
          </div>
        )}
        
        {!mediaInfo?.blobUrl && (
          <div className="detail-media-placeholder">
            {mediaInfo?.type === 'video' ? <Video size={48} /> : <Camera size={48} />}
            <p>Media file not found in archive</p>
          </div>
        )}
        
        <div className="detail-info-section">
          <div className="detail-badge">
            {mediaInfo?.type === 'video' && <Video size={16} />}
            {mediaInfo?.type === 'photo' && <Camera size={16} />}
            {!mediaInfo && <FileText size={16} />}
            <span>{mediaInfo?.type?.toUpperCase() || 'TEXT'} STORY</span>
          </div>
          
          <div className="detail-timestamp">
            <Clock size={16} />
            {formatDate(story.timestamp)}
          </div>
          
          <h2 className="detail-title">{story.title || 'Archived Story'}</h2>
          
          {mediaInfo && (
            <div className="detail-section">
              <h3>
                <FolderOpen size={16} />
                File Information
              </h3>
              <div className="detail-info">
                <div className="info-row">
                  <span className="info-label">Filename</span>
                  <span className="info-value">{mediaInfo.filename}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Path</span>
                  <span className="info-value path">{mediaInfo.path}</span>
                </div>
                {mediaInfo.creationTimestamp && (
                  <div className="info-row">
                    <span className="info-label">Created</span>
                    <span className="info-value">{formatDate(mediaInfo.creationTimestamp)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StoryDetail
