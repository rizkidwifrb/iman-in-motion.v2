const QUICK_REPLIES = [
  'Aku lagi sedih',
  'Aku butuh hidayah',
  'Aku lagi marah',
  'Rekomendasikan film yang menenangkan'
];

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function bubbleHtml(type, text) {
  return `<div class="bubble ${type}">${escapeHtml(text)}</div>`;
}

function addBubble(target, type, text) {
  target.insertAdjacentHTML('beforeend', bubbleHtml(type, text));
  target.scrollTop = target.scrollHeight;
}

async function sendToAiman(message) {
  const r = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!r.ok) throw new Error('chat failed');
  return r.json();
}

export function initAimanWidget({ onMoodDetected } = {}) {
  const bubbles = document.getElementById('miniChatBubbles');
  const form = document.getElementById('miniChatForm');
  const input = document.getElementById('miniChatInput');
  const cta = document.getElementById('miniChatCTA');
  const micBtn = document.getElementById('micBtn');
  if (!bubbles || !form || !input || form.dataset.aimanReady === 'true') return;
  form.dataset.aimanReady = 'true';

  addBubble(bubbles, 'bot', 'Assalamualaikum. Ceritakan dulu perasaanmu, aku temani pelan-pelan.');
  if (cta) cta.textContent = 'AIMAN bukan pengganti ustaz/konselor, tapi teman refleksi awal.';

  const quickWrap = document.createElement('div');
  quickWrap.className = 'mini-chat-quick-replies';
  quickWrap.style.display = 'flex';
  quickWrap.style.flexWrap = 'wrap';
  quickWrap.style.gap = '8px';
  quickWrap.style.marginBottom = '8px';
  quickWrap.innerHTML = QUICK_REPLIES.map((q) => `<button type="button" class="btn" style="height:auto;padding:6px 10px;font-size:.78rem">${escapeHtml(q)}</button>`).join('');
  bubbles.parentElement.insertBefore(quickWrap, bubbles);

  quickWrap.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent;
      form.requestSubmit();
    });
  });

  if (micBtn) {
    micBtn.setAttribute('aria-label', micBtn.getAttribute('aria-label') || 'Input suara AIMAN');
    micBtn.addEventListener('click', () => {
      input.focus();
      input.placeholder = 'Voice belum aktif. Silakan ketik perasaanmu.';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addBubble(bubbles, 'user', message);
    input.value = '';

    const typingId = `typing-${Date.now()}`;
    bubbles.insertAdjacentHTML('beforeend', `<div id="${typingId}" class="bubble bot">AIMAN sedang menulis...</div>`);
    bubbles.scrollTop = bubbles.scrollHeight;

    try {
      const data = await sendToAiman(message);
      document.getElementById(typingId)?.remove();
      const cleanReply = String(data.reply || 'Aku mendengarmu.').replace(/\[MOOD:.*?\]|\[FILM:.*?\]/gi, '').trim();
      addBubble(bubbles, 'bot', cleanReply);
      if (data.mood && typeof onMoodDetected === 'function') onMoodDetected(String(data.mood).toLowerCase());
    } catch (err) {
      document.getElementById(typingId)?.remove();
      addBubble(bubbles, 'bot', 'Koneksi AI sedang tidak stabil. Aku tetap bisa bantu pakai mood pilihanmu.');
    }
  });
}