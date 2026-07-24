// toto je JavaScript (fronted) = honestly, vzhledem k tomu, že se mi s UI fakt nechce dělat, tak to asi nechám od LLMka
// ale možná se na to podívat, protože jsou to trošku takový střeva pro UI (na druhou stranu nevím jestli se chci tohle učit od začátku)

// invoke() -> propojení frontend JavaScript a backend Rust
import { invoke } from '@tauri-apps/api/core';

// TODO: obecně v javascriptu ještě nic nefunguje, nic jsem nenapojoval a taky tady to všechno potřebuju napřed pochopit
// TODO: toto taky projít všechno, jak to všechno funguje, vůbec nevím
// TODO: + bude potřeba nabindovat všechny tlačítka aby fungovaly (ale to až později)
// TODO: vedle feedbacku bych pridal i volinteer dono pres paypal treba (for more development projects a for improving current projects)

//------------------
// TODO: je potřeba si opravdu sepsat kompletní funkcionalitu celé aplikace, abych přesně věděl, co mám kódit !!!!!
//------------------
/*
let currentFile = null;
let saveTimer = null;
let allNotes = [];

// listing all nodes into frontend
async function loadNoteList() {
  allNotes = await invoke('list_notes');
  renderList(allNotes);
}

// takes list from backend of .md files and create list of notes in GUI
function renderList(files) {
  const list = document.getElementById('note-list');
  list.innerHTML = '';
  if (files.length === 0) {
    list.innerHTML = '<div style="padding:1rem;color:#555;font-size:0.85rem">No notes yet</div>';
    return;
  }
  files.forEach(filename => {
    const item = document.createElement('div');
    item.className = 'note-item' + (filename === currentFile ? ' active' : '');
    item.dataset.file = filename;

    const dateStr = filename.replace('.md', '');
    const y = dateStr.slice(0,4), m = dateStr.slice(4,6), d = dateStr.slice(6,8);
    
    item.innerHTML = `
      <div class="note-item-date">${d}.${m}.${y}</div>
      <div class="note-item-preview" id="prev-${filename}">...</div>
    `;
    item.addEventListener('click', () => openNote(filename));
    list.appendChild(item);

    // Load preview text asynchronously
    invoke('read_note', { filename }).then(content => {
      const el = document.getElementById(`prev-${filename}`);
      if (el && content) {
        el.textContent = content.replace(/[#*`_]/g, '').slice(0, 45) || '(empty)';
      }
    }).catch(() => {});
  });
}

// open a note
async function openNote(filename) {
  currentFile = filename;
  const content = await invoke('read_note', { filename });
  document.getElementById('editor').value = content;
  updatePreview(content);
  document.querySelectorAll('.note-item').forEach(el => {
    el.classList.toggle('active', el.dataset.file === filename);
  });
}

// live preview of currently edited node
function updatePreview(text) {
  document.getElementById('preview').innerHTML = marked.parse(text);
}

// auto-save
document.getElementById('editor').addEventListener('input', e => {
  const content = e.target.value;
  updatePreview(content);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (currentFile) {
      await invoke('save_note', { filename: currentFile, content });
      renderList(allNotes); // refresh previews
    }
  }, 500);
});

// when user clicks on new note, creates file, display him and launch editor
document.getElementById('btn-new').addEventListener('click', async () => {
  const filename = await invoke('new_note');
  await loadNoteList();
  await openNote(filename);
  document.getElementById('editor').focus();
});

// TODO: hledání, toto jsem zatím vůbec nepromýšlel jakým způsobem by se to mělo implememtovat
// TODO: Rust kód v main.rs čte a zapisuje notes přímo do složky na disku — jednodušší, ale později připadá v úvahu SQLite (komplexní dotazy, filtrování, tagy, full text search)
// TODO: ten fronted nějak vyřešit ještě, jestli se to dá celý nastavit nějak ještě jinak (idk, promyslet)
// TODO: další věc je to, že se ten adresář /notes ani nevytvořil (nikde jsem ho nenašel, nevím jestli je to tím, že ta aplikace prostě není deploynutá, ale dává smysl, že by v source code adresáři nebyl)
document.getElementById('search').addEventListener('input', async e => {
  const query = e.target.value.toLowerCase();
  if (!query) { renderList(allNotes); return; }

  const results = [];
  for (const file of allNotes) {
    const content = await invoke('read_note', { filename: file });
    if (content.toLowerCase().includes(query)) results.push(file);
  }
  renderList(results);
});

// during boot, all nodes are loaded
await loadNoteList();
if (allNotes.length > 0) await openNote(allNotes[0]);*/