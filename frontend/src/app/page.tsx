'use client';

import { useState } from 'react';

interface SearchResult {
  url: string;
  title: string;
  content: string;
  timestamp: string;
  importance_score: number;
  depth: number;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!url) {
      setError('URLを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          depth,
        }),
      });

      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    const csvContent = [
      ['URL', 'タイトル', '重要度スコア', '深度', 'タイムスタンプ'],
      ...results.map(result => [
        result.url,
        result.title,
        result.importance_score.toString(),
        result.depth.toString(),
        result.timestamp
      ])
    ]
    .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'site-analysis-results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          サイト構造解析ツール
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                対象URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-2">
                探索深度
              </label>
              <select
                id="depth"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1階層</option>
                <option value={2}>2階層</option>
                <option value={3}>3階層</option>
              </select>
            </div>
            
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '解析中...' : '解析開始'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                解析結果 ({results.length}件)
              </h2>
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                CSV出力
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">URL</th>
                    <th className="px-4 py-2 text-left">タイトル</th>
                    <th className="px-4 py-2 text-left">重要度</th>
                    <th className="px-4 py-2 text-left">深度</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block max-w-xs"
                        >
                          {result.url}
                        </a>
                      </td>
                      <td className="px-4 py-2 max-w-xs truncate">{result.title}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {result.importance_score}
                        </span>
                      </td>
                      <td className="px-4 py-2">{result.depth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
