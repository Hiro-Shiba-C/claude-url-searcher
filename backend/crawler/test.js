const URLCrawler = require('./index.js');

async function testPuppeteer() {
    const crawler = new URLCrawler();
    
    console.log('🔧 Testing Puppeteer initialization...');
    
    try {
        await crawler.init();
        console.log('✅ Puppeteer initialized successfully!');
        
        console.log('\n🌐 Testing simple crawl with example.com...');
        const results = await crawler.crawl('https://example.com', null, 1);
        
        if (results && results.length > 0) {
            console.log('✅ Crawling successful!');
            console.log(`📄 Found ${results.length} page(s):`);
            results.forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.url} - "${result.title}"`);
            });
        } else {
            console.log('❌ No results returned');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await crawler.close();
        console.log('\n🔒 Browser closed');
    }
}

testPuppeteer();