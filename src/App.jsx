import { useState, useRef, useCallback, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import SAMPLES from './data/samples';

const ABOUT_LINKS = [
  {
    label: 'JSON Views',
    url: 'https://jsonviews.netlify.app/',
    description: 'JSON Viewer & Formatter',
    icon: '{ }',
  },
  {
    label: 'Portfolio',
    url: 'https://tesio-portfolio.vercel.app/',
    description: 'Developer Portfolio',
    icon: '👤',
  },
];

const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
  { value: 'php', label: 'PHP' },
];

// localStorage helpers
function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota errors
  }
}

export default function App() {
  const [language, setLanguage] = useState(() => loadFromStorage('cc_language', 'json'));
  const [isDark, setIsDark] = useState(() => loadFromStorage('cc_theme', 'dark') === 'dark');
  const [isInline, setIsInline] = useState(false);
  const [isWordWrap, setIsWordWrap] = useState(() => loadFromStorage('cc_wordwrap', 'on') === 'on');
  const [showAbout, setShowAbout] = useState(false);

  // Close about modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAbout(false);
      }
    };
    if (showAbout) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAbout]);

  // Editor content — starts EMPTY, restored from localStorage only if saved
  const [original] = useState(() => loadFromStorage('cc_original', ''));
  const [modified] = useState(() => loadFromStorage('cc_modified', ''));

  const diffEditorRef = useRef(null);
  const lastFocusedRef = useRef('modified');

  // Apply body class for light theme
  useEffect(() => {
    document.body.className = isDark ? '' : 'light-theme';
  }, [isDark]);

  // Handle editor mount
  const handleEditorMount = useCallback((editor) => {
    diffEditorRef.current = editor;

    try {
      const wrapVal = isWordWrap ? 'on' : 'off';
      editor.updateOptions({
        renderSideBySide: !isInline,
        diffWordWrap: wrapVal,
        wordWrap: wrapVal,
        wrappingStrategy: 'advanced',
        wordWrapOverride1: wrapVal,
        wordWrapOverride2: wrapVal,
      });

      const origEditor = editor.getOriginalEditor();
      const modEditor = editor.getModifiedEditor();

      origEditor.updateOptions({
        wordWrap: wrapVal,
        wrappingStrategy: 'advanced',
        wordWrapOverride1: wrapVal,
        wordWrapOverride2: wrapVal,
      });

      modEditor.updateOptions({
        wordWrap: wrapVal,
        wrappingStrategy: 'advanced',
        wordWrapOverride1: wrapVal,
        wordWrapOverride2: wrapVal,
      });

      // Track focus for undo/redo
      origEditor.onDidFocusEditorWidget(() => {
        lastFocusedRef.current = 'original';
      });
      modEditor.onDidFocusEditorWidget(() => {
        lastFocusedRef.current = 'modified';
      });

      // Persist content changes via model listeners
      const origModel = origEditor.getModel();
      const modModel = modEditor.getModel();

      if (origModel) {
        origModel.onDidChangeContent(() => {
          saveToStorage('cc_original', origModel.getValue());
        });
      }
      if (modModel) {
        modModel.onDidChangeContent(() => {
          saveToStorage('cc_modified', modModel.getValue());
        });
      }

      // Initial layout
      setTimeout(() => editor.layout(), 100);
    } catch (err) {
      console.warn('Editor mount setup error:', err);
    }
  }, [isWordWrap, isInline]);

  // Dynamically update wordWrap, side-by-side, and layout whenever isWordWrap or isInline changes
  useEffect(() => {
    if (!diffEditorRef.current) return;
    try {
      const editor = diffEditorRef.current;
      const wrapVal = isWordWrap ? 'on' : 'off';

      editor.updateOptions({
        renderSideBySide: !isInline,
        diffWordWrap: wrapVal,
        wordWrap: wrapVal,
        wrappingStrategy: 'advanced',
        wordWrapOverride1: wrapVal,
        wordWrapOverride2: wrapVal,
      });

      const origEditor = editor.getOriginalEditor?.();
      if (origEditor) {
        origEditor.updateOptions({
          wordWrap: wrapVal,
          wrappingStrategy: 'advanced',
          wordWrapOverride1: wrapVal,
          wordWrapOverride2: wrapVal,
        });
      }

      const modEditor = editor.getModifiedEditor?.();
      if (modEditor) {
        modEditor.updateOptions({
          wordWrap: wrapVal,
          wrappingStrategy: 'advanced',
          wordWrapOverride1: wrapVal,
          wordWrapOverride2: wrapVal,
        });
      }

      setTimeout(() => editor.layout(), 50);
    } catch (err) {
      console.warn('Failed to update diff editor options:', err);
    }
  }, [isWordWrap, isInline]);

  // Get the active editor (whichever was last focused)
  const getActiveEditor = useCallback(() => {
    if (!diffEditorRef.current) return null;
    try {
      return lastFocusedRef.current === 'original'
        ? diffEditorRef.current.getOriginalEditor()
        : diffEditorRef.current.getModifiedEditor();
    } catch {
      return null;
    }
  }, []);

  // ---- Toolbar handlers ----

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    saveToStorage('cc_language', lang);
  };

  const handleThemeToggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      saveToStorage('cc_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleUndo = () => {
    const editor = getActiveEditor();
    if (editor) {
      editor.trigger('toolbar', 'undo');
      editor.focus();
    }
  };

  const handleRedo = () => {
    const editor = getActiveEditor();
    if (editor) {
      editor.trigger('toolbar', 'redo');
      editor.focus();
    }
  };

  const handleSideBySide = () => {
    setIsInline(false);
  };

  const handleInline = () => {
    setIsInline(true);
  };

  const handleWordWrapToggle = () => {
    setIsWordWrap((prev) => {
      const next = !prev;
      saveToStorage('cc_wordwrap', next ? 'on' : 'off');
      return next;
    });
  };

  const handleSwap = () => {
    if (!diffEditorRef.current) return;
    try {
      const origEditor = diffEditorRef.current.getOriginalEditor();
      const modEditor = diffEditorRef.current.getModifiedEditor();
      const origVal = origEditor.getModel().getValue();
      const modVal = modEditor.getModel().getValue();
      origEditor.getModel().setValue(modVal);
      modEditor.getModel().setValue(origVal);
    } catch (err) {
      console.warn('Swap error:', err);
    }
  };

  const handleClear = () => {
    if (!diffEditorRef.current) return;
    try {
      diffEditorRef.current.getOriginalEditor().getModel().setValue('');
      diffEditorRef.current.getModifiedEditor().getModel().setValue('');
    } catch (err) {
      console.warn('Clear error:', err);
    }
  };

  const handleSample = () => {
    if (!diffEditorRef.current) return;
    try {
      const sample = SAMPLES[language] || SAMPLES.plaintext;
      diffEditorRef.current.getOriginalEditor().getModel().setValue(sample.original);
      diffEditorRef.current.getModifiedEditor().getModel().setValue(sample.modified);
    } catch (err) {
      console.warn('Sample error:', err);
    }
  };

  return (
    <div className="app">
      {/* Toolbar */}
      <header className="toolbar">
        <div className="toolbar-left">
          <h1 className="logo">⟺ Code Compare</h1>
        </div>

        <div className="toolbar-center">
          <div className="toolbar-group">
            <label htmlFor="language-select" className="toolbar-label">Language</label>
            <select
              id="language-select"
              className="toolbar-select"
              value={language}
              onChange={handleLanguageChange}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="toolbar-group">
            <label className="toolbar-label">Diff Mode</label>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${!isInline ? 'active' : ''}`}
                onClick={handleSideBySide}
                title="Side by Side"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="2" width="6" height="12" rx="1" opacity="0.8"/>
                  <rect x="9" y="2" width="6" height="12" rx="1" opacity="0.8"/>
                </svg>
                Side by Side
              </button>
              <button
                className={`toggle-btn ${isInline ? 'active' : ''}`}
                onClick={handleInline}
                title="Inline"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="2" width="14" height="12" rx="1" opacity="0.8"/>
                </svg>
                Inline
              </button>
            </div>
          </div>

          <div className="toolbar-group">
            <button
              className={`toggle-btn ${isWordWrap ? 'active' : ''}`}
              onClick={handleWordWrapToggle}
              title="Toggle Word Wrap according to view width"
              style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}
            >
              Wrap: {isWordWrap ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button className="toolbar-btn btn-secondary" onClick={handleThemeToggle} title="Toggle light/dark mode">
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 1a7 7 0 107.368 12.956.5.5 0 00-.368-.856 5 5 0 01-5.1-7.1.5.5 0 00-.6-.7A7.001 7.001 0 006 1z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="3.5"/>
                <path d="M8 0v2m0 12v2m8-8h-2M2 8H0m13.66-5.66L12.24 3.76M3.76 12.24l-1.42 1.42m11.32 0l-1.42-1.42M3.76 3.76L2.34 2.34" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            )}
            {isDark ? 'Light' : 'Dark'}
          </button>

          <button
            className={`toolbar-btn btn-secondary ${showAbout ? 'active' : ''}`}
            onClick={() => setShowAbout((prev) => !prev)}
            title="About Code Compare & Links"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM8 4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm-.75 3.5h1.5v4.5h-1.5v-4.5z"/>
            </svg>
            About
          </button>

          <div className="toolbar-divider" />

          <button className="toolbar-btn btn-secondary" onClick={handleUndo} title="Undo (Ctrl+Z)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 5l4-4v2.5C10.5 3.5 14 5.5 14 11c-1.5-3-4.5-4.5-8-4.5V9L2 5z"/>
            </svg>
            Undo
          </button>
          <button className="toolbar-btn btn-secondary" onClick={handleRedo} title="Redo (Ctrl+Y)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 5l-4-4v2.5C5.5 3.5 2 5.5 2 11c1.5-3 4.5-4.5 8-4.5V9l4-4z"/>
            </svg>
            Redo
          </button>

          <div className="toolbar-divider" />

          <button className="toolbar-btn btn-secondary" onClick={handleSample} title="Load sample content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 1h8a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1zm1 3v1h6V4H5zm0 3v1h6V7H5zm0 3v1h4v-1H5z"/>
            </svg>
            Sample
          </button>
          <button className="toolbar-btn btn-secondary" onClick={handleSwap} title="Swap left and right">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 4h10l-3-3h2l4 4-4 4h-2l3-3H1V4zm14 8H5l3 3H6l-4-4 4-4h2L5 10h10v2z"/>
            </svg>
            Swap
          </button>
          <button className="toolbar-btn btn-danger" onClick={handleClear} title="Clear both editors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 1l.5 1h4l.5-1h3v2H2V1h3.5zM3 5v9a2 2 0 002 2h6a2 2 0 002-2V5H3zm3 2h1v7H6V7zm3 0h1v7H9V7z"/>
            </svg>
            Clear
          </button>
        </div>
      </header>

      {/* About Modal */}
      {showAbout && (
        <div className="about-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <div className="about-modal-header">
              <div className="about-modal-title-group">
                <h2 className="about-title">
                  <span className="about-icon">⟺</span>
                  Code Compare
                </h2>
                <span className="about-badge">v1.0.0</span>
              </div>
              <button
                className="about-close"
                onClick={() => setShowAbout(false)}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            <p className="about-description">
              A modern, privacy-friendly browser-based code comparison tool powered by Monaco Editor.
              Compare code, JSON, HTML, and text with instant visual diff highlighting, side-by-side or
              inline viewing, and responsive viewport text wrapping.
            </p>

            <div className="about-features">
              <div className="about-feature-item">
                <span className="about-feature-check">✓</span>
                <span><strong>18+ Languages</strong> (HTML, JSON, JS, TS, Python, CSS, SQL, XML, YAML...)</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-check">✓</span>
                <span><strong>Diff Modes</strong>: Side-by-Side & Inline</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-check">✓</span>
                <span><strong>Word Wrap</strong>: Automatic wrapping to view width</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-check">✓</span>
                <span><strong>100% Private</strong>: Code runs entirely in your browser</span>
              </div>
            </div>

            <div className="about-section-heading">Websites & Projects</div>
            <div className="about-links">
              {ABOUT_LINKS.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-link-card"
                >
                  <span className="about-link-icon">{link.icon}</span>
                  <div className="about-link-info">
                    <span className="about-link-label">{link.label}</span>
                    <span className="about-link-desc">{link.description}</span>
                  </div>
                  <svg className="about-link-arrow" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor labels — only in side-by-side mode */}
      {!isInline && (
        <div className="editor-labels">
          <span className="editor-label label-original">Original</span>
          <span className="editor-label label-modified">Modified</span>
        </div>
      )}

      {/* Monaco Diff Editor */}
      <div className="editor-container">
        <DiffEditor
          original={original}
          modified={modified}
          language={language}
          theme={isDark ? 'vs-dark' : 'vs'}
          onMount={handleEditorMount}
          options={{
            renderSideBySide: !isInline,
            originalEditable: true,
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            scrollBeyondLastLine: false,
            renderOverviewRuler: true,
            ignoreTrimWhitespace: false,
            renderIndicators: true,
            padding: { top: 8 },
            wordWrap: isWordWrap ? 'on' : 'off',
            diffWordWrap: isWordWrap ? 'on' : 'off',
            wrappingStrategy: 'advanced',
            wordWrapOverride1: isWordWrap ? 'on' : 'off',
            wordWrapOverride2: isWordWrap ? 'on' : 'off',
            useInlineViewWhenSpaceIsLimited: false,
          }}
          loading={
            <div className="editor-loading">Loading editor...</div>
          }
        />
      </div>
    </div>
  );
}
