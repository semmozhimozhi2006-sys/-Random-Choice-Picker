// --- Elements ---
const input = document.getElementById('choicesInput');
const tagsBox = document.getElementById('tags');
const pickBtn = document.getElementById('pickBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const resultText = document.getElementById('resultText');

let animating = false;
let lastPick = "";

// --- Helpers ---
function parseChoices(text) {
  return text
    .replace(/\n/g, ',')           // allow new lines or commas
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);               // remove empty
}

function renderTags(choices) {
  tagsBox.innerHTML = '';
  choices.forEach(ch => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = ch;
    tagsBox.appendChild(tag);
  });
}

function getRandomIndex(n) {
  return Math.floor(Math.random() * n);
}

function getTagElements() {
  return Array.from(tagsBox.querySelectorAll('.tag'));
}

function setResult(text) {
  resultText.textContent = text || '—';
  lastPick = text || "";
}

// --- Main actions ---
function pickRandom() {
  const choices = parseChoices(input.value);
  renderTags(choices);

  if (!choices.length) {
    setResult('Add some options first 📝');
    return;
  }

  const tags = getTagElements();
  if (!tags.length) return;

  // Prevent double-run
  if (animating) return;
  animating = true;
  pickBtn.disabled = true;

  // Fun highlight animation
  let currentActive = null;
  const hops = 20;           // how many flashes
  const intervalMs = 80;     // speed
  let count = 0;

  const interval = setInterval(() => {
    if (currentActive) currentActive.classList.remove('active');
    currentActive = tags[getRandomIndex(tags.length)];
    currentActive.classList.add('active');
    count++;

    if (count >= hops) {
      clearInterval(interval);

      // Final selection
      setTimeout(() => {
        if (currentActive) currentActive.classList.remove('active');
        const finalTag = tags[getRandomIndex(tags.length)];
        finalTag.classList.add('active');
        setResult(finalTag.textContent);

        animating = false;
        pickBtn.disabled = false;
      }, 120);
    }
  }, intervalMs);
}

function clearAll() {
  input.value = '';
  renderTags([]);
  setResult('');
  input.focus();
}

async function copyResult() {
  if (!lastPick) return;
  try {
    await navigator.clipboard.writeText(lastPick);
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = original), 900);
  } catch {
    alert('Copy failed. You can select and copy manually.');
  }
}

// --- Wire up events ---
input.addEventListener('input', () => {
  renderTags(parseChoices(input.value));
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();        // keep textarea tidy
    pickRandom();
  }
});

pickBtn.addEventListener('click', pickRandom);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyResult);

// Render initial (empty)
renderTags([]);
setResult('');
