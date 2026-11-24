(() => {
  const replacements = {
    'at this point in time': 'now',
    'at the present time': 'now',
    'a large number of': 'many',
    'a small number of': 'a few',
    'due to the fact that': 'because',
    'in spite of the fact that': 'although',
    'despite the fact that': 'although',
    'in the event that': 'if',
    'in order to': 'to',
    'with the exception of': 'except for',
    'for the purpose of': 'for',
    'prior to': 'before',
    'subsequent to': 'after',
    'by means of': 'using',
    'with regard to': 'about',
    'has the ability to': 'can',
    'have the ability to': 'can',
    'had the ability to': 'could',
    'make a decision': 'decide',
    'makes a decision': 'decides',
    'made a decision': 'decided',
    'provide assistance': 'help',
    'provides assistance': 'helps',
    'provided assistance': 'helped',
    'utilise': 'use',
    'utilises': 'uses',
    'utilised': 'used',
    'utilising': 'using',
    'utilize': 'use',
    'utilizes': 'uses',
    'utilized': 'used',
    'utilizing': 'using',
    'approximately': 'about',
    'numerous': 'many',
  };

  const phrases = Object.keys(replacements).map((phrase) => phrase.replaceAll(' ', '[ \\t]+'));
  const wordCharacter = '[\\p{L}\\p{N}\\p{M}_]';
  const wording = new RegExp(`(?<!${wordCharacter})(?:${phrases.join('|')})(?!${wordCharacter})`, 'giu');
  const protectedText = /```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)|`[^`\r\n]*`|https?:\/\/[^\s<>]+|<[^<>\r\n]+>|\[[^\]\r\n]*\]\([^\r\n]*?\)|^ {0,3}>[^\r\n]*|“[^”\r\n]*”|"[^"\r\n]*"|‘[^\r\n]*?’(?!\p{L})/gmu;

  function preserveCase(match, replacement) {
    if (match === match.toUpperCase()) return replacement.toUpperCase();
    if (match[0] === match[0].toUpperCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  function rewriteText(text) {
    let edits = 0;
    const simplify = (part) => part.replace(wording, (match) => {
      const phrase = match.toLowerCase().replace(/[ \t]+/g, ' ');
      const replacement = replacements[phrase];
      if (!replacement) return match;
      edits++;
      return preserveCase(match, replacement);
    });

    let revised = '';
    let offset = 0;
    for (const match of text.matchAll(protectedText)) {
      revised += simplify(text.slice(offset, match.index)) + match[0];
      offset = match.index + match[0].length;
    }

    revised += simplify(text.slice(offset));
    return { revised, edits };
  }

  const draft = document.getElementById('draft');
  const button = document.getElementById('rewrite-draft');
  const panel = document.getElementById('rewrite-result');
  const output = document.getElementById('rewrite-output');
  const outcome = document.getElementById('rewrite-outcome');
  const status = document.getElementById('rewrite-status');
  const copyStatus = document.getElementById('rewrite-copy-status');

  button.addEventListener('click', () => {
    if (!draft.value.trim()) {
      status.textContent = 'Add some English text to your draft first.';
      draft.focus();
      return;
    }

    const { revised, edits } = rewriteText(draft.value);
    output.value = revised;
    outcome.textContent = edits === 0
      ? 'No wording changes suggested.'
      : `${edits} wording ${edits === 1 ? 'change' : 'changes'}. Review the result before using it.`;
    status.textContent = '';
    copyStatus.textContent = '';
    panel.hidden = false;
    output.focus();
  });

  draft.addEventListener('input', resetRevision);
  document.getElementById('clear').addEventListener('click', () => {
    if (!draft.value) resetRevision();
  });

  function resetRevision() {
    status.textContent = '';
    panel.hidden = true;
    output.value = '';
  }

  document.getElementById('copy-rewrite').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      copyStatus.textContent = 'Revision copied.';
    } catch {
      output.focus();
      output.select();
      copyStatus.textContent = 'Revision selected. Use your browser’s Copy command.';
    }
  });
})();
