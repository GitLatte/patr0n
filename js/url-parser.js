// Function to parse URLs from a webpage
async function parseURL() {
    const urlInput = document.getElementById('urlInput');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const results = document.getElementById('results');
    const m3uFilter = document.getElementById('m3uFilter');

    // Clear previous results and errors
    results.innerHTML = '';
    errorMessage.style.display = 'none';

    const url = urlInput.value.trim();

    if (!url) {
        errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Lütfen bir URL girin.';
        errorMessage.style.display = 'block';
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Geçerli bir URL girin (http:// veya https:// ile başlamalı).';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        // Show loading message and progress bar
        loadingMessage.style.display = 'block';
        showCustomProgressBar(true);
        updateCustomProgressBar(0, 0);

        // Fetch the webpage content using CORS proxy
        const proxyUrl = 'https://cors.gitlatte.workers.dev/?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(url));
        const html = await response.text();

        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract all links using regex pattern
        const urlPattern = /(https?:\/\/[^\s"'<>]+)/g;

        const links = html.match(urlPattern) || [];
        const validLinks = links
            .map(link => {
                try {
                    // HTML entity decode ve URL decode işlemleri
                    let decodedLink = link
                        .replace(/&amp;/g, '&')
                        .replace(/%3C\/[^%]+%3E$/g, '') // HTML tag encoding'lerini temizle
                        .replace(/[%]3[CE][^&?]*$/g, ''); // URL sonundaki gereksiz karakterleri temizle
                    
                    // m3u_plus ile biten URL'lerde özel işlem
                    if (decodedLink.includes('m3u_plus')) {
                        decodedLink = decodedLink.split('m3u_plus')[0] + 'm3u_plus';
                    } else if (decodedLink.includes('=m3u')) {
                        decodedLink = decodedLink.split('=m3u')[0] + '=m3u';
                    }
    
                    // URL'i doğrula
                    return new URL(decodedLink).href;
                } catch (e) {
                    return null;
                }
            })
            .filter(link => link !== null);

        // Apply m3u filter if checked and remove duplicates
        let uniqueLinks;
        if (m3uFilter.checked) {
            // Filter m3u links first, then remove duplicates
            uniqueLinks = [...new Set(validLinks.filter(link => 
                link.toLowerCase().includes('.m3u') || 
                link.toLowerCase().includes('get.php')
            ))];
        } else {
            // Just remove duplicates for all links
            uniqueLinks = [...new Set(validLinks)];
        }

        if (uniqueLinks.length === 0) {
            results.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> Bu sayfada link bulunamadı.</div>';
            updateCustomProgressBar(100, 0);
        } else {
            // Create a list of links
            const linkList = document.createElement('div');
            linkList.className = 'list-group mt-3';

            uniqueLinks.forEach((link, index) => {
                const linkItem = document.createElement('div');
                linkItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                const linkNumber = document.createElement('span');
                linkNumber.className = 'me-2';
                linkNumber.style.minWidth = '30px';
                linkNumber.textContent = `${index + 1}.`;
                linkItem.appendChild(linkNumber);

                const linkText = document.createElement('span');
                linkText.style.wordBreak = 'break-all';
                linkText.style.flex = '1';
                linkText.textContent = link;
                linkItem.appendChild(linkText);

                const copyButton = document.createElement('button');
                copyButton.className = 'btn btn-sm ms-2';
                copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(link);
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                };


                linkItem.appendChild(copyButton);
                linkList.appendChild(linkItem);

                // Update progress
                const progress = Math.round(((index + 1) / uniqueLinks.length) * 100);
                updateCustomProgressBar(progress, index + 1);
            });

            results.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${uniqueLinks.length} link bulundu.</div>`;
            results.appendChild(linkList);

            // Show copy all buttons
            document.querySelectorAll('.copy-all-btn').forEach(btn => btn.style.display = 'block');
        }
    } catch (error) {
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> Hata oluştu: ${error.message}`;
        errorMessage.style.display = 'block';
        updateCustomProgressBar(100, 0);
    } finally {
        loadingMessage.style.display = 'none';
        showCustomProgressBar(false);
    }
}

// Progress bar functions
function showCustomProgressBar(show) {
    const progressContainer = document.getElementById('customProgressContainer');
    if (progressContainer) {
        progressContainer.style.display = show ? 'block' : 'none';
    }
}

function updateCustomProgressBar(progress, count) {
    const progressBar = document.getElementById('customProgress');
    const progressValue = document.querySelector('.progress-value');
    if (progressBar && progressValue) {
        progressBar.style.width = `${progress}%`;
        progressValue.textContent = progress === 100 ? 'İşlem tamamlandı' : `${progress}% (${count} linkmiş)`;
    }
}

// Function to copy all links
function copyAllLinks() {
    const links = Array.from(document.querySelectorAll('.list-group-item span:nth-child(2)')).map(span => span.textContent);
    if (links.length > 0) {
        navigator.clipboard.writeText(links.join('\n'));
        document.querySelectorAll('.copy-all-btn').forEach(btn => {
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Kopyalandı';
            setTimeout(() => {
                btn.innerHTML = originalContent;
            }, 2000);
        });
    }
}

// Scroll to top functionality
window.onscroll = function() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollBtn.style.display = 'block';
    } else {
        scrollBtn.style.display = 'none';
    }
};

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}