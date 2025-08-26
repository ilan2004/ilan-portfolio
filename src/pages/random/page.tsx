import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RandomPost() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const fetchRandomPostSlug = async () => {
      try {
        const response = await fetch('/api/random', { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && data?.slug) navigate(`/posts/${data.slug}`);
      } catch (e) {
        // stay on page if error
      }
    };
    fetchRandomPostSlug();
    return () => { cancelled = true; };
  }, [navigate]);

  return <p>Loading...</p>;
}
