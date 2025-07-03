// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://www.jiosaavn.com/api.php',
    CORS_PROXY: 'https://api.allorigins.win/get?url=', // Primary proxy (returns JSON with data property)
    BACKUP_PROXY: 'https://cors-anywhere.herokuapp.com/', // Backup proxy (requires activation)
    SIMPLE_PROXY: 'https://api.codetabs.com/v1/proxy?quest=', // Simple proxy
    TIMEOUT: 15000
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsContainer = document.getElementById('resultsContainer');
const songsList = document.getElementById('songsList');
const trendingList = document.getElementById('trendingList');
const downloadModal = document.getElementById('downloadModal');
const closeModal = document.getElementById('closeModal');
const corsNotice = document.getElementById('corsNotice');
const startDownloadBtn = document.getElementById('startDownloadBtn');
const cancelDownloadBtn = document.getElementById('cancelDownloadBtn');

// State
let currentDownload = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadTrendingSongs();
});

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', function() {
        handleSearch();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    closeModal.addEventListener('click', closeDownloadModal);
    startDownloadBtn.addEventListener('click', handleStartDownload);
    cancelDownloadBtn.addEventListener('click', closeDownloadModal);

    // Close modal when clicking outside
    downloadModal.addEventListener('click', function(e) {
        if (e.target === downloadModal) {
            closeDownloadModal();
        }
    });
}

// Search functionality
async function handleSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a search term');
        return;
    }

    showLoading(true);
    hideResults();

    try {
        const songs = await searchSongs(query);
        displaySearchResults(songs);
        showResults();
        hideCorsNotice(); // Hide CORS notice if request succeeds
    } catch (error) {
        console.error('Search error:', error);
        if (error.message.includes('CORS') || error.message.includes('enable CORS')) {
            alert('Please enable CORS access using the button above, then try searching again.');
        } else {
            alert('Search failed. Please try again.');
        }
    } finally {
        showLoading(false);
    }
}

// API Functions
async function searchSongs(query, page = 1, limit = 20) {
    const params = new URLSearchParams({
        __call: 'search.getResults',
        _format: 'json',
        _marker: '0',
        cc: 'in',
        includeMetaTags: '1',
        query: query, // Mobile app uses 'query' parameter
        ctx: 'web6dot0',
        api_version: '4',
        n: Math.max(limit, 15).toString(),
        p: page.toString()
    });

    const apiUrl = `${API_CONFIG.BASE_URL}?${params.toString()}`;

    try {
        const data = await makeApiRequestWithFallback(apiUrl);

        // Extract songs from the response - handle different response structures
        let songs = [];

        // Check for error in response first
        if (data?.error) {
            // Try autocomplete fallback like mobile app
            const fallbackParams = new URLSearchParams({
                __call: 'autocomplete.get',
                _format: 'json',
                _marker: '0',
                cc: 'in',
                includeMetaTags: '1',
                query: query,
                ctx: 'web6dot0',
                api_version: '4'
            });

            const fallbackApiUrl = `${API_CONFIG.BASE_URL}?${fallbackParams.toString()}`;

            try {
                const fallbackData = await makeApiRequestWithFallback(fallbackApiUrl);
                songs = fallbackData?.songs?.data || fallbackData?.songs || [];
            } catch (fallbackError) {
                console.error('Autocomplete fallback failed:', fallbackError);
                throw new Error('Both search methods failed. Please try a different search term.');
            }
        } else {
            // Normal response parsing
            if (data?.songs?.data && Array.isArray(data.songs.data)) {
                songs = data.songs.data;
            } else if (data?.data?.results && Array.isArray(data.data.results)) {
                songs = data.data.results;
            } else if (data?.results && Array.isArray(data.results)) {
                songs = data.results;
            } else if (Array.isArray(data)) {
                songs = data;
            } else if (data?.data && Array.isArray(data.data)) {
                songs = data.data;
            }
        }

        // Filter valid songs like mobile app
        const validSongs = songs.filter(song => song && song.id && (song.title || song.song));

        return Array.isArray(validSongs) ? validSongs : [];
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Failed to search songs');
    }
}

async function getTrendingSongs(language = 'hindi') {
    const params = new URLSearchParams({
        __call: 'content.getTrending',
        _format: 'json',
        _marker: '0',
        cc: 'in',
        includeMetaTags: '1',
        ctx: 'web6dot0',
        api_version: '4',
        entity_type: 'song',
        entity_language: language
    });

    const apiUrl = `${API_CONFIG.BASE_URL}?${params.toString()}`;

    try {
        const data = await makeApiRequestWithFallback(apiUrl);
        return Array.isArray(data) ? data.slice(0, 12) : [];
    } catch (error) {
        console.error('Trending songs error:', error);
        return [];
    }
}

async function getSongDetails(songId) {
    const params = new URLSearchParams({
        __call: 'song.getDetails',
        _format: 'json',
        _marker: '0',
        cc: 'in',
        includeMetaTags: '1',
        ctx: 'web6dot0',
        api_version: '4',
        pids: songId
    });

    const apiUrl = `${API_CONFIG.BASE_URL}?${params.toString()}`;

    try {
        const data = await makeApiRequestWithFallback(apiUrl);

        // Handle different response formats (same logic as mobile app)
        let songData = data;

        if (data[songId]) {
            // Response has songId as key
            songData = data[songId];
        } else if (Array.isArray(data) && data.length > 0) {
            // Response is an array
            songData = data[0];
        } else if (data.songs && Array.isArray(data.songs) && data.songs.length > 0) {
            // Response has songs array
            songData = data.songs[0];
        } else if (data && typeof data === 'object' && data.id) {
            // Response is already the song object
            songData = data;
        }

        return songData;
    } catch (error) {
        console.error('Song details error:', error);
        throw error;
    }
}

// Utility Functions
async function makeApiRequest(url, useBackupProxy = false) {
    try {
        let requestUrl = url;

        if (useBackupProxy) {
            // Use backup proxy that returns JSON with data property
            requestUrl = url.replace(API_CONFIG.CORS_PROXY, API_CONFIG.BACKUP_PROXY);
        }

        const response = await axios({
            url: requestUrl,
            method: 'GET',
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Accept': 'application/json',
                'Referer': 'https://www.jiosaavn.com/',
                'Origin': 'https://www.jiosaavn.com'
                // Removed User-Agent and Cache-Control as browsers block them
            }
        });

        // Handle different proxy response formats
        if (useBackupProxy && response.data && response.data.contents) {
            // allorigins.win returns data in 'contents' property
            return JSON.parse(response.data.contents);
        }

        return response.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - please check your internet connection');
        }
        if (error.response) {
            throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error('Network error - please check your internet connection');
    }
}

// Enhanced API request with multiple fallbacks
async function makeApiRequestWithFallback(apiUrl) {
    const proxies = [
        { url: `${API_CONFIG.CORS_PROXY}${encodeURIComponent(apiUrl)}`, useBackup: true, name: 'AllOrigins' },
        { url: `${API_CONFIG.SIMPLE_PROXY}${encodeURIComponent(apiUrl)}`, useBackup: false, name: 'CodeTabs' },
        { url: `${API_CONFIG.BACKUP_PROXY}${apiUrl}`, useBackup: false, name: 'CORS-Anywhere' }
    ];

    let lastError = null;

    for (const proxy of proxies) {
        try {
            const result = await makeApiRequest(proxy.url, proxy.useBackup);
            return result;
        } catch (error) {
            lastError = error;

            // Small delay before trying next proxy
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // All proxies failed

    // Show CORS notice if it looks like a CORS issue
    if (lastError?.message.includes('CORS') || lastError?.message.includes('Network') ||
        lastError?.message.includes('blocked')) {
        showCorsNotice();
    }

    throw new Error('Unable to fetch data from any proxy. Please try enabling CORS access or try again later.');
}

function formatDuration(duration) {
    if (!duration) return 'Unknown';

    // If duration is in seconds
    if (typeof duration === 'number') {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // If duration is already formatted
    return duration.toString();
}

function getHighQualityImage(imageUrl) {
    if (!imageUrl) return 'https://via.placeholder.com/150x150?text=No+Image';
    return imageUrl.replace('150x150', '500x500');
}

// Display Functions
function displaySearchResults(songs) {
    songsList.innerHTML = '';

    if (!songs || songs.length === 0) {
        songsList.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1; padding: 20px; font-size: 1.1rem;">No songs found. Try a different search term.</p>';
        return;
    }

    songs.forEach((song, index) => {
        try {
            const songCard = createSongCard(song);
            songsList.appendChild(songCard);
        } catch (error) {
            console.error(`Error creating card for song ${index + 1}:`, error);
        }
    });
}

async function loadTrendingSongs() {
    try {
        const songs = await getTrendingSongs();
        displayTrendingSongs(songs);
        hideCorsNotice(); // Hide CORS notice if request succeeds
    } catch (error) {
        console.error('Failed to load trending songs:', error);
        if (error.message.includes('CORS') || error.message.includes('enable CORS')) {
            trendingList.innerHTML = '<p style="color: white; text-align: center;">Please enable CORS access above to load trending songs.</p>';
        } else {
            trendingList.innerHTML = '<p style="color: white; text-align: center;">Failed to load trending songs. Please try again.</p>';
        }
    }
}

function displayTrendingSongs(songs) {
    trendingList.innerHTML = '';

    if (!songs || songs.length === 0) {
        trendingList.innerHTML = '<p style="color: white; text-align: center;">No trending songs available.</p>';
        return;
    }

    songs.forEach(song => {
        const songCard = createSongCard(song);
        trendingList.appendChild(songCard);
    });
}

function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';

    const title = song.title || song.song || 'Unknown Title';
    const artist = song.subtitle || song.primary_artists || song.singers || 'Unknown Artist';
    const duration = formatDuration(song.duration);
    const image = getHighQualityImage(song.image);

    card.innerHTML = `
        <div class="song-info">
            <img src="${image}" alt="${title}" class="song-image" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
            <div class="song-details">
                <div class="song-title" title="${title}">${title}</div>
                <div class="song-artist" title="${artist}">${artist}</div>
                <div class="song-duration">${duration}</div>
            </div>
        </div>
        <button class="download-btn" onclick="startDownload('${song.id}', '${title.replace(/'/g, "\\'")}', '${artist.replace(/'/g, "\\'")}', '${image}')">
            <i class="fas fa-download"></i>
            Download
        </button>
    `;

    return card;
}

// Download Functions
async function startDownload(songId, title, artist, image) {
    try {
        // Direct download without modal
        const songDetails = await getSongDetails(songId);

        if (!songDetails) {
            throw new Error('Could not fetch song details. Please try again.');
        }

        if (!songDetails.more_info?.encrypted_media_url) {
            throw new Error('Download URL not available for this song. This might be a premium track or region-restricted content.');
        }

        // Get the download URL with 320kbps quality
        const quality = '320'; // High quality download
        const downloadUrl = await getDownloadUrl(songDetails, quality);

        // Start direct download
        await downloadSong(downloadUrl, title, artist, quality);

    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed: ' + error.message);
    }
}

// Handle the actual download when user clicks "Start Download"
async function handleStartDownload() {
    if (!currentDownload) {
        alert('No download selected');
        return;
    }

    try {
        // Hide download buttons and show progress bar
        startDownloadBtn.style.display = 'none';
        cancelDownloadBtn.style.display = 'none';
        document.querySelector('.progress-container').style.display = 'block';
        updateDownloadProgress(0);

        const { songId, title, artist } = currentDownload;

        // Get song details to get download URL
        const songDetails = await getSongDetails(songId);

        if (!songDetails) {
            throw new Error('Could not fetch song details. Please try again.');
        }

        if (!songDetails.more_info?.encrypted_media_url) {
            throw new Error('Download URL not available for this song. This might be a premium track or region-restricted content.');
        }

        // Get the download URL
        const quality = document.getElementById('qualitySelect').value;
        const downloadUrl = await getDownloadUrl(songDetails, quality);

        // Start the actual download
        await downloadSong(downloadUrl, title, artist, quality);

    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed: ' + error.message);

        // Show buttons again if there's an error
        startDownloadBtn.style.display = 'flex';
        cancelDownloadBtn.style.display = 'flex';
        document.querySelector('.progress-container').style.display = 'none';

        closeDownloadModal();
    }
}

async function getDownloadUrl(songDetails, quality = '160') {
    try {
        // Get the encrypted media URL from song details
        const encryptedUrl = songDetails.more_info?.encrypted_media_url;

        if (!encryptedUrl) {
            throw new Error('No encrypted media URL found');
        }

        // Decrypt the URL using the same logic as the mobile app
        const decryptedUrl = await decryptJioSaavnUrl(encryptedUrl, quality);

        return decryptedUrl;
    } catch (error) {
        console.error('Download URL error:', error);
        throw error;
    }
}

// Decrypt JioSaavn URL (based on mobile app implementation)
async function decryptJioSaavnUrl(encryptedUrl, quality) {
    try {
        // Method 1: Try to get auth token from JioSaavn API
        try {
            const authParams = new URLSearchParams({
                __call: 'song.generateAuthToken',
                _format: 'json',
                _marker: '0',
                cc: 'in',
                includeMetaTags: '1',
                ctx: 'web6dot0',
                api_version: '4',
                url: encryptedUrl,
                bitrate: quality
            });

            const authApiUrl = `${API_CONFIG.BASE_URL}?${authParams.toString()}`;
            const authData = await makeApiRequestWithFallback(authApiUrl);

            if (authData && authData.auth_url) {
                return authData.auth_url;
            }
        } catch (authError) {
            // Auth method failed, continue to fallback
        }

        // Method 2: Fallback - construct direct URL from encrypted one
        let directUrl = encryptedUrl
            .replace(/_96\.mp4/g, `_${quality}.mp4`)
            .replace(/_160\.mp4/g, `_${quality}.mp4`)
            .replace(/_320\.mp4/g, `_${quality}.mp4`);

        // If quality suffix not found, add it
        if (!directUrl.includes(`_${quality}.mp4`)) {
            directUrl = directUrl.replace(/\.mp4$/, `_${quality}.mp4`);
        }

        return directUrl;

    } catch (error) {
        console.error('URL decryption error:', error);
        return encryptedUrl;
    }
}

async function downloadSong(url, title, artist, quality = '160') {
    try {
        // Use actual song name with basic sanitization for file system compatibility
        const cleanTitle = title.replace(/[<>:"/\\|?*]/g, '').trim(); // Remove only problematic characters
        const cleanArtist = artist.replace(/[<>:"/\\|?*]/g, '').trim();
        const filename = `${cleanTitle} - ${cleanArtist}.mp3`;



        updateDownloadProgress(10);

        // iOS-specific download handling
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            updateDownloadProgress(50);

            // For iOS, provide multiple download options
            const userChoice = confirm(`📱 iOS Download Options:\n\n🎯 OPTION 1: Open audio file (Recommended)\n• File opens in new tab\n• Use Share menu to save\n\n🎯 OPTION 2: Copy download link\n• Copy link to clipboard\n• Paste in Documents app\n\nChoose OPTION 1 (OK) or OPTION 2 (Cancel)`);

            if (userChoice) {
                // Option 1: Open audio file
                window.open(url, '_blank');
                updateDownloadProgress(100);

                setTimeout(() => {
                    alert(`📱 Audio file opened!\n\nFile: ${filename}\n\n🎯 TO DOWNLOAD:\n1. Tap "Share" button (⬆️)\n2. Select "Save to Files"\n3. Choose location\n\nOR:\n1. Tap and hold audio player\n2. Select "Download"`);
                    closeDownloadModal();
                }, 1000);
            } else {
                // Option 2: Copy link to clipboard
                try {
                    navigator.clipboard.writeText(url).then(() => {
                        updateDownloadProgress(100);
                        alert(`📋 Download link copied!\n\nFile: ${filename}\n\n🎯 NEXT STEPS:\n1. Install "Documents by Readdle" app\n2. Open Documents app\n3. Tap browser icon\n4. Paste the link\n5. Download will start\n\nLink: ${url.substring(0, 50)}...`);
                        closeDownloadModal();
                    });
                } catch (clipboardError) {
                    // Fallback: Show the URL for manual copy
                    updateDownloadProgress(100);
                    alert(`📋 Copy this download link:\n\n${url}\n\n🎯 STEPS:\n1. Long press the link above\n2. Select "Copy"\n3. Open Documents app\n4. Paste and download\n\nFile: ${filename}`);
                    closeDownloadModal();
                }
            }

        } else {
            // Desktop/Android - Force download approach
            try {
                updateDownloadProgress(30);

                // Try to fetch the file and force download
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'audio/mpeg, audio/mp4, audio/*',
                        'Cache-Control': 'no-cache'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                updateDownloadProgress(60);

                // Get the file as blob
                const blob = await response.blob();
                updateDownloadProgress(90);

                // Force download using blob URL
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                link.style.display = 'none';

                // Force download attribute
                link.setAttribute('download', filename);
                link.setAttribute('type', 'audio/mpeg');

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up blob URL
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                }, 3000);

                updateDownloadProgress(100);

                setTimeout(() => {
                    alert(`✅ Download completed!\nFile: ${filename}\nCheck your downloads folder.`);
                    closeDownloadModal();
                }, 500);

            } catch (fetchError) {
                console.warn('Blob download failed, trying direct link:', fetchError.message);

                // Fallback: Direct link method
                updateDownloadProgress(70);

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.setAttribute('download', filename);
                link.target = '_blank';
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                updateDownloadProgress(100);

                setTimeout(() => {
                    alert(`🔗 Download link opened!\nFile: ${filename}\n\nIf the file plays instead of downloading:\n1. Right-click the audio\n2. Select "Save as..." or "Save audio as..."\n3. Choose your download location`);
                    closeDownloadModal();
                }, 500);
            }
        }

    } catch (error) {
        console.error('❌ Download error:', error);
        alert(`Download failed: ${error.message}\n\nThis might be due to:\n- Network connectivity issues\n- CORS restrictions\n- Premium content restrictions\n\nTry a different quality setting or song.`);
        closeDownloadModal();
        throw error;
    }
}

// Modal Functions
function showDownloadModal(songId, title, artist, image) {
    document.getElementById('downloadTitle').textContent = title;
    document.getElementById('downloadArtist').textContent = artist;
    document.getElementById('downloadImage').src = image;

    // Hide progress bar initially
    document.querySelector('.progress-container').style.display = 'none';

    // Reset and show download buttons
    startDownloadBtn.disabled = false;
    startDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Start Download';
    startDownloadBtn.style.display = 'flex';
    cancelDownloadBtn.style.display = 'flex';

    downloadModal.classList.remove('hidden');

    currentDownload = { songId, title, artist, image };
}

function closeDownloadModal() {
    downloadModal.classList.add('hidden');
    currentDownload = null;
}

function updateDownloadProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = percentage + '%';
    progressText.textContent = Math.round(percentage) + '%';
}

// UI Helper Functions
function showLoading(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function showResults() {
    resultsContainer.classList.remove('hidden');
}

function hideResults() {
    resultsContainer.classList.add('hidden');
}

function showCorsNotice() {
    corsNotice.classList.remove('hidden');
}

function hideCorsNotice() {
    corsNotice.classList.add('hidden');
}
