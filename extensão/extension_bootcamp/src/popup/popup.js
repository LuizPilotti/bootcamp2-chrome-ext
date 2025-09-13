const noteTitle = document.getElementById('noteTitle');
const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const notesList = document.getElementById('notesList');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalEditBtn = document.getElementById('modalEditBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');

let editIndex = null;

// Carrega notas do storage
async function loadNotes() {
  const res = await chrome.storage.local.get('notes');
  const notes = res.notes || [];
  renderNotes(notes);
}

// Renderiza lista com botões (Ver / Editar / Excluir)
function renderNotes(notes) {
  notesList.innerHTML = '';
  if (!notes.length) {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma nota ainda.';
    li.style.background = 'transparent';
    notesList.appendChild(li);
    return;
  }

  notes.forEach((note, index) => {
    const li = document.createElement('li');

    const meta = document.createElement('div');
    meta.className = 'note-meta';

    const titleEl = document.createElement('strong');
    titleEl.textContent = note.title || 'Sem título';
    // clicar no título abre a nota
    titleEl.style.cursor = 'pointer';
    titleEl.addEventListener('click', () => viewNote(index));

    const preview = document.createElement('div');
    preview.className = 'note-preview';
    preview.textContent = note.content || '';

    meta.appendChild(titleEl);
    meta.appendChild(preview);

    // ações
    const actions = document.createElement('div');
    actions.className = 'note-actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'viewBtn';
    viewBtn.textContent = 'Ver';
    viewBtn.addEventListener('click', () => viewNote(index));

    const editBtn = document.createElement('button');
    editBtn.className = 'editBtn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => editNote(index));

    const delBtn = document.createElement('button');
    delBtn.className = 'deleteBtn';
    delBtn.textContent = 'X';
    delBtn.addEventListener('click', () => deleteNote(index));

    actions.appendChild(viewBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(meta);
    li.appendChild(actions);
    notesList.appendChild(li);
  });
}

// Salvar / Atualizar nota
saveBtn.addEventListener('click', async () => {
  const title = noteTitle.value.trim();
  const content = noteInput.value.trim();
  if (!content) return; // não salva vazio

  const res = await chrome.storage.local.get('notes');
  const notes = res.notes || [];

  if (editIndex !== null) {
    notes[editIndex] = { title, content };
    editIndex = null;
    saveBtn.textContent = 'Salvar Nota';
  } else {
    notes.push({ title, content });
  }

  await chrome.storage.local.set({ notes });
  noteTitle.value = '';
  noteInput.value = '';
  renderNotes(notes);
});

// Visualizar nota (abre modal)
function viewNote(index) {
  chrome.storage.local.get('notes').then(res => {
    const notes = res.notes || [];
    const note = notes[index];
    if (!note) return;
    modalTitle.textContent = note.title || 'Sem título';
    modalBody.textContent = note.content || '';
    modal.classList.remove('hidden');

    // preparar botão de editar dentro do modal
    modalEditBtn.onclick = () => {
      modal.classList.add('hidden');
      editNote(index);
    };
  });
}

// Editar nota (carrega nos campos)
function editNote(index) {
  chrome.storage.local.get('notes').then(res => {
    const notes = res.notes || [];
    const note = notes[index];
    if (!note) return;
    noteTitle.value = note.title || '';
    noteInput.value = note.content || '';
    editIndex = index;
    saveBtn.textContent = 'Atualizar Nota';
  });
}

// Deletar (com confirmação)
function deleteNote(index) {
  if (!confirm('Confirma excluir esta nota?')) return;
  chrome.storage.local.get('notes').then(async res => {
    const notes = res.notes || [];
    notes.splice(index, 1);
    await chrome.storage.local.set({ notes });
    renderNotes(notes);
  });
}

// Fechar modal
modalCloseBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Fecha modal se clicar fora do conteúdo
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

loadNotes();
