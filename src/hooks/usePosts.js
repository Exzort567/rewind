import { useState, useEffect, useCallback } from 'react'
import { isWithinInterval } from 'date-fns'
import JSZip from 'jszip'

export const usePosts = () => {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [mediaFiles, setMediaFiles] = useState({})
  const [profilePicture, setProfilePicture] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [availableYears, setAvailableYears] = useState([])
  const [dateFilter, setDateFilter] = useState({ 
    type: 'all', 
    startDate: '', 
    endDate: '', 
    specificDate: '' 
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [postTypeFilter, setPostTypeFilter] = useState('all') // all, photos, videos, status

  // Extract years from posts
  const extractYears = useCallback((postsData) => {
    const years = new Set()
    postsData.forEach(post => {
      const year = new Date(post.timestamp * 1000).getFullYear()
      years.add(year)
    })
    return Array.from(years).sort((a, b) => b - a) // Sort descending
  }, [])

  // Filter posts based on date, year, search, and type
  const filterPosts = useCallback(() => {
    let filtered = [...posts]
    
    // Apply year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(post => {
        const postYear = new Date(post.timestamp * 1000).getFullYear()
        return postYear === parseInt(yearFilter)
      })
    }
    
    // Apply date filter
    if (dateFilter.type === 'specific' && dateFilter.specificDate) {
      const targetDate = new Date(dateFilter.specificDate)
      filtered = filtered.filter(post => {
        const postDate = new Date(post.timestamp * 1000)
        return postDate.toDateString() === targetDate.toDateString()
      })
    } else if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
      const start = new Date(dateFilter.startDate)
      const end = new Date(dateFilter.endDate)
      filtered = filtered.filter(post => {
        const postDate = new Date(post.timestamp * 1000)
        return isWithinInterval(postDate, { start, end })
      })
    }


    // Apply post type filter
    if (postTypeFilter !== 'all') {
      filtered = filtered.filter(post => {
        const hasPhotos = post.attachments?.some(a => 
          a.data?.some(d => d.media && (
            d.media.uri?.includes('photos/') || 
            d.media.uri?.endsWith('.jpg') || 
            d.media.uri?.endsWith('.png')
          ))
        )
        const hasVideos = post.attachments?.some(a => 
          a.data?.some(d => d.media && (
            d.media.uri?.includes('videos/') || 
            d.media.uri?.endsWith('.mp4')
          ))
        )

        if (postTypeFilter === 'photos') return hasPhotos
        if (postTypeFilter === 'videos') return hasVideos
        return true
      })
    }
    
    // Always filter out posts without media (photos or videos)
    filtered = filtered.filter(post => {
      const hasPhotos = post.attachments?.some(a => 
        a.data?.some(d => d.media && (
          d.media.uri?.includes('photos/') || 
          d.media.uri?.endsWith('.jpg') || 
          d.media.uri?.endsWith('.png')
        ))
      )
      const hasVideos = post.attachments?.some(a => 
        a.data?.some(d => d.media && (
          d.media.uri?.includes('videos/') || 
          d.media.uri?.endsWith('.mp4')
        ))
      )
      
      return hasPhotos || hasVideos
    })
    
    setFilteredPosts(filtered)
  }, [posts, dateFilter, yearFilter, postTypeFilter])

  useEffect(() => {
    filterPosts()
  }, [filterPosts])

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
    setIsProcessing(true)
    setUploadProgress('Reading ZIP file...')
    
    try {
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file)
      
      setUploadProgress('Looking for posts data...')
      
      // Look for posts JSON files - Facebook exports posts in multiple JSON files
      let postsData = []
      let postsPath = ''
      let contentSharingLinks = []
      
      // Also look for profile information
      let profileInfo = null
      let profilePicPath = ''
      
      for (const [path, zipFile] of Object.entries(zipContent.files)) {
        // Look for your_posts_*.json files (Facebook's naming convention)
        if ((path.includes('your_posts') || path.includes('posts/your_posts')) && 
            path.endsWith('.json') && !zipFile.dir) {
          try {
            const content = await zipFile.async('text')
            const data = JSON.parse(content)
            
            // Facebook posts JSON structure can vary
            if (Array.isArray(data)) {
              postsData = postsData.concat(data)
            } else if (data.posts) {
              postsData = postsData.concat(data.posts)
            }
            
            if (!postsPath) {
              postsPath = path.substring(0, path.lastIndexOf('/') + 1)
            }
          } catch (e) {
            console.error('Error parsing posts file:', path, e)
          }
        }
        
        // Look for content sharing links
        if (path.includes('content_sharing_links') && path.endsWith('.json') && !zipFile.dir) {
          try {
            const content = await zipFile.async('text')
            const data = JSON.parse(content)
            if (Array.isArray(data)) {
              contentSharingLinks = contentSharingLinks.concat(data)
            }
          } catch (e) {
            console.error('Error parsing content sharing links:', path, e)
          }
        }
        
        // Look for profile information
        if (path.includes('profile_information.json') && !zipFile.dir) {
          try {
            const content = await zipFile.async('text')
            profileInfo = JSON.parse(content)
          } catch (e) {
            console.error('Error parsing profile info:', path, e)
          }
        }
        
        // Find profile pictures folder
        if (path.includes('Profilepictures') && !profilePicPath) {
          profilePicPath = path.substring(0, path.lastIndexOf('/') + 1)
        }
      }
      
      if (postsData.length === 0) {
        alert('Could not find any posts data in the uploaded file. Make sure you selected "Posts" when exporting your Facebook data.')
        setIsUploading(false)
        setIsProcessing(false)
        setUploadProgress('')
        return
      }

      const totalPosts = postsData.length
      setUploadProgress(`Found ${totalPosts} posts`)
      
      // Small delay to show the count
      await new Promise(resolve => setTimeout(resolve, 500))

      // Extract profile name
      if (profileInfo?.profile_v2?.name?.full_name) {
        setProfileName(decodeText(profileInfo.profile_v2.name.full_name))
      }

      setUploadProgress('Analyzing posts for media...')
      
      // Extract all media files
      const mediaUrls = {}
      
      // Collect all media paths from posts
      const mediaPaths = new Set()
      let postsWithMedia = 0
      
      postsData.forEach((post, index) => {
        let hasMedia = false
        
        // Check attachments for media
        post.attachments?.forEach(attachment => {
          attachment.data?.forEach(item => {
            if (item.media?.uri) {
              mediaPaths.add(item.media.uri)
              hasMedia = true
            }
          })
        })
        
        if (hasMedia) {
          postsWithMedia++
        }
        
        // Update progress every 50 posts
        if ((index + 1) % 50 === 0 || index === totalPosts - 1) {
          setUploadProgress(`Analyzed ${index + 1}/${totalPosts} posts...`)
        }
      })
      
      setUploadProgress(`Found ${postsWithMedia} posts with media (${mediaPaths.size} unique files)`)
      
      // Extract profile picture (get the most recent one by sorting filenames)
      if (profilePicPath) {
        const profilePics = []
        for (const [path, zipFile] of Object.entries(zipContent.files)) {
          if (path.startsWith(profilePicPath) && (path.endsWith('.jpg') || path.endsWith('.png')) && !zipFile.dir) {
            const filename = path.split('/').pop()
            const timestamp = filename.split('.')[0] // Extract timestamp from filename
            profilePics.push({ path, zipFile, timestamp: parseInt(timestamp) || 0 })
          }
        }
        
        // Sort by timestamp (most recent first) and extract the most recent one
        if (profilePics.length > 0) {
          profilePics.sort((a, b) => b.timestamp - a.timestamp)
          try {
            const blob = await profilePics[0].zipFile.async('blob')
            const typedBlob = new Blob([blob], { type: 'image/jpeg' })
            setProfilePicture(URL.createObjectURL(typedBlob))
          } catch (e) {
            console.error('Error extracting profile pic:', e)
            setProfilePicture(null) // No profile picture available
          }
        } else {
          setProfilePicture(null) // No profile pictures found
        }
      }
      
      // Extract media files
      let extracted = 0
      const totalMedia = mediaPaths.size
      
      setUploadProgress(`Extracting media files (0/${totalMedia})...`)
      
      for (const mediaPath of mediaPaths) {
        const possiblePaths = [
          mediaPath,
          postsPath.split('/')[0] + '/' + mediaPath,
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
              
              // Update progress more frequently
              if (extracted % 10 === 0 || extracted === totalMedia) {
                setUploadProgress(`Extracting media files (${extracted}/${totalMedia})...`)
              }
              break
            } catch (e) {
              console.error('Error extracting media:', tryPath, e)
            }
          }
        }
      }
      
      // Sort posts by timestamp (newest first)
      setUploadProgress('Organizing posts by date...')
      postsData.sort((a, b) => b.timestamp - a.timestamp)
      
      // Decode Facebook's weird encoding
      setUploadProgress('Decoding post content...')
      const decodedPosts = postsData.map((post, index) => {
        if ((index + 1) % 100 === 0) {
          setUploadProgress(`Decoding posts (${index + 1}/${totalPosts})...`)
        }
        return decodePost(post)
      })
      
      setUploadProgress('Finalizing posts...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Only use regular posts, skip shared content links entirely
      const allPosts = [...decodedPosts]
      
      // Sort all posts by timestamp (newest first)
      allPosts.sort((a, b) => b.timestamp - a.timestamp)
      
      setUploadProgress('Building timeline...')
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setMediaFiles(mediaUrls)
      setPosts(allPosts)
      setFilteredPosts(allPosts)
      setAvailableYears(extractYears(allPosts))
      
      setUploadProgress('Timeline ready!')
      setTimeout(() => {
        setUploadProgress('')
        setIsProcessing(false)
      }, 500)
      
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please make sure you uploaded a valid Facebook data archive.')
      setIsProcessing(false)
    }
    setIsUploading(false)
  }

  // Decode Facebook's UTF-8 encoded text
  const decodeText = (text) => {
    if (!text) return text
    try {
      // Facebook encodes special characters weirdly
      return decodeURIComponent(escape(text))
    } catch (e) {
      return text
    }
  }

  // Decode entire post object
  const decodePost = (post) => {
    const decoded = { ...post }
    
    if (decoded.title) {
      decoded.title = decodeText(decoded.title)
    }
    
    if (decoded.data) {
      decoded.data = decoded.data.map(d => ({
        ...d,
        post: d.post ? decodeText(d.post) : d.post
      }))
    }
    
    if (decoded.attachments) {
      decoded.attachments = decoded.attachments.map(a => ({
        ...a,
        data: a.data?.map(d => ({
          ...d,
          media: d.media ? {
            ...d.media,
            description: d.media.description ? decodeText(d.media.description) : d.media.description,
            title: d.media.title ? decodeText(d.media.title) : d.media.title
          } : d.media,
          place: d.place ? {
            ...d.place,
            name: d.place.name ? decodeText(d.place.name) : d.place.name,
            address: d.place.address ? decodeText(d.place.address) : d.place.address
          } : d.place,
          external_context: d.external_context ? {
            ...d.external_context,
            name: d.external_context.name ? decodeText(d.external_context.name) : d.external_context.name,
            source: d.external_context.source ? decodeText(d.external_context.source) : d.external_context.source,
            url: d.external_context.url
          } : d.external_context
        }))
      }))
    }
    
    return decoded
  }

  // Get post info
  const getPostInfo = useCallback((post) => {
    // Get post text
    const postText = post.data?.find(d => d.post)?.post || ''
    
    // Get all media from attachments
    const allMedia = []
    
    // Handle shared posts - add the link as a special media type
    if (post.isSharedPost && post.originalUrl) {
      allMedia.push({
        type: 'sharedLink',
        url: post.originalUrl,
        contentType: post.contentType,
        title: post.contentType
      })
    }
    
    // Handle regular attachments
    post.attachments?.forEach(attachment => {
      attachment.data?.forEach(item => {
        if (item.media) {
          const uri = item.media.uri || ''
          const isVideo = uri.includes('videos/') || uri.endsWith('.mp4')
          const isPhoto = uri.includes('photos/') || uri.includes('images/') || uri.endsWith('.jpg') || uri.endsWith('.png')
          allMedia.push({
            type: isVideo ? 'video' : isPhoto ? 'photo' : 'media',
            uri,
            blobUrl: mediaFiles[uri] || null,
            description: item.media.description || '',
            title: item.media.title || '',
            creationTimestamp: item.media.creation_timestamp
          })
        }
        // Handle places (check-ins)
        if (item.place) {
          allMedia.push({
            type: 'place',
            place: item.place
          })
        }
        // Handle external links
        if (item.external_context) {
          allMedia.push({
            type: 'link',
            external: item.external_context
          })
        }
      })
    })
    
    // Get tags
    const tags = post.tags || []
    
    return {
      text: postText,
      media: allMedia,
      tags,
      timestamp: post.timestamp,
      title: post.title || ''
    }
  }, [mediaFiles])

  // Reset app state
  const resetApp = useCallback(() => {
    Object.values(mediaFiles).forEach(url => URL.revokeObjectURL(url))
    if (profilePicture) URL.revokeObjectURL(profilePicture)
    setPosts([])
    setFilteredPosts([])
    setMediaFiles({})
    setDateFilter({ type: 'all', startDate: '', endDate: '', specificDate: '' })
    setSearchTerm('')
    setSelectedPost(null)
    setYearFilter('all')
    setPostTypeFilter('all')
    setAvailableYears([])
    setProfilePicture(null)
    setProfileName('')
    setIsProcessing(false)
  }, [mediaFiles, profilePicture])

  return {
    posts,
    filteredPosts,
    dateFilter,
    setDateFilter,
    yearFilter,
    setYearFilter,
    availableYears,
    postTypeFilter,
    setPostTypeFilter,
    isUploading,
    isProcessing,
    uploadProgress,
    selectedPost,
    setSelectedPost,
    handleFileUpload,
    getPostInfo,
    resetApp,
    profilePicture,
    profileName
  }
}
