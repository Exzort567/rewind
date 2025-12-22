import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  Header, 
  Background, 
  UploadSection, 
  FilterSection, 
  StoriesGrid, 
  StoryDetail,
  PostsTimeline,
  PostDetail,
  MobileWarning
} from './components'
import { useStories, usePosts } from './hooks'
import { formatDate } from './utils'
import JSZip from 'jszip'
import './App.css'

function App() {
  // Stories state
  const {
    stories,
    filteredStories,
    dateFilter: storiesDateFilter,
    setDateFilter: setStoriesDateFilter,
    isUploading: storiesUploading,
    uploadProgress: storiesProgress,
    selectedStory,
    setSelectedStory,
    handleFileUpload: handleStoriesUpload,
    getMediaInfo,
    resetApp: resetStories
  } = useStories()

  // Posts state
  const {
    posts,
    filteredPosts,
    dateFilter: postsDateFilter,
    setDateFilter: setPostsDateFilter,
    yearFilter,
    setYearFilter,
    availableYears,
    postTypeFilter,
    setPostTypeFilter,
    isUploading: postsUploading,
    isProcessing: postsProcessing,
    uploadProgress: postsProgress,
    selectedPost,
    setSelectedPost,
    handleFileUpload: handlePostsUpload,
    getPostInfo,
    resetApp: resetPosts,
    profilePicture,
    profileName
  } = usePosts()

  const [currentPage, setCurrentPage] = useState(1)
  const [currentView, setCurrentView] = useState('stories') // 'stories' or 'posts'
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  // Check if we have data
  const hasStories = stories.length > 0
  const hasPosts = posts.length > 0
  const hasData = hasStories || hasPosts

  // Combined reset
  const resetApp = useCallback(() => {
    resetStories()
    resetPosts()
    setCurrentView('stories')
    setCurrentPage(1)
  }, [resetStories, resetPosts])

  // Combined file upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    // Mobile-specific file size check
    if (isMobile && file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('File too large for mobile device. Please try on a desktop computer or use a smaller Facebook data archive.')
      return
    }

    setIsUploading(true)
    setUploadProgress('Reading ZIP file...')
    
    try {
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file)
      
      setUploadProgress('Scanning archive contents...')
      
      // Check what data is available
      let hasStoriesData = false
      let hasPostsData = false
      
      for (const [path] of Object.entries(zipContent.files)) {
        if (path.endsWith('archived_stories.json')) {
          hasStoriesData = true
        }
        if ((path.includes('your_posts') || path.includes('posts/your_posts')) && path.endsWith('.json')) {
          hasPostsData = true
        }
      }
      
      if (!hasStoriesData && !hasPostsData) {
        alert('Could not find any Stories or Posts data in the uploaded file. Make sure you selected "Stories" and/or "Posts" when exporting your Facebook data.')
        setIsUploading(false)
        setUploadProgress('')
        return
      }

      let processedTypes = []
      if (hasStoriesData) processedTypes.push('Stories')
      if (hasPostsData) processedTypes.push('Posts')
      
      setUploadProgress(`Found ${processedTypes.join(' and ')} data. Processing...`)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Process both types of data
      if (hasStoriesData) {
        setUploadProgress('Processing Stories data...')
        // Create a fake event for the stories handler
        const fakeEvent = { target: { files: [file] } }
        await handleStoriesUpload(fakeEvent)
      }
      
      if (hasPostsData) {
        setUploadProgress('Processing Posts data...')
        const fakeEvent = { target: { files: [file] } }
        await handlePostsUpload(fakeEvent)
      }

      // Set default view based on what's available
      if (hasPostsData && !hasStoriesData) {
        setCurrentView('posts')
      }
      
      setUploadProgress('')
    } catch (error) {
      console.error('Error processing file:', error)
      
      let errorMessage = 'Error processing file. Please make sure you uploaded a valid Facebook data archive.'
      
      if (isMobile) {
        if (error.name === 'QuotaExceededError' || error.message.includes('memory')) {
          errorMessage = 'Not enough memory to process this file on mobile device. Please try on a desktop computer or use a smaller archive.'
        } else if (error.name === 'NetworkError' || error.message.includes('network')) {
          errorMessage = 'Network error on mobile. Please check your connection and try again.'
        } else if (isIOS && (error.message.includes('zip') || error.message.includes('decompress'))) {
          errorMessage = 'iOS Safari has trouble with large ZIP files. Please try using Chrome on your phone or Safari on desktop.'
        }
      }
      
      alert(errorMessage)
    }
    setIsUploading(false)
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [storiesDateFilter, stories.length, postsDateFilter, posts.length, yearFilter, postTypeFilter])

  return (
    <div className="app">
      <Background />
      <MobileWarning />
      
      <Header 
        showReset={hasData} 
        onReset={resetApp} 
      />

      <main className="main">
        <AnimatePresence mode="wait">
          {selectedStory ? (
            <StoryDetail 
              key="story-detail"
              story={selectedStory} 
              onClose={() => setSelectedStory(null)}
              formatDate={formatDate}
              getMediaInfo={getMediaInfo}
            />
          ) : selectedPost ? (
            <PostDetail
              key="post-detail"
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
              formatDate={formatDate}
              getPostInfo={getPostInfo}
              profilePicture={profilePicture}
              profileName={profileName}
            />
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="main-content"
            >
              {!hasData ? (
                <UploadSection 
                  onFileUpload={handleFileUpload} 
                  isUploading={isUploading || storiesUploading || postsUploading}
                  uploadProgress={uploadProgress || storiesProgress || postsProgress}
                />
              ) : (
                <>
                  {/* View Switcher */}
                  {(hasStories || hasPosts) && (
                    <div className="view-switcher">
                      <button 
                        className={`view-tab ${currentView === 'stories' ? 'active' : ''} ${!hasStories ? 'disabled' : ''}`}
                        onClick={() => hasStories && setCurrentView('stories')}
                        disabled={!hasStories}
                      >
                        <span className="view-icon">📖</span>
                        Stories
                        {hasStories && <span className="view-count">{stories.length}</span>}
                      </button>
                      <button 
                        className={`view-tab ${currentView === 'posts' ? 'active' : ''} ${!hasPosts ? 'disabled' : ''}`}
                        onClick={() => hasPosts && setCurrentView('posts')}
                        disabled={!hasPosts}
                      >
                        <span className="view-icon">📰</span>
                        Timeline
                        {postsProcessing ? (
                          <span className="view-count loading">Loading...</span>
                        ) : (
                          hasPosts && <span className="view-count">{filteredPosts.length}</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Stories View */}
                  {currentView === 'stories' && hasStories && (
                    <>
                      <FilterSection 
                        dateFilter={storiesDateFilter}
                        setDateFilter={setStoriesDateFilter}
                        storiesCount={filteredStories.length}
                        totalCount={stories.length}
                      />
                      <StoriesGrid 
                        stories={filteredStories}
                        onStorySelect={setSelectedStory}
                        formatDate={formatDate}
                        getMediaInfo={getMediaInfo}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                      />
                    </>
                  )}

                  {/* Posts/Timeline View */}
                  {currentView === 'posts' && hasPosts && (
                    <PostsTimeline
                      posts={filteredPosts}
                      onPostSelect={setSelectedPost}
                      formatDate={formatDate}
                      getPostInfo={getPostInfo}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      yearFilter={yearFilter}
                      setYearFilter={setYearFilter}
                      availableYears={availableYears}
                      postTypeFilter={postTypeFilter}
                      setPostTypeFilter={setPostTypeFilter}
                      totalCount={posts.length}
                      isProcessing={postsProcessing}
                      profilePicture={profilePicture}
                      profileName={profileName}
                    />
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
