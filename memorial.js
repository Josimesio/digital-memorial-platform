const AUTH_KEY = 'memorial_auth';
const LOGIN_PAGE = 'index.html';

if (sessionStorage.getItem(AUTH_KEY) !== 'true') {
  window.location.replace(LOGIN_PAGE);
}

const logoutButton = document.querySelector('#logoutButton');
const candleCount = document.querySelector('#candleCount');
const lightCandleButton = document.querySelector('#lightCandleButton');
const messageForm = document.querySelector('#messageForm');
const visitorName = document.querySelector('#visitorName');
const visitorMessage = document.querySelector('#visitorMessage');
const messagesList = document.querySelector('#messagesList');
const favoriteMusic = document.querySelector('#favoriteMusic');
const playMusicButton = document.querySelector('#playMusicButton');
const pauseMusicButton = document.querySelector('#pauseMusicButton');
const musicStatus = document.querySelector('#musicStatus');

const STORAGE_CANDLES = 'pedro_memorial_candles';
const STORAGE_MESSAGES = 'pedro_memorial_messages';

const defaultMessages = [
  {
    name: 'Família',
    text: 'Este espaço guarda as lembranças, o respeito e o amor por Pedro Baptista Pereira Neto.',
    date: 'Mensagem inicial'
  },
  {
    name: 'Memorial Online',
    text: 'Aqui visitantes podem deixar palavras de carinho, histórias e orações.',
    date: 'Exemplo'
  }
];

function getCandles() {
  return Number(localStorage.getItem(STORAGE_CANDLES) || '0');
}

function setCandles(value) {
  localStorage.setItem(STORAGE_CANDLES, String(value));
  candleCount.textContent = String(value);
}

function loadMessages() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_MESSAGES));
    return Array.isArray(stored) && stored.length ? stored : defaultMessages;
  } catch (error) {
    return defaultMessages;
  }
}

function saveMessages(messages) {
  localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
}

function renderMessages() {
  const messages = loadMessages();
  messagesList.innerHTML = messages.map((message) => `
    <article class="message-item">
      <div>
        <strong>${escapeHtml(message.name)}</strong>
        <span>${escapeHtml(message.date)}</span>
      </div>
      <p>${escapeHtml(message.text)}</p>
    </article>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function todayLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());
}

function setMusicUi(isPlaying, message) {
  if (!favoriteMusic || !playMusicButton || !pauseMusicButton || !musicStatus) return;

  playMusicButton.disabled = isPlaying;
  pauseMusicButton.disabled = !isPlaying;
  playMusicButton.textContent = isPlaying ? 'Tocando...' : '▶ Tocar';
  musicStatus.textContent = message;
}

async function playFavoriteMusic(triggeredByUser = false) {
  if (!favoriteMusic) return;

  try {
    favoriteMusic.volume = 0.65;
    await favoriteMusic.play();
    setMusicUi(true, 'Música tocando com respeito e suavidade.');
  } catch (error) {
    const missingFile = favoriteMusic.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
    setMusicUi(false, missingFile
      ? 'Adicione o arquivo assets/musica-preferida.mp3 para ativar a música.'
      : 'O celular bloqueou o início automático. Toque em “Tocar”.');

    if (triggeredByUser && missingFile) {
      alert('Coloque um arquivo chamado musica-preferida.mp3 dentro da pasta assets.');
    }
  }
}

function pauseFavoriteMusic() {
  if (!favoriteMusic) return;
  favoriteMusic.pause();
  setMusicUi(false, 'Música pausada.');
}

if (playMusicButton) {
  playMusicButton.addEventListener('click', () => playFavoriteMusic(true));
}

if (pauseMusicButton) {
  pauseMusicButton.addEventListener('click', pauseFavoriteMusic);
}

window.addEventListener('load', () => {
  if (sessionStorage.getItem('memorial_try_music') === 'true') {
    sessionStorage.removeItem('memorial_try_music');
    playFavoriteMusic(false);
  }
});

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem('memorial_access_mode');
  sessionStorage.removeItem('memorial_person');
  window.location.href = LOGIN_PAGE;
});

lightCandleButton.addEventListener('click', () => {
  const next = getCandles() + 1;
  setCandles(next);
  lightCandleButton.textContent = 'Vela acesa ✨';
  window.setTimeout(() => {
    lightCandleButton.textContent = 'Acender outra vela';
  }, 1200);
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = visitorName.value.trim();
  const text = visitorMessage.value.trim();

  if (!name || !text) {
    alert('Informe seu nome e uma mensagem.');
    return;
  }

  const messages = loadMessages();
  messages.unshift({ name, text, date: todayLabel() });
  saveMessages(messages.slice(0, 20));

  visitorName.value = '';
  visitorMessage.value = '';
  renderMessages();
});

setCandles(getCandles());
renderMessages();
