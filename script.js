(() => {
  'use strict';

  /* ------------------------------------------------------------------ content
     Every statement below comes straight from the figure (glial cells and their functions). */
  const CELLS = {
    satellite: { name: 'Satellite cells', system: 'pns', funcs: ['support-cell-bodies'] },
    schwann:   { name: 'Schwann cells', system: 'pns', funcs: ['myelin', 'pns-neurotrophic'] },
    oligo:     { name: 'Oligodendrocytes', system: 'cns', funcs: ['myelin'] },
    astro:     { name: 'Astrocytes', system: 'cns', funcs: ['support-cns', 'bbb', 'cns-neurotrophic', 'k-nt'] },
    microglia: { name: 'Microglia', note: 'Modified immune cells', system: 'cns', funcs: ['scavengers'] },
    ependymal: { name: 'Ependymal cells', system: 'cns', funcs: ['barriers'] }
  };

  const FUNCS = {
    'support-cell-bodies': { name: 'Support cell bodies', owners: ['satellite'] },
    'myelin':              { name: 'Myelin sheaths', owners: ['schwann', 'oligo'] },
    'pns-neurotrophic':    { name: 'Neurotrophic factors', owners: ['schwann'] },
    'support-cns':         { name: 'Support for central nervous system', owners: ['astro'] },
    'bbb':                 { name: 'Blood-brain barrier', owners: ['astro'] },
    'cns-neurotrophic':    { name: 'Neurotrophic factors', owners: ['astro'] },
    'k-nt':                { name: 'K⁺, Ca²⁺, neurotransmitters', owners: ['astro'] },
    'scavengers':          { name: 'Scavengers', owners: ['microglia'] },
    'barriers':            { name: 'Barriers between compartments', owners: ['ependymal'] }
  };

  const STATEMENTS = {
    'satellite|support-cell-bodies': 'Satellite cells support cell bodies.',
    'schwann|myelin': 'Schwann cells form myelin sheaths.',
    'schwann|pns-neurotrophic': 'Schwann cells secrete neurotrophic factors.',
    'oligo|myelin': 'Oligodendrocytes form myelin sheaths.',
    'astro|support-cns': 'Astrocytes form support for the central nervous system.',
    'astro|bbb': 'Astrocytes help form the blood-brain barrier.',
    'astro|cns-neurotrophic': 'Astrocytes secrete neurotrophic factors.',
    'astro|k-nt': 'Astrocytes take up K⁺ and neurotransmitters, and stabilize extracellular Ca²⁺.',
    'microglia|scavengers': 'Microglia act as scavengers.',
    'ependymal|barriers': 'Ependymal cells create barriers between compartments.'
  };

  const CORE_QUESTIONS = [
    { prompt: 'Which glial cell supports cell bodies?', answer: ['satellite'], reveal: ['support-cell-bodies'],
      explain: 'Satellite cells support cell bodies.' },
    { prompt: 'Which glial cells form myelin sheaths?', answer: ['schwann', 'oligo'], reveal: ['myelin'],
      explain: 'Schwann cells and oligodendrocytes form myelin sheaths.',
      alt: { prompt: 'Which glial cell forms myelin sheaths in the central nervous system?', answer: ['oligo'],
             reveal: ['myelin'], explain: 'Oligodendrocytes form myelin sheaths in the central nervous system.' } },
    { prompt: 'Which glial cells secrete neurotrophic factors?', answer: ['schwann', 'astro'],
      reveal: ['pns-neurotrophic', 'cns-neurotrophic'],
      explain: 'Schwann cells and astrocytes secrete neurotrophic factors.',
      alt: { prompt: 'Which glial cell secretes neurotrophic factors in the peripheral nervous system?',
             answer: ['schwann'], reveal: ['pns-neurotrophic'],
             explain: 'Schwann cells secrete neurotrophic factors in the peripheral nervous system.' } },
    { prompt: 'Which glial cell forms support for the central nervous system?', answer: ['astro'], reveal: ['support-cns'],
      explain: 'Astrocytes form support for the central nervous system.' },
    { prompt: 'Which glial cell helps form the blood-brain barrier?', answer: ['astro'], reveal: ['bbb'],
      explain: 'Astrocytes help form the blood-brain barrier.' },
    { prompt: 'Which glial cell takes up K⁺ and neurotransmitters, and stabilizes extracellular Ca²⁺?', answer: ['astro'], reveal: ['k-nt'],
      explain: 'Astrocytes take up K⁺ and neurotransmitters, and stabilize extracellular Ca²⁺.' },
    { prompt: 'Which glial cell acts as a scavenger?', answer: ['microglia'], reveal: ['scavengers'],
      explain: 'Microglia act as scavengers.' },
    { prompt: 'Which glial cell is a modified immune cell?', answer: ['microglia'], reveal: ['scavengers'],
      explain: 'Microglia are modified immune cells. They act as scavengers.' },
    { prompt: 'Which glial cell creates barriers between compartments?', answer: ['ependymal'], reveal: ['barriers'],
      explain: 'Ependymal cells create barriers between compartments.' }
  ];

  /* ------------------------------------------------------------------ elements */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const mapCells = $$('.map .cell');
  const mapFuncs = $$('.map .func');
  const edges = $$('.map .edge');
  const chips = $$('.cell-chip');
  const slotEl = Object.fromEntries(mapFuncs.map((g) => [g.dataset.func, g]));

  const el = {
    subtitle: $('#modeSubtitle'), exploreBtn: $('#modeExploreBtn'), buildBtn: $('#modeBuildBtn'), testBtn: $('#modeTestBtn'),
    exploreActions: $('#exploreActions'), progressText: $('#progressText'), progressBar: $('#progressBar'),
    reset: $('#resetBtn'),
    buildBar: $('#buildBar'), buildTitle: $('#buildTitle'), buildHint: $('#buildHint'), buildCount: $('#buildCount'),
    buildCheck: $('#buildCheck'), buildRestart: $('#buildRestart'), tray: $('#tray'), buildFeedback: $('#buildFeedback'),
    quizBar: $('#quizBar'), qCount: $('#qCount'), qScore: $('#qScore'), qPrompt: $('#qPrompt'), qHint: $('#qHint'),
    qCheck: $('#qCheck'), qNext: $('#qNext'), qRetake: $('#qRetake'), qFeedback: $('#qFeedback'),
    infoEmpty: $('#infoEmpty'), infoBody: $('#infoBody'), infoArt: $('#infoArt use'), infoWhere: $('#infoWhere'),
    infoTitle: $('#infoTitle'), infoNote: $('#infoNote'), infoList: $('#infoList'), listTitle: $('#listTitle')
  };
  const SUBTITLES = {
    explore: el.subtitle.innerHTML,
    build: 'Rebuild the figure from memory: put each function back under the glial cell it belongs to.',
    test: 'Read the function, then tap the glial cell that matches it on the map or in the list.'
  };

  /* ------------------------------------------------------------------ state */
  let mode = 'explore';
  const explore = { explored: new Set(), cells: new Set(), funcs: new Set(), selected: null };
  const test = { queue: [], pos: 0, firstTry: 0, total: 0, retries: 0, picks: new Set(), checked: false, done: false };
  const build = { tiles: [], placed: {}, locked: new Set(), wrong: new Set(), picked: null, checks: 0, firstScore: null, busy: false };

  /* ------------------------------------------------------------------ helpers */
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const setOn = (node, cls, on) => node.classList.toggle(cls, !!on);
  // the two "Neurotrophic factors" boxes take either neurotrophic label
  const slotKey = (f) => (f.endsWith('neurotrophic') ? 'neurotrophic' : f);
  const tileById = (id) => build.tiles.find((t) => t.id === id);
  const slotOfTile = (id) => Object.keys(build.placed).find((s) => build.placed[s] === id);
  // The four astrocyte boxes are interchangeable: any astrocyte function counts in any astrocyte box,
  // as long as each astrocyte function is used only once across them.
  const ASTRO_SLOTS = CELLS.astro.funcs;
  const ASTRO_LABELS = new Set(ASTRO_SLOTS.map(slotKey));
  const accepts = (slot) => (ASTRO_SLOTS.includes(slot) ? ASTRO_LABELS : new Set([slotKey(slot)]));

  /* ------------------------------------------------------------------ map rendering */
  function renderMap() {
    let funcOn = () => false, edgeOn = () => false, funcHot = () => false, edgeHot = () => false, cellClass = () => ({});

    if (mode === 'explore') {
      const sel = explore.selected;
      funcOn = (f) => explore.funcs.has(f) || FUNCS[f].owners.some((c) => explore.cells.has(c));
      edgeOn = (o, f) => explore.cells.has(o) || explore.funcs.has(f);
      funcHot = (f) => sel && (sel.type === 'cell' ? CELLS[sel.key].funcs.includes(f) : sel.key === f);
      edgeHot = (o, f) => sel && (sel.type === 'cell' ? sel.key === o : sel.key === f);
      cellClass = (k) => ({ 'is-selected': sel && ((sel.type === 'cell' && sel.key === k) ||
                                                  (sel.type === 'func' && FUNCS[sel.key].owners.includes(k))),
                            'is-explored': explore.explored.has(k) });
    } else if (mode === 'build') {
      edgeOn = (o, f) => build.locked.has(f);
    } else {
      const item = test.queue[test.pos], q = item && item.q;
      const show = test.checked && q;
      funcOn = (f) => show && q.reveal.includes(f);
      edgeOn = (o, f) => show && q.reveal.includes(f) && q.answer.includes(o);
      funcHot = funcOn; edgeHot = edgeOn;
      cellClass = (k) => {
        const picked = test.picks.has(k), right = q && q.answer.includes(k);
        return { 'is-picked': !test.checked && picked, 'is-correct': test.checked && right,
                 'is-wrong': test.checked && picked && !right };
      };
    }

    mapFuncs.forEach((g) => {
      const f = g.dataset.func;
      const on = mode !== 'build' && funcOn(f);
      setOn(g, 'is-on', on); setOn(g, 'is-hot', on && funcHot(f));
      const filled = mode === 'build' && !!build.placed[f];
      setOn(g, 'is-filled', filled);
      setOn(g, 'is-locked', mode === 'build' && build.locked.has(f));
      setOn(g, 'is-wrongslot', mode === 'build' && build.wrong.has(f));
      renderPlaced(g, mode === 'build' ? build.placed[f] : null);
      if (mode === 'build') {
        const t = filled && tileById(build.placed[f]);
        g.setAttribute('aria-label', build.locked.has(f) ? `${t.name}, correct` :
          filled ? `${t.name}. Tap to send back to the labels.` : 'Empty box. Tap to place the selected label.');
        g.setAttribute('tabindex', build.locked.has(f) ? '-1' : '0');
      } else {
        g.setAttribute('aria-label', on ? FUNCS[f].name : 'Hidden function. Tap to reveal.');
        g.setAttribute('tabindex', mode === 'explore' ? '0' : '-1');
      }
    });
    edges.forEach((g) => {
      const o = g.dataset.owner, f = g.dataset.func;
      let on, hot;
      if (!f) { // astrocyte trunk: on when any astrocyte branch is on
        on = CELLS.astro.funcs.some((ff) => edgeOn('astro', ff));
        hot = CELLS.astro.funcs.some((ff) => edgeOn('astro', ff) && edgeHot('astro', ff));
      } else { on = edgeOn(o, f); hot = on && edgeHot(o, f); }
      setOn(g, 'is-on', on); setOn(g, 'is-hot', hot);
    });
    [...mapCells, ...chips].forEach((n) => {
      const cls = cellClass(n.dataset.cell);
      ['is-selected', 'is-explored', 'is-picked', 'is-correct', 'is-wrong'].forEach((c) => setOn(n, c, cls[c]));
      if (n.matches('.cell-chip')) n.setAttribute('aria-pressed', String(!!(cls['is-selected'] || cls['is-picked'])));
    });
    body.classList.toggle('has-picked', mode === 'build' && !!build.picked);
  }

  /* Draws a placed label inside its box, wrapping and shrinking it to fit whichever box it was put in. */
  function renderPlaced(g, tileId) {
    const holder = g.querySelector('.placed');
    if (holder.dataset.tile === (tileId || '')) return;
    holder.dataset.tile = tileId || '';
    holder.textContent = '';
    if (!tileId) return;
    const r = g.querySelector('rect');
    const x = +r.getAttribute('x'), y = +r.getAttribute('y'), w = +r.getAttribute('width'), h = +r.getAttribute('height');
    const tile = tileById(tileId);
    const words = tile.name.split(' ');
    let best = null;
    if (slotKey(tile.func) === slotKey(g.dataset.func)) { // right box: use the figure's own line breaks
      const lines = g.dataset.lines.split('|');
      best = { lines, fs: Math.min(16.5, (h - 8) / (lines.length * 1.25)) };
    }
    const fixed = !!best;
    for (let n = 1; !fixed && n <= Math.min(3, words.length); n++) {
      const lines = wrap(words, n);
      const longest = Math.max(...lines.map((l) => l.length));
      const fs = Math.min(16.5, (w - 12) / (longest * 0.54), (h - 8) / (lines.length * 1.25));
      if (!best || fs > best.fs + 0.4) best = { lines, fs, auto: true };
    }
    const text = document.createElementNS(SVGNS, 'text');
    text.setAttribute('class', 'node-text placed-text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.style.fontSize = `${best.fs.toFixed(1)}px`;
    const lh = best.fs * 1.25, y0 = y + h / 2 - ((best.lines.length - 1) * lh) / 2;
    best.lines.forEach((line, i) => {
      const ts = document.createElementNS(SVGNS, 'tspan');
      ts.setAttribute('x', x + w / 2); ts.setAttribute('y', (y0 + i * lh).toFixed(1));
      ts.textContent = line; text.appendChild(ts);
    });
    holder.appendChild(text);
    try { // final safety check against the real rendered width
      const bw = text.getBBox().width;
      if (bw > w - 8) text.style.fontSize = `${(best.fs * (w - 8) / bw).toFixed(1)}px`;
    } catch (e) { /* not rendered yet */ }
  }
  function wrap(words, n) {
    if (n === 1) return [words.join(' ')];
    const total = words.join(' ').length, target = total / n, lines = [];
    let cur = '';
    words.forEach((wd, i) => {
      const next = cur ? `${cur} ${wd}` : wd;
      const left = words.length - i;
      if (cur && next.length > target && lines.length < n - 1 && left >= n - lines.length - 1) { lines.push(cur); cur = wd; }
      else cur = next;
    });
    lines.push(cur);
    return lines;
  }

  function renderProgress() {
    const n = explore.explored.size, total = Object.keys(CELLS).length;
    el.progressText.textContent = `${n} / ${total} cells explored`;
    el.progressBar.style.width = `${(n / total) * 100}%`;
  }

  function renderInfo() {
    const sel = explore.selected;
    el.infoEmpty.hidden = !!sel;
    el.infoBody.hidden = !sel;
    if (!sel) return;
    el.infoList.innerHTML = '';
    let lines;
    if (sel.type === 'cell') {
      const c = CELLS[sel.key];
      el.infoBody.classList.remove('no-art');
      el.infoArt.setAttribute('href', `#art-${sel.key}`);
      el.infoWhere.className = `where-chip ${c.system}`;
      el.infoWhere.textContent = c.system === 'pns' ? 'Peripheral nervous system' : 'Central nervous system';
      el.infoTitle.textContent = c.name;
      el.infoNote.hidden = !c.note; el.infoNote.textContent = c.note || '';
      lines = c.funcs.map((f) => STATEMENTS[`${sel.key}|${f}`]);
    } else {
      const f = FUNCS[sel.key];
      const systems = new Set(f.owners.map((o) => CELLS[o].system));
      el.infoBody.classList.add('no-art');
      el.infoWhere.className = `where-chip ${systems.size > 1 ? 'both' : [...systems][0]}`;
      el.infoWhere.textContent = systems.size > 1 ? 'Peripheral and central nervous system'
        : systems.has('pns') ? 'Peripheral nervous system' : 'Central nervous system';
      el.infoTitle.textContent = f.name;
      el.infoNote.hidden = true;
      lines = f.owners.map((o) => STATEMENTS[`${o}|${sel.key}`]);
    }
    lines.forEach((t) => { const li = document.createElement('li'); li.textContent = t; el.infoList.appendChild(li); });
  }

  /* ------------------------------------------------------------------ build-the-map rendering */
  function renderBuild() {
    const total = build.tiles.length;
    const placedCount = Object.keys(build.placed).length;
    const done = build.locked.size === total;
    el.buildCount.textContent = done ? `${total} / ${total} correct` : `${placedCount} / ${total} placed`;
    el.buildCheck.disabled = build.busy || done || placedCount < total;
    el.buildCheck.hidden = done;
    el.buildRestart.textContent = done ? 'Build again' : 'Start over';
    el.buildTitle.textContent = done ? 'Map complete' : 'Place every label in its box on the map.';
    el.buildHint.hidden = done;

    // tray: tiles not currently in a box, in their shuffled order
    const inTray = build.tiles.filter((t) => !slotOfTile(t.id));
    const have = new Set(inTray.map((t) => t.id));
    $$('.tile', el.tray).forEach((b) => { if (!have.has(b.dataset.tile)) b.remove(); });
    inTray.forEach((t) => {
      let b = el.tray.querySelector(`[data-tile="${t.id}"]`);
      if (!b) {
        b = document.createElement('button');
        b.type = 'button'; b.className = 'tile'; b.dataset.tile = t.id; b.textContent = t.name;
        b.setAttribute('role', 'listitem');
        bindTile(b);
      }
      el.tray.appendChild(b); // keeps order stable
      setOn(b, 'is-picked', build.picked === t.id);
      setOn(b, 'was-wrong', t.wasWrong);
      b.setAttribute('aria-pressed', String(build.picked === t.id));
    });
    el.tray.dataset.empty = inTray.length ? '' : (done ? 'done' : 'full');

    const fb = el.buildFeedback;
    fb.className = 'q-feedback';
    if (done) {
      fb.classList.add('done');
      fb.innerHTML = build.checks === 1
        ? `<strong>All ${total} correct on the first check.</strong>`
        : `<strong>All ${total} correct.</strong> Your first check had ${build.firstScore} of ${total} right, and you finished in ${build.checks} checks.`;
    } else if (build.lastResult) {
      const { right, wrong } = build.lastResult;
      fb.classList.add(wrong ? 'bad' : 'good');
      fb.innerHTML = `<strong>${right} of ${total} correct so far.</strong> ` +
        (wrong ? `The ${wrong === 1 ? 'label in red goes' : `${wrong} labels in red go`} back to the tray. Try ${wrong === 1 ? 'it' : 'them'} again.` : '');
    } else fb.textContent = '';
  }

  /* ------------------------------------------------------------------ test rendering */
  function renderQuiz() {
    const item = test.queue[test.pos];
    const retriesLeft = test.queue.slice(test.pos).filter((i) => i.retry).length;
    el.qFeedback.className = 'q-feedback';
    el.qCheck.hidden = test.done || test.checked;
    el.qNext.hidden = test.done || !test.checked;
    el.qRetake.hidden = !test.done;
    el.qScore.textContent = `First try ${test.firstTry} / ${test.total}`;
    if (test.done) {
      el.qCount.textContent = 'Round complete';
      el.qPrompt.textContent = test.firstTry === test.total ? 'All correct on the first try' : `All ${test.total} mastered`;
      el.qHint.textContent = 'Try again for a new order of questions.';
      el.qFeedback.classList.add('done');
      el.qFeedback.innerHTML = test.firstTry === test.total
        ? `You got all ${test.total} right on the first try.`
        : `You got ${test.firstTry} of ${test.total} right on the first try, then answered the rest correctly after ${test.retries} ${test.retries === 1 ? 'retry' : 'retries'}.`;
      return;
    }
    el.qCount.textContent = item.retry
      ? `Retry: ${retriesLeft} ${retriesLeft === 1 ? 'question' : 'questions'} left`
      : `Question ${test.pos + 1} of ${test.total}`;
    const q = item.q, need = q.answer.length;
    el.qPrompt.textContent = q.prompt;
    el.qHint.textContent = `Select ${need} ${need === 1 ? 'cell' : 'cells'}, then check your answer.`;
    el.qCheck.disabled = test.picks.size === 0;
    el.qNext.textContent = test.pos === test.queue.length - 1 ? 'See your result' : 'Next question';
    if (!test.checked) { el.qFeedback.textContent = ''; return; }
    const right = isAnswerRight(q);
    el.qFeedback.classList.add(right ? 'good' : 'bad');
    el.qFeedback.innerHTML = `<strong>${right ? 'Correct.' : 'Not quite.'}</strong> ${q.explain}` +
      (right ? '' : ' This question will come back at the end of the round.');
  }
  const isAnswerRight = (q) => q.answer.length === test.picks.size && q.answer.every((a) => test.picks.has(a));

  function render() {
    renderMap();
    renderProgress();
    renderInfo();
    if (mode === 'build') renderBuild();
    if (mode === 'test') renderQuiz();
  }

  /* ------------------------------------------------------------------ explore actions */
  function exploreCell(key) {
    explore.cells.add(key); explore.explored.add(key);
    explore.selected = { type: 'cell', key };
    render();
  }
  function exploreFunc(f) {
    explore.funcs.add(f);
    explore.selected = { type: 'func', key: f };
    render();
  }

  /* ------------------------------------------------------------------ build actions */
  function newBuild() {
    build.tiles = shuffle(Object.keys(FUNCS).map((f, i) => ({ id: `t${i}`, func: f, name: FUNCS[f].name, wasWrong: false })));
    build.placed = {}; build.locked.clear(); build.wrong.clear();
    build.picked = null; build.checks = 0; build.firstScore = null; build.lastResult = null; build.busy = false;
    el.tray.textContent = '';
    render();
  }
  function place(tileId, slot) {
    if (build.busy || build.locked.has(slot)) return;
    const from = slotOfTile(tileId);
    if (from) delete build.placed[from];
    const prev = build.placed[slot];
    if (prev && from) build.placed[from] = prev; // dragging between boxes swaps them
    build.placed[slot] = tileId;
    const t = tileById(tileId); t.wasWrong = false;
    build.picked = null;
    render();
  }
  function unplace(slot) {
    if (build.busy || build.locked.has(slot) || !build.placed[slot]) return;
    delete build.placed[slot];
    render();
  }
  function tapSlot(slot) {
    if (build.locked.has(slot)) return;
    if (build.picked) place(build.picked, slot);
    else if (build.placed[slot]) unplace(slot);
  }
  function checkBuild() {
    if (build.busy) return;
    build.checks++;
    const wrongSlots = [];
    const usedAstro = new Set([...build.locked].filter((s) => ASTRO_SLOTS.includes(s))
      .map((s) => slotKey(tileById(build.placed[s]).func)));
    Object.keys(build.placed).forEach((s) => {
      if (build.locked.has(s)) return;
      const label = slotKey(tileById(build.placed[s]).func);
      const isAstro = ASTRO_SLOTS.includes(s);
      if (accepts(s).has(label) && !(isAstro && usedAstro.has(label))) {
        build.locked.add(s);
        if (isAstro) usedAstro.add(label);
      } else wrongSlots.push(s);
    });
    if (build.firstScore === null) build.firstScore = build.locked.size;
    build.lastResult = { right: build.locked.size, wrong: wrongSlots.length };
    wrongSlots.forEach((s) => build.wrong.add(s));
    build.busy = wrongSlots.length > 0;
    render();
    if (!wrongSlots.length) return;
    setTimeout(() => { // show the red boxes briefly, then send those labels back
      wrongSlots.forEach((s) => { tileById(build.placed[s]).wasWrong = true; delete build.placed[s]; build.wrong.delete(s); });
      build.busy = false;
      render();
    }, 1400);
  }

  /* Drag and drop with pointer events (mouse, pen and touch), plus tap-to-select as the fallback. */
  let drag = null, suppressClick = false;
  function startPointer(e, tileId, sourceEl) {
    if (mode !== 'build' || build.busy || e.button > 0) return;
    drag = { id: tileId, x: e.clientX, y: e.clientY, src: sourceEl, ghost: null, over: null, pid: e.pointerId };
  }
  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pid) return;
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 7) return;
      const g = document.createElement('div');
      g.className = 'tile ghost'; g.textContent = tileById(drag.id).name;
      document.body.appendChild(g); drag.ghost = g;
      drag.src.classList.add('is-dragging');
      body.classList.add('is-dragging-tile');
    }
    e.preventDefault();
    drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -60%)`;
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const slot = hit && hit.closest('.map .func');
    const over = slot && !build.locked.has(slot.dataset.func) ? slot : null;
    if (drag.over !== over) { if (drag.over) drag.over.classList.remove('is-drop'); if (over) over.classList.add('is-drop'); drag.over = over; }
    drag.overTray = !!(hit && hit.closest('#tray'));
    // auto-scroll when the pointer nears the top or bottom edge, so far-away boxes stay reachable
    const edge = 70, yv = e.clientY;
    drag.scrollSpeed = yv > innerHeight - edge ? (yv - (innerHeight - edge)) / 3 : yv < edge ? -(edge - yv) / 3 : 0;
    drag.lastX = e.clientX; drag.lastY = e.clientY;
    if (drag.scrollSpeed && !drag.raf) autoScroll();
  }, { passive: false });
  function autoScroll() {
    if (!drag || !drag.scrollSpeed) { if (drag) drag.raf = null; return; }
    window.scrollBy(0, drag.scrollSpeed);
    const hit = document.elementFromPoint(drag.lastX, drag.lastY);
    const slot = hit && hit.closest('.map .func');
    const over = slot && !build.locked.has(slot.dataset.func) ? slot : null;
    if (drag.over !== over) { if (drag.over) drag.over.classList.remove('is-drop'); if (over) over.classList.add('is-drop'); drag.over = over; }
    drag.raf = requestAnimationFrame(autoScroll);
  }
  const endPointer = (e) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag; drag = null;
    if (d.raf) cancelAnimationFrame(d.raf);
    if (!d.ghost) return; // a tap: handled by the click event
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    d.ghost.remove(); d.src.classList.remove('is-dragging'); body.classList.remove('is-dragging-tile');
    if (d.over) { d.over.classList.remove('is-drop'); place(d.id, d.over.dataset.func); }
    else if (d.overTray) { const s = slotOfTile(d.id); if (s) unplace(s); }
  };
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);

  function bindTile(b) {
    b.addEventListener('pointerdown', (e) => startPointer(e, b.dataset.tile, b));
    b.addEventListener('click', () => {
      if (suppressClick || build.busy) return;
      build.picked = build.picked === b.dataset.tile ? null : b.dataset.tile;
      render();
    });
  }
  mapFuncs.forEach((g) => g.addEventListener('pointerdown', (e) => {
    const s = g.dataset.func;
    if (mode === 'build' && build.placed[s] && !build.locked.has(s) && !build.picked) startPointer(e, build.placed[s], g);
  }));

  /* ------------------------------------------------------------------ test actions */
  function newRound() {
    const qs = CORE_QUESTIONS.map((q) => (q.alt && Math.random() < .5 ? q.alt : q));
    test.queue = shuffle(qs).map((q) => ({ q, retry: false }));
    test.total = test.queue.length;
    test.pos = 0; test.firstTry = 0; test.retries = 0;
    test.picks.clear(); test.checked = false; test.done = false;
    render();
  }
  function pick(key) {
    if (test.checked || test.done) return;
    const q = test.queue[test.pos].q;
    if (q.answer.length === 1) { test.picks.clear(); test.picks.add(key); }
    else if (test.picks.has(key)) test.picks.delete(key);
    else test.picks.add(key);
    render();
  }
  function check() {
    if (!test.picks.size) return;
    const item = test.queue[test.pos];
    const right = isAnswerRight(item.q);
    if (right && !item.retry) test.firstTry++;
    if (item.retry) test.retries++;
    if (!right) test.queue.push({ q: item.q, retry: true }); // mastery loop: missed questions come back
    test.checked = true;
    render();
    el.qNext.focus({ preventScroll: true });
  }
  function next() {
    if (test.pos >= test.queue.length - 1) test.done = true;
    else test.pos++;
    test.picks.clear(); test.checked = false;
    render();
  }

  /* ------------------------------------------------------------------ mode switching */
  function setMode(m) {
    mode = m;
    ['explore', 'build', 'test'].forEach((k) => body.classList.toggle(`mode-${k}`, m === k));
    [['explore', el.exploreBtn], ['build', el.buildBtn], ['test', el.testBtn]].forEach(([k, b]) => {
      b.classList.toggle('active', m === k); b.setAttribute('aria-selected', String(m === k));
    });
    el.exploreActions.hidden = m !== 'explore';
    el.buildBar.hidden = m !== 'build';
    el.quizBar.hidden = m !== 'test';
    el.subtitle.innerHTML = SUBTITLES[m];
    el.listTitle.textContent = m === 'test' ? 'Or answer from this list' : 'Glial cells';
    if (m === 'test') newRound();
    else if (m === 'build' && !build.tiles.length) newBuild();
    else render();
  }

  /* ------------------------------------------------------------------ events */
  const activate = (node, fn) => {
    node.addEventListener('click', () => { if (!suppressClick) fn(); });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
    });
  };
  const onCell = (key) => { if (mode === 'explore') exploreCell(key); else if (mode === 'test') pick(key); };
  mapCells.forEach((g) => activate(g, () => onCell(g.dataset.cell)));
  chips.forEach((b) => b.addEventListener('click', () => onCell(b.dataset.cell)));
  mapFuncs.forEach((g) => activate(g, () => {
    if (mode === 'explore') exploreFunc(g.dataset.func);
    else if (mode === 'build') tapSlot(g.dataset.func);
  }));

  el.reset.addEventListener('click', () => {
    explore.explored.clear(); explore.cells.clear(); explore.funcs.clear(); explore.selected = null;
    render();
  });
  el.exploreBtn.addEventListener('click', () => setMode('explore'));
  el.buildBtn.addEventListener('click', () => setMode('build'));
  el.testBtn.addEventListener('click', () => setMode('test'));
  el.buildCheck.addEventListener('click', checkBuild);
  el.buildRestart.addEventListener('click', newBuild);
  el.qCheck.addEventListener('click', check);
  el.qNext.addEventListener('click', next);
  el.qRetake.addEventListener('click', newRound);

  render();
})();
