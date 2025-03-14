// Oynatma Listesi verisi
const playlists = [
    { name: "IPTV Sevenler (Sinetech.tr @Memetcandal)", url: "https://www.dropbox.com/scl/fi/v2kehgxdx8tzkby03kpht/IPTVSevenler.m3u?rlkey=4sop4kr4o7u9nzm55yfhmkx1w&st=5puawny2&dl=1" },
    { name: "patr0nspor (Sinetech.tr @patr0n)", url: "https://tinyurl.com/patronsport" }, 
    { name: "Bekx İptv (Sinetech.tr @Berat55)", url: "https://www.dropbox.com/scl/fi/sa29n5m5xp9zvueg41f3p/M3U.txt?rlkey=lyjq8wauu4ws1cva1stqlzlet&st=wf8dndo7&dl=1" },
    { name: "Sinema/Film Arşivi (Sinetech.tr @powerboard)", url: "https://tinyurl.com/power-cinema" },
    { name: "myway TV (Sinetech.tr @myway)", url: "https://drive.usercontent.google.com/download?id=10MliZSuqDh9Ljs1Fkqh0zKsROmspgYu3&export=download" },
    { name: "SyndraxicV (Sinetech.tr @Syndraxic)", url: "https://m3u.ch/pl/c44d186f905c4c16237b647a99fabd34_44e86ec81890f2324ad996e86dbf4ae2.m3u" },
];

// Adresi Kopyala
async function copyToClipboard(text) {
    try {
        // Önce API deneyelim
        await navigator.clipboard.writeText(text);
        alert('URL kopyalandı!');
    } catch (err) {
        // API hata verirse pas geçip yerel kopyalamaya geçelim.
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            alert('URL kopyalandı!');
        } catch (err) {
            console.error('URL kopyalanamadı:', err);
            alert('URL kopyalanamadı!');
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

// Oynatma Listesi bilgilerini yükleyelim
async function loadPlaylists() {
    const playlistContainer = document.getElementById('playlistContainer');
    if (!playlistContainer) return;

    playlistContainer.innerHTML = ''; // Önceki verileri temizleyelim.

    for (const playlist of playlists) {
        // Oynatma Listesi elemanlarını oluşturalım.
        const listItem = document.createElement('div');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'mb-2');

        // Kopyala butonunu koyalım.
        const copyButton = document.createElement('button');
        copyButton.classList.add('btn', 'btn-link', 'text-primary', 'p-2', 'me-3');
        copyButton.innerHTML = '<i class="fa-regular fa-clone"></i>';
        copyButton.title = 'Kopyala';
        copyButton.onclick = () => copyToClipboard(playlist.url);

        // İsim ve bilgiyi oluşturalım
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('d-flex', 'flex-column', 'flex-grow-1');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('h6', 'mb-1');
        nameSpan.textContent = playlist.name;

        const statsSpan = document.createElement('small');
        statsSpan.classList.add('text-muted');
        statsSpan.textContent = 'Yükleniyor...';

        infoContainer.appendChild(nameSpan);
        infoContainer.appendChild(statsSpan);

        // butonları listeye ekleyelim
        listItem.appendChild(copyButton);
        listItem.appendChild(infoContainer);
        playlistContainer.appendChild(listItem);

        // Oynatma listesi istatistiklerini çekelim
        try {
            const proxyUrl = 'https://cors.gitlatte.workers.dev/?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(playlist.url));
            const text = await response.text();

            // Grup başlıklarından sayılarını alalım.
            const groupTitles = new Set();
            const groupTitleMatches = text.match(/group-title="([^"]+)"/g);
            if (groupTitleMatches) {
                groupTitleMatches.forEach(match => {
                    const groupTitle = match.match(/group-title="([^"]+)"/)[1].trim();
                    groupTitles.add(groupTitle);
                });
            }

            // Kaç kanal varmış bakalım
            const channelCount = (text.match(/#EXTINF/g) || []).length;

            // istatistik ekranını güncelleyelim.
            statsSpan.textContent = `${groupTitles.size} içerik grubu ve ${channelCount} içerik`;
        } catch (error) {
            console.error('Playlist bilgileri yüklenemedi:', error);
            statsSpan.textContent = 'Bilgiler yüklenemedi';
        }
    }
}

// Herşey yüklensin bakalım.
document.addEventListener('DOMContentLoaded', loadPlaylists);
