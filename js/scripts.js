let currentRequest = null; // Şu anki aktif istek

function updateCustomProgressBar(percentage) {
    console.log(`Progress bar updated to: ${percentage}%`); // Test mesajı
    const progressBar = document.getElementById('customProgress');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.textContent = percentage + '%';
    } else {
        console.error('Progress bar element not found');
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
    linksHeader.textContent = 'Ayıklanan Linkler';
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
	showCustomProgressBar(true); // Progress barı göster
    const inputText = document.getElementById('inputText').value;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const links = inputText.match(urlPattern);
    const linksContainer = document.getElementById('links');
    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
    
    linksContainer.innerHTML = '';
    showCustomProgressBar(true); // Progress barı göster
    
    if (currentRequest) {
        currentRequest.abort(); // Önceki istek varsa iptal et
    }

    currentRequest = new AbortController(); // Yeni AbortController oluştur
    const signal = currentRequest.signal; // Abort sinyalini al

    if (links && links.length > 0) {
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
    } else {
        linksContainer.textContent = 'Hiçbir link bulunamadı.';
        copyAllLinksBtn.style.display = 'none';
        updateCustomProgressBar(100);
    }
    showCustomProgressBar(true); // İşlem bittiğinde progress barı gizle
    showNewMethodMessage(false);
    showLoadingMessage(false);
}
// Linkleri Ayıklama (örnek olarak fetchLinksFromPage fonksiyonu güncelleniyor)
async function fetchLinksFromPage() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
	showCustomProgressBar(true); // Progress barı göster
    const pageUrl = document.getElementById('pageUrl').value;
    showCustomProgressBar(true); // Progress barı göster

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
            links.forEach(async (link, index) => {
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

function loadPlaylists() {
    const playlists = [
        { name: "Spor Listesi", url: "https://tinyurl.com/sporlistesi1" },
        { name: "Film Listesi", url: "https://tinyurl.com/filmlistesi1" },
        { name: "Dizi Listesi", url: "https://tinyurl.com/dizilistesi1" },
		{ name: "IPTV Sevenler (MemetCandal)", url: ",https://raw.githubusercontent.com/GitLatte/patr0n/refs/heads/site/lists/iptvsevenler.m3u" },
        // Eklemek istediğiniz diğer listeler...
    ];

    const playlistContainer = document.getElementById('playlistContainer');
    playlists.forEach(playlist => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        listItem.textContent = playlist.name;

        const copyButton = document.createElement('button');
        copyButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
        copyButton.textContent = 'Kopyala';
        copyButton.onclick = () => copyToClipboard(playlist.url);

        listItem.appendChild(copyButton);
        playlistContainer.appendChild(listItem);
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
