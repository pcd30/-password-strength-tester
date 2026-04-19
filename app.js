'use strict';

const COMMON_PASSWORDS = new Set([
  'password','123456','12345678','qwerty','abc123','monkey','1234567',
  'letmein','trustno1','dragon','baseball','iloveyou','master','sunshine',
  'ashley','bailey','passw0rd','shadow','123123','654321','superman',
  'qazwsx','michael','football','password1','password123','admin','welcome',
  'login','hello','charlie','donald','password2','qwerty123','starwars',
  '123456789','1234567890','111111','000000','121212','123321','princess',
  'solo','zaq1zaq1','qwertyuiop','pass','test','ninja','azerty','1q2w3e4r',
]);

const DICT_WORDS = [
  'the','and','for','that','this','with','from','have','been','your',
  'which','would','could','should','about','there','their','when','what',
  'more','also','into','some','them','then','than','like','time','very',
  'just','come','over','back','only','after','know','such','most','make',
  'give','take','good','great','life','think','still','every','little',
  'name','long','through','before','place','right','world','home','work',
  'same','another','much','our','while','because','those','always','both',
  'between','high','keep','children','never','began','state','once','book',
  'hear','stop','without','second','later','miss','idea','enough','eat',
  'face','watch','far','indian','really','almost','let','above','girl',
  'sometimes','mountain','cut','young','talk','soon','list','song','being',
  'leave','family','move','body','music','color','stand','sun','questions',
  'fish','area','mark','dog','horse','birds','problem','complete','room',
  'knew','since','ever','piece','told','usually','didn','friends','easy',
  'heard','order','red','door','sure','become','top','ship','across',
  'today','however','sure','knew','it\'s','water','story','heart','fire',
  'admin','user','login','test','pass','welcome','hello','monkey','dragon',
  'master','batman','superman','spiderman','starwars','princess','sunshine',
  'flower','love','football','baseball','soccer','hockey','basketball',
  'summer','winter','spring','autumn','monday','friday','sunday','january',
  'iphone','android','google','apple','amazon','netflix','facebook','twitter',
];

const KEYBOARD_PATTERNS = [
  'qwerty','asdfgh','zxcvbn','qazwsx','1qaz2wsx',
  'qweasd','asdzxc','poiuyt','lkjhgf',
  'mnbvcx','qweasdzxc','!@#$%^&*',
];

function calcEntropy(pwd) {
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
  return pool > 0 ? Math.floor(pwd.length * Math.log2(pool)) : 0;
}

function formatTime(seconds) {
  if (seconds < 1) return { label: 'Instant', cls: 'ct-instant' };
  if (seconds < 60) return { label: `${Math.round(seconds)} sec`, cls: 'ct-instant' };
  if (seconds < 3600) return { label: `${Math.round(seconds/60)} min`, cls: 'ct-instant' };
  if (seconds < 86400) return { label: `${Math.round(seconds/3600)} hours`, cls: 'ct-short' };
  if (seconds < 2592000) return { label: `${Math.round(seconds/86400)} days`, cls: 'ct-short' };
  if (seconds < 31536000) return { label: `${Math.round(seconds/2592000)} months`, cls: 'ct-medium' };
  if (seconds < 3153600000) return { label: `${Math.round(seconds/31536000)} years`, cls: 'ct-long' };
  const yrs = seconds / 31536000;
  if (yrs < 1e6) return { label: `${(yrs/1000).toFixed(0)}K years`, cls: 'ct-long' };
  if (yrs < 1e9) return { label: `${(yrs/1e6).toFixed(0)}M years`, cls: 'ct-long' };
  if (yrs < 1e12) return { label: `${(yrs/1e9).toFixed(0)}B years`, cls: 'ct-long' };
  return { label: 'Heat death', cls: 'ct-long' };
}

function crackSeconds(entropy, guessesPerSec) {
  return Math.pow(2, entropy) / guessesPerSec / 2;
}

function hasSequence(pwd) {
  const p = pwd.toLowerCase();
  for (let i = 0; i < p.length - 2; i++) {
    const a = p.charCodeAt(i), b = p.charCodeAt(i+1), c = p.charCodeAt(i+2);
    if (b - a === 1 && c - b === 1) return true;
    if (a - b === 1 && b - c === 1) return true;
  }
  return false;
}

function hasKeyboardPattern(pwd) {
  const p = pwd.toLowerCase();
  return KEYBOARD_PATTERNS.some(pat => p.includes(pat));
}

function hasRepeatedChars(pwd) {
  return /(.)\1{2,}/.test(pwd);
}

function hasDatePattern(pwd) {
  return /\b(19|20)\d{2}\b/.test(pwd) ||
    /\b\d{1,2}[\/\-\.]\d{1,2}([\/\-\.]\d{2,4})?\b/.test(pwd) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(pwd);
}

function hasDictWord(pwd) {
  const p = pwd.toLowerCase();
  return DICT_WORDS.some(w => w.length >= 4 && p.includes(w));
}

function isCommon(pwd) {
  return COMMON_PASSWORDS.has(pwd.toLowerCase());
}

function getStrengthScore(pwd) {
  const e = calcEntropy(pwd);
  const checks = runChecks(pwd);
  const passCnt = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  if (pwd.length === 0) return { score: 0, level: 'none', label: '—', cls: '' };
  if (isCommon(pwd) || e < 20) return { score: 1, level: 'weak', label: 'WEAK', cls: 's-weak' };
  if (e < 40 || passCnt < 4) return { score: 2, level: 'fair', label: 'FAIR', cls: 's-fair' };
  if (e < 60 || passCnt < 7) return { score: 3, level: 'good', label: 'GOOD', cls: 's-good' };
  if (e < 80 || passCnt < 10) return { score: 4, level: 'strong', label: 'STRONG', cls: 's-strong' };
  return { score: 5, level: 'excellent', label: 'EXCELLENT', cls: 's-excellent' };
}

function runChecks(pwd) {
  return {
    chkLength: pwd.length >= 12,
    chkUpper: /[A-Z]/.test(pwd),
    chkLower: /[a-z]/.test(pwd),
    chkNumber: /[0-9]/.test(pwd),
    chkSymbol: /[^a-zA-Z0-9]/.test(pwd),
    chkNoRepeat: !hasRepeatedChars(pwd),
    chkNoSeq: !hasSequence(pwd),
    chkNoCommon: !isCommon(pwd),
    chkNoDict: !hasDictWord(pwd),
    chkNoKeyboard: !hasKeyboardPattern(pwd),
    chkNoDate: !hasDatePattern(pwd),
    chkEntropy: calcEntropy(pwd) >= 60,
  };
}

function getAdvisories(pwd, checks) {
  const msgs = [];
  if (!checks.chkNoCommon) msgs.push({ type: 'bad', text: 'This is a commonly used password — avoid it entirely.' });
  if (!checks.chkLength) msgs.push({ type: 'warn', text: `Password is only ${pwd.length} chars. Use at least 12.` });
  if (!checks.chkUpper || !checks.chkLower) msgs.push({ type: 'warn', text: 'Mix uppercase and lowercase letters to expand the character set.' });
  if (!checks.chkNumber) msgs.push({ type: 'info', text: 'Adding numeric digits increases entropy significantly.' });
  if (!checks.chkSymbol) msgs.push({ type: 'info', text: 'Special characters (!@#$...) greatly increase resistance to brute-force.' });
  if (!checks.chkNoRepeat) msgs.push({ type: 'warn', text: 'Repeated character sequences reduce effective entropy.' });
  if (!checks.chkNoSeq) msgs.push({ type: 'warn', text: 'Sequential characters (abc, 123) are easily guessed.' });
  if (!checks.chkNoKeyboard) msgs.push({ type: 'bad', text: 'Keyboard patterns (qwerty, asdfgh) are among the first guessed.' });
  if (!checks.chkNoDate) msgs.push({ type: 'warn', text: 'Date patterns are predictable — avoid birthdays and years.' });
  if (!checks.chkNoDict) msgs.push({ type: 'warn', text: 'Common words found — dictionary attacks target these directly.' });
  if (!checks.chkEntropy) msgs.push({ type: 'info', text: `Entropy is ${calcEntropy(pwd)} bits. Aim for ≥ 60 bits for adequate security.` });

  const passCount = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  if (passCount === total) msgs.push({ type: 'good', text: 'All security checks passed. Excellent password!' });
  else if (passCount >= 8) msgs.push({ type: 'good', text: `${passCount}/${total} checks passed. Strong foundation — address remaining warnings.` });
  return msgs;
}

function analyzePassword(pwd) {
  const el = id => document.getElementById(id);
  const meterSection = document.querySelector('.analyzer-card');

  ['s-weak','s-fair','s-good','s-strong','s-excellent'].forEach(c => meterSection.classList.remove(c));

  if (pwd.length === 0) {
    el('strengthLabel').textContent = '—';
    el('meterFill').style.width = '0%';
    el('meterFill').style.background = '';
    el('entropyValue').textContent = '0 bits';
    resetStats();
    resetChecks();
    el('advisoryLog').innerHTML = '<p class="advisory-idle">// Awaiting input...</p>';
    resetCrack();
    return;
  }

  const entropy = calcEntropy(pwd);
  const strength = getStrengthScore(pwd);
  const checks = runChecks(pwd);

  if (strength.cls) meterSection.classList.add(strength.cls);
  el('strengthLabel').textContent = strength.label;
  el('entropyValue').textContent = `${entropy} bits`;

  el('statLen').textContent = pwd.length;
  el('statUpper').textContent = (pwd.match(/[A-Z]/g) || []).length;
  el('statLower').textContent = (pwd.match(/[a-z]/g) || []).length;
  el('statNum').textContent = (pwd.match(/[0-9]/g) || []).length;
  el('statSym').textContent = (pwd.match(/[^a-zA-Z0-9]/g) || []).length;
  el('statUniq').textContent = new Set(pwd).size;

  Object.entries(checks).forEach(([key, pass]) => {
    const item = el(key);
    if (!item) return;
    item.classList.toggle('pass', pass);
    item.classList.toggle('fail', !pass);
    const icon = item.querySelector('.check-icon');
    icon.textContent = pass ? '◆' : '✕';
  });

  const times = [
    ['crackOnline', 100],
    ['crackOnlineFast', 10000],
    ['crackOffline', 1e10],
    ['crackBcrypt', 20000],
  ];

  times.forEach(([elId, rate]) => {
    const secs = crackSeconds(entropy, rate);
    const fmt = formatTime(secs);
    const cel = el(elId);
    cel.textContent = fmt.label;
    cel.className = 'crack-time ' + fmt.cls;
  });

  const advisories = getAdvisories(pwd, checks);
  el('advisoryLog').innerHTML = advisories.map(a =>
    `<div class="advisory-item ${a.type}">${a.text}</div>`
  ).join('');
}

function resetStats() {
  ['statLen','statUpper','statLower','statNum','statSym','statUniq'].forEach(id => {
    document.getElementById(id).textContent = '0';
  });
}

function resetChecks() {
  document.querySelectorAll('.check-item').forEach(item => {
    item.className = 'check-item';
    item.querySelector('.check-icon').textContent = '■';
  });
}

function resetCrack() {
  ['crackOnline','crackOnlineFast','crackOffline','crackBcrypt'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '—';
    el.className = 'crack-time';
  });
}

function generatePassword() {
  const len = parseInt(document.getElementById('genLen').value);
  const useUpper = document.getElementById('genUpper').checked;
  const useLower = document.getElementById('genLower').checked;
  const useNum = document.getElementById('genNum').checked;
  const useSym = document.getElementById('genSym').checked;

  let chars = '';
  let guaranteed = [];

  if (useUpper) { chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; guaranteed.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); }
  if (useLower) { chars += 'abcdefghijklmnopqrstuvwxyz'; guaranteed.push('abcdefghijklmnopqrstuvwxyz'); }
  if (useNum) { chars += '0123456789'; guaranteed.push('0123456789'); }
  if (useSym) { chars += '!@#$%^&*()-_=+[]{}|;:,.<>?'; guaranteed.push('!@#$%^&*()-_=+[]{}|;:,.<>?'); }

  if (!chars) { document.getElementById('genOutput').textContent = '// Select at least one option'; return; }

  const arr = new Uint32Array(len + guaranteed.length);
  crypto.getRandomValues(arr);

  let pwd = guaranteed.map((g, i) => g[arr[i] % g.length]);

  for (let i = guaranteed.length; i < len; i++) {
    pwd.push(chars[arr[i] % chars.length]);
  }

  for (let i = pwd.length - 1; i > 0; i--) {
    const j = arr[i] % (i + 1);
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }

  document.getElementById('genOutput').textContent = pwd.join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('passwordInput');
  const toggleBtn = document.getElementById('toggleBtn');
  const genLen = document.getElementById('genLen');
  const lenDisplay = document.getElementById('lenDisplay');
  const btnGenerate = document.getElementById('btnGenerate');
  const btnCopy = document.getElementById('btnCopy');

  input.addEventListener('input', () => analyzePassword(input.value));

  toggleBtn.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    toggleBtn.style.color = input.type === 'text' ? 'var(--accent)' : '';
  });

  genLen.addEventListener('input', () => { lenDisplay.textContent = genLen.value; });

  btnGenerate.addEventListener('click', generatePassword);

  btnCopy.addEventListener('click', () => {
    const text = document.getElementById('genOutput').textContent;
    if (!text || text.startsWith('//')) return;
    navigator.clipboard.writeText(text).then(() => {
      btnCopy.textContent = 'Copied!';
      btnCopy.classList.add('copied');
      setTimeout(() => {
        btnCopy.textContent = 'Copy';
        btnCopy.classList.remove('copied');
      }, 1800);
    });
  });
});
