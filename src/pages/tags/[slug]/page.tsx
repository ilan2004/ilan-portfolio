import React from 'react';
import { useParams } from 'react-router-dom';
import getPostMetadata from '../../../utils/getPostMetadata';
import PostPreview from '../../../components/PostPreview/PostPreview.jsx';

export default function TagDetailPage() {
  const { slug } = useParams();
  const tag = decodeURIComponent(slug || '');
  const postMetadata = getPostMetadata();

  const filteredPosts = postMetadata.filter((post) =>
    String(post.tags || '')
      .split(',')
      .map((t) => t.trim())
      .includes(tag)
  );

  return (
    <div>
      <h1 className='font-bold text-left mb-10 text-lg'> Tag: {tag}</h1>
      <div className='grid grid-cols-1 text-sm'>
        {filteredPosts.map((post) => (
          <PostPreview key={post.slug} {...post} />
        ))}
      </div>
    </div>
  );
}
