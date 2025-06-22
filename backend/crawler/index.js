const puppeteer = require('puppeteer');
const { URL } = require('url');

class URLCrawler {
    constructor() {
        this.browser = null;
        this.visitedUrls = new Set();
        this.baseDomain = null;
    }

    async init() {
        // WSL環境用のPuppeteerオプション最適化
        const launchOptions = {
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-default-apps',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--enable-logging',
                '--log-level=0',
                '--single-process',
                '--no-zygote'
            ]
        };

        // WSL環境でのexecutablePath設定を試行
        try {
            this.browser = await puppeteer.launch(launchOptions);
        } catch (error) {
            console.log('Default launch failed, trying with system Chrome...', error.message);
            
            // システムのChromiumを使用
            launchOptions.executablePath = '/usr/bin/chromium-browser';
            try {
                this.browser = await puppeteer.launch(launchOptions);
            } catch (systemError) {
                console.error('Both Chrome options failed:', systemError.message);
                throw new Error('Puppeteer initialization failed. Please check Chrome installation.');
            }
        }
    }

    extractBaseDomain(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            const parts = hostname.split('.');
            if (parts.length >= 2) {
                return parts.slice(-2).join('.');
            }
            return hostname;
        } catch {
            return null;
        }
    }

    isValidInternalUrl(url, baseUrl) {
        try {
            const urlObj = new URL(url);
            const baseUrlObj = new URL(baseUrl);
            
            // Check if it's the same domain or subdomain
            const urlDomain = this.extractBaseDomain(url);
            const baseDomain = this.extractBaseDomain(baseUrl);
            
            return urlDomain === baseDomain && 
                   urlObj.protocol.startsWith('http') &&
                   !this.visitedUrls.has(url);
        } catch {
            return false;
        }
    }

    async crawl(url, selectors = null, depth = 1, currentDepth = 0) {
        if (!this.browser) {
            await this.init();
        }

        if (!this.baseDomain) {
            this.baseDomain = this.extractBaseDomain(url);
        }

        if (this.visitedUrls.has(url) || currentDepth >= depth) {
            return [];
        }

        this.visitedUrls.add(url);
        const page = await this.browser.newPage();
        const results = [];

        try {
            await page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            
            const title = await page.title();
            let content = '';

            if (selectors && selectors.length > 0) {
                for (const selector of selectors) {
                    const elements = await page.$$(selector);
                    for (const element of elements) {
                        const text = await element.evaluate(el => el.textContent.trim());
                        if (text) content += text + '\n';
                    }
                }
            } else {
                content = await page.evaluate(() => {
                    const removeElements = ['script', 'style', 'nav', 'header', 'footer'];
                    removeElements.forEach(tag => {
                        const elements = document.querySelectorAll(tag);
                        elements.forEach(el => el.remove());
                    });
                    
                    const bodyText = document.body.innerText;
                    return bodyText.slice(0, 2000);
                });
            }

            results.push({
                url,
                title,
                content: content.trim(),
                timestamp: new Date().toISOString(),
                depth: currentDepth
            });

            if (currentDepth < depth - 1) {
                const links = await page.$$eval('a[href]', (links, baseUrl) => {
                    return links
                        .map(link => {
                            try {
                                return new URL(link.href, baseUrl).href;
                            } catch {
                                return null;
                            }
                        })
                        .filter(href => href !== null);
                }, url);

                const validLinks = links
                    .filter(link => this.isValidInternalUrl(link, url))
                    .slice(0, 10);

                for (const link of validLinks) {
                    try {
                        const subResults = await this.crawl(link, selectors, depth, currentDepth + 1);
                        results.push(...subResults);
                    } catch (error) {
                        console.error(`Error crawling ${link}:`, error.message);
                    }
                }
            }

        } catch (error) {
            console.error(`Error crawling ${url}:`, error.message);
        } finally {
            await page.close();
        }

        return results;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

module.exports = URLCrawler;