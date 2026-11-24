(() => {
  const host = document.getElementById('probe-widget');
  const report = document.getElementById('probe-status');
  const state = { messages: {}, heights: [] };
  window.addEventListener('message', (event) => {
    const frame = host.querySelector('iframe');
    if (event.origin !== 'https://widgets.cleverhumanizer.ai' || event.source !== frame?.contentWindow) return;
    const { type, height, rects } = event.data ?? {};
    if (type === 'clever:resize' && Number.isFinite(height)) state.heights.push(height);
    if (type === 'clever:credit' && Array.isArray(rects)) state.messages.credit = rects.map(({x,y,width,height}) => ({x,y,width,height}));
    if (state.heights.length > 8) state.heights.shift();
    report.textContent = JSON.stringify(state);
  });
})();