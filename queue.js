(() => {
  const maxWords = 1500;
  const minWords = 30;

  function splitDraft(text) {
    const words = [...text.matchAll(/\S+/gu)];
    const portions = [];

    for (let start = 0; start < words.length;) {
      let end = Math.min(start + maxWords, words.length);
      if (end < words.length) {
        // Leave enough words for Clever to accept the final portion.
        end = Math.min(end, words.length - minWords);
        const searchStart = Math.max(start + minWords, end - 120);
        let sentenceEnd;
        for (let position = end; position >= searchStart; position--) {
          const previous = words[position - 1];
          const gap = text.slice(previous.index + previous[0].length, words[position].index);
          if (/\n[^\S\n]*\n/u.test(gap)) {
            end = position;
            break;
          }
          if (!sentenceEnd && /[.!?…][”’"')\]]*$/u.test(previous[0])) {
            sentenceEnd = position;
          }
          if (position === searchStart && sentenceEnd) end = sentenceEnd;
        }
      }

      const last = words[end - 1];
      const endOffset = last.index + last[0].length;
      portions.push({
        text: text.slice(words[start].index, endOffset),
        words: end - start,
        separator: end < words.length ? text.slice(endOffset, words[end].index) : '',
        result: '',
      });
      start = end;
    }

    return portions;
  }

  const byId = (id) => document.getElementById(`queue-${id}`);
  const setup = byId('setup');
  const draft = byId('draft');
  const current = byId('current');
  const previous = byId('previous');
  const next = byId('next');
  const saveNext = byId('save-next');
  const copyPortion = byId('copy');
  const portion = byId('portion');
  const result = byId('result');
  const progress = byId('progress');
  const combinedPanel = byId('combined-panel');
  const combined = byId('combined');
  const message = byId('status');
  let portions = [];
  let active = 0;

  function refreshProgress() {
    const saved = portions.filter((entry) => entry.result.trim()).length;
    const progressText = `Portion ${active + 1} of ${portions.length} · ${portions[active].words} words · ${saved} results collected`;
    if (progress.textContent !== progressText) progress.textContent = progressText;
    if (saveNext) saveNext.disabled = next.disabled || !result.value.trim();

    const complete = saved === portions.length;
    combinedPanel.hidden = !complete;
    combined.value = complete ? portions.map((entry) => entry.result.trim() + entry.separator).join('') : '';
  }

  function showPortion() {
    portion.value = portions[active].text;
    result.value = portions[active].result;
    previous.disabled = active === 0;
    next.disabled = active === portions.length - 1;
    message.textContent = '';
    refreshProgress();
  }

  async function copyField(field, successMessage, fallbackMessage = 'Text selected. Use your browser’s Copy command.') {
    try {
      await navigator.clipboard.writeText(field.value);
      message.textContent = successMessage;
    } catch {
      field.focus();
      field.select();
      message.textContent = fallbackMessage;
    }
  }

  byId('create').addEventListener('click', () => {
    const split = splitDraft(draft.value);
    if (!split.length || split[0].words < minWords) {
      message.textContent = 'Enter at least 30 words to use Clever.';
      draft.focus();
      return;
    }
    portions = split;
    active = 0;
    draft.value = '';
    setup.hidden = true;
    current.hidden = false;
    showPortion();
    copyPortion.focus();
  });

  previous.addEventListener('click', () => {
    active--;
    showPortion();
    if (previous.disabled) copyPortion.focus();
  });

  next.addEventListener('click', () => {
    active++;
    showPortion();
    if (next.disabled) copyPortion.focus();
  });

  saveNext?.addEventListener('click', () => {
    if (saveNext.disabled) return;
    portions[active].result = result.value;
    active++;
    showPortion();
    copyPortion.focus({ preventScroll: true });
    return copyField(
      portion,
      'Result saved in this tab. Next portion copied. Paste it into Clever.',
      'Result saved in this tab. Next portion selected. Use your browser’s Copy command.',
    );
  });

  copyPortion.addEventListener('click', () => copyField(portion, 'Portion copied. Paste it into Clever when ready.'));
  byId('copy-combined').addEventListener('click', () => copyField(combined, 'Combined text copied.'));

  result.addEventListener('input', () => {
    portions[active].result = result.value;
    message.textContent = '';
    refreshProgress();
  });

  byId('clear').addEventListener('click', () => {
    portions = [];
    active = 0;
    portion.value = '';
    result.value = '';
    combined.value = '';
    combinedPanel.hidden = true;
    progress.textContent = '';
    current.hidden = true;
    setup.hidden = false;
    message.textContent = 'Queue cleared.';
    draft.focus();
  });
})();
