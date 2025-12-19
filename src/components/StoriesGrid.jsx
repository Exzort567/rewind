import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Video, Camera, FileText, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const StoryCard = ({ story, index, onSelect, formatDate, getMediaInfo }) => {
  const mediaInfo = getMediaInfo(story)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="story-card"
      onClick={() => onSelect(story)}
    >
      {/* Media Thumbnail */}
      <div className="story-thumbnail">
        {mediaInfo?.blobUrl ? (
          mediaInfo.type === 'video' ? (
            <video src={mediaInfo.blobUrl} muted className="thumbnail-media" />
          ) : (
            <img src={mediaInfo.blobUrl} alt="" className="thumbnail-media" />
          )
        ) : (
          <div className="thumbnail-placeholder">
            {mediaInfo?.type === 'video' ? <Video size={32} /> : <Camera size={32} />}
          </div>
        )}
        <div className="media-badge-overlay">
          {mediaInfo?.type === 'video' && <Play size={14} />}
          {mediaInfo?.type === 'photo' && <Camera size={14} />}
          {!mediaInfo && <FileText size={14} />}
        </div>
      </div>
      
      <div className="story-info">
        <div className="story-date">
          <Clock size={12} />
          {formatDate(story.timestamp)}
        </div>
        <p className="story-title">{story.title || 'Archived Story'}</p>
      </div>
    </motion.div>
  )
}

const StoriesGrid = ({ stories, onStorySelect, formatDate, getMediaInfo }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    setCurrentPage(1)
  }, [stories])

  const totalPages = Math.ceil(stories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentStories = stories.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="stories-wrapper">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="stories-grid"
      >
        {stories.length === 0 ? (
          <div className="no-results">
            <Search size={48} strokeWidth={1} />
            <h3>No stories found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          currentStories.map((story, index) => (
            <StoryCard
              key={`${story.timestamp}-${startIndex + index}`}
              story={story}
              index={index}
              onSelect={onStorySelect}
              formatDate={formatDate}
              getMediaInfo={getMediaInfo}
            />
          ))
        )}
      </motion.div>

      {stories.length > itemsPerPage && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            className="pagination-btn" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default StoriesGrid
