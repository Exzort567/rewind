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

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

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

      setUploadProgress('Extracting media files...')
      
      // Extract all media files
      const mediaUrls = {}
      const storiesData = data.archived_stories_v2
      
      // Collect all media paths
      const mediaPaths = new Set()
      storiesData.forEach(story => {
        if (story.attachments?.[0]?.data?.[0]?.media?.uri) {
          mediaPaths.add(story.attachments[0].data[0].media.uri)
        }
      })
      
      // Extract media files
      let extracted = 0
      const totalMedia = mediaPaths.size
      
      for (const mediaPath of mediaPaths) {
        const possiblePaths = [
          mediaPath,
          storiesPath.split('/')[0] + '/' + mediaPath,
        ]
        
        for (const tryPath of possiblePaths) {
          const mediaFile = zipContent.files[tryPath]
          if (mediaFile && !mediaFile.dir) {
            try {
              const blob = await mediaFile.async('blob')
              const isVideo = mediaPath.includes('videos/') || mediaPath.endsWith('.mp4')
              const mimeType = isVideo ? 'video/mp4' : 'image/jpeg'
              const typedBlob = new Blob([blob], { type: mimeType })
              mediaUrls[mediaPath] = URL.createObjectURL(typedBlob)
              extracted++
              setUploadProgress(`Extracting media... (${extracted}/${totalMedia})`)
              break
            } catch (e) {
              console.error('Error extracting media:', tryPath, e)
            }
          }
        }
      }
      
      setMediaFiles(mediaUrls)
      setStories(storiesData)
      setFilteredStories(storiesData)
      setUploadProgress('')
      
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please make sure you uploaded a valid Facebook data archive.')
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
