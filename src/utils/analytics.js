// Lightweight GA4 helper for Vite apps
// Reads GA ID from import.meta.env.VITE_GA_ID

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  const GA_ID = import.meta.env.VITE_GA_ID;
  if (!GA_ID) {
    if (import.meta.env.DEV) {
      console.warn("[analytics] VITE_GA_ID is not set; analytics disabled.");
    }
    return;
  }

  // Load gtag.js script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // Init dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: false }); // we control SPA pageviews

  initialized = true;
}

export function trackPageview(pathname, title) {
  const GA_ID = import.meta.env.VITE_GA_ID;
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: pathname,
    page_title: title || document.title,
  });
}

export function trackEvent(name, params = {}) {
  if (!window.gtag) return;
  window.gtag('event', name, params);
}
