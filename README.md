# Rewind - Facebook Memories Viewer

**Rewind your social life.** Browse through all your old Facebook posts and stories in a beautiful, interactive timeline.

## Features

- **View Old Stories** - Browse through archived Facebook stories with full media support
- **Timeline Posts** - See all your Facebook posts in a clean timeline view
- **Smart Filtering** - Filter by year, post type (photos/videos), and date ranges
- **Media Support** - View photos and videos from your posts and stories
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Beautiful UI** - Modern interface with smooth animations
- **Privacy First** - All data processing happens locally in your browser

## Tech Stack

### Frontend Framework
- **React 19.2.0** - Latest version for building the UI components
- **Vite 7.2.4** - Modern build tool and dev server

### Styling & UI
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Framer Motion 12.23.26** - Animation library for smooth transitions
- **Lucide React** - Beautiful icon library
- **Radix UI** - Accessible UI primitives

### Utility Libraries
- **JSZip 3.10.1** - For handling Facebook data ZIP files
- **Date-fns 4.1.0** - Date manipulation and formatting
- **Class Variance Authority** - Component variant management

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd rewind
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Step 1: Download Your Facebook Data
1. Go to Facebook Settings → Privacy → Download Your Information
2. Select "Stories" and/or "Posts" from the data types
3. Choose JSON format and download the archive

### Step 2: Upload to Rewind
1. Open the Rewind app
2. Click "Choose File" and select your downloaded Facebook ZIP file
3. Wait for the app to process your data (this happens locally in your browser)

### Step 3: Browse Your Memories
- **Stories Tab**: View all your archived stories with photos/videos
- **Timeline Tab**: Browse through your posts chronologically
- Use filters to find specific content by year, type, or date range

## Key Features

### Stories Viewer
- Browse archived Facebook stories
- View photos and videos in full quality
- Filter by date ranges
- Search through story content

### Timeline Posts
- Chronological view of your Facebook posts
- Filter by year and post type (photos/videos only)
- See posts with attached media
- Clean, card-based layout

### Smart Filtering
- **Year Filter**: Browse posts from specific years
- **Media Filter**: Show only posts with photos or videos
- **Date Range**: Find posts from specific time periods
- **Real-time Search**: Find content instantly

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── Background.jsx   # App background
│   ├── Header.jsx       # App header
│   ├── StoriesGrid.jsx  # Stories display grid
│   ├── PostsTimeline.jsx # Posts timeline view
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useStories.js    # Stories data management
│   └── usePosts.js      # Posts data management
├── utils/               # Utility functions
├── App.jsx             # Main application component
└── main.jsx           # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Privacy & Security

- **Local Processing**: All data processing happens in your browser
- **No Data Upload**: Your Facebook data never leaves your device
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Full transparency - inspect the code yourself

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Facebook for providing data export functionality
- React team for the amazing framework
- Tailwind CSS for beautiful styling utilities
- Framer Motion for smooth animations

---

**Made with care for nostalgia and memories**
