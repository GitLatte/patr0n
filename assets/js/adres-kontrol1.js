async function testStream() {
    const url = document.getElementById('streamUrl').value;
    if (!url) {
        alert("Lütfen bir URL girin");
        return;
    }
    
    const resultsDiv = document.getElementById('testResults');
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    resultsDiv.style.display = 'block';
    statusIndicator.className = 'status-indicator status-pending';
    statusText.textContent = 'Kontrol ediliyor...';
    
    try {
        const startTime = performance.now();
        const proxyUrl = `https://vavoo.gitlatte.workers.dev/?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, application/octet-stream'
            }
        });
        const endTime = performance.now();
        const content = await response.text();
    
        document.getElementById('httpStatus').textContent = response.status;
        document.getElementById('responseTime').textContent = `${Math.round(endTime - startTime)}ms`;
        document.getElementById('contentType').textContent = response.headers.get('content-type') || 'Bilinmiyor';

        // Extract and display additional stream information
        const streamInfo = {
            format: detectStreamFormat(content, url),
            size: formatBytes(content.length),
            lastModified: response.headers.get('last-modified') || 'Bilinmiyor',
            channels: countChannels(content)
        };

        // Update stream details in the UI
        updateStreamDetails(streamInfo);
    
        if (response.ok) {
            const isM3U = content.includes('#EXTM3U') || url.toLowerCase().endsWith('.m3u') || url.toLowerCase().endsWith('.m3u8');
            const hasGeoBlock = response.headers.get('x-geo-block') === 'true' || 
                             response.headers.get('x-country-block') === 'true' ||
                             content.includes('geo-blocked') ||
                             response.status === 451;
            const isAccessDenied = response.status === 403 || 
                             content.includes('access denied') || 
                             content.includes('forbidden');
    
            if (isM3U) {
                if (hasGeoBlock || isAccessDenied) {
                    statusIndicator.className = 'status-indicator status-error';
                    statusText.textContent = 'VPN gerekli olabilir - Coğrafi kısıtlama veya erişim engeli tespit edildi';
                } else {
                    statusIndicator.className = 'status-indicator status-success';
                    statusText.textContent = 'Bağlantı başarılı - VPN gerekmiyor';
                }
            } else {
                statusIndicator.className = 'status-indicator status-error';
                statusText.textContent = 'Bağlantı başarılı fakat geçerli M3U formatı değil';
            }
        } else {
            statusIndicator.className = 'status-indicator status-error';
            if (response.status === 403 || response.status === 451) {
                statusText.textContent = 'VPN gerekli olabilir - Erişim engeli tespit edildi';
            } else {
                statusText.textContent = `Bağlantı hatası: HTTP ${response.status} ${response.statusText}`;
            }
        }
    } catch (error) {
        statusIndicator.className = 'status-indicator status-error';
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            statusText.textContent = 'VPN gerekli olabilir - CORS politikası veya sunucu erişilemez';
        } else {
            statusText.textContent = 'Bağlantı hatası: ' + error.message;
        }
        
        document.getElementById('httpStatus').textContent = 'Bekliyor...';
        document.getElementById('responseTime').textContent = 'Bekliyor...';
        document.getElementById('contentType').textContent = 'Bekliyor...';
        clearStreamDetails();
    }
}

function detectStreamFormat(content, url) {
    if (content.includes('#EXTM3U')) {
        if (content.includes('#EXT-X-STREAM-INF')) return 'HLS (M3U8)';
        return 'M3U Playlist';
    }
    if (url.toLowerCase().endsWith('.m3u8')) return 'HLS (M3U8)';
    if (url.toLowerCase().endsWith('.m3u')) return 'M3U Playlist';
    return 'Bilinmiyor';
}

function countChannels(content) {
    const matches = content.match(/#EXTINF/g);
    return matches ? matches.length : 0;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateStreamDetails(info) {
    const detailsDiv = document.getElementById('responseDetails');
    // Remove any existing stream details first
    const existingAccordion = document.getElementById('streamDetailsAccordion');
    if (existingAccordion) {
        existingAccordion.remove();
    }
    
    const streamDetailsHtml = `
        <div class="accordion mt-2" id="streamDetailsAccordion">
            <div class="accordion-item bg-dark border-0">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed bg-dark text-light py-2" type="button" data-bs-toggle="collapse" data-bs-target="#extraDetailsCollapse" aria-expanded="false" aria-controls="extraDetailsCollapse">
                        Ekstra Bilgiler
                    </button>
                </h2>
                <div id="extraDetailsCollapse" class="accordion-collapse collapse" data-bs-parent="#streamDetailsAccordion">
                    <div class="accordion-body text-light py-2">
                        <div class="row g-2">
                            <div class="col-6"><small><strong>Format:</strong> ${info.format}</small></div>
                            <div class="col-6"><small><strong>Boyut:</strong> ${info.size}</small></div>
                            <div class="col-6"><small><strong>Güncelleme:</strong> ${info.lastModified}</small></div>
                            <div class="col-6"><small><strong>Kanal:</strong> ${info.channels}</small></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    detailsDiv.insertAdjacentHTML('beforeend', streamDetailsHtml);
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

function getHttpStatusInfo(statusCode) {
    const statusInfo = {
        '200': 'Başarılı! İstek başarıyla tamamlandı ve sunucu beklenen yanıtı döndürdü.',
        '201': 'Oluşturuldu! İstek başarılı oldu ve sunucuda yeni bir kaynak oluşturuldu.',
        '301': 'Kalıcı Yönlendirme! İstenen kaynak kalıcı olarak başka bir URL\'e taşınmış.',
        '302': 'Geçici Yönlendirme! İstenen kaynak geçici olarak başka bir URL\'de.',
        '400': 'Hatalı İstek! Sunucu, isteğin sözdiziminin hatalı olduğunu algıladı.',
        '401': 'Yetkisiz! Kimlik doğrulama gerekiyor.',
        '403': 'Yasaklandı! Sunucu isteği anladı ancak yetkisiz erişim.',
        '404': 'Bulunamadı! İstenen kaynak sunucuda mevcut değil.',
        '500': 'Sunucu Hatası! Sunucu beklenmeyen bir durumla karşılaştı.',
        '502': 'Hatalı Ağ Geçidi! Sunucu, ağ geçidi olarak çalışırken geçersiz yanıt aldı.',
        '503': 'Hizmet Kullanılamıyor! Sunucu geçici olarak hizmet veremiyor.',
        '504': 'Ağ Geçidi Zaman Aşımı! Sunucu, ağ geçidi olarak çalışırken zamanında yanıt alamadı.'
    };
    
    return statusInfo[statusCode] || 'Bu HTTP durum kodu için açıklama bulunmuyor.';
}
