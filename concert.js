// ==========================================
// ARNAV'S UNPLUGGED - JIOSAAVN API & CONTROLS
// ==========================================

// --- DOM ELEMENTS ---
const audioPlayer = document.getElementById('audio-player');
const songListContainer = document.getElementById('song-list-container');
const searchInput = document.getElementById('search-input');
const playerPanel = document.getElementById('player-panel');
const crowdContainer = document.getElementById('crowd-lights');
const backButton = document.getElementById('back-to-songs-btn');

// Player Elements
const npTitle = document.getElementById('np-title');
const npArtist = document.getElementById('np-artist');
const npArt = document.getElementById('np-art');
const vibeText = document.getElementById('vibe-text');

// Control Elements
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const seekBar = document.getElementById('seek-bar');
const currTimeEl = document.getElementById('curr-time');
const totalTimeEl = document.getElementById('total-time');

// API Details
const API_BASE = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";

// --- INITIAL LOAD ---
async function loadTrending() {
    songListContainer.innerHTML = `<li style="padding:20px; text-align:center; color:#FFD700;">Loading latest vibes... 🎧</li>`;
    await fetchSaavnSongs("Arijit Singh"); // Default page
}
loadTrending();

// --- SEARCH LOGIC (Debounce) ---
let searchTimeout = null;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const term = e.target.value.trim();
    
    if(term.length < 2) return; 
    
    songListContainer.innerHTML = `<li style="padding:20px; text-align:center; color:#888;">⏳ Searching universe...</li>`;
    
    searchTimeout = setTimeout(() => {
        fetchSaavnSongs(term);
    }, 800); 
});

// --- API FETCH LOGIC ---
async function fetchSaavnSongs(query) {
    try {
        const res = await fetch(API_BASE + encodeURIComponent(query));
        const data = await res.json();
        
        if(data.success && data.data.results.length > 0) {
            renderSongs(data.data.results);
        } else {
            songListContainer.innerHTML = `<li style="padding:20px; text-align:center;">Koi gaana nahi mila bhai 😢</li>`;
        }
    } catch(e) {
        console.error("API Error: ", e);
        songListContainer.innerHTML = `<li style="padding:20px; text-align:center; color:#FF5555;">Server busy hai bhai. Try again!</li>`;
    }
}

// --- RENDER LIST ---
function renderSongs(songs) {
    songListContainer.innerHTML = "";
    songs.forEach((song) => {
        const li = document.createElement('li');
        li.classList.add('song-item');
        
        const title = song.name;
        // Safely extract artist names
        const artistName = song.artists?.primary?.map(a => a.name).join(', ') || "Unknown Artist";
        // Safely extract lowest quality image for fast list load
        const thumbUrl = song.image && song.image.length > 0 ? song.image[0].url : "guitarist.png";

        li.innerHTML = `
            <img src="${thumbUrl}" class="song-thumb">
            <div class="song-info">
                <h4>${title}</h4>
                <p>${artistName}</p>
            </div>
        `;
        
        li.onclick = () => playSong(song, li);
        songListContainer.appendChild(li);
    });
}

// --- PLAY SONG ---
function playSong(song, liElement) {
    // 1. Set Details
    npTitle.innerText = song.name;
    npArtist.innerText = song.artists?.primary?.map(a => a.name).join(', ') || "Unknown Artist";
    vibeText.innerHTML = `Vibing to <br> "${song.name}" 🎵`;
    
    // 2. Handle Highlights
    document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
    if(liElement) liElement.classList.add('active');
    
    // 3. Set HD Cover Art (Try 500x500 first, fallback to last available)
    const coverUrl = song.image.find(i => i.quality === '500x500')?.url || song.image[song.image.length - 1].url;
    npArt.src = coverUrl;

    // 4. Set Audio (Try 320kbps first)
    const audioUrl = song.downloadUrl.find(q => q.quality === '320kbps')?.url || song.downloadUrl[0].url;
    audioPlayer.src = audioUrl;
    
    // 5. Play & Update UI
    audioPlayer.play();
    playIcon.className = "fas fa-pause";
    openPlayer();
}

// --- PLAYER CONTROLS LOGIC ---

// Toggle Play/Pause Button
playPauseBtn.addEventListener('click', () => {
    if(!audioPlayer.src) return; // Agar koi gaana select nahi hua hai

    if(audioPlayer.paused) {
        audioPlayer.play();
        playIcon.className = "fas fa-pause";
    } else {
        audioPlayer.pause();
        playIcon.className = "fas fa-play";
    }
});

// Update Progress Bar
audioPlayer.addEventListener('timeupdate', () => {
    if(audioPlayer.duration) {
        const current = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        
        // Math magic to set bar width
        const progressPercent = (current / duration) * 100;
        seekBar.value = progressPercent;
        
        // Format Time (0:00)
        currTimeEl.innerText = formatTime(current);
        totalTimeEl.innerText = formatTime(duration);
    }
});

// Seek (Drag Bar to skip forward/backward)
seekBar.addEventListener('input', (e) => {
    if(audioPlayer.duration) {
        const seekTo = audioPlayer.duration * (e.target.value / 100);
        audioPlayer.currentTime = seekTo;
    }
});

// Format Seconds into Minutes:Seconds
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// --- MOBILE UI CONTROLS ---
backButton.addEventListener('click', () => {
    playerPanel.classList.remove('active');
    backButton.classList.remove('show');
});

function openPlayer() {
    if(window.innerWidth <= 768) {
        playerPanel.classList.add('active');
        backButton.classList.add('show');
    }
}

// --- BACKGROUND LIGHTS (Vibe) ---
function createCrowd() {
    for(let i=0; i<30; i++) {
        let light = document.createElement('div');
        light.classList.add('flashlight');
        light.style.left = Math.random() * 100 + '%';
        light.style.bottom = Math.random() * 20 + '%';
        light.style.animationDelay = Math.random() * 3 + 's';
        crowdContainer.appendChild(light);
    }
}
createCrowd();
