import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  Header, 
  Background, 
  UploadSection, 
  FilterSection, 
  StoriesGrid, 
  StoryDetail 
} from './components'
import { useStories } from './hooks'
import { formatDate } from './utils'
import './App.css'

function App() {
  const {
    stories,
    filteredStories,
    dateFilter,
    setDateFilter,
    isUploading,
    uploadProgress,
    selectedStory,
    setSelectedStory,
    searchTerm,
    setSearchTerm,
    handleFileUpload,
    getMediaInfo,
    resetApp
  } = useStories()

  const [currentPage, setCurrentPage] = useState(1)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateFilter, searchTerm, stories.length])

  return (
    <div className="app">
      <Background />
      
      <Header 
        showReset={stories.length > 0} 
        onReset={resetApp} 
      />

      <main className="main">
        <AnimatePresence mode="wait">
          {selectedStory ? (
            <StoryDetail 
              key="detail"
              story={selectedStory} 
              onClose={() => setSelectedStory(null)}
              formatDate={formatDate}
              getMediaInfo={getMediaInfo}
            />
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="main-content"
            >
              {stories.length === 0 ? (
                <UploadSection 
                  onFileUpload={handleFileUpload} 
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              ) : (
                <>
                  <FilterSection 
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
