let currentRequest = null; // Şu anki aktif istek

function showLoadingMessage(show) {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = show ? 'block' : 'none';
}

function showNewMethodMessage(show) {
    const newMethodMessage = document.getElementById('newMethodMessage');
    newMethodMessage.style.display = show ? 'block' : 'none';
}

function updateCustomProgressBar(percentage) {
    console.log(`Progress bar updated to: ${percentage}%`); // Test mesajı
    const progressBar = document.getElementById('customProgressBar');
    progressBar.style.width = percentage + '%';
    progressBar.textContent = percentage + '%';
}

function showCustomProgressBar(show) {
    const progressContainer = document.getElementById('customProgressContainer');
    progressContainer.style.display = show ? 'block' : 'none';
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
    showCustomProgressBar(true); // Progress barı gizle
    updateCustomProgressBar(0); // Progress barı sıfırla
}

function decodeURL(url) {
    try {
        return decodeURIComponent(url.replace(/\\+/g, ' '));
    } catch (e) {
        console.error('URL decoding failed:', e);
        return url;
    }
}

function cleanURL(url) {
    return url.replace(/[<>"]/g, '').replace(/'/g, '').replace(/,$/g, ''); // "<", ">", çift tırnak ve tek tırnakları temizle, ayrıca sondaki virgülü kaldır
}

// Metinden Linkleri Ayıklama
async function extractLinks() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
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
    showCustomProgressBar(false); // İşlem bittiğinde progress barı gizle
    showNewMethodMessage(false);
    showLoadingMessage(false);
}

// Linkleri Ayıklama (örnek olarak fetchLinksFromPage fonksiyonu güncelleniyor)
async function fetchLinksFromPage() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
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
    showCustomProgressBar(false); // İşlem bittiğinde progress barı gizle
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
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://paste.fo/raw/45174a0b7377')}`, { signal });
        const data = await response.json();
        const html = data.contents.split('\n').slice(0, 750).join('\n'); // İlk 750 satırı al
        const fullHtml = data.contents;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern);
        const fullLinks = fullHtml.match(urlPattern); // Tüm sayfadaki linkler
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

            // Toplam link sayısını gösterme
            const totalLinksNote = document.createElement('div');
            totalLinksNote.classList.add('alert', 'alert-secondary', 'mt-2');
            totalLinksNote.textContent = `Toplam Link Sayısı: ${fullLinks ? fullLinks.length : 0} (İlk 750 satırdan ${links.length} tanesi görüntüleniyor)`;
            linksContainer.appendChild(totalLinksNote);

            // Linkleri listeye ekleme
            links.forEach(async (link, index) => {
                if (signal.aborted) return; // İptal edildi mi kontrol et
                const decodedLink = decodeURL(link); // URL'yi çöz
                const cleanedLink = cleanURL(decodedLink); // URL'yi temizle
                const line = html.split('\n').find(line => line.includes(link));
                const maxConnectionsMatch = line.match(/Maksimum Bağlantılar: (\d+)/);
                const maxConnections = maxConnectionsMatch ? ` (Önemli: Aynı anda en fazla ${maxConnectionsMatch[1]} kişi kullanabilir)` : '';
                
                const validatedLink = new URL(cleanedLink.trim()).href;
                const linkWrapper = document.createElement('div');
                linkWrapper.classList.add('p-3', 'mb-2', 'bg-light', 'rounded');
                linkWrapper.id = 'linkWrapper_' + index;

                const linkElement = document.createElement('a');
                linkElement.href = validatedLink;
                linkElement.textContent = (index + 1) + '. ' + validatedLink;
                linkElement.target = '_blank';
                linkElement.classList.add('d-block', 'mb-2');

                const connectionsInfo = document.createElement('span');
                connectionsInfo.textContent = maxConnections;
                connectionsInfo.classList.add('ml-2', 'font-italic', 'text-muted');

                const copyButton = document.createElement('button');
                copyButton.textContent = 'Bu Adresi Kullan';
                copyButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
                copyButton.onclick = () => copyToClipboard(validatedLink);

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

                const xtreamDetails = parseXtreamDetails(validatedLink);
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
    showCustomProgressBar(false); // İşlem bittiğinde progress barı gizle
}

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

// Hazır Listeleri Yükleme
function loadPlaylists() {
    const playlists = [
        { name: "Spor Listesi", url: "https://tinyurl.com/sporlistesi1" },
        { name: "Film Listesi", url: "https://tinyurl.com/filmlistesi1" },
        { name: "Dizi Listesi", url: "https://tinyurl.com/dizilistesi1" },
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

// Bölümleri Gösterme ve Gizleme
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
    resetPage();
}

function resetPage() {
    if (currentRequest) {
        currentRequest.abort(); // Aktif isteği iptal et
        currentRequest = null;
    }
    clearPreviousResults(); // Sonuçları temizle
}
