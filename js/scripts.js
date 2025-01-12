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

async function extractLinks() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
    const inputText = document.getElementById('inputText').value;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const links = inputText.match(urlPattern);
    const linksContainer = document.getElementById('links');
    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
    const linksHeader = document.getElementById('linksHeader');
    
    linksContainer.innerHTML = '';
    showCustomProgressBar(true); // Progress barı göster
    
    if (links && links.length > 0) {
        linksHeader.textContent = 'Ayıklanan Linkler (Toplam ' + links.length + ' adet)';
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
    } else {
        linksHeader.textContent = 'Hiçbir link bulunamadı.';
        copyAllLinksBtn.style.display = 'none';
        updateCustomProgressBar(100);
    }
    showCustomProgressBar(true); // İşlem bittiğinde progress barı gizle
    showNewMethodMessage(false);
    showLoadingMessage(false);
}


async function fetchLinksFromPage() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
    const pageUrl = document.getElementById('pageUrl').value;
    showCustomProgressBar(true); // Progress barı göster
    const linksHeader = document.getElementById('linksHeader');
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(pageUrl)}`);
        const data = await response.json();
        const html = data.contents;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern);
        const linksContainer = document.getElementById('links');
        const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
        const sourceInfo = document.getElementById('sourceInfo');
        
        if (links && links.length > 0) {
            linksHeader.textContent = 'Ayıklanan Linkler (Toplam ' + links.length + ' adet)';
            for (const [index, link] of links.entries()) {
                setTimeout(async () => {
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
                }, index * 100);
            }
            copyAllLinksBtn.style.display = 'block';
            sourceInfo.textContent = pageUrl;
        } else {
            linksHeader.textContent = 'Hiçbir link bulunamadı.';
            copyAllLinksBtn.style.display = 'none';
            sourceInfo.textContent = '';
            updateCustomProgressBar(100);
        }
    } catch (error) {
        console.error('Web sayfasından linkler alınamadı:', error);
        alert('Web sayfasından linkler alınamadı: ' + error);
        updateCustomProgressBar(100);
    }
    showCustomProgressBar(true); // İşlem bittiğinde progress barı gizle
    showNewMethodMessage(false);
    showLoadingMessage(false);
}

async function fetchPatronLinks() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
    showCustomProgressBar(true); // Progress barı göster
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://paste.fo/raw/45174a0b7377')}`);
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
            const promises = links.map(async (link, index) => {
                try {
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
                } catch (urlError) {
                    console.warn('Geçersiz URL atlandı:', link);
                }
            });

            await Promise.all(promises);
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
        console.error('Web sayfasından linkler alınamadı:', error);
        alert('Web sayfasından linkler alınamadı: ' + error);
        showNewMethodMessage(false); // Yeni yöntem uyarısını kaldır
        showLoadingMessage(false); // Çoğul URL uyarısını kaldır
        updateCustomProgressBar(100);
    }
    showCustomProgressBar(true); // İşlem bittiğinde progress barı gizle
}

function parseXtreamDetails(link) {
    const url = new URL(link);
    const server = url.origin;
    const params = new URLSearchParams(url.search);
    const username = params.get('username');
    const password = params.get('password');
    return { server, username, password };
}

function showToast(message) {
    // Mesajı kısaltmak ve çok uzun mesajları sınırlamak
    const maxMessageLength = 200; // Görüntülenecek maksimum karakter sayısı
    const displayMessage = message.length > maxMessageLength ? message.substring(0, maxMessageLength) + '...' : message;

    Toastify({
        text: displayMessage,
        duration: 2000, // 2 saniye boyunca görüntülenecek
        close: true,
        gravity: "bottom", // Toast konumu: "top" veya "bottom"
        position: "right", // Toast konumu: "left", "center" veya "right"
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)"
        },
        stopOnFocus: false, // Mouse üzerine geldiğinde durmasın
        onClick: function() { this.hideToast(); } // Tıklanınca gizle
    }).showToast();
}

function copyToClipboard(text) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    showToast('Kopyalandı: ' + (text.length > 200 ? text.substring(0, 200) + '...' : text));
}

function copyAllLinks() {
    const linksText = Array.from(document.getElementById('links').getElementsByTagName('a'), link => link.href).join('\n');
    copyToClipboard(linksText);
}