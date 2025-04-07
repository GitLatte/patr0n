// Function to parse URLs from a webpage
async function parseURL() {
    const urlInput = document.getElementById('urlInput');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const results = document.getElementById('results');

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
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern) || [];
        const validLinks = links
            .map(link => {
                try {
                    return new URL(link).href;
                } catch (e) {
                    return null;
                }
            })
            .filter(link => link !== null);

        // Remove duplicates from valid links
        const uniqueLinks = [...new Set(validLinks)];

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
                
                const linkText = document.createElement('span');
                linkText.textContent = link;
                linkItem.appendChild(linkText);

                const copyButton = document.createElement('button');
                copyButton.className = 'btn btn-sm';
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
        progressValue.textContent = progress === 100 ? 'İşlem tamamlandı' : `${progress}% (${count} link)`;
    }
}