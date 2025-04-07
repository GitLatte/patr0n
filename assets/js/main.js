// Utility Functions
const utils = {
    decodeURL(url) {
        try {
            return decodeURIComponent(url.replace(/\+/g, ' '));
        } catch (e) {
            console.error('URL decoding failed:', e);
            return url;
        }
    },

    cleanURL(url) {
        return url.replace(/[<>"]/g, '').replace(/'/g, '').replace(/,$/g, '');
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => alert('Link kopyalandı!'))
            .catch(err => console.error('Kopyalama hatası:', err));
    }
};

// Progress Bar Component
class ProgressBar {
    constructor() {
        this.progressBar = document.getElementById('customProgress');
        this.progressValue = document.querySelector('.progress-value');
        this.progressContainer = document.getElementById('customProgressContainer');
    }

    update(progress, count) {
        if (this.progressBar && this.progressValue) {
            this.progressBar.style.width = `${progress}%`;
            if (progress === 100) {
                this.progressValue.textContent = 'İşlem tamamlandı';
                this.progressBar.style.animation = 'none';
                setTimeout(() => {
                    this.progressBar.style.animation = 'glow 1.5s ease-in-out infinite';
                }, 100);
            } else {
                this.progressValue.textContent = `${progress}% (${count} link yüklendi)`;
            }
        }
    }

    show(visible) {
        if (this.progressContainer) {
            this.progressContainer.style.display = visible ? 'block' : 'none';
        }
    }

    reset() {
        this.update(0, 0);
        this.show(false);
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.root = document.documentElement;
    }

    setTheme(theme) {
        const themes = {
            dark: {
                '--vscode-bg': '#1e1e1e',
                '--vscode-fg': '#d4d4d4',
                '--vscode-blue': '#007acc',
                '--vscode-highlight': '#264f78',
                '--vscode-selection': '#264f7880',
                '--vscode-border': '#454545',
                '--menu-item-hover': '#37373d'
            }
            // Add more themes here if needed
        };

        const selectedTheme = themes[theme] || themes.dark;
        Object.entries(selectedTheme).forEach(([key, value]) => {
            this.root.style.setProperty(key, value);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    themeManager.setTheme('dark');
});