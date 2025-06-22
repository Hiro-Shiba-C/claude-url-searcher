from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import subprocess
import asyncio
import os

app = FastAPI(title="URL Searcher API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLSearchRequest(BaseModel):
    url: str
    selectors: Optional[List[str]] = None
    depth: Optional[int] = 1

class SearchResult(BaseModel):
    url: str
    title: str
    content: str
    timestamp: str
    importance_score: Optional[float] = 0.0
    depth: Optional[int] = 0

@app.get("/")
async def root():
    return {"message": "URL Searcher API"}

async def run_crawler(url: str, depth: int = 1, selectors: List[str] = None) -> List[dict]:
    """Run the Puppeteer crawler and return results"""
    try:
        crawler_path = os.path.join(os.path.dirname(__file__), "crawler")
        
        # Create a temporary script to run the crawler
        script_content = f"""
const URLCrawler = require('./index.js');

async function main() {{
    const crawler = new URLCrawler();
    try {{
        const results = await crawler.crawl('{url}', {json.dumps(selectors) if selectors else 'null'}, {depth});
        console.log(JSON.stringify(results));
    }} catch (error) {{
        console.error('Crawler error:', error.message);
    }} finally {{
        await crawler.close();
    }}
}}

main();
"""
        
        # Write temporary script
        temp_script = os.path.join(crawler_path, "temp_crawl.js")
        with open(temp_script, 'w') as f:
            f.write(script_content)
        
        # Run the crawler
        result = await asyncio.create_subprocess_exec(
            'node', temp_script,
            cwd=crawler_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await result.communicate()
        
        # Clean up temp file
        os.remove(temp_script)
        
        if result.returncode != 0:
            raise Exception(f"Crawler failed: {stderr.decode()}")
        
        # Parse results
        output = stdout.decode().strip()
        if output:
            return json.loads(output)
        return []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawler error: {str(e)}")

def calculate_importance_score(result: dict, all_results: List[dict]) -> float:
    """Calculate importance score based on various factors"""
    score = 0.0
    
    # Base score by depth (shallower = more important)
    depth = result.get('depth', 0)
    score += max(0, 10 - depth * 2)
    
    # URL structure analysis
    url = result.get('url', '')
    url_parts = url.lower().split('/')
    
    # Important URL patterns
    important_patterns = ['contact', 'about', 'service', 'product', 'pricing', 'register', 'login']
    for pattern in important_patterns:
        if any(pattern in part for part in url_parts):
            score += 5
    
    # Home page gets high score
    if url.rstrip('/').count('/') <= 2:
        score += 8
    
    # Content length (more content = potentially more important)
    content_length = len(result.get('content', ''))
    score += min(5, content_length / 200)
    
    return round(score, 2)

@app.post("/search", response_model=List[SearchResult])
async def search_urls(request: URLSearchRequest):
    """Search URLs using Puppeteer crawler"""
    try:
        # Run crawler
        raw_results = await run_crawler(request.url, request.depth, request.selectors)
        
        # Process results and add importance scores
        processed_results = []
        for result in raw_results:
            importance_score = calculate_importance_score(result, raw_results)
            
            processed_results.append(SearchResult(
                url=result.get('url', ''),
                title=result.get('title', ''),
                content=result.get('content', ''),
                timestamp=result.get('timestamp', ''),
                importance_score=importance_score,
                depth=result.get('depth', 0)
            ))
        
        # Sort by importance score (descending)
        processed_results.sort(key=lambda x: x.importance_score, reverse=True)
        
        return processed_results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))