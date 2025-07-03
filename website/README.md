# LetsPlayIt Web - Music Downloader Website

A simple web-based music downloader that replicates the core functionality of the LetsPlayIt mobile app. Search and download songs using the JioSaavn API. **Optimized for Netlify deployment!**

## Features

- 🔍 **Search Songs**: Search for your favorite songs, artists, and albums
- 🔥 **Trending Music**: Browse trending songs
- ⬇️ **Download Songs**: Download songs in multiple quality options (96kbps, 160kbps, 320kbps)
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean and intuitive user interface
- 🚀 **Netlify Ready**: Optimized for easy deployment on Netlify
- 🌐 **No Backend Required**: Pure frontend solution with CORS handling

## Quick Start

### Option 1: Deploy to Netlify (Recommended)

1. **Fork or download** this repository
2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: `website`
3. **Deploy** and your site will be live!

### Option 2: Local Development

1. **Download the files** to a folder on your computer
2. **Start a simple HTTP server**:

   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Using Node.js:**
   ```bash
   npx http-server -p 8000
   ```

   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser** and go to: `http://localhost:8000`

### Option 3: Direct File Opening (Limited)

You can open `index.html` directly in your browser, but CORS restrictions may limit functionality.

## How to Use

1. **Search for Songs**:
   - Enter a song name, artist, or album in the search box
   - Click the search button or press Enter
   - Browse through the search results

2. **Browse Trending Songs**:
   - Scroll down to see trending songs
   - These are automatically loaded when you open the website

3. **Download Songs**:
   - Click the "Download" button on any song card
   - Choose your preferred quality (96kbps, 160kbps, or 320kbps)
   - The download will start automatically

## Technical Details

### API Integration
- Uses the same JioSaavn API endpoints as the mobile app
- Handles CORS issues using a public proxy service
- Uses Axios for robust HTTP requests with timeout handling
- Implements proper error handling and retry logic

### File Structure
```
website/
├── index.html      # Main HTML file
├── style.css       # Styling and responsive design
├── script.js       # JavaScript functionality with Axios
├── netlify.toml    # Netlify configuration
├── _headers        # HTTP headers for Netlify
├── SETUP.md        # Quick setup guide
└── README.md       # This file
```

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Netlify Deployment Features
- Optimized static site configuration
- Proper HTTP headers for security and caching
- CORS handling for API requests
- No build process required

## Limitations

1. **CORS Proxy**: Uses public CORS proxies which may have rate limits
2. **Premium Content**: Some songs may be premium-only or region-restricted
3. **Quality**: Actual audio quality depends on source availability
4. **Rate Limiting**: API may have usage limits
5. **Download Method**: Uses browser download capabilities (may vary by browser)

## Troubleshooting

### Songs Not Loading
- Check your internet connection
- Try refreshing the page
- The CORS proxy or API service might be temporarily unavailable

### Downloads Not Working
- Some songs may be premium-only or region-restricted
- Try a different quality setting (96kbps, 160kbps, 320kbps)
- Check if your browser blocks downloads from external sources
- Clear browser cache and try again

### CORS Errors (Local Development)
- Use a local server instead of opening files directly
- The proxy service might be down - try again later

## Development

### Local Development:
1. **Edit the files** using any text editor
2. **Test locally** using a local server
3. **Deploy to Netlify** for production

### Key Files to Modify:
- `script.js`: Add new features or modify API calls
- `style.css`: Change the appearance and styling
- `index.html`: Modify the layout and structure
- `netlify.toml`: Adjust Netlify configuration

### Netlify Deployment:
1. Push changes to your Git repository
2. Netlify will automatically rebuild and deploy
3. Changes are live within minutes

## Legal Notice

This tool is for hackathon purposes only. Please respect copyright laws and the terms of service of music streaming platforms. Only download music that you have the right to download.

## Credits

- Based on the LetsPlayIt mobile app
- Uses JioSaavn API for music data
- Font Awesome for icons
- AllOrigins for CORS proxy

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure you're using a supported browser
3. Try using a local server instead of opening files directly
4. Check your internet connection

---

**Enjoy downloading your favorite music! 🎵**
