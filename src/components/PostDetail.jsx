import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Play, Image, MapPin, Link2, Clock, User, ChevronLeft, ChevronRight, ExternalLink, X, Maximize2 } from 'lucide-react'
import { LinkPreview } from '@/components/ui/link-preview'

const PostDetail = ({ post, onClose, formatDate, getPostInfo, profilePicture, profileName }) => {
  const postInfo = getPostInfo(post)
  const photos = postInfo.media.filter(m => m.type === 'photo')
  const videos = postInfo.media.filter(m => m.type === 'video')
  const allMedia = [...photos, ...videos]
  const places = postInfo.media.filter(m => m.type === 'place')
  const links = postInfo.media.filter(m => m.type === 'link')
  const sharedLinks = postInfo.media.filter(m => m.type === 'sharedLink')
  
  // Separate Facebook and non-Facebook links
  const nonFacebookLinks = links.filter(link => !link.external?.url?.includes('facebook.com'))
  // Combine Facebook links - treat both sharedLinks and Facebook URLs in regular links the same
  const facebookLinks = [
    ...sharedLinks,
    ...links.filter(link => link.external?.url?.includes('facebook.com'))
  ]
  
  // Debug: log the link data to understand what's happening
  if (links.length > 0 || sharedLinks.length > 0) {
    console.log('Post links debug:', { 
      links, 
      sharedLinks, 
      nonFacebookLinks, 
      facebookLinks,
      postTitle: post.title 
    })
  }
  
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const currentMedia = allMedia[currentMediaIndex]
  
  // Get display name
  const displayName = profileName || postInfo.title?.split(' shared')[0]?.split(' updated')[0]?.split(' added')[0] || 'You'
  
  const handlePrevMedia = (e) => {
    e?.stopPropagation()
    setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1)
  }
  
  const handleNextMedia = (e) => {
    e?.stopPropagation()
    setCurrentMediaIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0)
  }
  
  const openMediaModal = () => {
    setShowMediaModal(true)
  }
  
  const closeMediaModal = () => {
    setShowMediaModal(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="post-detail"
    >
      <div className="post-detail-header">
        <motion.button 
          onClick={onClose} 
          className="back-button"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          Back to Timeline
        </motion.button>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="post-detail-content"
      >
        {/* Post Header */}
        <div className="post-detail-user">
          <div className="post-avatar large">
            {profilePicture ? (
              <img src={profilePicture} alt="" className="avatar-img" />
            ) : (
              <div className="avatar-fallback large">
                {displayName?.charAt(0) || 'Y'}
              </div>
            )}
          </div>
          <div className="post-header-info">
            <span className="post-author">{displayName}</span>
            <div className="post-meta">
              <Clock size={14} />
              <span>{formatDate(post.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Post Text */}
        {postInfo.text && (
          <div className="post-detail-text">
            <p>{postInfo.text}</p>
          </div>
        )}

        {/* Check-in */}
        {places.length > 0 && (
          <div className="post-detail-checkin">
            <MapPin size={18} />
            <div className="checkin-info">
              <span className="checkin-name">{places[0].place?.name}</span>
              {places[0].place?.address && (
                <span className="checkin-address">{places[0].place.address}</span>
              )}
            </div>
          </div>
        )}

        {/* Shared Links */}
        {facebookLinks.length > 0 && (
          <div className="post-detail-shared-content">
            <div className="shared-content-header large">
              <Share2 size={18} className="shared-icon" />
              <span className="shared-label">{facebookLinks[0].contentType || 'Shared Link'}</span>
            </div>
            <div className="shared-link-container large">
              <div className="link-preview-static large">
                <img 
                  src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3e%3crect width='400' height='250' fill='%231877f2'/%3e%3ctext x='200' y='110' text-anchor='middle' fill='white' font-family='Arial' font-size='50' font-weight='bold'%3ef%3c/text%3e%3ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='18'%3eFacebook Post%3c/text%3e%3ctext x='200' y='175' text-anchor='middle' fill='rgba(255,255,255,0.8)' font-family='Arial' font-size='14'%3eClick to view original%3c/text%3e%3c/svg%3e"
                  alt="Facebook Post Preview"
                  className="facebook-preview-image"
                  width={400}
                  height={250}
                />
                <div className="facebook-preview-overlay">
                  <div className="facebook-preview-header large">
                    <div className="facebook-logo large">f</div>
                    <div className="facebook-info">
                      <span className="facebook-title">Facebook Post</span>
                      <span className="facebook-desc">{facebookLinks[0].contentType || 'Shared Link'}</span>
                    </div>
                  </div>
                  <div className="link-preview-content">
                    <ExternalLink size={16} className="link-icon" />
                    <a href={facebookLinks[0].url || facebookLinks[0].external?.url} target="_blank" rel="noopener noreferrer" className="link-text" onClick={(e) => e.stopPropagation()}>
                      View Original Post on Facebook
                    </a>
                  </div>
                  <div className="link-preview-url">
                    {facebookLinks[0].url || facebookLinks[0].external?.url}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular External Links (Non-Facebook) */}
        {nonFacebookLinks.length > 0 && (
          <div className="post-detail-link">
            <Link2 size={18} />
            <div className="link-content">
              <span className="link-title">{nonFacebookLinks[0].external?.name || 'External Link'}</span>
              {nonFacebookLinks[0].external?.description && (
                <span className="link-description">{nonFacebookLinks[0].external.description}</span>
              )}
              {nonFacebookLinks[0].external?.source && (
                <span className="link-source">{nonFacebookLinks[0].external.source}</span>
              )}
              {nonFacebookLinks[0].external?.url && (
                <a 
                  href={nonFacebookLinks[0].external.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link-url"
                  title={nonFacebookLinks[0].external.url}
                >
                  <ExternalLink size={12} />
                  Open Link
                </a>
              )}
            </div>
          </div>
        )}

        {/* Media Gallery - Compact thumbnails */}
        {allMedia.length > 0 && (
          <div className="post-detail-media">
            <div className="media-main" onClick={openMediaModal}>
              {currentMedia?.type === 'video' ? (
                currentMedia.blobUrl ? (
                  <div className="media-preview-container">
                    <video 
                      src={currentMedia.blobUrl} 
                      className="detail-media-preview"
                      muted
                    />
                    <div className="play-overlay">
                      <Play size={48} />
                    </div>
                    <button className="expand-btn">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="detail-media-placeholder">
                    <Play size={48} />
                    <p>Video not found in archive</p>
                  </div>
                )
              ) : (
                currentMedia?.blobUrl ? (
                  <div className="media-preview-container">
                    <img 
                      src={currentMedia.blobUrl} 
                      alt="" 
                      className="detail-media-preview"
                    />
                    <button className="expand-btn">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="detail-media-placeholder">
                    <Image size={48} />
                    <p>Image not found in archive</p>
                  </div>
                )
              )}
              
              {/* Navigation arrows for multiple media */}
              {allMedia.length > 1 && (
                <>
                  <button className="media-nav prev" onClick={handlePrevMedia}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="media-nav next" onClick={handleNextMedia}>
                    <ChevronRight size={24} />
                  </button>
                  <div className="media-counter">
                    {currentMediaIndex + 1} / {allMedia.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Media Description */}
            {currentMedia?.description && (
              <p className="media-description">{currentMedia.description}</p>
            )}
            
            {/* Thumbnails */}
            {allMedia.length > 1 && (
              <div className="media-thumbnails">
                {allMedia.map((media, idx) => (
                  <button 
                    key={idx}
                    className={`thumbnail-btn ${idx === currentMediaIndex ? 'active' : ''}`}
                    onClick={() => setCurrentMediaIndex(idx)}
                  >
                    {media.type === 'video' ? (
                      media.blobUrl ? (
                        <video src={media.blobUrl} muted className="thumbnail-preview" />
                      ) : (
                        <div className="thumbnail-placeholder"><Play size={16} /></div>
                      )
                    ) : (
                      media.blobUrl ? (
                        <img src={media.blobUrl} alt="" className="thumbnail-preview" />
                      ) : (
                        <div className="thumbnail-placeholder"><Image size={16} /></div>
                      )
                    )}
                    {media.type === 'video' && (
                      <div className="thumbnail-video-badge"><Play size={10} /></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {postInfo.tags && postInfo.tags.length > 0 && (
          <div className="post-detail-tags">
            <h4>Tagged</h4>
            <div className="tags-list">
              {postInfo.tags.map((tag, idx) => (
                <span key={idx} className="detail-tag">
                  <User size={12} />
                  {tag.name || 'Friend'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Classic Facebook Actions */}
        <div className="post-detail-actions">
          <button className="action-btn">
            <ThumbsUp size={18} />
            Like
          </button>
          <button className="action-btn">
            <MessageCircle size={18} />
            Comment
          </button>
          <button className="action-btn">
            <Share2 size={18} />
            Share
          </button>
        </div>
      </motion.div>
      
      {/* Floating Media Modal */}
      <AnimatePresence>
        {showMediaModal && currentMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="media-modal-overlay"
            onClick={closeMediaModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="media-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={closeMediaModal}>
                <X size={24} />
              </button>
              
              {currentMedia.type === 'video' ? (
                <video 
                  src={currentMedia.blobUrl} 
                  controls 
                  autoPlay
                  className="modal-media"
                />
              ) : (
                <img 
                  src={currentMedia.blobUrl} 
                  alt="" 
                  className="modal-media"
                />
              )}
              
              {/* Modal Navigation */}
              {allMedia.length > 1 && (
                <>
                  <button className="modal-nav prev" onClick={handlePrevMedia}>
                    <ChevronLeft size={32} />
                  </button>
                  <button className="modal-nav next" onClick={handleNextMedia}>
                    <ChevronRight size={32} />
                  </button>
                  <div className="modal-counter">
                    {currentMediaIndex + 1} / {allMedia.length}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PostDetail
