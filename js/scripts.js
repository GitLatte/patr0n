function showLoadingMessage(show) {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = show ? 'block' : 'none';
}

function extractLinks() {
    const text = document.getElementById('inputText').value;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const links = text.match(urlPattern);
    const linksContainer = document.getElementById('links');
    const linksHeader = document.getElementById('linksHeader');
    const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
    const sourceInfo = document.getElementById('sourceInfo');
    linksContainer.innerHTML = '';

    if (links) {
        links.forEach((link, index) => {
            const linkWrapper = document.createElement('div');
            linkWrapper.classList.add('p-3', 'mb-2', 'bg-light', 'rounded');
            linkWrapper.id = 'linkWrapper_' + index;

            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.textContent = (index + 1) + '. ' + link;
            linkElement.target = '_blank';
            linkElement.classList.add('d-block', 'mb-2');

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Bu Adresi Kullan';
            copyButton.classList.add('btn', 'btn-outline-secondary', 'btn-block');
            copyButton.onclick = () => copyToClipboard(link);

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

            const xtreamDetails = parseXtreamDetails(link);
            xtreamPanel.innerHTML = `
                <div><strong>Sunucu Adresi:</strong> <span>${xtreamDetails.server}</span></div>
                <div><strong>Kullanıcı Adı:</strong> <span>${xtreamDetails.username}</span></div>
                <div><strong>Şifre:</strong> <span>${xtreamDetails.password}</span></div>
            `;

            linkWrapper.appendChild(linkElement);
            linkWrapper.appendChild(copyButton);
            linkWrapper.appendChild(showXtreamButton);
            linkWrapper.appendChild(xtreamPanel);
            linksContainer.appendChild(linkWrapper);
        });
        copyAllLinksBtn.style.display = 'block';
        sourceInfo.textContent = 'Girilen metin içeriğinden';
        linksHeader.textContent = 'Ayıklanan Linkler (Toplam ' + links.length + ' adet)';
    } else {
        linksContainer.textContent = 'Hiçbir link bulunamadı.';
        copyAllLinksBtn.style.display = 'none';
        sourceInfo.textContent = '';
    }
}

async function fetchPatronLinks() {
    showLoadingMessage(true);
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
        linksContainer.innerHTML = '';

        if (links && links.length > 0) {
            links.forEach((link, index) => {
                try {
                    const validatedLink = new URL(link.trim()).href;
                    const linkWrapper = document.createElement('div');
                    linkWrapper.classList.add('p-3', 'mb-2', 'bg-light', 'rounded');
                    linkWrapper.id = 'linkWrapper_' + index;

                    const linkElement = document.createElement('a');
                    linkElement.href = validatedLink;
                    linkElement.textContent = (index + 1) + '. ' + validatedLink;
                    linkElement.target = '_blank';
                    linkElement.classList.add('d-block', 'mb-2');

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
                    linkWrapper.appendChild(copyButton);
                    linkWrapper.appendChild(showXtreamButton);
                    linkWrapper.appendChild(xtreamPanel);
                    linksContainer.appendChild(linkWrapper);
                } catch (urlError) {
                    console.warn('Geçersiz URL atlandı:', link);
                }
            });
            copyAllLinksBtn.style.display = 'block';
            sourceInfo.textContent = '@patr0n sağolsun 😅';
            linksHeader.textContent = 'Ayıklanan Linkler (Toplam ' + links.length + ' adet)';
        } else {
            linksContainer.textContent = 'Hiçbir link bulunamadı.';
            copyAllLinksBtn.style.display = 'none';
            sourceInfo.textContent = '';
        }
    } catch (error) {
        console.error('Web sayfasından linkler alınamadı:', error);
        alert('Web sayfasından linkler alınamadı: ' + error);
    }
    showLoadingMessage(false);
}

async function fetchLinksFromPage() {
    const pageUrl = document.getElementById('pageUrl').value;
    if (!pageUrl.startsWith('http')) {
        alert('Lütfen geçerli bir URL girin (http:// veya https:// ile başlamalıdır).');
        showLoadingMessage(false);
        return;
    }
    showLoadingMessage(true);
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(pageUrl)}`);
        const data = await response.json();
        const html = data.contents;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const links = html.match(urlPattern);
        const linksContainer = document.getElementById('links');
        const copyAllLinksBtn = document.getElementById('copyAllLinksBtn');
        const sourceInfo = document.getElementById('sourceInfo');
        const linksHeader = document.getElementById('linksHeader');
        linksContainer.innerHTML = '';

        if (links && links.length > 0) {
            links.forEach((link, index) => {
                try {
                    const validatedLink = new URL(link.trim()).href;
                    const linkWrapper = document.createElement('div');
                    linkWrapper.classList.add('p-3', 'mb-2', 'bg-light', 'rounded');
                    linkWrapper.id = 'linkWrapper_' + index;

                    const linkElement = document.createElement('a');
                    linkElement.href = validatedLink;
                    linkElement.textContent = (index + 1) + '. ' + validatedLink;
                    linkElement.target = '_blank';
                    linkElement.classList.add('d-block', 'mb-2');

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
                    linkWrapper.appendChild(copyButton);
                    linkWrapper.appendChild(showXtreamButton);
                    linkWrapper.appendChild(xtreamPanel);
                    linksContainer.appendChild(linkWrapper);
                } catch (urlError) {
                    console.warn('Geçersiz URL atlandı:', link);
                }
            });
            copyAllLinksBtn.style.display = 'block';
            sourceInfo.textContent = pageUrl + ' adresinden alınan linkler';
            linksHeader.textContent = 'Ayıklanan Linkler (Toplam ' + links.length + ' adet)';
        } else {
            linksContainer.textContent = 'Hiçbir link bulunamadı.';
            copyAllLinksBtn.style.display = 'none';
            sourceInfo.textContent = '';
        }
    } catch (error) {
        console.error('Web sayfasından linkler alınamadı:', error);
        alert('Web sayfasından linkler alınamadı: ' + error);
    }
    showLoadingMessage(false);
}

function parseXtreamDetails(link) {
    const url = new URL(link);
    const server = url.origin;
    const params = new URLSearchParams(url.search);
    const username = params.get('username');
    const password = params.get('password');
    return { server, username, password };
}

function copyToClipboard(text) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    alert('Kopyalandı: ' + text);
}

function copyAllLinks() {
    const linksText = Array.from(document.getElementById('links').getElementsByTagName('a'), link => link.href).join('\n');
    copyToClipboard(linksText);
}
