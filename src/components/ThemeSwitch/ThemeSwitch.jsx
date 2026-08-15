import { useEffect, useState } from 'react';

export default function ThemeSwitch({ className = "" }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const nextTheme = isDark ? 'light' : 'dark';
  const iconSrc =
    nextTheme === 'dark'
      ? '/icons/horizon%20moon.png'
      : '/icons/sun%20horizon.png';

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-switch ${className}`.trim()}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <img src={iconSrc} alt="" aria-hidden="true" className="theme-switch__icon" />
    </button>
  );
}
