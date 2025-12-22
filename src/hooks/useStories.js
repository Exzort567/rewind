import { useState, useEffect, useCallback } from 'react'
import { isWithinInterval } from 'date-fns'
import JSZip from 'jszip'

export const useStories = () => {
  const [stories, setStories] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [mediaFiles, setMediaFiles] = useState({})
  const [dateFilter, setDateFilter] = useState({ 
    type: 'all', 
    startDate: '', 
    endDate: '', 
    specificDate: '' 
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [selectedStory, setSelectedStory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter stories based on date and search
  const filterStories = useCallback(() => {
    let filtered = [...stories]
    
    // Apply date filter
    if (dateFilter.type === 'specific' && dateFilter.specificDate) {
      const targetDate = new Date(dateFilter.specificDate)
      filtered = filtered.filter(story => {
        const storyDate = new Date(story.timestamp * 1000)
        return storyDate.toDateString() === targetDate.toDateString()
      })
    } else if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
      const start = new Date(dateFilter.startDate)
      const end = new Date(dateFilter.endDate)
      filtered = filtered.filter(story => {
        const storyDate = new Date(story.timestamp * 1000)
        return isWithinInterval(storyDate, { start, end })
      })
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(story => 
        story.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredStories(filtered)
  }, [stories, dateFilter, searchTerm])

  useEffect(() => {
    filterStories()
  }, [filterStories])

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(mediaFiles).forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  // Check if device is mobile/iOS
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check file size for mobile devices
    if (isMobile && file.size > 100 * 1024 * 1024) { // 100MB limit for mobile
      alert('File too large for mobile device. Please try on a desktop computer or use a smaller archive.')
      return
    }

    setIsUploading(true)
    setUploadProgress('Reading ZIP file...')
    
    try {
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file)
      
      setUploadProgress('Looking for stories data...')
      
      // Look for archived_stories.json
      let storiesFile = null
      let storiesPath = ''
      
      for (const [path, zipFile] of Object.entries(zipContent.files)) {
        if (path.endsWith('archived_stories.json') && !zipFile.dir) {
          storiesFile = zipFile
          storiesPath = path.replace('archived_stories.json', '')
          break
        }
      }
      
      if (!storiesFile) {
        alert('Could not find archived_stories.json in the uploaded file')
        setIsUploading(false)
        setUploadProgress('')
        return
      }
      
      const content = await storiesFile.async('text')
      const data = JSON.parse(content)
      
      if (!data.archived_stories_v2) {
        alert('Invalid file format. Please upload a valid Facebook data archive.')
        setIsUploading(false)
        setUploadProgress('')
        return
      }

      const storiesData = data.archived_stories_v2
      const totalStories = storiesData.length
      setUploadProgress(`Found ${totalStories} stories`)
      
      // Small delay to show the count
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUploadProgress('Analyzing media files...')
      
      // Extract all media files
      const mediaUrls = {}
      
      // Collect all media paths
      const mediaPaths = new Set()
      let storiesWithMedia = 0
      
      storiesData.forEach((story, index) => {
        if (story.attachments?.[0]?.data?.[0]?.media?.uri) {
          mediaPaths.add(story.attachments[0].data[0].media.uri)
          storiesWithMedia++
        }
        
        // Update progress every 100 stories
        if ((index + 1) % 100 === 0 || index === totalStories - 1) {
          setUploadProgress(`Analyzed ${index + 1}/${totalStories} stories...`)
        }
      })
      
      setUploadProgress(`Found ${storiesWithMedia} stories with media (${mediaPaths.size} unique files)`)
      
      // Extract media files with mobile optimizations
      let extracted = 0
      const totalMedia = mediaPaths.size
      const maxMediaFiles = isMobile ? 50 : 200 // Limit media files on mobile
      const targetFiles = Math.min(totalMedia, maxMediaFiles)
      
      setUploadProgress(`Extracting media files (0/${targetFiles})...`)
      
      // Sort media paths to prioritize smaller files on mobile
      const sortedPaths = Array.from(mediaPaths)
      
      for (const mediaPath of sortedPaths.slice(0, maxMediaFiles)) {
        // Add delay on mobile to prevent memory issues
        if (isMobile && extracted % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        const possiblePaths = [
          mediaPath,
          storiesPath.split('/')[0] + '/' + mediaPath,
        ]
        
        for (const tryPath of possiblePaths) {
          const mediaFile = zipContent.files[tryPath]
          if (mediaFile && !mediaFile.dir) {
            try {
              // Check file size before processing on mobile
              if (isMobile && mediaFile._data && mediaFile._data.uncompressedSize > 5 * 1024 * 1024) {
                continue // Skip files larger than 5MB on mobile
              }
              
              const blob = await mediaFile.async('blob')
              const isVideo = mediaPath.includes('videos/') || mediaPath.endsWith('.mp4')
              const mimeType = isVideo ? 'video/mp4' : 'image/jpeg'
              const typedBlob = new Blob([blob], { type: mimeType })
              mediaUrls[mediaPath] = URL.createObjectURL(typedBlob)
              extracted++
              
              // Update progress more frequently
              if (extracted % 5 === 0 || extracted === targetFiles) {
                setUploadProgress(`Extracting media files (${extracted}/${targetFiles})...`)
              }
              break
            } catch (e) {
              console.error('Error extracting media:', tryPath, e)
              if (isMobile && e.name === 'QuotaExceededError') {
                alert('Device storage full. Some media files will not be displayed.')
                break
              }
            }
          }
        }
      }
      
      setUploadProgress('Finalizing stories...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setMediaFiles(mediaUrls)
      setStories(storiesData)
      setFilteredStories(storiesData)
      setUploadProgress('')
      
    } catch (error) {
      console.error('Error processing file:', error)
      
      let errorMessage = 'Error processing file. Please make sure you uploaded a valid Facebook data archive.'
      
      if (isMobile) {
        if (error.name === 'QuotaExceededError' || error.message.includes('memory')) {
          errorMessage = 'Not enough memory to process this file on mobile device. Please try on a desktop computer or use a smaller archive.'
        } else if (error.name === 'NetworkError' || error.message.includes('network')) {
          errorMessage = 'Network error on mobile. Please check your connection and try again.'
        } else if (isIOS && error.message.includes('zip')) {
          errorMessage = 'iOS Safari has trouble with large ZIP files. Please try using Chrome or Safari on desktop.'
        }
      }
      
      alert(errorMessage)
    }
    setIsUploading(false)
  }

  // Get media info for a story
  const getMediaInfo = useCallback((story) => {
    if (story.attachments?.[0]?.data?.[0]?.media) {
      const media = story.attachments[0].data[0].media
      const uri = media.uri || ''
      const filename = uri.split('/').pop() || 'Unknown file'
      const isVideo = uri.includes('videos/') || uri.endsWith('.mp4')
      const isPhoto = uri.includes('photos/') || uri.includes('images/') || uri.endsWith('.jpg') || uri.endsWith('.png')
      
      return {
        type: isVideo ? 'video' : isPhoto ? 'photo' : 'media',
        filename,
        path: uri,
        blobUrl: mediaFiles[uri] || null,
        description: media.description || '',
        creationTimestamp: media.creation_timestamp
      }
    }
    return null
  }, [mediaFiles])

  // Reset app state
  const resetApp = useCallback(() => {
    Object.values(mediaFiles).forEach(url => URL.revokeObjectURL(url))
    setStories([])
    setFilteredStories([])
    setMediaFiles({})
    setDateFilter({ type: 'all', startDate: '', endDate: '', specificDate: '' })
    setSearchTerm('')
    setSelectedStory(null)
  }, [mediaFiles])

  return {
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
  }
}
