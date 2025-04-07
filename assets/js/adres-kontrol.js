const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
];

async function testStream() {
    const streamUrlElement = document.getElementById('streamUrl');
    if (!streamUrlElement) {
        console.error('Stream URL giriş elemanı bulunamadı');
        return;
    }

    const url = streamUrlElement.value;
    if (!url) {
        alert("Lütfen bir URL girin");
        return;
    }
    
    // Clear previous results
    const elements = [
        'httpStatus', 'responseTime', 'contentType',
        'streamFormat', 'channelCount', 'fileSize', 'lastModified',
        'expirationDate', 'maxConnections', 'activeConnections'
    ];
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) element.textContent = '-';
    });
    
    const resultsDiv = document.getElementById('testResults');
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    if (!resultsDiv || !statusIndicator || !statusText) {
        console.error('Gerekli DOM elemanları bulunamadı');
        return;
    }

    resultsDiv.style.display = 'block';
    statusIndicator.className = 'status-indicator status-pending';
    statusText.textContent = 'Kontrol ediliyor...';
    
    try {
        const startTime = performance.now();
        const proxyUrl = 'https://vavoo.gitlatte.workers.dev/?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(url), {
            method: 'GET',
            headers: {
                'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
            }
        });
        const endTime = performance.now();
        const content = await response.text();
    
        const httpStatusElement = document.getElementById('httpStatus');
        const responseTimeElement = document.getElementById('responseTime');
        const contentTypeElement = document.getElementById('contentType');

        if (httpStatusElement) httpStatusElement.textContent = response.status;
        if (responseTimeElement) responseTimeElement.textContent = `${Math.round(endTime - startTime)}ms`;
        if (contentTypeElement) contentTypeElement.textContent = response.headers.get('content-type') || 'Bilinmiyor';

        // Check for VPN requirement or access issues
        if (response.status === 403 || response.status === 451) {
            statusIndicator.className = 'status-indicator status-vpn';
            statusText.className = 'vpn';
            statusText.textContent = 'VPN gerekli olabilir - Erişim engeli tespit edildi (Proxy üzerinden test edildi, gerçek kullanımda farklılık gösterebilir)';
            return;
        }

        // Handle other error status codes
        if (!response.ok) {
            statusIndicator.className = 'status-indicator status-error';
            statusText.className = 'error';
            statusText.textContent = `Bağlantı hatası: HTTP ${response.status} (Proxy üzerinden test edildi, gerçek kullanımda farklılık gösterebilir)`;
            return;
        }

        // Detect content type and format
        const contentType = response.headers.get('content-type') || '';
        const isVideo = contentType.includes('video/') || url.match(/\.(ts|mp4|mkv|avi|mov)$/i);
        const isM3U = content.includes('#EXTM3U') || url.toLowerCase().endsWith('.m3u') || url.toLowerCase().endsWith('.m3u8');

        // Add stream format detection
        const streamFormat = detectStreamFormat(content, url);
        const channelCount = isM3U ? countChannels(content) : { total: 0, beinSports: 0 };
        const fileSize = formatBytes(content.length);
        const lastModified = response.headers.get('last-modified') || 'Bilinmiyor';

        // Update stream details with the additional information
        const streamInfo = {
            format: isVideo ? 'Tekil Video Akışı' : streamFormat,
            channels: channelCount,
            size: fileSize,
            lastModified: lastModified
        };

        // Update stream details
        updateStreamDetails(streamInfo);

        // Check for Xtream Codes API information
        if (url.includes('/get.php') || url.includes('/player_api.php')) {
            try {
                const apiUrl = new URL(url);
                const urlParams = new URLSearchParams(apiUrl.search);
                const apiUsername = urlParams.get('username');
                const apiPassword = urlParams.get('password');
                
                if (apiUsername && apiPassword) {
                    const headers = { 
                        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                        'Content-Type': 'application/json'
                    };
                    
                    // Construct API URL for account info
                    const baseApiUrl = `${apiUrl.protocol}//${apiUrl.hostname}:${apiUrl.port || (apiUrl.protocol === 'https:' ? '443' : '80')}`;
                    const apiUrlWithParams = `${baseApiUrl}/player_api.php?username=${apiUsername}&password=${apiPassword}`;
                    
                    const [accountInfo, categories] = await Promise.all([
                        fetch(proxyUrl + encodeURIComponent(apiUrlWithParams), { headers }),
                        fetch(proxyUrl + encodeURIComponent(`${apiUrlWithParams}&action=get_live_categories`), { headers })
                    ]);

                    const accountData = await accountInfo.json();
                    const categoriesData = await categories.json();
                    
                    if (accountData.user_info) {
                        const expDate = accountData.user_info.exp_date;
                        const maxConn = accountData.user_info.max_connections;
                        const activeCons = accountData.user_info.active_cons;

                        // Update account information elements
                        document.getElementById('expirationDate').textContent = 
                            expDate && expDate !== null && expDate !== '0' && expDate !== 'null' ? 
                            timeConverter(expDate) : 'Süresiz';
                        
                        document.getElementById('maxConnections').textContent = 
                            (!maxConn || maxConn === '0' || maxConn === 'null' || maxConn === null) ? 
                            'Sınırsız' : maxConn;
                        
                        document.getElementById('activeConnections').textContent = 
                            (activeCons !== null && activeCons !== undefined) ? 
                            activeCons : '0';

                        // Update status text directly
                        statusIndicator.className = 'status-indicator status-success';
                        statusText.className = 'success';
                        statusText.textContent = 'Hesap bilgileri başarıyla alındı (Proxy üzerinden test edildi, gerçek kullanımda VPN gerekebilir)';
                    }
                }
            } catch (error) {
                console.error('API bilgileri alınamadı:', error);
                // Update account information elements with error state
                const accountElements = ['expirationDate', 'maxConnections', 'activeConnections'];
                accountElements.forEach(elementId => {
                    const element = document.getElementById(elementId);
                    if (element) element.textContent = 'Bilinmiyor';
                });
                
                statusIndicator.className = 'status-indicator status-error';
                statusText.textContent = 'Hesap bilgileri alınamadı';
            }
        } else {
            // Handle regular stream checking
            if (response.ok) {
                if (isM3U || isVideo) {
                    statusIndicator.className = 'status-indicator status-success';
                    statusText.className = 'success';
                    statusText.textContent = `Bağlantı başarılı - ${isM3U ? 'M3U Listesi' : 'Tekil Video Akışı'} tespit edildi`;
                } else {
                    statusIndicator.className = 'status-indicator status-error';
                    statusText.textContent = 'Bağlantı başarılı fakat geçerli bir akış formatı tespit edilemedi';
                }
            } else {
                statusIndicator.className = 'status-indicator status-error';
                statusText.textContent = `Bağlantı hatası: HTTP ${response.status} ${response.statusText}`;
            }
        }
    } catch (error) {
        console.error('Bağlantı hatası:', error);
        
        // Update status indicator and text with VPN-specific styling
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            statusIndicator.className = 'status-indicator status-vpn';
            statusText.className = 'vpn';
            statusText.textContent = 'VPN gerekli olabilir - CORS politikası veya sunucu erişilemez';
        } else if (error.message.includes('403')) {
            statusIndicator.className = 'status-indicator status-vpn';
            statusText.className = 'vpn';
            statusText.textContent = 'VPN gerekli olabilir - Erişim engeli tespit edildi';
        } else if (error.message.includes('451')) {
            statusIndicator.className = 'status-indicator status-vpn';
            statusText.className = 'vpn';
            statusText.textContent = 'VPN gerekli olabilir - Coğrafi kısıtlama tespit edildi';
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            statusIndicator.className = 'status-indicator status-vpn';
            statusText.className = 'vpn';
            statusText.textContent = 'Bağlantı zaman aşımına uğradı - VPN gerekebilir';
        } else if (error.message.includes('certificate') || error.message.includes('SSL')) {
            statusIndicator.className = 'status-indicator status-error';
            statusText.className = 'error';
            statusText.textContent = 'SSL/Sertifika hatası - Güvenlik sorunu';
        } else {
            statusIndicator.className = 'status-indicator status-error';
            statusText.className = 'error';
            statusText.textContent = 'Bağlantı hatası: ' + error.message;
        }
        
        // Update all elements with error state
        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) element.textContent = 'Hata';
        });
    }
}

function timeConverter(UNIX_timestamp) {
    const a = new Date(UNIX_timestamp * 1000);
    const months = ['Ocak', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    return `${date} ${month} ${year} ${hour}:${min}:${sec}`;
}

function detectStreamFormat(content, url) {
    if (content.includes('#EXTM3U')) {
        if (content.includes('#EXT-X-STREAM-INF')) return 'HLS (M3U8)';
        return 'M3U Listesi';
    }
    if (url.toLowerCase().endsWith('.m3u8')) return 'HLS (M3U8)';
    if (url.toLowerCase().endsWith('.m3u')) return 'M3U Listesi';
    return 'Bilinmiyor';
}

function countChannels(content) {
    const matches = content.match(/#EXTINF/g);
    const totalChannels = matches ? matches.length : 0;
    
    // Count BeIN Sports channels
    const beinMatches = content.match(/#EXTINF[^\n]*(?:beinsports?|bein\s*sports?)[^\n]*/gi);
    const beinChannels = beinMatches ? beinMatches.length : 0;
    
    return {
        total: totalChannels,
        beinSports: beinChannels
    };
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateStreamDetails(streamInfo) {
    // Update stream format
    document.getElementById('streamFormat').textContent = streamInfo.format;
    document.getElementById('channelCount').innerHTML = `${streamInfo.channels.total} <br/>(BeIN Sports: ${streamInfo.channels.beinSports} adet)`;
    document.getElementById('fileSize').textContent = streamInfo.size;
    document.getElementById('lastModified').textContent = streamInfo.lastModified;
}

function formatDate(timestamp) {
    if (!timestamp || timestamp === 'Süresiz') return 'Süresiz';
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR');
}

function clearStreamDetails() {
    const streamDetails = document.querySelector('.stream-details');
    if (streamDetails) streamDetails.remove();
}

function showHttpStatusInfo() {
    const statusCode = document.getElementById('httpStatus').textContent;
    const statusInfo = getHttpStatusInfo(statusCode);
    
    // Create and show Bootstrap modal
    const modalHtml = `
        <div class="modal fade" id="httpStatusModal" tabindex="-1" aria-labelledby="httpStatusModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title" id="httpStatusModalLabel">HTTP Durum Kodu: ${statusCode}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Kapat"></button>
                    </div>
                    <div class="modal-body p-4">
                        ${statusInfo}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('httpStatusModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('httpStatusModal'));
    modal.show();
}

function pasteFromClipboard() {
    navigator.clipboard.readText()
        .then(text => {
            document.getElementById('streamUrl').value = text;
        })
        .catch(err => {
            console.error('Failed to read clipboard:', err);
            alert('Panodaki içerik alınamadı.');
        });
  }

function getHttpStatusInfo(statusCode) {
    const statusInfo = {
        '100': 'Devam! İstek alındı ve işlem devam ediyor.',
        '101': 'Protokol Değiştiriliyor! Sunucu istemcinin protokol değiştirme isteğini kabul ediyor.',
        '200': 'Başarılı! İstek başarıyla tamamlandı ve sunucu beklenen yanıtı döndürdü.',
        '201': 'Oluşturuldu! İstek başarılı oldu ve sunucuda yeni bir kaynak oluşturuldu.',
        '202': 'Kabul Edildi! İstek kabul edildi ancak henüz işlenmedi.',
        '204': 'İçerik Yok! İstek başarılı ancak gösterilecek içerik yok.',
        '206': 'Kısmi İçerik! İstek başarılı ve kısmi içerik gönderildi.',
        '300': 'Çoklu Seçenek! İstek için birden fazla olası yanıt var.',
        '301': 'Kalıcı Yönlendirme! İstenen kaynak kalıcı olarak başka bir URL\'e taşınmış.',
        '302': 'Geçici Yönlendirme! İstenen kaynak geçici olarak başka bir URL\'de.',
        '304': 'Değiştirilmemiş! İstemcinin önbelleğindeki içerik güncel.',
        '307': 'Geçici Yönlendirme! 302 gibi, ancak HTTP yöntemi değişmez.',
        '400': 'Hatalı İstek! Sunucu, isteğin sözdiziminin hatalı olduğunu algıladı.',
        '401': 'Yetkisiz! Kimlik doğrulama gerekiyor.',
        '402': 'Ödeme Gerekli! Gelecekte kullanılmak üzere ayrılmış.',
        '403': 'Yasaklandı! Sunucu isteği anladı ancak yetkisiz erişim.',
        '404': 'Bulunamadı! İstenen kaynak sunucuda mevcut değil.',
        '405': 'İzin Verilmeyen Yöntem! HTTP yöntemi bu kaynakta desteklenmiyor.',
        '406': 'Kabul Edilemez! İstemcinin kabul kriterleri karşılanamıyor.',
        '408': 'İstek Zaman Aşımı! Sunucu istemciden yanıt beklerken zaman aşımına uğradı.',
        '409': 'Çakışma! İstek, sunucunun iç durumuyla çakışıyor.',
        '410': 'Kaynak Yok! İstenen kaynak kalıcı olarak kaldırıldı.',
        '429': 'Çok Fazla İstek! Kullanıcı belirli sürede çok fazla istek gönderdi.',
        '500': 'Sunucu Hatası! Sunucu beklenmeyen bir durumla karşılaştı.',
        '501': 'Uygulanmadı! Sunucu isteği yerine getirme yeteneğine sahip değil.',
        '502': 'Hatalı Ağ Geçidi! Sunucu, ağ geçidi olarak çalışırken geçersiz yanıt aldı.',
        '503': 'Hizmet Kullanılamıyor! Sunucu geçici olarak hizmet veremiyor.',
        '504': 'Ağ Geçidi Zaman Aşımı! Sunucu, ağ geçidi olarak çalışırken zamanında yanıt alamadı.',
        '507': 'Yetersiz Depolama! Sunucuda yeterli boş alan yok.',
        '511': 'Ağ Kimlik Doğrulaması Gerekli! İstemci ağa erişmek için kimlik doğrulaması yapmalı.'
    };
    
    return statusInfo[statusCode] || `HTTP ${statusCode} - Bu HTTP durum kodu için açıklama bulunmuyor.`;
}
