import { motion } from 'framer-motion'
import { ThumbsUp, MessageCircle, Share2, Play, Image, MapPin, Link2, Clock, User, ExternalLink } from 'lucide-react'
import { LinkPreview } from '@/components/ui/link-preview'

const PostCard = ({ post, index, onSelect, formatDate, getPostInfo, profilePicture, profileName }) => {
  const postInfo = getPostInfo(post)
  const hasMedia = postInfo.media.filter(m => m.type === 'photo' || m.type === 'video').length > 0
  const photos = postInfo.media.filter(m => m.type === 'photo')
  const videos = postInfo.media.filter(m => m.type === 'video')
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
  
  // Get display name from title (e.g., "Kenneth Quibel shared a post." -> "Kenneth Quibel")
  const displayName = profileName || postInfo.title?.split(' shared')[0]?.split(' updated')[0]?.split(' added')[0] || 'You'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min((index % 20) * 0.05, 0.5) }}
      whileHover={{ scale: 1.005 }}
      className="post-card"
      onClick={() => onSelect(post)}
    >
      {/* Post Header - Facebook 2012 Style */}
      <div className="post-header">
        <div className="post-avatar">
          {profilePicture ? (
            <img src={profilePicture} alt="" className="avatar-img" />
          ) : (
            <div className="avatar-fallback">
              {displayName?.charAt(0) || 'Y'}
            </div>
          )}
        </div>
        <div className="post-header-info">
          <span className="post-author">{displayName}</span>
          <div className="post-meta">
            <Clock size={12} />
            <span>{formatDate(post.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="post-body">
        {/* Post Text */}
        {postInfo.text && (
          <p className="post-text">{postInfo.text}</p>
        )}

        {/* Check-in */}
        {places.length > 0 && (
          <div className="post-checkin">
            <MapPin size={14} />
            <span>{places[0].place?.name}</span>
            {places[0].place?.address && (
              <span className="checkin-address">{places[0].place.address}</span>
            )}
          </div>
        )}

        {/* Shared Link Preview - Facebook Links */}
        {facebookLinks.length > 0 && (
          <div className="post-shared-content">
            <div className="shared-content-header">
              <Share2 size={16} className="shared-icon" />
              <span className="shared-label">{facebookLinks[0].contentType || 'Shared Link'}</span>
            </div>
            <div className="shared-link-container">
              <div className="link-preview-static">
                <img 
                  src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3e%3crect width='300' height='200' fill='%231877f2'/%3e%3ctext x='150' y='90' text-anchor='middle' fill='white' font-family='Arial' font-size='40' font-weight='bold'%3ef%3c/text%3e%3ctext x='150' y='120' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3eFacebook Post%3c/text%3e%3ctext x='150' y='140' text-anchor='middle' fill='rgba(255,255,255,0.8)' font-family='Arial' font-size='12'%3eClick to view original%3c/text%3e%3c/svg%3e"
                  alt="Facebook Post Preview"
                  className="facebook-preview-image"
                  width={300}
                  height={200}
                />
                <div className="facebook-preview-overlay">
                  <div className="facebook-preview-header">
                    <div className="facebook-logo">f</div>
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

        {/* Shared Link - Enhanced (Non-Facebook Links Only) */}
        {nonFacebookLinks.length > 0 && (
          <div className="post-link-preview" onClick={(e) => e.stopPropagation()}>
            <Link2 size={14} />
            <div className="link-info">
              <span className="link-name">{nonFacebookLinks[0].external?.name || 'Shared Link'}</span>
              {nonFacebookLinks[0].external?.description && (
                <span className="link-description">{nonFacebookLinks[0].external.description}</span>
              )}
              {links[0].external?.source && (
                <span className="link-source">{links[0].external.source}</span>
              )}
              {links[0].external?.url && (
                <a 
                  href={links[0].external.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link-url-preview"
                  title={links[0].external.url}
                >
                  <ExternalLink size={10} />
                  View Original Post
                </a>
              )}
            </div>
          </div>
        )}

        {/* Media Preview - Smaller thumbnails */}
        {hasMedia && (
          <div className={`post-media-grid media-count-${Math.min(photos.length + videos.length, 4)}`}>
            {/* Show up to 4 media items */}
            {[...photos, ...videos].slice(0, 4).map((media, idx) => (
              <div key={idx} className="post-media-item">
                {media.type === 'video' ? (
                  <>
                    {media.blobUrl ? (
                      <video src={media.blobUrl} muted className="post-media-preview" />
                    ) : (
                      <div className="media-placeholder">
                        <Play size={20} />
                      </div>
                    )}
                    <div className="media-type-badge video">
                      <Play size={10} />
                    </div>
                  </>
                ) : (
                  <>
                    {media.blobUrl ? (
                      <img src={media.blobUrl} alt="" className="post-media-preview" />
                    ) : (
                      <div className="media-placeholder">
                        <Image size={20} />
                      </div>
                    )}
                  </>
                )}
                {/* Show "Shared" indicator for shared original media */}
                {media.isSharedOriginal && (
                  <div className="shared-media-badge">
                    <Share2 size={8} />
                  </div>
                )}
                {/* Show "+X more" overlay on 4th item if there are more */}
                {idx === 3 && (photos.length + videos.length) > 4 && (
                  <div className="more-media-overlay">
                    +{(photos.length + videos.length) - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {postInfo.tags && postInfo.tags.length > 0 && (
        <div className="post-tags">
          {postInfo.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="post-tag">@{tag.name || 'Friend'}</span>
          ))}
          {postInfo.tags.length > 3 && (
            <span className="post-tag-more">+{postInfo.tags.length - 3} more</span>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default PostCard
