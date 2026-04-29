/* global window, document */

const STORAGE_KEY = 'studentCrud.apiBase';

const el = {
  apiBase: document.getElementById('apiBase'),
  apiSave: document.getElementById('apiSave'),
  endpointPreview: document.getElementById('endpointPreview'),
  health: document.getElementById('health'),

  banner: document.getElementById('banner'),

  q: document.getElementById('q'),
  refresh: document.getElementById('refresh'),
  rows: document.getElementById('rows'),

  form: document.getElementById('form'),
  id: document.getElementById('id'),
  name: document.getElementById('name'),
  email: document.getElementById('email'),
  course: document.getElementById('course'),
  submit: document.getElementById('submit'),
  reset: document.getElementById('reset'),
  delete: document.getElementById('delete'),
  modePill: document.getElementById('modePill'),
  formStatus: document.getElementById('formStatus'),
  selectedPreview: document.getElementById('selectedPreview'),

  confirm: document.getElementById('confirm'),
  confirmText: document.getElementById('confirmText'),
  confirmYes: document.getElementById('confirmYes'),
};

let students = [];
let selectedId = null;

function normalizeBaseUrl(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  return trimmed.replace(/\/+$/, '');
}

function apiBase() {
  const saved = normalizeBaseUrl(el.apiBase.value);
  if (saved) return saved;
  // Prefer same-origin when served by Spring Boot (avoids CORS)
  if (window.location && window.location.origin && window.location.origin !== 'null') {
    return window.location.origin;
  }
  return 'http://localhost:8080';
}

function endpoint(path) {
  const base = apiBase();
  return `${base}${path}`;
}

function showBanner(message, kind = 'error') {
  el.banner.hidden = !message;
  el.banner.textContent = message || '';
  el.banner.dataset.kind = kind;
}

function setBusy(isBusy, message = '') {
  el.refresh.disabled = isBusy;
  el.submit.disabled = isBusy;
  el.reset.disabled = isBusy;
  el.delete.disabled = isBusy || !selectedId;
  el.formStatus.textContent = message;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function currentMode() {
  return selectedId ? 'edit' : 'create';
}

function updateModeUI() {
  const mode = currentMode();
  if (mode === 'edit') {
    el.modePill.textContent = 'Edit';
    el.submit.textContent = 'Save';
    el.delete.disabled = false;
  } else {
    el.modePill.textContent = 'Create';
    el.submit.textContent = 'Create';
    el.delete.disabled = true;
  }
  el.selectedPreview.textContent = selectedId ? `#${selectedId}` : 'None';
}

function readForm() {
  return {
    name: el.name.value.trim(),
    email: el.email.value.trim(),
    course: el.course.value.trim(),
  };
}

function validate(student) {
  if (!student.name) return 'Name is required.';
  if (!student.course) return 'Course is required.';
  if (!student.email) return 'Email is required.';

  // Lightweight email sanity check (backend may validate more strictly)
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email);
  if (!ok) return 'Email looks invalid.';
  return null;
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (res.status === 204) return { ok: true, status: 204, data: null };

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const msg = (data && typeof data === 'object' && data.message) ? data.message : (typeof data === 'string' ? data : `Request failed: ${res.status}`);
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return { ok: true, status: res.status, data };
}

function renderRows() {
  const q = el.q.value.trim().toLowerCase();
  const filtered = !q
    ? students
    : students.filter(s => {
        const hay = `${s.id ?? ''} ${s.name ?? ''} ${s.email ?? ''} ${s.course ?? ''}`.toLowerCase();
        return hay.includes(q);
      });

  if (!filtered.length) {
    el.rows.innerHTML = `
      <tr>
        <td colspan="5" style="color: var(--muted);">No students found.</td>
      </tr>
    `;
    return;
  }

  el.rows.innerHTML = filtered
    .map(s => {
      const selected = Number(selectedId) === Number(s.id);
      const rowClass = selected ? 'is-selected' : '';

      return `
        <tr class="${rowClass}" data-id="${escapeHtml(s.id)}" title="Click to select">
          <td>${escapeHtml(s.id)}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.email)}</td>
          <td>${escapeHtml(s.course)}</td>
          <td>
            <button class="btn btn--ghost" type="button" data-action="edit" data-id="${escapeHtml(s.id)}">Edit</button>
            <button class="btn btn--danger" type="button" data-action="delete" data-id="${escapeHtml(s.id)}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function selectStudent(student) {
  selectedId = student?.id ?? null;
  el.id.value = selectedId ?? '';
  el.name.value = student?.name ?? '';
  el.email.value = student?.email ?? '';
  el.course.value = student?.course ?? '';
  updateModeUI();
  renderRows();
}

function resetForm() {
  selectedId = null;
  el.id.value = '';
  el.name.value = '';
  el.email.value = '';
  el.course.value = '';
  el.formStatus.textContent = '';
  showBanner('');
  updateModeUI();
  renderRows();
}

async function loadAll() {
  showBanner('');
  setBusy(true, 'Loading…');
  try {
    const { data } = await requestJson(endpoint('/students'));
    students = Array.isArray(data) ? data : [];
    renderRows();
    setBusy(false, `Loaded ${students.length} student(s).`);
  } catch (e) {
    setBusy(false, '');
    const msg = e?.message || String(e);
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      showBanner('Cannot reach the API (backend down or blocked by CORS). Try opening the UI from http://localhost:8080/ (same origin) or set API base to match the page origin.');
    } else {
      showBanner(msg);
    }
    // keep existing rows if any
  }
}

async function createStudent(payload) {
  const { data } = await requestJson(endpoint('/students'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

async function updateStudent(id, payload) {
  const { data } = await requestJson(endpoint(`/students/${encodeURIComponent(id)}`), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return data;
}

async function deleteStudent(id) {
  await requestJson(endpoint(`/students/${encodeURIComponent(id)}`), { method: 'DELETE' });
}

async function testConnection() {
  showBanner('');
  setBusy(true, 'Testing connection…');
  try {
    const { data } = await requestJson(endpoint('/students'));
    const count = Array.isArray(data) ? data.length : 0;
    setBusy(false, `Connected. /students returned ${count} record(s).`);
  } catch (e) {
    setBusy(false, '');
    showBanner(`Connection failed: ${e.message}`);
  }
}

function saveApiBase() {
  const base = normalizeBaseUrl(el.apiBase.value) || 'http://localhost:8080';
  el.apiBase.value = base;
  window.localStorage.setItem(STORAGE_KEY, base);
  el.endpointPreview.textContent = `${new URL(base).origin}/students`;
}

function loadApiBaseFromStorage() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) el.apiBase.value = saved;
  else el.apiBase.value = apiBase();
  try {
    const base = normalizeBaseUrl(el.apiBase.value);
    el.endpointPreview.textContent = `${new URL(base).origin}/students`;
  } catch {
    el.endpointPreview.textContent = '/students';
  }
}

function wireEvents() {
  el.apiSave.addEventListener('click', () => {
    saveApiBase();
    loadAll();
  });

  el.refresh.addEventListener('click', loadAll);

  el.q.addEventListener('input', () => {
    renderRows();
  });

  el.rows.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button');
    const tr = ev.target.closest('tr[data-id]');

    if (btn) {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const student = students.find(s => String(s.id) === String(id));

      if (action === 'edit' && student) {
        selectStudent(student);
        return;
      }

      if (action === 'delete' && student) {
        await askDelete(student);
        return;
      }
    }

    if (tr) {
      const id = tr.dataset.id;
      const student = students.find(s => String(s.id) === String(id));
      if (student) selectStudent(student);
    }
  });

  el.reset.addEventListener('click', resetForm);

  el.form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    showBanner('');

    const payload = readForm();
    const error = validate(payload);
    if (error) {
      showBanner(error);
      return;
    }

    setBusy(true, selectedId ? 'Saving…' : 'Creating…');

    try {
      if (selectedId) {
        const updated = await updateStudent(selectedId, payload);
        students = students.map(s => (String(s.id) === String(selectedId) ? updated : s));
        selectStudent(updated);
        setBusy(false, 'Saved.');
      } else {
        const created = await createStudent(payload);
        students = [created, ...students];
        selectStudent(created);
        setBusy(false, 'Created.');
      }

      renderRows();
    } catch (e) {
      setBusy(false, '');
      showBanner(e.message || String(e));
    }
  });

  el.delete.addEventListener('click', async () => {
    const student = students.find(s => String(s.id) === String(selectedId));
    if (!student) return;
    await askDelete(student);
  });

  el.health.addEventListener('click', (ev) => {
    ev.preventDefault();
    testConnection();
  });
}

async function askDelete(student) {
  showBanner('');

  const id = student.id;
  el.confirmText.textContent = `Delete student #${id} (${student.name})?`;

  if (!('showModal' in el.confirm)) {
    // Fallback if <dialog> unsupported
    // eslint-disable-next-line no-alert
    const ok = window.confirm(el.confirmText.textContent);
    if (!ok) return;
    await doDelete(id);
    return;
  }

  el.confirm.showModal();
  const result = await new Promise(resolve => {
    const onClose = () => {
      el.confirm.removeEventListener('close', onClose);
      resolve(el.confirm.returnValue);
    };
    el.confirm.addEventListener('close', onClose);
  });

  if (result === 'yes') {
    await doDelete(id);
  }
}

async function doDelete(id) {
  setBusy(true, 'Deleting…');
  try {
    await deleteStudent(id);
    students = students.filter(s => String(s.id) !== String(id));
    resetForm();
    setBusy(false, 'Deleted.');
  } catch (e) {
    setBusy(false, '');
    showBanner(e.message || String(e));
  }
}

function init() {
  loadApiBaseFromStorage();
  updateModeUI();
  wireEvents();
  loadAll();
}

init();
