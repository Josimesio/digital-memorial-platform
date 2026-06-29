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

function describeAudioError() {
  if (!favoriteMusic) return 'Não encontrei o player de áudio na página.';

  const error = favoriteMusic.error;

  if (favoriteMusic.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || !error) {
    return 'Não consegui carregar a música. Confira se o arquivo está em assets/musica-preferida.mp3, com hífen e letras minúsculas.';
  }

  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return 'A reprodução foi interrompida pelo navegador.';
    case MediaError.MEDIA_ERR_NETWORK:
      return 'Erro de rede ao carregar a música. Teste usando Live Server ou hospedagem HTTP.';
    case MediaError.MEDIA_ERR_DECODE:
      return 'O arquivo foi encontrado, mas o navegador não conseguiu decodificar. Exporte novamente como MP3 comum.';
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Formato não suportado ou caminho inválido. Use MP3, M4A ou OGG com o nome correto.';
    default:
      return 'Não foi possível tocar a música. Confira o caminho, o nome e o formato do arquivo.';
  }
}

async function playFavoriteMusic(triggeredByUser = false) {
  if (!favoriteMusic) return;

  try {
    favoriteMusic.muted = false;
    favoriteMusic.volume = 0.65;

    // Força o navegador a recarregar o arquivo caso ele tenha sido colocado depois.
    if (favoriteMusic.readyState === 0) {
      favoriteMusic.load();
    }

    await favoriteMusic.play();
    setMusicUi(true, 'Música tocando com respeito e suavidade.');
  } catch (error) {
    const message = describeAudioError();
    setMusicUi(false, message);

    if (triggeredByUser) {
      alert(message);
    }
  }
}

function pauseFavoriteMusic() {
  if (!favoriteMusic) return;
  favoriteMusic.pause();
  setMusicUi(false, 'Música pausada.');
}

if (favoriteMusic) {
  favoriteMusic.addEventListener('canplay', () => {
    if (musicStatus && !favoriteMusic.paused) {
      musicStatus.textContent = 'Música carregada e tocando.';
    } else if (musicStatus) {
      musicStatus.textContent = 'Música carregada. Toque em “Tocar”.';
    }
  });

  favoriteMusic.addEventListener('play', () => {
    setMusicUi(true, 'Música tocando com respeito e suavidade.');
  });

  favoriteMusic.addEventListener('pause', () => {
    setMusicUi(false, 'Música pausada.');
  });

  favoriteMusic.addEventListener('error', () => {
    setMusicUi(false, describeAudioError());
  });
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
