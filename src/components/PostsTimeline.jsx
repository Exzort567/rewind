import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, Image, Video, MessageSquare, Filter, Loader2 } from 'lucide-react'
import PostCard from './PostCard'

const PostsTimeline = ({ 
  posts, 
  onPostSelect, 
  formatDate, 
  getPostInfo,
  currentPage,
  setCurrentPage,
  yearFilter,
  setYearFilter,
  availableYears,
  postTypeFilter,
  setPostTypeFilter,
  totalCount,
  isProcessing,
  profilePicture,
  profileName
}) => {
  const itemsPerPage = 20

  const totalPages = Math.ceil(posts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPosts = posts.slice(startIndex, startIndex + itemsPerPage)

  // Group posts by date for timeline view
  const groupedPosts = currentPosts.reduce((groups, post) => {
    const date = new Date(post.timestamp * 1000)
    const dateKey = date.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(post)
    return groups
  }, {})

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="timeline-wrapper">
      {/* Timeline Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="timeline-header"
      >
        <div className="timeline-header-top">
          <div className="timeline-title-section">
            <h2>Your Timeline</h2>
            <div className="results-badge">
              {posts.length} of {totalCount}
            </div>
          </div>
        </div>



        {/* Filters Row */}
        <div className="timeline-filters">
          {/* Year Filter */}
          <div className="year-filter">
            <Calendar size={16} />
            <select 
              value={yearFilter} 
              onChange={(e) => setYearFilter(e.target.value)}
              className="year-select"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Post Type Filter */}
          <div className="type-filter-tabs">
            <button 
              className={`type-tab ${postTypeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPostTypeFilter('all')}
            >
              <Filter size={14} />
              All
            </button>
            <button 
              className={`type-tab ${postTypeFilter === 'photos' ? 'active' : ''}`}
              onClick={() => setPostTypeFilter('photos')}
            >
              <Image size={14} />
              Photos
            </button>
            <button 
              className={`type-tab ${postTypeFilter === 'videos' ? 'active' : ''}`}
              onClick={() => setPostTypeFilter('videos')}
            >
              <Video size={14} />
              Videos
            </button>
          </div>
        </div>
      </motion.div>

      {/* Timeline Content */}
      <div className="timeline-content">
        {isProcessing ? (
          <div className="timeline-loader">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="loader-spinner"
            >
              <Loader2 size={40} />
            </motion.div>
            <h3>Loading your timeline...</h3>
            <p>Fetching all your precious memories</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-results">
            <Search size={48} strokeWidth={1} />
            <h3>No posts found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="timeline-feed">
            {/* Timeline Line */}
            <div className="timeline-line" />
            
            {Object.entries(groupedPosts).map(([dateKey, datePosts], groupIndex) => (
              <div key={dateKey} className="timeline-day">
                {/* Date Marker */}
                <motion.div 
                  className="timeline-date-marker"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.05 }}
                >
                  <div className="date-dot" />
                  <span className="date-text">{dateKey}</span>
                </motion.div>
                
                {/* Posts for this date */}
                <div className="timeline-posts">
                  {datePosts.map((post, index) => (
                    <PostCard
                      key={`${post.timestamp}-${index}`}
                      post={post}
                      index={startIndex + index}
                      onSelect={onPostSelect}
                      formatDate={formatDate}
                      getPostInfo={getPostInfo}
                      profilePicture={profilePicture}
                      profileName={profileName}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {posts.length > itemsPerPage && (
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

export default PostsTimeline
