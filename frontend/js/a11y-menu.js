// Accessibility menu: a button on every page that lets visitors enlarge text, raise contrast,
// underline links, switch to a plain font and stop motion. Choices persist in localStorage.
(() => {
  const KEY = 'a11y-preferences';
  const SIZES = [100, 115, 130, 150];
  const TOGGLES = [
    ['contrast', 'High contrast'],
    ['links', 'Underline links'],
    ['font', 'Readable font'],
    ['motion', 'Stop animations'],
  ];
  const statementUrl = new URL('../accessibility.html', document.currentScript.src).href;

  const load = () => {
    try { return { size: 0, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { size: 0 }; }
  };
  let prefs = load();

  const apply = () => {
    const root = document.documentElement;
    root.style.fontSize = prefs.size ? `${SIZES[prefs.size]}%` : '';
    for (const [name] of TOGGLES) root.classList.toggle(`a11y-${name}`, Boolean(prefs[name]));
  };
  // re-render, then put focus back on the control the visitor used (or the first one if it is now disabled)
  const save = (focusKey, message) => {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* private mode: still applies for this page */ }
    apply();
    render();
    if (message) status.textContent = message;
    (panel.querySelector(`[data-a11y="${focusKey}"]:not([disabled])`) || panel.querySelector('button:not([disabled])')).focus();
  };
  apply();

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const toggle = make('button', 'a11y-menu-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'a11y-menu-panel');
  toggle.setAttribute('aria-label', 'Accessibility options');
  toggle.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><circle cx="12" cy="4" r="2"/><path d="M20 8.5c0 .6-.4 1-1 1.1l-4.5.6V13l1.9 7.2a1 1 0 0 1-1.9.6L12.7 15h-1.4l-1.8 5.8a1 1 0 0 1-1.9-.6L9.5 13v-2.8L5 9.6a1 1 0 1 1 .2-2l5.3.7h3l5.3-.7c.6-.1 1.2.4 1.2.9z"/></svg>';

  const panel = make('div', 'a11y-menu-panel');
  panel.id = 'a11y-menu-panel';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Accessibility options');
  panel.hidden = true;

  const status = make('p', 'a11y-menu-status');
  status.setAttribute('role', 'status');

  function render() {
    panel.replaceChildren();
    panel.append(make('h2', 'a11y-menu-title', 'Accessibility'));

    const sizeRow = make('div', 'a11y-menu-row');
    const smaller = make('button', 'a11y-menu-btn', 'A−');
    const larger = make('button', 'a11y-menu-btn', 'A+');
    smaller.type = larger.type = 'button';
    smaller.setAttribute('aria-label', 'Decrease text size');
    larger.setAttribute('aria-label', 'Increase text size');
    smaller.disabled = prefs.size === 0;
    larger.disabled = prefs.size === SIZES.length - 1;
    smaller.dataset.a11y = 'smaller';
    larger.dataset.a11y = 'larger';
    smaller.addEventListener('click', () => { prefs.size -= 1; save('smaller', `Text size ${SIZES[prefs.size]}%`); });
    larger.addEventListener('click', () => { prefs.size += 1; save('larger', `Text size ${SIZES[prefs.size]}%`); });
    sizeRow.append(make('span', 'a11y-menu-label', `Text size ${SIZES[prefs.size]}%`), smaller, larger);
    panel.append(sizeRow);

    for (const [name, label] of TOGGLES) {
      const button = make('button', 'a11y-menu-btn a11y-menu-wide', label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(Boolean(prefs[name])));
      button.addEventListener('click', () => { prefs[name] = !prefs[name]; save(name, `${label} ${prefs[name] ? 'on' : 'off'}`); });
      button.dataset.a11y = name;
      panel.append(button);
    }

    const reset = make('button', 'a11y-menu-btn a11y-menu-wide', 'Reset');
    reset.type = 'button';
    reset.dataset.a11y = 'reset';
    reset.addEventListener('click', () => { prefs = { size: 0 }; save('reset', 'Accessibility settings reset'); });
    const link = make('a', 'a11y-menu-link', 'Accessibility statement');
    link.href = statementUrl;
    panel.append(reset, link, status);
  }
  render();

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('button:not([disabled])').focus();
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (event) => {
    // composedPath: re-rendering detaches the clicked button, so contains() would misfire
    if (!panel.hidden && !event.composedPath().includes(wrap)) setOpen(false);
  });

  const wrap = make('div', 'a11y-menu');
  wrap.append(panel, toggle);
  document.body.append(wrap);
})();
