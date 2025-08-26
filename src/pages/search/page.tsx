import React, { useState, useEffect, Suspense } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import '../posts/PostsArchive.css';

const LoadingComponent = () => {
  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <div className="loading-track">
        <div className="loading-bar" />
      </div>
      <span className="text-sm" style={{ color: 'var(--bg)', opacity: 0.7 }}>
        Searching posts...
      </span>
    </div>
  );
};

const SearchResult = ({ result }) => {
  const truncateText = (text, maxLength = 150) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatContent = (content) => {
    const truncatedContent = truncateText(content);
    if (result.chunk_type === 'code') {
      return (
        <pre className="p-2 rounded text-sm overflow-x-auto mt-2" style={{ background: 'color-mix(in srgb, var(--bg) 10%, transparent)', color: 'var(--bg)' }}>
          <code>{truncatedContent}</code>
        </pre>
      );
    }
    return (
      <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--bg) 70%, transparent)' }}>
        {truncatedContent}
      </p>
    );
  };

  return (
    <div className="search-result">
      <Link to={`/posts/${result.post_slug}`} className="block space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {result.post_title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="search-score">
              {Math.round(
                (result.hybrid_score ??
                  result.keyword_score ??
                  result.vector_similarity ??
                  result.similarity) * 100
              )}
              % match
            </span>
          </div>
        </div>
        <div className="prose prose-sm max-w-none">
          {formatContent(result.content)}
        </div>
        <div className="search-chunkmeta">
          <span className="capitalize">{result.chunk_type}</span>
          {result.metadata.section && (
            <>
              <span className="mx-2">•</span>
              <span>{result.metadata.section}</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};

function SearchContent() {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Initialize with empty defaults for server rendering
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('hybrid');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Use useEffect to safely load from sessionStorage after mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlType = searchParams.get('type');
    
    setQuery(urlQuery || sessionStorage.getItem('lastQuery') || '');
    setSearchType(
      urlType || 
      (sessionStorage.getItem('lastSearchType')) || 
      'hybrid'
    );
    
    const cached = sessionStorage.getItem('searchResults');
    if (cached) setResults(JSON.parse(cached));
    
    setHasSearched(sessionStorage.getItem('hasSearched') === 'true');
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    // Add search type to URL
    params.set('type', searchType);
    navigate(`${pathname}?${params.toString()}`, { replace: true });

    // Store in session storage
    sessionStorage.setItem('lastQuery', query.trim());
    sessionStorage.setItem('lastSearchType', searchType);
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          searchType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Search failed: ${data.error || response.statusText}`);
      }

      if (!data.results || !Array.isArray(data.results)) {
        console.warn('Unexpected response format:', data);
        setResults([]);
        return;
      }

      setResults(data.results);
      sessionStorage.setItem('searchResults', JSON.stringify(data.results));
      // Mark that a search has been performed
      setHasSearched(true);
      sessionStorage.setItem('hasSearched', 'true');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      // Still mark that a search was attempted even if it failed
      setHasSearched(true);
      sessionStorage.setItem('hasSearched', 'true');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    if (query.trim()) {
      // Only update the URL without triggering immediate search
      const params = new URLSearchParams(searchParams.toString());
      params.set('type', type);
      if (query.trim()) {
        params.set('q', query.trim());
      }
      navigate(`${pathname}?${params.toString()}`, { replace: true });
      sessionStorage.setItem('lastSearchType', type);
    }
  };

  useEffect(() => {
    if (searchParams) {
      const urlQuery = searchParams.get('q');
      const urlType = searchParams.get('type');

      // Only set the query and search type without auto-searching
      if (urlQuery && urlQuery !== query) {
        setQuery(urlQuery);
      }

      if (
        urlType &&
        urlType !== searchType &&
        ['hybrid', 'semantic', 'keyword'].includes(urlType)
      ) {
        setSearchType(urlType);
      }

      // Don't auto-trigger search when params change
      // Users must press Enter or click Search button
    }
  }, [searchParams]);
  
  // Clear hasSearched when query changes
  useEffect(() => {
    // When the user manually changes the query, reset the search state
    setHasSearched(false);
    sessionStorage.removeItem('hasSearched');
  }, [query]);

  return (
    <div className="posts-archive">
      {/* Centered hero heading + description */}
      <div className="posts-archive-hero">
        <h1>Search</h1>
        <p>Find posts by meaning or exact keywords.</p>
      </div>

      <div className="posts-archive-row main">
        {/* Left column */}
        <div className="posts-archive-col left">
          <p className="avoid-widows">Filter by tags, pick at random, or search&nbsp;deeply.</p>
          <div className="posts-archive-info">
            <div className="posts-archive-actions">
              <Link to="/tags">tags</Link>
              <span> · </span>
              <Link to="/random">random</Link>
              <span> · </span>
              <Link to="/search">search</Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="posts-archive-col right">
          <div className="max-w-3xl mx-auto px-4 py-2">
            <form onSubmit={handleSearch} className="mb-8 space-y-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts..."
                className="search-input"
              />

              {/* Search Type Toggle */}
              <div className="search-toggle mt-2">
                <button
                  type="button"
                  onClick={() => handleSearchTypeChange('hybrid')}
                  className={`toggle-btn ${searchType === 'hybrid' ? 'active' : ''}`}
                >
                  Hybrid
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchTypeChange('semantic')}
                  className={`toggle-btn ${searchType === 'semantic' ? 'active' : ''}`}
                >
                  Semantic
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchTypeChange('keyword')}
                  className={`toggle-btn ${searchType === 'keyword' ? 'active' : ''}`}
                >
                  Keyword
                </button>
              </div>

              {/* Search Type Explanation */}
              <div className="text-xs text-center text-[#2c353d]/60 dark:text-[#c7cce1]/60 italic mt-1">
                {searchType === 'hybrid' &&
                  'Combines meaning and exact matches for balanced results'}
                {searchType === 'semantic' &&
                  'Finds conceptually related content even with different wording'}
                {searchType === 'keyword' &&
                  'Searches for exact word matches (like traditional search)'}
              </div>
            </form>

            {isLoading && <LoadingComponent />}
            {error && (
              <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            )}

            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <SearchResult key={index} result={result} />
                ))}
              </div>
            ) : (
              // Only show "no results" message if a search has been performed
              !isLoading && hasSearched && query && (
                <div className="text-center py-6 text-[#2c353d]/70 dark:text-[#c7cce1]/70">
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-2">
                    Try a different search type or modify your query
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-48 h-1 bg-[#e6c9a8]/20 dark:bg-[#1e2030] rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#927456] dark:bg-[#7aa2f7] animate-loading-bar" />
            </div>
            <span className="text-sm text-[#927456]/70 dark:text-[#7aa2f7]/70">
              Loading search...
            </span>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
