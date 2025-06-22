const URLCrawler = require('./index.js');

async function advancedTests() {
    const crawler = new URLCrawler();
    
    console.log('🧪 Advanced Puppeteer Tests\n');
    
    try {
        await crawler.init();
        console.log('✅ Puppeteer initialized successfully!');
        
        // Test 1: Simple site with subpages
        console.log('\n📝 Test 1: Wikipedia (JS heavy site)...');
        const wikiResults = await crawler.crawl('https://en.wikipedia.org/wiki/Main_Page', null, 2);
        console.log(`✅ Wikipedia test: Found ${wikiResults.length} pages`);
        
        // Test 2: Site with subdomains potential
        console.log('\n📝 Test 2: GitHub (subdomain handling)...');
        const githubResults = await crawler.crawl('https://github.com', null, 1);
        console.log(`✅ GitHub test: Found ${githubResults.length} pages`);
        
        // Display sample results
        console.log('\n📊 Sample results:');
        [...wikiResults.slice(0, 3), ...githubResults.slice(0, 2)].forEach((result, index) => {
            console.log(`  ${index + 1}. ${result.url}`);
            console.log(`     Title: "${result.title}"`);
            console.log(`     Depth: ${result.depth}, Content: ${result.content.slice(0, 100)}...`);
        });
        
    } catch (error) {
        console.error('❌ Advanced test failed:', error.message);
    } finally {
        await crawler.close();
        console.log('\n🔒 All tests completed');
    }
}

advancedTests();