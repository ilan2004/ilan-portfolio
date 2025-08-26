import { Link } from 'react-router-dom';

const PostPreview = (props) => {
  const isStarred = props.tags.includes('✰');

  return (
    <Link to={`/posts/${props.slug}`}>
      <div className="group relative flex justify-between items-center hover:bg-[var(--bg200)]/40 cursor-crosshair text-xs md:text-sm px-2 py-1 rounded-md">
        {/* Title and optional star */}
        <div className="flex items-center gap-1">
          {isStarred && (
            <span className="text-[var(--fg)]">✰</span>
          )}
          <p
            className={`${isStarred ? 'font-medium text-[var(--fg)]' : 'text-[var(--fg)]/90'}`}
          >
            {props.title}
          </p>
        </div>

        {/* Date */}
        <p className="text-[var(--fg)]/50">{props.date}</p>
      </div>
    </Link>
  );
};

export default PostPreview;
