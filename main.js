/* ═══════════════════════════════════════════════════════════
   AI Hub — Shared JavaScript (main.js)
   FAQ Toggle, Modal, Nav Highlight
   ═══════════════════════════════════════════════════════════ */

/* ─── FAQ Toggle ─── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ─── Smooth nav highlight on scroll ─── */
(function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 100) current = s.id;
      });
      navLinks.forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('#')) {
          a.style.color = href === '#' + current ? 'var(--cyan)' : '';
        }
      });
    });
  }
})();

/* ═══════════════════════════════════════════════════════════
   CONSULTATION MODAL
   ═══════════════════════════════════════════════════════════ */

const CONSULT_API_URL = 'https://script.google.com/macros/s/AKfycbyGC-FTeq5pbjNeNUuSuVyn6R8d-ie9ug4eU_4kDB5JgGe_nZ0zrQjCZAddkjg-Qzld/exec';

/* ─── Open / Close ─── */
window.openConsultModal = function(){
  const overlay = document.getElementById('consultModal');
  if (!overlay) return;
  overlay.classList.add('cm-open');
  document.body.style.overflow = 'hidden';
  updateProgress();
}
window.closeConsultModal = function() {
  const overlay = document.getElementById('consultModal');
  if (!overlay) return;
  overlay.classList.remove('cm-open');
  document.body.style.overflow = '';
  setTimeout(() => {
    resetForm();
  }, 350);
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('consultModal')) closeConsultModal();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeConsultModal();
});

/* ─── Progress bar ─── */
function updateProgress() {
  const fields = ['cf-name', 'cf-phone', 'cf-city', 'cf-course'];
  let filled = fields.filter(id => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== '';
  }).length;
  // If email is filled, count it as well (but since it's optional, let's keep progress calculation simple)
  const emailEl = document.getElementById('cf-email');
  if (emailEl && emailEl.value.trim() !== '') {
    filled++;
  }
  const total = fields.length + (emailEl ? 1 : 0);
  const bar = document.getElementById('cmProgress');
  if (bar) bar.style.width = `${Math.round((filled/total)*100)}%`;
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#consultForm .cm-input, #consultForm .cm-select')
    .forEach(el => el.addEventListener('input', updateProgress));
});

/* ─── Validation ─── */
const validators = {
  'cf-name':  { fn: v => v.trim().length >= 2, msg: 'Please enter your full name (min 2 chars).' },
  'cf-email': { fn: v => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
  'cf-phone': { fn: v => /^[6-9]\d{9}$/.test(v.trim()), msg: 'Enter a valid 10-digit Indian mobile number.' },
  'cf-city':  { fn: v => v.trim().length >= 2, msg: 'Please enter your location.' },
  'cf-course':{ fn: v => v !== '', msg: 'Please select a course.' },
};

function validateField(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  const err = document.getElementById('err-' + id.replace('cf-',''));
  if (!err) return true;
  const val = el.value;
  const rule = validators[id];
  if (!rule) return true;
  if (rule.fn(val)) {
    el.classList.remove('cm-invalid'); err.textContent = ''; return true;
  } else {
    el.classList.add('cm-invalid'); err.textContent = rule.msg; return false;
  }
}

// Live validation on blur
document.addEventListener('DOMContentLoaded', () => {
  Object.keys(validators).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id));
  });
});

function validateAll() {
  let valid = true;
  Object.keys(validators).forEach(id => { 
    if (document.getElementById(id) && !validateField(id)) valid = false; 
  });
  return valid;
}

/* ─── Form submit ─── */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('consultForm');
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    // Honeypot check
    if (form._honey && form._honey.value) return;
    if (!validateAll()) {
      const firstErr = document.querySelector('#consultForm .cm-invalid');
      if (firstErr) firstErr.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }
    setLoading(true);
    
    // Maintain existing backend payload format for compatibility
    const payload = {
      fullName:      document.getElementById('cf-name').value.trim(),
      email:         document.getElementById('cf-email') ? document.getElementById('cf-email').value.trim() : '',
      phone:         '+91' + document.getElementById('cf-phone').value.trim(),
      city:          document.getElementById('cf-city').value.trim(),
      course:        document.getElementById('cf-course').value,
      qualification: 'Not specified',
      mode:          'Not specified',
      message:       'Not specified',
    };
    try {
      if (!CONSULT_API_URL || CONSULT_API_URL.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT')) {
        throw new Error('Form endpoint is not connected yet.');
      }
      await fetch(CONSULT_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(payload),
      });
      showSuccess();
    } catch (err) {
      alert('⚠️ ' + err.message);
    } finally {
      setLoading(false);
    }
  });
});

function setLoading(on) {
  const btn  = document.getElementById('cmSubmitBtn');
  const text = document.getElementById('cmBtnText');
  const spin = document.getElementById('cmBtnLoader');
  if (!btn) return;
  btn.disabled = on;
  text.style.display = on ? 'none' : 'inline';
  spin.style.display  = on ? 'inline-block' : 'none';
}

function showSuccess() {
  const form = document.getElementById('consultForm');
  const success = document.getElementById('cmSuccess');
  const bar = document.getElementById('cmProgress');
  if (form) form.style.display = 'none';
  if (success) success.style.display = 'flex';
  if (bar) bar.style.width = '100%';
}

function resetForm() {
  const form = document.getElementById('consultForm');
  if (!form) return;
  form.reset();
  form.style.display = '';
  const success = document.getElementById('cmSuccess');
  const bar = document.getElementById('cmProgress');
  if (success) success.style.display = 'none';
  if (bar) bar.style.width = '0%';
  document.querySelectorAll('.cm-invalid').forEach(el => el.classList.remove('cm-invalid'));
  document.querySelectorAll('.cm-err').forEach(el => el.textContent = '');
  const modeGroup = document.getElementById('modeGroup');
  if (modeGroup) modeGroup.classList.remove('cm-invalid-group');
}
