// Playlist data
const playlists = [
    { name: "IPTV Sevenler (Sinetech.tr @Memetcandal)", url: "https://www.dropbox.com/scl/fi/v2kehgxdx8tzkby03kpht/IPTVSevenler.m3u?rlkey=4sop4kr4o7u9nzm55yfhmkx1w&st=5puawny2&dl=1" },
    { name: "patr0nspor (Sinetech.tr @patr0n)", url: "https://tinyurl.com/patronsport" }, 
    { name: "Bekx İptv (Sinetech.tr @Berat55)", url: "https://www.dropbox.com/scl/fi/sa29n5m5xp9zvueg41f3p/M3U.txt?rlkey=lyjq8wauu4ws1cva1stqlzlet&st=wf8dndo7&dl=1" },
    { name: "Sinema/Film Arşivi (Sinetech.tr @powerboard)", url: "https://tinyurl.com/power-cinema" }, 
    { name: "myway TV (Sinetech.tr @myway)", url: "https://surl.be/myway06" },
    { name: "SyndraxicV (Sinetech.tr @Syndraxic)", url: "https://m3u.ch/pl/c44d186f905c4c16237b647a99fabd34_44e86ec81890f2324ad996e86dbf4ae2.m3u" },
];

// Copy URL to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('URL kopyalandı!');
    } catch (err) {
        console.error('URL kopyalanamadı:', err);
        alert('URL kopyalanamadı!');
    }
}

// Load and display playlist information
async function loadPlaylists() {
    const playlistContainer = document.getElementById('playlistContainer');
    if (!playlistContainer) return;

    playlistContainer.innerHTML = ''; // Clear previous content

    for (const playlist of playlists) {
        // Create playlist item
        const listItem = document.createElement('div');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'mb-2');

        // Create name and info container
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('d-flex', 'flex-column');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('h6', 'mb-1');
        nameSpan.textContent = playlist.name;

        const statsSpan = document.createElement('small');
        statsSpan.classList.add('text-muted');
        statsSpan.textContent = 'Yükleniyor...';

        infoContainer.appendChild(nameSpan);
        infoContainer.appendChild(statsSpan);

        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Kopyala';
        copyButton.onclick = () => copyToClipboard(playlist.url);

        // Add elements to list item
        listItem.appendChild(infoContainer);
        listItem.appendChild(copyButton);
        playlistContainer.appendChild(listItem);

        // Load playlist stats using CORS proxy
        try {
            const proxyUrl = 'https://cors.gitlatte.workers.dev/?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(playlist.url));
            const text = await response.text();

            // Count unique group titles
            const groupTitles = new Set();
            const groupTitleMatches = text.match(/group-title="([^"]+)"/g);
            if (groupTitleMatches) {
                groupTitleMatches.forEach(match => {
                    const groupTitle = match.match(/group-title="([^"]+)"/)[1].trim();
                    groupTitles.add(groupTitle);
                });
            }

            // Count channels
            const channelCount = (text.match(/#EXTINF/g) || []).length;

            // Update stats display
            statsSpan.textContent = `${groupTitles.size} içerik grubu ve ${channelCount} içerik`;
        } catch (error) {
            console.error('Playlist bilgileri yüklenemedi:', error);
            statsSpan.textContent = 'Bilgiler yüklenemedi';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadPlaylists);
