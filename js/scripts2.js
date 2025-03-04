let currentRequest = null; // Şu anki aktif istek

// Progress bar'ı güncelleyen fonksiyon
function updateCustomProgressBar(progress, count, totalLinks) {
    const progressBar = document.getElementById('customProgress');
    const progressValue = document.querySelector('.progress-value');
    const linksHeader = document.getElementById('linksHeader');
    
    if (progressBar && progressValue) {
        progressBar.style.width = `${progress}%`;
        progressValue.textContent = progress === 100 ? `İşlem tamamlandı` : `${progress}% ${count}/${totalLinks} link`;
        
        if (linksHeader && count > 0) {
            linksHeader.textContent = `Bulunan bağlantılar toplamı ${totalLinks} adet`;
        }
    } else {
        console.error('Progress bar or value element not found');
    }
}

// Progress bar'ı gösteren veya gizleyen fonksiyon
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
    if (loadingMessage) {
        loadingMessage.style.display = show ? 'block' : 'none';
    }
}

function showNewMethodMessage(show) {
    const newMethodMessage = document.getElementById('newMethodMessage');
    if (newMethodMessage) {
        newMethodMessage.style.display = show ? 'block' : 'none';
    }
}

function cleanURL(url) {
    return url.replace(/[<>"]/g, '').replace(/'/g, '').replace(/,$/g, ''); // "<", ">", çift tırnak ve tek tırnakları temizle, ayrıca sondaki virgülü kaldır
}

function clearPreviousResults() {
    const linksContainer = document.getElementById('links');
    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
    const sourceInfo = document.getElementById('sourceInfo');
    const linksHeader = document.getElementById('linksHeader');
    if (linksContainer) linksContainer.innerHTML = '';
    if (copyAllLinksBtn) copyAllLinksBtn.style.display = 'none';
    if (sourceInfo) sourceInfo.textContent = '';
    if (linksHeader) linksHeader.textContent = 'Sonuçlar';
    updateCustomProgressBar(0, 0); // Progress barı sıfırla
}

// Tab handling functions
function initializeTabs() {
    const mainTabs = document.getElementById('mainTabs');
    if (mainTabs) {
        mainTabs.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const tabId = e.target.getAttribute('href').substring(1);
                showTab(tabId);
                // Update URL with hash for direct access
                window.location.hash = tabId;
            }
        });

        // Check for hash in URL on page load
        if (window.location.hash) {
            const tabId = window.location.hash.substring(1);
            showTab(tabId);
        }
    }
}

function showTab(tabId) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });

    // Deactivate all tabs
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab pane
    const selectedPane = document.getElementById(tabId);
    if (selectedPane) {
        selectedPane.classList.add('show', 'active');
    }

    // Activate selected tab
    const selectedTab = document.querySelector(`[href="#${tabId}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Clear results section when switching tabs
    clearPreviousResults();
    showCustomProgressBar(false);
    showNewMethodMessage(false);
    showLoadingMessage(false);
}

// Initialize tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
    // Initialize dynamic page loading
    initializeNavigation();
    // Load the default page
    loadPage('pages/link-extraction.html');
});

// Dynamic page loading functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('#mainNav .nav-link');
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Load the corresponding page
                const pagePath = this.getAttribute('data-page');
                if (pagePath) {
                    loadPage(pagePath);
                }
            });
        });
    }
}

function loadPage(pagePath) {
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) return;
    
    // Add fade-out effect
    contentContainer.style.opacity = '0';
    
    // Use XMLHttpRequest instead of fetch to handle local files
    const xhr = new XMLHttpRequest();
    xhr.open('GET', pagePath, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xhr.responseText, 'text/html');
            const container = doc.querySelector('.container-fluid');
            
            if (container) {
                setTimeout(() => {
                    contentContainer.innerHTML = container.innerHTML;
                    contentContainer.style.opacity = '1';
                    
                    // Reset and hide UI elements for the new page
                    const progressContainer = document.getElementById('customProgressContainer');
                    const linksContainer = document.getElementById('linksContainer');
                    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
                    const sourceInfo = document.getElementById('sourceInfo');
                    const loadingMessage = document.getElementById('loadingMessage');
                    
                    if (progressContainer) progressContainer.style.display = 'none';
                    if (linksContainer) linksContainer.style.display = pagePath.includes('ready-lists.html') ? 'none' : 'block';
                    if (copyAllLinksBtn) copyAllLinksBtn.style.display = 'none';
                    if (sourceInfo) sourceInfo.textContent = '';
                    if (loadingMessage) loadingMessage.style.display = 'none';
                    
                    // Reinitialize components
                    if (typeof $ !== 'undefined') {
                        $('[data-toggle="tooltip"]').tooltip();
                    }
                    if (pagePath.includes('ready-lists.html')) {
                        if (typeof loadPlaylists === 'function') {
                            loadPlaylists();
                        }
                    }
                }, 300);
            }
        } else {
            contentContainer.innerHTML = '<div class="alert alert-danger">Error loading content</div>';
            contentContainer.style.opacity = '1';
        }
    };
    
    xhr.onerror = function() {
        contentContainer.innerHTML = '<div class="alert alert-danger">Error loading content</div>';
        contentContainer.style.opacity = '1';
    };
    
    xhr.send();
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
            copyButton.textContent = 'Bu Adresi Kopyala 📋';
            copyButton.classList.add('btn', 'btn-outline-success', 'btn-block');
            copyButton.onclick = () => copyToClipboard(cleanedLink);

            linksContainer.appendChild(linkElement);
            linksContainer.appendChild(copyButton);

            // Progress bar'ı güncelle
            const progress = Math.round(((index + 1) / links.length) * 100);
            updateCustomProgressBar(progress);

            // Gecikme ekle
            await new Promise(resolve => setTimeout(resolve, 20));
        });
        copyAllLinksBtn.style.display = 'block';
        linksHeader.textContent = `Bulunan bağlantılar toplamı ${links.length} adet`; // Toplam link sayısını ekle
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
    showCustomProgressBar(true); // Progress bar'ı göster
    const pageUrl = document.getElementById('pageUrl').value;
    const linksHeader = document.getElementById('linksHeader'); // Link başlığı elemanını al

    if (currentRequest) {
        currentRequest.abort(); // Önceki istek varsa iptal et
    }

    currentRequest = new AbortController(); // Yeni AbortController oluştur
    const signal = currentRequest.signal; // Abort sinyalini al
    
    try {
        const proxyUrl = 'https://cors.gitlatte.workers.dev/?url='; // Cloudflare Worker URL'sini kullanıyoruz
        const response = await fetch(proxyUrl + encodeURIComponent(pageUrl), { signal });
        const html = await response.text(); // Proxy kullandığımız için doğrudan metin olarak alıyoruz
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern);
        const lines = html.split('\n'); // Satırları ayır
        const linksContainer = document.getElementById('links');
        const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
        const sourceInfo = document.getElementById('sourceInfo');
        
        if (links && links.length > 0) {
            linksContainer.innerHTML = '';

            document.getElementById('copyCurrentPageBtn').style.display = 'block';
            const invalidLinks = []; // Hatalı linkleri saklamak için
            
            for (const [index, link] of links.entries()) {
                if (signal.aborted) return;

                // URL'yi doğrula ve temizle
                let cleanedLink;
                try {
                    cleanedLink = new URL(cleanURL(decodeURL(link)).trim()).href;
                } catch (e) {
                    console.error('Geçersiz URL atlandı:', link);
                    invalidLinks.push(link);
                    continue; // Geçersiz URL'yi atla
                }

                // İlgili bilgileri içeren satırları bul
                const linkLineIndex = lines.findIndex(line => line.includes(link));
                const linkLine = lines[linkLineIndex] || '';
                const infoLine = lines[linkLineIndex + 1] || '';

                const maxConnectionsMatch = (linkLine + ' ' + infoLine).match(/(?:Maksimum Bağlantılar|Maximum Connections): (\d+)/);
                const maxConnections = maxConnectionsMatch ? `<span style="color: rgb(41, 105, 176);">Önemli</span>: Aynı anda en fazla <strong>${maxConnectionsMatch[1]}</strong> kişi kullanabilir` : '';
                const expiresMatch = (linkLine + ' ' + infoLine).match(/(?:Son kullanma tarihi|Expires): ([\d\/\.\- ]+ \d+:\d+:\d+)/);
                const expires = expiresMatch ? `<span style="color: rgb(41, 105, 176);">Son kullanma tarihi</span>: <strong>${expiresMatch[1]}</strong>` : '';

                const linkWrapper = document.createElement('div');
                linkWrapper.classList.add('p-3', 'mb-2', 'bg-light', 'rounded');
                linkWrapper.id = 'linkWrapper_' + index;

                const linkElement = document.createElement('a');
                linkElement.href = cleanedLink;
                linkElement.textContent = (index + 1) + '. ' + cleanedLink;
                linkElement.target = '_blank';
                linkElement.classList.add('d-block', 'mb-2');

                const connectionsInfo = document.createElement('span');
                connectionsInfo.innerHTML = maxConnections;
                connectionsInfo.classList.add('ml-2', 'font-italic', 'text-muted');

                const expiresInfo = document.createElement('span');
                expiresInfo.innerHTML = expires;
                expiresInfo.classList.add('ml-2', 'font-italic', 'text-muted');

                const copyButton = document.createElement('button');
                copyButton.textContent = 'Bu Adresi Kopyala 📋';
                copyButton.classList.add('btn', 'btn-outline-success', 'btn-block');
                copyButton.onclick = () => copyToClipboard(cleanedLink);

                // Xtream Code olarak gösterme düğmesini sadece username ve password parametreleri varsa ekle
                const url = new URL(cleanedLink);
                if (url.searchParams.has('username') && url.searchParams.has('password')) {
                    const showXtreamButton = document.createElement('button');
                    showXtreamButton.classList.add('btn', 'btn-outline-info', 'btn-block');
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

                    linkWrapper.appendChild(showXtreamButton);
                    linkWrapper.appendChild(xtreamPanel);
                }

                linkWrapper.appendChild(linkElement);
                if (maxConnections) linkWrapper.appendChild(connectionsInfo); // Bağlantı bilgisi ekle
                if (expires) linkWrapper.appendChild(expiresInfo); // Son kullanma tarihi bilgisi ekle
                linkWrapper.appendChild(copyButton);
                linksContainer.appendChild(linkWrapper);

                // Progress bar'ı güncelle
                const progress = Math.round(((index + 1) / links.length) * 100);
                updateCustomProgressBar(progress, index + 1);

                // Gecikme ekle
                await new Promise(resolve => setTimeout(resolve, 1)); // 1 milisaniye gecikme
            }

            // Hatalı linkleri ekleme ve toplam sayıları güncelleme
            if (invalidLinks.length > 0) {
                const invalidLinksNote = document.createElement('div');
                invalidLinksNote.classList.add('alert', 'alert-danger', 'mt-2');
                invalidLinksNote.innerHTML = `Toplam <strong>${invalidLinks.length}</strong> hatalı yazılmış adres. <a href="#" id="showInvalidLinks">Göster</a>`;
                linksContainer.appendChild(invalidLinksNote);

                const invalidLinksList = document.createElement('ul');
                invalidLinksList.id = 'invalidLinksList';
                invalidLinksList.style.display = 'none';
                invalidLinks.forEach((link, index) => {
                    const invalidLinkItem = document.createElement('li');
                    invalidLinkItem.textContent = `${index + 1}. ${link}`;
                    invalidLinksList.appendChild(invalidLinkItem);
                });
                linksContainer.appendChild(invalidLinksList);

                const showInvalidLinksButton = document.getElementById('showInvalidLinks');
                showInvalidLinksButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const invalidLinksList = document.getElementById('invalidLinksList');
                    const isVisible = invalidLinksList.style.display === 'none';
                    invalidLinksList.style.display = isVisible ? 'block' : 'none';
                    showInvalidLinksButton.textContent = isVisible ? 'Gizle' : 'Göster';
                });
            }


            sourceInfo.textContent = pageUrl;
            linksHeader.innerHTML = `Bulunan bağlantı toplamı&nbsp; <strong>${links.length}</strong>  &nbsp;adet`; // Toplam link sayısını ekle
        } else {
            linksContainer.textContent = 'Hiçbir link bulunamadı.';
            copyAllLinksBtn.style.display = 'none';
            sourceInfo.textContent = '';
            updateCustomProgressBar(100, 0);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Aktif işlem iptal edildi.');
        } else {
            console.error('Web sayfasından linkler alınamadı:', error);
            alert('Web sayfasından linkler alınamadı: ' + error);
            updateCustomProgressBar(100, 0);
        }
    }
    showCustomProgressBar(true); // İşlem bittiğinde progress barı gizle
    showNewMethodMessage(false);
    showLoadingMessage(false);
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function showCustomProgressBar(show) {
    const progressContainer = document.getElementById('customProgressContainer');
    progressContainer.style.display = show ? 'block' : 'none';
}

function updateCustomProgressBar(percentage, count, totalCount) {
    const progressBar = document.getElementById('customProgress');
    const progressValue = document.querySelector('.progress-value');
    const sayfaBasiLink = currentPage * count;
    progressBar.style.width = percentage + '%';
    progressValue.textContent = totalCount ? `Tamamlandı. (${totalCount} - ${currentPage}. sayfadaki ${count} link)` : `${percentage}% (${count} link)`;
}

function displayLinks(links) {
    const linksContainer = document.getElementById('links');
    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
    const linksHeader = document.getElementById('linksHeader');

    linksContainer.innerHTML = '';
    if (links.length > 0) {
        links.forEach((link, index) => {
            const linkWrapper = document.createElement('div');
            linkWrapper.classList.add('p-3', 'mb-2', 'bg-light', 'rounded');

            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.textContent = `${index + 1}. ${link}`;
            linkElement.target = '_blank';
            linkElement.classList.add('d-block', 'mb-2');

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Bu Adresi Kopyala 📋';
            copyButton.classList.add('btn', 'btn-outline-success', 'btn-block');
            copyButton.onclick = () => copyToClipboard(link);

            linkWrapper.appendChild(linkElement);
            linkWrapper.appendChild(copyButton);
            linksContainer.appendChild(linkWrapper);
        });

        copyAllLinksBtn.style.display = 'block';
        linksHeader.textContent = `Bulunan bağlantı toplamı ${links.length} adet`;
    } else {
        linksContainer.textContent = 'Hiçbir link bulunamadı.';
        copyAllLinksBtn.style.display = 'none';
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function copyCurrentPageLinks() {
    const currentLinks = Array.from(document.querySelectorAll('.result-item a'))
        .map(a => a.href)
        .join('\n');
    copyToClipboard(currentLinks);
}

function copyAllLinks() {
    const allLinks = Array.from(document.querySelectorAll('.result-item a'))
        .map(a => a.href)
        .join('\n');
    copyToClipboard(allLinks);
}

let currentPage = 1;
const linksPerPage = 100;

async function fetchPatronLinks() {
    clearPreviousResults();
    showNewMethodMessage(true);
    showLoadingMessage(true);
    showCustomProgressBar(true);

    if (currentRequest) {
        currentRequest.abort();
    }

    currentRequest = new AbortController();
    const signal = currentRequest.signal;
    const invalidLinks = [];

    try {
        const proxyUrl = 'https://cors.gitlatte.workers.dev/?url=';
        const targetUrl = 'https://tinyurl.com/gitpatron';
        let response = await fetch(proxyUrl + encodeURIComponent(targetUrl), { signal });
        const html = await response.text();

        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern);
        const lines = html.split('\n');

        const linksContainer = document.getElementById('links');
        const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
        const sourceInfo = document.getElementById('sourceInfo');
        const linksHeader = document.getElementById('linksHeader');
        const lastUpdate = document.getElementById('lastUpdate');
        const totalLinks = document.getElementById('totalLinks');
        
        const firstLine = html.split('\n')[0].trim();
        const [datePart] = firstLine.split('_');

        // Find the first link and separator line to count new links
        let newLinksCount = 0;
        const firstLinkIndex = lines.findIndex(line => urlPattern.test(line));
        const separatorIndex = lines.slice(firstLinkIndex).findIndex(line => line.trim().match(/^-{3,}/));
        
        if (firstLinkIndex >= 0 && separatorIndex > 0) {
            // Count links from first link to separator
            const newLinksText = lines.slice(firstLinkIndex, firstLinkIndex + separatorIndex).join('\n');
            const newLinks = newLinksText.match(urlPattern) || [];
            newLinksCount = newLinks.length;
        }

        // Update info cards
        lastUpdate.textContent = datePart;
        totalLinks.textContent = links ? links.length : '0';
        
        // Add new links count to the info cards if available
        const newLinksInfo = document.getElementById('newLinks');
        if (newLinksInfo) {
            newLinksInfo.textContent = newLinksCount > 0 ? newLinksCount : '0';
        }

        if (links && links.length > 0) {
            linksContainer.innerHTML = '';

            document.getElementById('copyCurrentPageBtn').style.display = 'block';

            // Calculate pagination
            const totalPages = Math.ceil(links.length / linksPerPage);
            const startIndex = (currentPage - 1) * linksPerPage;
            const endIndex = Math.min(startIndex + linksPerPage, links.length);
            const currentLinks = links.slice(startIndex, endIndex);

            // Create pagination controls
            const paginationContainer = document.createElement('div');
            paginationContainer.classList.add('pagination', 'justify-content-center', 'my-3');
            paginationContainer.innerHTML = `
                <button class="btn mx-1" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="btn mx-1" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-left"></i>
                </button>
                <span class="mx-3">Sayfa ${currentPage} / ${totalPages}</span>
                <button class="btn mx-1" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="btn mx-1" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-right"></i>
                </button>
            `;

            linksContainer.appendChild(paginationContainer);

            for (const [index, link] of currentLinks.entries()) {
                if (signal.aborted) return;

                let cleanedLink;
                try {
                    cleanedLink = new URL(cleanURL(decodeURL(link)).trim()).href;
                } catch (e) {
                    console.error('Geçersiz URL atlandı:', link);
                    invalidLinks.push(link);
                    continue;
                }

                const linkLineIndex = lines.findIndex(line => line.includes(link));
                const linkLine = lines[linkLineIndex] || '';
                const infoLine = lines[linkLineIndex + 1] || '';

                const maxConnectionsMatch = (linkLine + ' ' + infoLine).match(/(?:Maksimum Bağlantılar|Maximum Connections): (\d+)/);
                const expiresMatch = (linkLine + ' ' + infoLine).match(/(?:Son kullanma tarihi|Expires): ([\d\/\.\- ]+ \d+:\d+:\d+)/);

                // Create result item container
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');

                // Add result number
                const resultNumber = document.createElement('div');
                resultNumber.classList.add('result-number');
                resultNumber.textContent = startIndex + index + 1;
                resultItem.appendChild(resultNumber);

                // Create info section
                const resultInfo = document.createElement('div');
                resultInfo.classList.add('result-info');

                // Add URL info
                const urlInfo = document.createElement('div');
                urlInfo.classList.add('result-info-item');
                urlInfo.innerHTML = `
                    <div class="result-info-label">URL:</div>
                    <div class="result-info-value">
                        <a href="${cleanedLink}" target="_blank">${cleanedLink}</a>
                    </div>
                `;
                resultInfo.appendChild(urlInfo);

                // Add connection limit if available
                if (maxConnectionsMatch) {
                    const connectionInfo = document.createElement('div');
                    connectionInfo.classList.add('result-info-item');
                    connectionInfo.innerHTML = `
                        <div class="result-info-label">Bağlantı Limiti:</div>
                        <div class="result-info-value">${maxConnectionsMatch[1]} kullanıcı</div>
                    `;
                    resultInfo.appendChild(connectionInfo);
                }

                // Add expiry date if available
                if (expiresMatch) {
                    const expiryInfo = document.createElement('div');
                    expiryInfo.classList.add('result-info-item');
                    expiryInfo.innerHTML = `
                        <div class="result-info-label">Son Kullanma:</div>
                        <div class="result-info-value">${expiresMatch[1]}</div>
                    `;
                    resultInfo.appendChild(expiryInfo);
                }

                resultItem.appendChild(resultInfo);

                // Create actions section
                const resultActions = document.createElement('div');
                resultActions.classList.add('result-actions');

                // Add copy button
                const copyButton = document.createElement('button');
                copyButton.classList.add('btn');
                copyButton.innerHTML = '<i class="fas fa-copy"></i> Kopyala';
                copyButton.onclick = () => copyToClipboard(cleanedLink);
                resultActions.appendChild(copyButton);

                // Add Xtream code button if applicable
                try {
                    const url = new URL(cleanedLink);
                    if (url.searchParams.has('username') && url.searchParams.has('password')) {
                        const showXtreamButton = document.createElement('button');
                        showXtreamButton.classList.add('btn');
                        showXtreamButton.innerHTML = '<i class="fas fa-code"></i> Xtream Detayları';

                        const xtreamPanel = document.createElement('div');
                        xtreamPanel.style.display = 'none';
                        xtreamPanel.classList.add('xtream-details');

                        const xtreamDetails = parseXtreamDetails(cleanedLink);
                        xtreamPanel.innerHTML = `
                            <div class="result-info-item">
                                <div class="result-info-label">Sunucu:</div>
                                <div class="result-info-value">${xtreamDetails.server}</div>
                            </div>
                            <div class="result-info-item">
                                <div class="result-info-label">Kullanıcı Adı:</div>
                                <div class="result-info-value">${xtreamDetails.username}</div>
                            </div>
                            <div class="result-info-item">
                                <div class="result-info-label">Şifre:</div>
                                <div class="result-info-value">${xtreamDetails.password}</div>
                            </div>
                        `;

                        showXtreamButton.addEventListener('click', () => {
                            const isVisible = xtreamPanel.style.display === 'block';
                            xtreamPanel.style.display = isVisible ? 'none' : 'block';
                            showXtreamButton.innerHTML = isVisible ? 
                                '<i class="fas fa-code"></i> Xtream Detayları' : 
                                '<i class="fas fa-times"></i> Detayları Gizle';
                        });


                        resultActions.appendChild(showXtreamButton);
                        resultItem.appendChild(xtreamPanel);
                    }
                } catch (e) {
                    console.error('URL parsing failed:', e);
                }

                resultItem.appendChild(resultActions);
                linksContainer.appendChild(resultItem);

                const progress = Math.round(((index + 1) / currentLinks.length) * 100);
                updateCustomProgressBar(progress, index + 1, links.length);
                await new Promise(resolve => setTimeout(resolve, 1));
            }

            // Add pagination controls at the bottom as well
            const bottomPaginationContainer = paginationContainer.cloneNode(true);
            linksContainer.appendChild(bottomPaginationContainer);


            sourceInfo.innerHTML = '<span class="patron-sagolsun" style="display: inline-flex; align-items: center; gap: 8px;"><i class="fas fa-heart fa-lg" style="color: rgb(5,47, 105); text-shadow: 0 0 10px #FFED46; animation: heartbeat 1.5s ease-in-out infinite;"></i><a href="https://forum.sinetech.tr/konu/1-2-03-2025-m3u-linkleri.2131/" target="blank">patr0n kardeşim sağolsun, emeklerine sağlık.</span><style>@keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); }}</style></a>';
        } else {
            linksContainer.textContent = 'Hiçbir link bulunamadı.';
            copyAllLinksBtn.style.display = 'none';
            sourceInfo.textContent = '';
            updateCustomProgressBar(100, 0);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Aktif işlem iptal edildi.');
        } else {
            console.error('Web sayfasından linkler alınamadı:', error);
            alert('Web sayfasından linkler alınamadı: ' + error);
            updateCustomProgressBar(100, 0);
        }
    }
    showCustomProgressBar(true);
    showNewMethodMessage(false);
    showLoadingMessage(false);
}

function changePage(page) {
    currentPage = page;
    fetchPatronLinks();
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function showCustomProgressBar(show) {
    const progressContainer = document.getElementById('customProgressContainer');
    if (progressContainer) {
        progressContainer.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function displayLinks(links) {
    const linksContainer = document.getElementById('links');
    const copyAllBtn = document.getElementById('copyAllLinksBtn');
    
    if (linksContainer) {
        linksContainer.innerHTML = '';
        
        links.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            
            const linkText = document.createElement('a');
            linkText.href = link;
            linkText.textContent = link;
            linkText.target = '_blank';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.onclick = () => copyToClipboard(link);
            
            linkItem.appendChild(linkText);
            linkItem.appendChild(copyBtn);
            linksContainer.appendChild(linkItem);
        });
        
        if (copyAllBtn) {
            copyAllBtn.style.display = links.length > 0 ? 'block' : 'none';
        }
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('Link kopyalandı!');
    } catch (err) {
        console.error('Kopyalama başarısız:', err);
        alert('Link kopyalanamadı!');
    }
}

async function copyAllLinks() {
    const linksContainer = document.getElementById('links');
    if (linksContainer) {
        const links = Array.from(linksContainer.querySelectorAll('a')).map(a => a.href);
        try {
            await navigator.clipboard.writeText(links.join('\n'));
            alert('Tüm linkler kopyalandı!');
        } catch (err) {
            console.error('Kopyalama başarısız:', err);
            alert('Linkler kopyalanamadı!');
        }
    }
}

function parseXtreamDetails(link) {
    const url = new URL(link);
    const server = url.origin;
    const params = new URLSearchParams(url.search);
    const username = params.get('username');
    const password = params.get('password');
    return { server, username, password };
}