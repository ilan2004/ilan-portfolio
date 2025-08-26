import { useEffect, useRef, useState } from 'react';

// Helper function to render Markdown links as React elements
function renderMarkdownLinks(text, role) {
  // Regular expression to match Markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  // Split the text at markdown links
  const parts = text.split(linkRegex);
  const result = [];

  // Process each part
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      // Plain text part
      if (parts[i]) {
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
    } else if (i % 3 === 1) {
      // Link text part
      const linkText = parts[i];
      const linkUrl = parts[i + 1];

      if (linkText && linkUrl) {
        result.push(
          <a
            key={`link-${i}`}
            href={linkUrl}
            className={`${
              role === 'user'
                ? 'text-[var(--bg)] underline'
                : 'text-[var(--fg)]/90 underline'
            } pointer-events-auto`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkText}
          </a>
        );
      }

      // Skip the URL part as we've already used it
      i++;
    }
  }

  return result;
}

export default function ChatInterface({
  backgroundImage,
  onChangeBackgroundAction,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Light-weight suggested prompts to help users understand the chat purpose
  const suggestions = [
    "What’s this chat for?",
    "Summarize my latest blog post.",
  ];

  const handleInputChange = (e) => setInput(e.target.value);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    // Append user message
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history including the new user message
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Chat request failed');
      }

      // Add placeholder assistant message
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: (m.content || '') + chunk } : m
            )
          );
        }
      }
    } catch (err) {
      // Append an error message from assistant
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'sorry, something went wrong.' },
      ]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const messagesEndRef = useRef(null);

  // Only auto-scroll when a new message is added
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      // No smooth behavior to avoid scroll jacking
      messagesEndRef.current.scrollIntoView({ block: 'end' });
    }
  }, [messages.length]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleSuggestionClick = (q) => {
    if (isLoading) return;
    setInput(q);
    // Submit immediately
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 0);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-[340px] sm:max-w-[380px] mx-auto h-[66vh] sm:h-[72vh] max-h-[720px] flex flex-col shadow-card relative" style={{ border: '2px dashed var(--bg200)' }}>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 top-[42px] bottom-[36px]">
          <img
            src={backgroundImage}
            alt="Background artwork"
            className="w-full h-full opacity-30 object-scale-down"
          />
        </div>
      </div>

      {/* Minimal header */}
      <div className="bg-white h-[48px] flex items-center justify-between px-2 border-b border-[var(--bg200)] relative z-10">
        <div className="flex items-center">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-6 h-6 rounded-full bg-[var(--fg)] flex items-center justify-center text-[var(--bg)] text-xs font-semibold">
              I
            </div>
            <span className="text-[var(--fg)]/80 text-sm font-normal">
              Ilan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 pr-2">
          <button
            onClick={onChangeBackgroundAction}
            type="button"
            className="text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
            aria-label="Change background"
            title="Change background"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={handleClear}
            type="button"
            className="text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area with iMessage styling */}
      <div className="flex-1 overflow-y-auto relative z-10 p-5 sm:p-6">
        <div className="space-y-3">
          {messages.map((message, i) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[78%] md:max-w-[72%] rounded-2xl px-4 py-2.5 bubble-in ${
                  message.role === 'user'
                    ? 'bg-[var(--fg)] text-[var(--bg)] ml-auto'
                    : 'bg-white text-[var(--fg)] border border-[var(--bg200)]'
                }`}
              >
                <div className="text-sm leading-relaxed break-words">
                  {renderMarkdownLinks(
                    message.content,
                    message.role === 'user' || message.role === 'assistant'
                      ? message.role
                      : 'assistant'
                  )}
                  {/* Blinking caret while current assistant message is streaming */}
                  {isLoading && i === messages.length - 1 && message.role === 'assistant' && (
                    <span className="typing-caret" aria-hidden="true"></span>
                  )}
                </div>
                <div
                  className={`text-[11px] mt-2 ${
                    message.role === 'user'
                      ? 'text-[var(--bg)]/90'
                      : 'text-[var(--fg)]/60'
                  }`}
                >
                  {formatTime()}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator - only show between user message and assistant response */}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-white border border-[var(--bg200)] rounded-2xl px-4 py-2.5 user-select-none">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--fg)]/40 animate-typing"></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--fg)]/40 animate-typing-middle"></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--fg)]/40 animate-typing-last"></div>
                  </div>
                </div>
              </div>
            )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions (show when empty to explain the chat) */}
      {messages.length === 0 && (
        <div className="px-3 pb-2 pt-0 bg-white border-t border-[var(--bg200)] relative z-10">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="px-3 py-2 rounded-full text-xs font-semibold bg-[var(--bg200)] text-[var(--fg)] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minimal input area */}
      <div className="px-2 py-3.5 bg-white border-t border-[var(--bg200)] relative z-10 user-select-none">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3.5 bg-[var(--bg200)] text-[var(--fg)] border border-[var(--bg200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:rgba(31,31,31,0.15)] focus:border-[var(--fg)] text-sm placeholder-[var(--fg)]/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`${
              input.trim() ? 'bg-[var(--fg)]' : 'bg-[var(--bg200)]'
            } rounded-full p-2.5 mr-2 disabled:opacity-50 transition-colors user-select-none`}
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse w-4 h-4 text-[var(--bg)] user-select-none">
                •••
              </span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[var(--bg)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}