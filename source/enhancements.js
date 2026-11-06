/* Eric EEIT v1.3 enhancement layer: non-destructive UI upgrade. */
(function () {
  'use strict';
  let content = null;
  let dialog = null;
  let busy = false;
  const $ = s => document.querySelector(s);
  function resolveExercise() {
    const hash = decodeURIComponent(location.hash || '');
    const id = hash.startsWith('#exercise/') ? hash.slice(10) : '';
    const items = content && Array.isArray(content.exercises) ? content.exercises : [];
    let ex = items.find(item => item.id === id);
    if (!ex) {
      try {
        const local = JSON.parse(localStorage.getItem('eric-eeit-exercise:v1') || '{}');
        ex = (local.custom || []).find(item => item.id === id);
      } catch (_) { /* local storage may be blocked */ }
    }
    return ex || null;
  }
  function resolvePart() {
    const ex = resolveExercise();
    if (!ex || !Array.isArray(ex.parts)) return { ex, part: null };
    const active = $('.part-button.active');
    const label = active && active.dataset ? active.dataset.id : null;
    return { ex, part: ex.parts.find(p => p.label === label) || ex.parts[0] || null };
  }
  function modal() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'eeit-explanation-dialog';
    dialog.setAttribute('aria-labelledby', 'eeit-explanation-title');
    const shell = document.createElement('div');
    shell.className = 'eeit-dialog-shell';
    const header = document.createElement('div');
    header.className = 'eeit-dialog-header';
    const title = document.createElement('h2');
    title.id = 'eeit-explanation-title';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn';
    close.textContent = 'Close ×';
    close.setAttribute('aria-label', 'Close explanation');
    close.addEventListener('click', () => dialog.close());
    const body = document.createElement('div');
    body.className = 'eeit-dialog-body';
    body.id = 'eeit-explanation-body';
    header.append(title, close);
    shell.append(header, body);
    dialog.append(shell);
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    document.body.append(dialog);
    return dialog;
  }
  function show(kind, chosenPart, chosenExercise) {
    const found = chosenPart ? { part: chosenPart, ex: chosenExercise } : resolvePart();
    const part = found.part;
    if (!part) return;
    const headings = {
      why: 'Why this method? · ဘာကြောင့်လဲ',
      method: 'How to solve · ဖြေရှင်းနည်း',
      answer: 'Final answer · နောက်ဆုံးအဖြေ'
    };
    const messages = {
      why: part.reason || 'This part does not yet have an independently checked rationale.',
      method: part.method || 'A separately verified step-by-step derivation is not yet recorded for this part. Read the worked equations on the exercise page.',
      answer: part.finalAnswer || part.solution || (part.equations || []).slice(-1)[0] || 'A separate final answer has not yet been independently checked.'
    };
    const el = modal();
    $('#eeit-explanation-title').textContent = headings[kind] || 'Explanation';
    const body = $('#eeit-explanation-body');
    body.replaceChildren();
    const reason = document.createElement('p');
    reason.textContent = messages[kind];
    const note = document.createElement('small');
    note.className = 'eeit-verification';
    note.textContent = part.verification || found.ex.verificationState || 'Existing study note, not exhaustively independently reaudited';
    body.append(reason, note);
    if (typeof el.showModal === 'function') el.showModal();
    else el.setAttribute('open', '');
  }
  function button(kind, text, part, exercise) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn eeit-info-button';
    b.dataset.eeitPopup = kind;
    b.textContent = text;
    b.addEventListener('click', () => show(kind, part, exercise));
    return b;
  }
  function addExplanations() {
    const root = $('.workspace-main');
    const ex = resolveExercise();
    if (!root || !ex || !Array.isArray(ex.parts)) return;
    // Render a separate popup-button trio for every inline worked subquestion.
    for (const article of root.querySelectorAll('.inline-part')) {
      if (article.querySelector('.eeit-popup-tools')) continue;
      const label = article.querySelector('.inline-part-index')?.textContent?.trim().toLowerCase();
      const part = ex.parts.find(p => String(p.label).toLowerCase() === label);
      if (!part) continue;
      const bar = document.createElement('div');
      bar.className = 'eeit-popup-tools no-print';
      bar.setAttribute('aria-label', 'Explanations for subquestion ' + label);
      bar.append(
        button('why', 'Why? · ဘာကြောင့်', part, ex),
        button('method', 'Method · ဖြေရှင်းနည်း', part, ex),
        button('answer', 'Final answer · အဖြေ', part, ex)
      );
      const header = article.querySelector('.inline-part-head');
      if (header) header.after(bar);
      else article.prepend(bar);
    }
  }
  function protectPrivateSources() {
    const pages = $('.workspace-main .source-pages');
    if (!pages) return;
    const ex = resolveExercise();
    const paper = pages.closest('.paper');
    if (!paper) return;
    const panel = document.createElement('div');
    panel.className = 'eeit-private-source';
    const title = document.createElement('strong');
    title.textContent = 'Private course question reference';
    const paragraph = document.createElement('p');
    paragraph.textContent = (ex && ex.question) || 'This question is available in your private course materials. Consult your own source PDF for the exact wording and diagrams.';
    const source = document.createElement('small');
    const ref = ex && (ex.sourcePageRef || ((ex.sourcePages || []).join(', ')));
    source.textContent = 'Reference: ' + ((ex && ex.source) || 'Original question sheet') + (ref ? ' · ' + ref : '');
    panel.append(title, paragraph, source);
    pages.replaceWith(panel);
    const helper = paper.querySelector('.resource');
    if (helper) helper.textContent = 'Instructor-owned PDFs and question-page images are not included in this public website.';
  }
  function fixLegacyCopy() {
    for (const node of document.querySelectorAll('.note-panel')) {
      if (node.textContent.includes('Official exercise content for the four other subjects is not yet imported')) {
        node.textContent = 'All five subjects now have exercise entries. Source-only entries still need independent verified calculations; they are not presented as solved.';
      }
    }
    for (const card of document.querySelectorAll('.settings-card')) {
      if (card.textContent.includes('No Google account, no Firebase')) {
        const p = card.querySelector('p');
        if (p) p.textContent = 'Local progress works without sign-in. Optional Firebase sign-in can sync progress per Google account when configured.';
      }
    }
  }
  function decorate() {
    if (busy || !content) return;
    busy = true;
    try { addExplanations(); protectPrivateSources(); fixLegacyCopy(); }
    finally { busy = false; }
  }
  const observer = new MutationObserver(() => decorate());
  if (document.querySelector('#app')) observer.observe($('#app'), { childList: true, subtree: true });
  Promise.all([fetch('data/content.json'), fetch('data/verified-expansion.json')])
    .then(async ([originalResponse, extensionResponse]) => {
      if (!originalResponse.ok || !extensionResponse.ok) throw new Error('Failed to load verified exercise data');
      const [data, extension] = await Promise.all([originalResponse.json(), extensionResponse.json()]);
      if (!Array.isArray(data.exercises) || !Array.isArray(extension.overrides)) throw new Error('Invalid exercise content');
      const overrides = new Map(extension.overrides.map(ex => [ex.id, ex]));
      data.exercises = data.exercises.map(ex => overrides.has(ex.id) ? { ...ex, ...overrides.get(ex.id) } : ex);
      content = data;
      decorate();
    }).catch(error => { console.warn('Explanation enhancements are unavailable:', error.message); });
  window.addEventListener('hashchange', () => queueMicrotask(decorate));
})();
