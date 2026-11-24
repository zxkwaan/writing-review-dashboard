const openWidget = document.getElementById('load-clever');
const frameContainer = document.getElementById('clever-frame');
const status = document.getElementById('clever-status');

openWidget.addEventListener('click', () => {
  const frame = document.createElement('iframe');
  frame.title = 'Clever Humanizer';
  frame.height = '750';
  frame.referrerPolicy = 'origin';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
  frame.allow = 'clipboard-write';
  frame.src = openWidget.dataset.embedSrc;
  frameContainer.append(frame);
  status.textContent = 'Clever widget opened below.';
  openWidget.disabled = true;
}, { once: true });
