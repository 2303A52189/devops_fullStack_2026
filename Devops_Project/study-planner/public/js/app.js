// ─── Sidebar Toggle ────────────────────────────────────────────
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('sidebarOverlay');
const hamburger= document.getElementById('hamburgerBtn');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });
}
if (overlay) {
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
}

// ─── Flash Dismiss ─────────────────────────────────────────────
document.querySelectorAll('.flash-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.flash').remove();
  });
});

// Auto-dismiss flashes after 5s
setTimeout(() => {
  document.querySelectorAll('.flash').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    el.style.transition = '0.4s ease';
    setTimeout(() => el.remove(), 400);
  });
}, 5000);

// ─── Delete Confirmation ───────────────────────────────────────
document.querySelectorAll('[data-confirm]').forEach(el => {
  el.addEventListener('click', (e) => {
    const message = el.dataset.confirm || 'Are you sure you want to delete this?';
    if (!confirm(message)) e.preventDefault();
  });
});

// ─── Active nav item ────────────────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-item').forEach(link => {
  const href = link.getAttribute('href');
  if (href && currentPath.startsWith(href) && href !== '/') {
    link.classList.add('active');
  } else if (href === '/dashboard' && currentPath === '/dashboard') {
    link.classList.add('active');
  }
});

// ─── Progress ring animation ────────────────────────────────────
document.querySelectorAll('.progress-ring-fill').forEach(ring => {
  const pct = parseFloat(ring.dataset.percent || 0);
  const r   = parseFloat(ring.getAttribute('r'));
  const c   = 2 * Math.PI * r;
  ring.style.strokeDasharray  = `${c}`;
  ring.style.strokeDashoffset = `${c - (pct / 100) * c}`;
});

// ─── Tooltips (simple title-based) ─────────────────────────────
document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.title = el.dataset.tooltip;
});

// ─── Form validation feedback ───────────────────────────────────
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function (e) {
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'var(--red)';
        field.style.boxShadow = '0 0 0 3px var(--red-glow)';
        valid = false;
      }
    });
    if (!valid) {
      e.preventDefault();
      const firstInvalid = form.querySelector('[required]:not([value])') || form.querySelector('[required]');
      if (firstInvalid) firstInvalid.focus();
    }
  });
});

// ─── Character counter for textareas ───────────────────────────
document.querySelectorAll('textarea[maxlength]').forEach(ta => {
  const max     = ta.getAttribute('maxlength');
  const counter = document.createElement('div');
  counter.style.cssText = 'font-size:11px;color:var(--text-muted);text-align:right;margin-top:4px;';
  counter.textContent   = `0 / ${max}`;
  ta.parentNode.insertBefore(counter, ta.nextSibling);
  ta.addEventListener('input', () => {
    counter.textContent = `${ta.value.length} / ${max}`;
    counter.style.color = ta.value.length > max * 0.9 ? 'var(--amber)' : 'var(--text-muted)';
  });
});

// ─── Table sort ─────────────────────────────────────────────────
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.style.cursor = 'pointer';
  th.addEventListener('click', () => {
    const table = th.closest('table');
    const tbody = table.querySelector('tbody');
    const col   = Array.from(th.parentNode.children).indexOf(th);
    const rows  = Array.from(tbody.querySelectorAll('tr'));
    const asc   = th.dataset.order !== 'asc';
    th.dataset.order = asc ? 'asc' : 'desc';

    rows.sort((a, b) => {
      const va = a.cells[col]?.textContent.trim() || '';
      const vb = b.cells[col]?.textContent.trim() || '';
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    rows.forEach(r => tbody.appendChild(r));
  });
});

// ─── Search filter on task table ───────────────────────────────
const searchInput = document.getElementById('liveSearch');
if (searchInput) {
  searchInput.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll('[data-searchable]').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

console.log('%c🎓 AI Study Planner', 'color:#6c63ff;font-size:18px;font-weight:bold;');
console.log('%cBuilt with ❤ and intelligence', 'color:#00d4ff;font-size:12px;');
