
// Shortcuts
const el = (id) => document.getElementById(id);
const form = el('form');
const input = el('input');
const prioritySel = el('priority');
const listEl = el('todos');
const countEl = el('count');
const progressEl = el('progress');
const emptyEl = el('empty');
const clearAllBtn = el('clearAll');
const themeToggle = el('themeToggle');
const chips = document.querySelectorAll('.chip');

let currentFilter = 'all';

const load = () => JSON.parse(localStorage.getItem('todos-v2') || '[]');
const save = (data) => localStorage.setItem('todos-v2', JSON.stringify(data));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

let todos = load();

// Theme
(function initTheme(){
  const prefer = localStorage.getItem('todo-theme') || 'light';
  if (prefer === 'dark') document.body.classList.add('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
})();

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('todo-theme', mode);
  themeToggle.textContent = mode === 'dark' ? '☀️ Light' : '🌙 Dark';
});

// Add new todo
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const priority = prioritySel.value;
  if (!text) return;
  todos.unshift({ id: uid(), text, completed: false, priority, createdAt: Date.now() });
  save(todos);
  input.value = '';
  render();
});

// Clear All
clearAllBtn.addEventListener('click', () => {
  if (!todos.length) return;
  if (!confirm('Delete all tasks?')) return;
  todos = [];
  save(todos);
  render();
});

// Filter
chips.forEach(btn => btn.addEventListener('click', () => {
  chips.forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  render();
}));

// Helpers
function toggleComplete(id){
  const t = todos.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  save(todos); render();
}

function removeTodo(id){
  todos = todos.filter(x => x.id !== id);
  save(todos); render();
}

function editTodo(id){
  const t = todos.find(x => x.id === id);
  if (!t) return;
  const next = prompt('Edit your task:', t.text);
  if (next && next.trim() !== ''){
    t.text = next.trim();
    save(todos); render();
  }
}

function filtered(){
  if (currentFilter === 'active') return todos.filter(t => !t.completed);
  if (currentFilter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

function fmtDate(ts){
  const d = new Date(ts);
  return d.toLocaleString();
}

// Render
function render(){
  const data = filtered();
  listEl.innerHTML = '';
  emptyEl.hidden = data.length !== 0;

  const done = todos.filter(t => t.completed).length;
  const total = todos.length;
  const pct = total ? Math.round((done/total)*100) : 0;
  countEl.textContent = `${total} item${total!==1?'s':''}`;
  progressEl.textContent = `${pct}% done`;

  data.forEach(t => {
    const li = document.createElement('li');
    if (t.completed) li.classList.add('completed');
    li.dataset.id = t.id;

    const left = document.createElement('div');
    left.className = 'row';
    const text = document.createElement('div');
    text.textContent = t.text;
    const badge = document.createElement('span');
    badge.className = `badge ${t.priority}`;
    badge.textContent = t.priority.charAt(0).toUpperCase() + t.priority.slice(1);
    left.appendChild(badge);
    left.appendChild(text);

    const right = document.createElement('div');
    right.className = 'small';
    right.textContent = fmtDate(t.createdAt);

    li.appendChild(left);
    li.appendChild(right);

    li.addEventListener('click', () => toggleComplete(t.id));
    li.addEventListener('contextmenu', (e) => { e.preventDefault(); removeTodo(t.id); });
    li.addEventListener('dblclick', () => editTodo(t.id));

    listEl.appendChild(li);
  });
}

render();
