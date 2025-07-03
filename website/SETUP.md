# LetsPlayIt Web - Quick Setup Guide

## 🚀 Quick Start (Recommended)

### Option 1: Deploy to Netlify (Easiest)

1. **Create a Netlify account** at [netlify.com](https://netlify.com)

2. **Deploy from Git:**
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository
   - Set build settings:
     - Build command: (leave empty)
     - Publish directory: `website`
   - Click "Deploy site"

3. **Your site is live!** 🎉
   - Netlify will provide a URL like `https://amazing-name-123456.netlify.app`
   - You can customize the domain name in site settings

### Option 2: Drag & Drop Deploy

1. **Download the website folder** to your computer
2. **Go to Netlify** and drag the `website` folder to the deploy area
3. **Your site is instantly live!**

### Option 3: Local Development

1. **Download the files** to a folder on your computer
2. **Start a simple HTTP server:**

   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Using Node.js:**
   ```bash
   npx http-server -p 8000
   ```

3. **Open your browser:** Go to `http://localhost:8000`

## 🎵 How to Use

1. **Search for Songs:**
   - Enter song name, artist, or album in the search box
   - Press Enter or click the search button

2. **Browse Trending:**
   - Scroll down to see trending songs
   - These load automatically

3. **Download Songs:**
   - Click "Download" on any song
   - Choose quality (96kbps, 160kbps, 320kbps)
   - Download starts automatically

## 📁 File Structure

```
website/
├── index.html          # Main webpage
├── style.css           # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Backend Node.js server
├── package.json        # Dependencies
├── install.sh          # Linux/Mac installer
├── install.bat         # Windows installer
├── README.md           # Detailed documentation
└── SETUP.md            # This file
```

## 🔧 Development

### Netlify Development:
1. **Make changes** to your files
2. **Push to Git** repository
3. **Netlify auto-deploys** your changes
4. **Changes are live** in minutes!

### Local Development:
1. **Edit files** with any text editor
2. **Test locally** using a simple HTTP server
3. **Deploy to Netlify** when ready

## 🌐 Technical Features

### Frontend-Only Solution:
- **No backend required** - Pure HTML, CSS, JavaScript
- **Axios for HTTP requests** - Robust API calls with error handling
- **CORS proxy handling** - Bypasses browser restrictions
- **Responsive design** - Works on all devices

## ⚠️ Important Notes

1. **No Backend Required:** Pure frontend solution using CORS proxy
2. **Download URLs:** Songs return encrypted URLs that need proper decryption
3. **Legal Notice:** This is for educational purposes only
4. **Quality Options:** 96kbps, 160kbps, 320kbps available
5. **Netlify Optimized:** Configured for best performance on Netlify

## 🐛 Troubleshooting

**Songs not loading:**
- Check internet connection
- CORS proxy or API service might be temporarily down
- Check browser console for errors
- Try refreshing the page

**Downloads not working:**
- Encrypted URLs need proper decryption implementation
- Some songs may have restricted access
- Try different quality settings

**Netlify deployment issues:**
- Ensure publish directory is set to `website`
- Check that all files are in the repository
- Verify netlify.toml configuration

## 🔒 Security & Legal

- This tool is for hackathon purposes only
- Respect copyright laws and terms of service
- Only download music you have rights to download
- No user data is stored or tracked

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Ensure you're using a supported browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
3. Try refreshing the page or clearing browser cache
4. Check your internet connection
5. Verify the CORS proxy service is working

---

**Happy music downloading! 🎵**
