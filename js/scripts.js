let currentRequest = null; // Şu anki aktif istek

function updateCustomProgressBar(percentage) {
    const progressBar = document.getElementById('customProgress');
    const progressValue = document.querySelector('.progress-value');
    
    if (progressBar && progressValue) {
        progressBar.style.width = percentage + '%';
        progressValue.textContent = percentage === 100 ? 'İşlem tamamlandı' : `${percentage}%`;
    } else {
        console.error('Progress bar or value element not found');
    }
}


function showCustomProgressBar(show) {
    const progressContainer = document.getElementById('customProgressContainer');
    if (progressContainer) {
        progressContainer.style.display = show ? 'block' : 'none';
    } else {
        console.error('Progress container not found');
    }
}


function decodeURL(url) {
    try {
        return decodeURIComponent(url.replace(/\\+/g, ' '));
    } catch (e) {
        console.error('URL decoding failed:', e);
        return url;
    }
}

function showLoadingMessage(show) {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = show ? 'block' : 'none';
}

function showNewMethodMessage(show) {
    const newMethodMessage = document.getElementById('newMethodMessage');
    newMethodMessage.style.display = show ? 'block' : 'none';
}

function cleanURL(url) {
    return url.replace(/[<>"]/g, '').replace(/'/g, '').replace(/,$/g, ''); // "<", ">", çift tırnak ve tek tırnakları temizle, ayrıca sondaki virgülü kaldır
}

function clearPreviousResults() {
    const linksContainer = document.getElementById('links');
    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
    const sourceInfo = document.getElementById('sourceInfo');
    const linksHeader = document.getElementById('linksHeader');
    linksContainer.innerHTML = '';
    copyAllLinksBtn.style.display = 'none';
    sourceInfo.textContent = '';
	linksHeader.innerHTML = 'Sonuçlar Aşağıda Listelenir <i class="bi bi-sort-down"></i>';
    updateCustomProgressBar(0); // Progress barı sıfırla
}


function showSection(sectionId) {
    const sections = ['metin-ayiklama', 'url-ayiklama', 'patron-ayiklama', 'hazir-listeler'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (id === sectionId) {
            section.classList.remove('d-none');
        } else {
            section.classList.add('d-none');
        }
    });
    clearPreviousResults(); // Sonuçları temizle
}


// Metinden Linkleri Ayıklama
async function extractLinks() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
    showCustomProgressBar(true); // Progress bar'ı göster
    const inputText = document.getElementById('inputText').value;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const links = inputText.match(urlPattern);
    const linksContainer = document.getElementById('links');
    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
    const linksHeader = document.getElementById('linksHeader'); // Link başlığı elemanını al
    
    if (currentRequest) {
        currentRequest.abort(); // Önceki istek varsa iptal et
    }

    currentRequest = new AbortController(); // Yeni AbortController oluştur
    const signal = currentRequest.signal; // Abort sinyalini al

    if (links && links.length > 0) {
        linksContainer.innerHTML = '';
        links.forEach(async (link, index) => {
            if (signal.aborted) return;
            const decodedLink = decodeURL(link); // URL'yi çöz
            const cleanedLink = cleanURL(decodedLink); // URL'yi temizle
            const linkElement = document.createElement('a');
            linkElement.href = cleanedLink;
            linkElement.textContent = (index + 1) + '. ' + cleanedLink;
            linkElement.target = '_blank';
            linkElement.classList.add('d-block', 'mb-2');
            
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Bu Adresi Kullan';
            copyButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
            copyButton.onclick = () => copyToClipboard(cleanedLink);

            const showXtreamButton = document.createElement('button');
            showXtreamButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
            showXtreamButton.textContent = 'Xtream Code olarak Göster';
            showXtreamButton.setAttribute('data-toggle', 'collapse');
            showXtreamButton.setAttribute('data-target', '#xtreamPanel_' + index);
            showXtreamButton.setAttribute('aria-expanded', 'false');
            showXtreamButton.setAttribute('aria-controls', 'xtreamPanel_' + index);

            const xtreamPanel = document.createElement('div');
            xtreamPanel.id = 'xtreamPanel_' + index;
            xtreamPanel.classList.add('collapse', 'mt-2');

            const xtreamDetails = parseXtreamDetails(cleanedLink);
            xtreamPanel.innerHTML = `
                <div><strong>Sunucu Adresi:</strong> <span>${xtreamDetails.server}</span></div>
                <div><strong>Kullanıcı Adı:</strong> <span>${xtreamDetails.username}</span></div>
                <div><strong>Şifre:</strong> <span>${xtreamDetails.password}</span></div>
            `;

            linksContainer.appendChild(linkElement);
            linksContainer.appendChild(copyButton);
            linksContainer.appendChild(showXtreamButton);
            linksContainer.appendChild(xtreamPanel);

            // Progress bar'ı güncelle
            const progress = Math.round(((index + 1) / links.length) * 100);
            updateCustomProgressBar(progress);

            // Gecikme ekle
            await new Promise(resolve => setTimeout(resolve, 20));
        });
        copyAllLinksBtn.style.display = 'block';
        linksHeader.textContent = `Ayıklanan Linkler (Toplam ${links.length} adet)`; // Toplam link sayısını ekle
    } else {
        linksContainer.textContent = 'Hiçbir link bulunamadı.';
        copyAllLinksBtn.style.display = 'none';
        updateCustomProgressBar(100);
    }
    showCustomProgressBar(false); // İşlem bittiğinde progress barı gizle
    showNewMethodMessage(false);
    showLoadingMessage(false);
}

// Linkleri Ayıklama (örnek olarak fetchLinksFromPage fonksiyonu güncelleniyor)
async function fetchLinksFromPage() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
    showCustomProgressBar(true); // Progress bar'ı göster
    const pageUrl = document.getElementById('pageUrl').value;
    const linksHeader = document.getElementById('linksHeader'); // Link başlığı elemanını al

    if (currentRequest) {
        currentRequest.abort(); // Önceki istek varsa iptal et
    }

    currentRequest = new AbortController(); // Yeni AbortController oluştur
    const signal = currentRequest.signal; // Abort sinyalini al
    
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(pageUrl)}`, { signal });
        const data = await response.json();
        const html = data.contents;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern);
        const linksContainer = document.getElementById('links');
        const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
        const sourceInfo = document.getElementById('sourceInfo');
        
        if (links && links.length > 0) {
            linksContainer.innerHTML = '';
            links.forEach(async (link, index) => {
                if (signal.aborted) return;
                const decodedLink = decodeURL(link); // URL'yi çöz
                const cleanedLink = cleanURL(decodedLink); // URL'yi temizle
                const linkElement = document.createElement('a');
                linkElement.href = cleanedLink;
                linkElement.textContent = (index + 1) + '. ' + cleanedLink;
                linkElement.target = '_blank';
                linkElement.classList.add('d-block', 'mb-2');
                
                const copyButton = document.createElement('button');
                copyButton.textContent = 'Bu Adresi Kullan';
                copyButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
                copyButton.onclick = () => copyToClipboard(cleanedLink);

                const showXtreamButton = document.createElement('button');
                showXtreamButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
                showXtreamButton.textContent = 'Xtream Code olarak Göster';
                showXtreamButton.setAttribute('data-toggle', 'collapse');
                showXtreamButton.setAttribute('data-target', '#xtreamPanel_' + index);
                showXtreamButton.setAttribute('aria-expanded', 'false');
                showXtreamButton.setAttribute('aria-controls', 'xtreamPanel_' + index);

                const xtreamPanel = document.createElement('div');
                xtreamPanel.id = 'xtreamPanel_' + index;
                xtreamPanel.classList.add('collapse', 'mt-2');

                const xtreamDetails = parseXtreamDetails(cleanedLink);
                xtreamPanel.innerHTML = `
                    <div><strong>Sunucu Adresi:</strong> <span>${xtreamDetails.server}</span></div>
                    <div><strong>Kullanıcı Adı:</strong> <span>${xtreamDetails.username}</span></div>
                    <div><strong>Şifre:</strong> <span>${xtreamDetails.password}</span></div>
                `;

                linksContainer.appendChild(linkElement);
                linksContainer.appendChild(copyButton);
                linksContainer.appendChild(showXtreamButton);
                linksContainer.appendChild(xtreamPanel);

                // Progress bar'ı güncelle
                const progress = Math.round(((index + 1) / links.length) * 100);
                updateCustomProgressBar(progress);

                // Gecikme ekle
                await new Promise(resolve => setTimeout(resolve, 20));
            });
            copyAllLinksBtn.style.display = 'block';
            sourceInfo.textContent = pageUrl;
            linksHeader.textContent = `Ayıklanan Linkler (Toplam ${links.length} adet)`; // Toplam link sayısını ekle
        } else {
            linksContainer.textContent = 'Hiçbir link bulunamadı.';
            copyAllLinksBtn.style.display = 'none';
            sourceInfo.textContent = '';
            updateCustomProgressBar(100);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Aktif işlem iptal edildi.');
        } else {
            console.error('Web sayfasından linkler alınamadı:', error);
            alert('Web sayfasından linkler alınamadı: ' + error);
            updateCustomProgressBar(100);
        }
    }
    showCustomProgressBar(true); // İşlem bittiğinde progress barı gizle
    showNewMethodMessage(false);
    showLoadingMessage(false);
}

// @patr0n Linklerini Ayıklama
async function fetchPatronLinks() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
    showCustomProgressBar(true); // Progress barı göster

    if (currentRequest) {
        currentRequest.abort(); // Önceki istek varsa iptal et
    }

    currentRequest = new AbortController(); // Yeni AbortController oluştur
    const signal = currentRequest.signal; // Abort sinyalini al

    try {
        let response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://paste.fo/raw/45174a0b7377')}`, { signal });
        const data = await response.json();
        const html = data.contents;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern);
        const linksContainer = document.getElementById('links');
        const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
        const sourceInfo = document.getElementById('sourceInfo');
        const linksHeader = document.getElementById('linksHeader');
        
        const firstLine = html.split('\n')[0].trim(); // İlk satırı al

        if (links && links.length > 0) {
            // Bilgi notunu ekleme
            const infoNote = document.createElement('div');
            infoNote.classList.add('alert', 'alert-info', 'mt-2');
            infoNote.textContent = `Son güncelleme tarihi: ${firstLine}`;
            linksContainer.appendChild(infoNote);

            // Linkleri listeye ekleme
            links.forEach(async (link, index) => {
                if (signal.aborted) return;
                
                // URL'yi doğrula ve temizle
                let cleanedLink;
                try {
                    cleanedLink = new URL(cleanURL(decodeURL(link)).trim()).href;
                } catch (e) {
                    console.error('Geçersiz URL atlandı:', link);
                    return; // Geçersiz URL'yi atla
                }
                
                const line = html.split('\n').find(line => line.includes(link));
                const maxConnectionsMatch = line.match(/Maksimum Bağlantılar: (\d+)/);
                const maxConnections = maxConnectionsMatch ? ` (Önemli: Aynı anda en fazla ${maxConnectionsMatch[1]} kişi kullanabilir)` : '';
                
                const linkWrapper = document.createElement('div');
                linkWrapper.classList.add('p-3', 'mb-2', 'bg-light', 'rounded');
                linkWrapper.id = 'linkWrapper_' + index;

                const linkElement = document.createElement('a');
                linkElement.href = cleanedLink;
                linkElement.textContent = (index + 1) + '. ' + cleanedLink;
                linkElement.target = '_blank';
                linkElement.classList.add('d-block', 'mb-2');

                const connectionsInfo = document.createElement('span');
                connectionsInfo.textContent = maxConnections;
                connectionsInfo.classList.add('ml-2', 'font-italic', 'text-muted');

                const copyButton = document.createElement('button');
                copyButton.textContent = 'Bu Adresi Kullan';
                copyButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
                copyButton.onclick = () => copyToClipboard(cleanedLink);

                const showXtreamButton = document.createElement('button');
                showXtreamButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
                showXtreamButton.textContent = 'Xtream Code olarak Göster';
                showXtreamButton.setAttribute('data-toggle', 'collapse');
                showXtreamButton.setAttribute('data-target', '#xtreamPanel_' + index);
                showXtreamButton.setAttribute('aria-expanded', 'false');
                showXtreamButton.setAttribute('aria-controls', 'xtreamPanel_' + index);

                const xtreamPanel = document.createElement('div');
                xtreamPanel.id = 'xtreamPanel_' + index;
                xtreamPanel.classList.add('collapse', 'mt-2');

                const xtreamDetails = parseXtreamDetails(cleanedLink);
                xtreamPanel.innerHTML = `
                    <div><strong>Sunucu Adresi:</strong> <span>${xtreamDetails.server}</span></div>
                    <div><strong>Kullanıcı Adı:</strong> <span>${xtreamDetails.username}</span></div>
                    <div><strong>Şifre:</strong> <span>${xtreamDetails.password}</span></div>
                `;

                linkWrapper.appendChild(linkElement);
                linkWrapper.appendChild(connectionsInfo); // Bağlantı bilgisi ekle
                linkWrapper.appendChild(copyButton);
                linkWrapper.appendChild(showXtreamButton);
                linkWrapper.appendChild(xtreamPanel);
                linksContainer.appendChild(linkWrapper);

                // Progress bar'ı güncelle
                const progress = Math.round(((index + 1) / links.length) * 100);
                updateCustomProgressBar(progress);

                // Gecikme ekle
                await new Promise(resolve => setTimeout(resolve, 20));
            });
            copyAllLinksBtn.style.display = 'block';
            sourceInfo.textContent = '@patr0n sağolsun 😅';
            linksHeader.textContent = 'Ayıklanan Linkler (Toplam ' + links.length + ' adet)';
            showNewMethodMessage(false); // Yeni yöntem uyarısını kaldır
            showLoadingMessage(false); // Çoğul URL uyarısını kaldır
        } else {
            linksContainer.textContent = 'Hiçbir link bulunamadı.';
            copyAllLinksBtn.style.display = 'none';
            sourceInfo.textContent = '';
            showNewMethodMessage(false); // Yeni yöntem uyarısını kaldır
            showLoadingMessage(false); // Çoğul URL uyarısını kaldır
            updateCustomProgressBar(100);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Aktif işlem iptal edildi.');
        } else {
            console.error('Web sayfasından linkler alınamadı:', error);
            alert('Web sayfasından linkler alınamadı: ' + error);
            updateCustomProgressBar(100);
        }
    }
    showCustomProgressBar(true); // İşlem bittiğinde progress barı gizle
}

async function loadPlaylists() {
    const playlists = [
        { name: "IPTV Sevenler (Sinetech.tr @MemetCandal)", url: "https://raw.githubusercontent.com/GitLatte/patr0n/refs/heads/site/lists/iptvsevenler.m3u" },
    ];

    const playlistContainer = document.getElementById('playlistContainer');
    playlistContainer.innerHTML = ''; // Önceki içeriği temizle

    for (const playlist of playlists) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');

        const itemContent = document.createElement('div');
        itemContent.classList.add('item-content');

        const nameText = document.createElement('span');
        nameText.textContent = playlist.name;
        nameText.classList.add('playlist-name');
        nameText.setAttribute('data-url', playlist.url);

        const itemButtons = document.createElement('div');
        itemButtons.classList.add('item-buttons');

        const copyButton = document.createElement('button');
        copyButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
        copyButton.textContent = 'Kopyala';
        copyButton.onclick = () => copyToClipboard(playlist.url);

        const infoIcon = document.createElement('i');
        infoIcon.classList.add('bi', 'bi-info-circle');
        infoIcon.setAttribute('data-toggle', 'popover');
        infoIcon.setAttribute('data-content', 'Yükleniyor...');
        infoIcon.setAttribute('tabindex', '0'); // Popover'un çalışmasını sağlamak için tabindex ekliyoruz
        infoIcon.setAttribute('role', 'button'); // Popover'un çalışmasını sağlamak için role ekliyoruz

        itemButtons.appendChild(copyButton);
        itemButtons.appendChild(infoIcon);

        itemContent.appendChild(nameText);
        itemContent.appendChild(itemButtons);

        listItem.appendChild(itemContent);
        playlistContainer.appendChild(listItem);

        // Bilgi ikonuna dinamik içerik yükleme
        try {
            const response = await fetch(playlist.url);
            const text = await response.text();

            // Tekil grup başlıklarını belirlemek için set kullanma ve normalize etme
            const groupTitles = new Set();
            const groupTitleMatches = text.match(/group-title="([^"]+)"/g);
            if (groupTitleMatches) {
                groupTitleMatches.forEach(match => {
                    const groupTitle = match.match(/group-title="([^"]+)"/)[1].trim().toLowerCase(); // Normalize etme
                    groupTitles.add(groupTitle);
                });
            }

            // Kanal URL'lerini ve isimlerini almak için
            const channels = [];
            const extinfLines = text.match(/#EXTINF[\s\S]*?https?:\/\/[^\s]+/g);
            if (extinfLines) {
                extinfLines.forEach((line) => {
                    const urlMatch = line.match(/(http[^\s]+)/);
                    const nameMatch = line.match(/tvg-name="([^"]+)"/) || line.match(/tvg-id="([^"]+)"/);
                    if (urlMatch && nameMatch) {
                        const channel = {
                            url: urlMatch[1],
                            name: nameMatch[1].trim()
                        };
                        channels.push(channel);
                    }
                });
            }

            console.log(channels); // Kanalların doğru alınıp alınmadığını kontrol edin.

            // İçeriği oluşturma
            const content = `Toplam ${groupTitles.size} kanal grubu, toplam ${channels.length} kanal`;

            infoIcon.setAttribute('data-content', content);
            $(infoIcon).popover(); // Popover'ı yeniden oluştur
        } catch (error) {
            infoIcon.setAttribute('data-content', 'Bilgiler yüklenemedi');
        }

        // Playlist adına tıklandığında popup açma
        nameText.addEventListener('click', async function () {
            try {
                const response = await fetch(playlist.url);
                const text = await response.text();

                const channels = [];
                const extinfLines = text.match(/#EXTINF[\s\S]*?https?:\/\/[^\s]+/g);
                if (extinfLines) {
                    extinfLines.forEach((line) => {
                        const urlMatch = line.match(/(http[^\s]+)/);
                        const nameMatch = line.match(/tvg-name="([^"]+)"/) || line.match(/tvg-id="([^"]+)"/);
                        if (urlMatch && nameMatch) {
                            const channel = {
                                url: urlMatch[1],
                                name: nameMatch[1].trim()
                            };
                            channels.push(channel);
                        }
                    });
                }

                const channelSelect = document.getElementById('channelSelect');
                channelSelect.innerHTML = ''; // Önceki kanalları temizle
                channels.forEach(channel => {
                    const option = document.createElement('option');
                    option.value = channel.url;
                    option.textContent = channel.name;
                    channelSelect.appendChild(option);
                });

                $('#channelPopup').modal('show');
            } catch (error) {
                console.error('Kanal bilgileri yüklenemedi:', error);
            }
        });
    }

    // Sayfa yüklendiğinde popover'ları etkinleştir
    $('[data-toggle="popover"]').popover();

    // Navbar öğelerine tıklandığında popover'ları kapatma
    $('.navbar-nav .nav-link').on('click', function () {
        $('[data-toggle="popover"]').each(function () {
            $(this).popover('hide');
        });
    });

    // Plyr video oynatıcısını başlatma
    const videoPlayer = new Plyr('#videoPlayer', {});

    // Kanal seçildiğinde video oynatıcıda oynatma
    $('#channelSelect').on('change', function () {
        const selectedChannel = $(this).val();
        const fileExtension = selectedChannel.split('.').pop();
        let mimeType = 'video/mp4'; // Varsayılan MIME türü

        // MIME türünü URL uzantısına göre belirleyelim
        switch(fileExtension) {
            case 'm3u8':
                mimeType = 'application/x-mpegURL';
                break;
            case 'mpd':
                mimeType = 'application/dash+xml';
                break;
            case 'mp4':
                mimeType = 'video/mp4';
                break;
            case 'webm':
                mimeType = 'video/webm';
                break;
        }

        videoPlayer.source = {
            type: 'video',
            sources: [
                {
                    src: selectedChannel,
                    type: mimeType
                }
            ]
        };

        setTimeout(() => {
            videoPlayer.play().catch(error => {
                console.error('Video oynatılamadı:', error);
            });
        }, 500); // Video oynatma gecikmesi ekleyin
    });
}

// Sayfa yüklendiğinde hazır listeleri yükle
document.addEventListener('DOMContentLoaded', function() {
    loadPlaylists();
    showSection('metin-ayiklama'); // İlk açılışta metin ayıklama bölümünü göster
});

function parseXtreamDetails(link) {
    const url = new URL(link);
    const server = url.origin;
    const params = new URLSearchParams(url.search);
    const username = params.get('username');
    const password = params.get('password');
    return { server, username, password };
}

function showAlert(message) {
    alert(message);
}

function copyToClipboard(text) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    showAlert('Kopyalandı: ' + (text.length > 200 ? text.substring(0, 200) + '...' : text));
}

function copyAllLinks() {
    const linksText = Array.from(document.getElementById('links').getElementsByTagName('a'), link => link.href).join('\n');
    copyToClipboard(linksText);
}
function resetPage() {
    clearPreviousResults();
    document.getElementById('inputText').value = '';
    document.getElementById('pageUrl').value = '';
    showSection('metin-ayiklama'); // İlk açılışta metin ayıklama bölümünü göster
}
document.querySelector('.navbar-brand').addEventListener('click', function(e) {
    e.preventDefault(); // Varsayılan bağlantı davranışını engelle
    resetPage(); // Sayfayı başlangıç durumuna getir
});

// Tüm navbar öğelerini seç
const navbarItems = document.querySelectorAll('.navbar-nav .nav-link');

// Her bir navbar öğesine event listener ekle
navbarItems.forEach(item => {
    item.addEventListener('click', function() {
        showCustomProgressBar(false); // Progress bar'ı gizle

        // Hazır Listeler'e geçiş yapılınca "linksContainer"ı gizle
        if (item.textContent.trim() === 'Hazır Listeler') {
            document.getElementById('linksContainer').style.display = 'none';
        } else {
            document.getElementById('linksContainer').style.display = 'block';
        }
    });
});

// Metin alanına dosya ile de metin ekleyip link ayıklamak için
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('inputText').value = e.target.result; // Dosya içeriğini metin alanına ekle
        };
        reader.readAsText(file);
    }
});
