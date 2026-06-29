const form = document.querySelector('#loginForm');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const memorialCode = document.querySelector('#memorialCode');
const togglePassword = document.querySelector('#togglePassword');
const switchMode = document.querySelector('#switchMode');
const submitButton = document.querySelector('#submitButton');
const submitText = document.querySelector('#submitText');
const statusMessage = document.querySelector('#statusMessage');
const modeDescription = document.querySelector('#modeDescription');
const forgotPassword = document.querySelector('#forgotPassword');
const recoveryModal = document.querySelector('#recoveryModal');
const recoveryEmail = document.querySelector('#recoveryEmail');

const emailError = document.querySelector('#emailError');
const passwordError = document.querySelector('#passwordError');
const codeError = document.querySelector('#codeError');

const accountFields = [...document.querySelectorAll('.account-field')];
const codeFields = [...document.querySelectorAll('.code-field')];
const accountActions = document.querySelector('.account-actions');

let loginMode = 'account';

const DEMO_ACCOUNT = {
  email: 'memorial@gmail.com',
  password: '1234'
};

const DEMO_CODE = 'memorial2026';
const MEMORIAL_PAGE = 'inmemorian_Pedro_Baptista_Pereira_neto.html';

function clearStatus() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}

function showStatus(type, message) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message is-${type}`;
}

function setError(element, message) {
  element.textContent = message || '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitText.textContent = isLoading ? 'Acessando...' : 'Acessar memorial';
}

function setMode(mode) {
  loginMode = mode;
  clearStatus();
  setError(emailError, '');
  setError(passwordError, '');
  setError(codeError, '');

  const useCode = mode === 'code';
  accountFields.forEach((field) => field.classList.toggle('is-hidden', useCode));
  codeFields.forEach((field) => field.classList.toggle('is-hidden', !useCode));
  accountActions.classList.toggle('is-hidden', useCode);

  switchMode.textContent = useCode ? 'Entrar com e-mail e senha' : 'Entrar com código do memorial';
  modeDescription.textContent = useCode
    ? 'Digite o código do memorial para visualizar a homenagem.'
    : 'Use o e-mail cadastrado para acessar o memorial.';

  window.setTimeout(() => {
    if (useCode) {
      memorialCode.focus({ preventScroll: true });
    } else {
      email.focus({ preventScroll: true });
    }
  }, 80);
}

function validateAccount() {
  let valid = true;

  if (!isValidEmail(email.value)) {
    setError(emailError, 'Informe um e-mail válido.');
    valid = false;
  } else {
    setError(emailError, '');
  }

  if (password.value.trim().length < 1) {
    setError(passwordError, 'Informe a senha.');
    valid = false;
  } else {
    setError(passwordError, '');
  }

  return valid;
}

function validateCode() {
  const value = memorialCode.value.trim();

  if (value.length < 4) {
    setError(codeError, 'Informe o código do memorial.');
    return false;
  }

  setError(codeError, '');
  return true;
}

function authenticateAccount() {
  const typedEmail = email.value.trim().toLowerCase();
  const typedPassword = password.value.trim();

  return typedEmail === DEMO_ACCOUNT.email && typedPassword === DEMO_ACCOUNT.password;
}

function authenticateCode() {
  return memorialCode.value.trim().toLowerCase() === DEMO_CODE.toLowerCase();
}

function authorizeAndRedirect(accessMode) {
  sessionStorage.setItem('memorial_auth', 'true');
  sessionStorage.setItem('memorial_access_mode', accessMode);
  sessionStorage.setItem('memorial_person', 'Pedro Baptista Pereira Neto');
  sessionStorage.setItem('memorial_try_music', 'true');
  localStorage.setItem('memorial_last_email', email.value.trim());

  showStatus('success', 'Acesso confirmado. Abrindo memorial...');
  window.setTimeout(() => {
    window.location.href = MEMORIAL_PAGE;
  }, 500);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearStatus();

  const valid = loginMode === 'account' ? validateAccount() : validateCode();
  if (!valid) return;

  setLoading(true);

  window.setTimeout(() => {
    setLoading(false);

    if (loginMode === 'account') {
      if (authenticateAccount()) {
        authorizeAndRedirect('email');
      } else {
        showStatus('error', 'Acesso negado. Use: memorial@gmail.com / 1234');
      }
      return;
    }

    if (authenticateCode()) {
      authorizeAndRedirect('codigo');
    } else {
      showStatus('error', 'Código inválido. Use: memorial2026');
    }
  }, 450);
});

switchMode.addEventListener('click', () => {
  setMode(loginMode === 'account' ? 'code' : 'account');
});

togglePassword.addEventListener('click', () => {
  const shouldShow = password.type === 'password';
  password.type = shouldShow ? 'text' : 'password';
  togglePassword.setAttribute('aria-label', shouldShow ? 'Ocultar senha' : 'Mostrar senha');
  togglePassword.setAttribute('aria-pressed', String(shouldShow));
});

forgotPassword.addEventListener('click', () => {
  clearStatus();
  if (typeof recoveryModal.showModal === 'function') {
    recoveryEmail.value = email.value.trim();
    recoveryModal.showModal();
    recoveryEmail.focus();
  } else {
    showStatus('success', 'Protótipo: recuperação será feita pelo backend.');
  }
});

if (recoveryModal) {
  recoveryModal.addEventListener('close', () => {
    if (recoveryModal.returnValue === 'default') {
      showStatus('success', 'Solicitação registrada. Em produção, o link seguro será enviado por e-mail.');
    }
  });
}

[email, password, memorialCode].forEach((field) => {
  field.addEventListener('input', clearStatus);
});

const savedEmail = localStorage.getItem('memorial_last_email');
if (savedEmail) {
  email.value = savedEmail;
}
