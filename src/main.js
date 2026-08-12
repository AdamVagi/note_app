// invoke() -> propojení frontend JavaScript a backend Rust
const { invoke } = window.__TAURI__.core;

// TODO: tady toho chci mít co nejmíň, protože se zatím nechci učit js

// ======================================================
// INICIALIZACE APLIKACE (main)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {

    SidebarMovement();
    ButtonsNavigation();
    NodeOverlay();
    AutoOverlayAdjustment();

    // loading nodes immediately after app launch
    loadAndRenderNotes();
});


/* ============================================================
   VĚCI, KTERÉ Z UI MUSÍM PROSTĚ PŘEPSAT DO JS (nejde jinak)
   ============================================================ */

// sidebar movement
function SidebarMovement() {

  // nalezení sidebaru + tlačítka, které chceme aby s tím sidebarem hýbalo
  const sidebar = document.getElementById('sidebar');
  const btnToggle = document.getElementById('btn-toggle');

  // check jestli opravdu existuje tlačítko a sidebar (jinak js spadne na chybě)
  if (btnToggle && sidebar) {
    // když user stiskne tlačítko, tak spusť tento kód
    btnToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
};

// když se stiskne tlačítko, tak se předá do další funkce, která přepne stav active
function ButtonsNavigation() {
  
  // najdeme všechny buttony, které jsme schopni přepínat
  const buttons = document.querySelectorAll(".footer-btn, .close-btn");

  // když někdo klikne na tlačítko, tak se přepne na tu stránku (přes ještě jednu další funkci)
  for (const button of buttons) {
    
    button.addEventListener("click", function () {
      
      // chceme title
      const target = button.getAttribute("data-target");
      NavigateTo(target);
    });
  }
}
  
// buttons functionality connection to other pages (SPA = single page application)
function NavigateTo(viewId) {  // -> argument, který máme v HTML (data-target)
 
  // najde všechny elementy, který mají vlastnost = app-view (js je schopnej přepnout stránku podle ID)
  const allselectors = document.querySelectorAll('.app-view');

  // schování všech stránek napřed
  for (const view of allselectors)
  {
      view.classList.remove("active");
  }

  // pak zobrazení jenom té, kterou chci já
  const targetView = document.getElementById(viewId);

  if (targetView)
  {
      targetView.classList.add("active");
  }

  // refresh uložených nodes
  if (viewId === "view-journal") {
    loadAndRenderNotes();
  }
}

// another function bc overlay is not the same as page in SPA (opening and closing needs to be handle differently)
function NodeOverlay() {

  // rozdělím to na opening a closing button pro overlay
  const open_button = document.querySelector(".action-open-btn");
  const overlay = document.getElementById("node-overlay");

  open_button.addEventListener("click", function () {
    overlay.classList.remove("hidden");
  });

  // closing (in the future maybe duplicate due to add btn)
  const close_button = document.querySelector(".close-new-node-btn");
  
  close_button.addEventListener("click", function () {
      overlay.classList.add("hidden");
  });

  // all overlay buttons related functionality
  const node_add = document.querySelector(".add-node-btn");

  node_add.addEventListener("click", async function () {
    
    // vrátí se nám jenom filename + si vytáhneme data z elementu ()
    const newNoteData = await invoke("new_note");
    const content = document.getElementById("node-content").value;

    // zapíšeme content z UI (return je bool)
    const odpoved = await invoke("insert_note", {
        filename: newNoteData,
        content: content
    });

    // TODO: ten error handling bude potřeba vyřešit (idk zatím)
    if (!odpoved) {
      showErrorNotification("Uložení poznámky selhalo! Zkontrolujte souborový systém.");
    }

    // zavřít overlay a zaktualizovat UI 
    const textarea = document.getElementById("node-content");
    textarea.value = "";
    overlay.classList.add("hidden");

    // TODO: toto je zatím optional, protože nemám otestovaný, jak se to bude chovat když textarea bude rozšířená na > default
    // textarea.style.height = "auto";

    // update main page with notes
    loadAndRenderNotes();
    
  });
}

// function for allignment adjustment during node inserting (automatic)
function AutoOverlayAdjustment() {

  const text_area = document.getElementById("node-content");

  text_area.addEventListener("input", function() {

    // first reset výšky na 'auto', aby se pole mohlo případně i zmenšit, když uživatel maže text
    this.style.height = "auto";
    
    // then set výšky podle skutečného obsahu + přičteme 2px kvůli borderu
    this.style.height = (this.scrollHeight + 2) + "px";
  });
}

// funkce na renderování všech dostupných poznámek na main page 
async function loadAndRenderNotes() {

  const notes = await invoke("list_notes"); 

  // kontejner na main page + clean up
  const container = document.getElementById("view-journal");
  if (!container) return;

  container.innerHTML = ""; 
  
  // empty stav (první spuštění aplikace) -> custom stav
  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>Zatím tu nic není</h2>
        <p>Klikni na <strong>+ New Journal</strong> v levém menu a napiš svoji první poznámku!</p>
      </div>
    `;
    return;
  }
  
  // vykreslení každé uložené poznámky
  notes.forEach((note) => {

    const article = document.createElement("article");
    article.className = "entry";
    // article.dataset.filename = note.filename;

    // HTML struktura
    article.innerHTML = `
      <div class="entry-header">
        <div class="date">${note.date}</div>
        <div class="entry-actions">
          <button class="btn-fav ${note.favorite ? 'active' : ''}">${note.favorite ? '★' : '☆'}</button>
          <button class="btn-edit">✏️</button>
        </div>
      </div>
      <div class="content">
        <p class="note-text">${note.content || "<i>Prázdná poznámka...</i>"}</p>
      </div>
    `;

    // LOGIC for favorite + edit
    //-------------------------------------

    // TODO: buď jsem divnej a nebo nefunguje animace hvězdičky ??
    // TODO: rozbil jsem allignment SPA (settings se zobrazují zároveň s main page)

    const favBtn = article.querySelector('.btn-fav');
    favBtn.addEventListener('click', async () => {
      
      note.favorite = !note.favorite;
      // update dat v souboru musí
      await invoke("update_note", { 
        filename: note.filename, 
        content: note.content, 
        favorite: note.favorite 
      });
      
      // aby se to celé propsalo
      loadAndRenderNotes(); 
    });


    // TODO: úprava contentu ještě domyslet
    /*const editBtn = article.querySelector('.btn-edit');
    const textElement = article.querySelector('.note-text');

    editBtn.addEventListener('click', async () => {
      const isEditing = textElement.isContentEditable;

      if (!isEditing) {
        // ZAPNOUT ÚPRAVY
        textElement.contentEditable = "true";
        textElement.focus();
        editBtn.textContent = '💾'; // Ikona uložení
        article.classList.add('is-editing');
      } else {
        // VYPNOUT A ULOŽIT
        textElement.contentEditable = "false";
        editBtn.textContent = '✏️';
        article.classList.remove('is-editing');
        
        // Získáme nový text
        note.content = textElement.innerText;

        // Uložíme do Rustu
        await invoke("update_note", { 
          filename: note.filename, 
          content: note.content, 
          favorite: note.favorite 
        });
      }
    });*/

    // Přidáme na stránku
    container.appendChild(article);
  });
}

/* ============================================================
   ZÁKLADNÍ KOSTRA, KTEROU CHCI POUŽÍT JAKO JENOM API PRO CONNECTION HTML -> RUST
   ============================================================ */      

/*// 1) najít element
const btn = document.getElementById('moje-tlacitko');
// 2) zachytit událost
btn.addEventListener('click', async () => {
  // 3) zavolat Rust command
  const odpoved = await invoke('moji_funkci_pro_tlacitko', { jmeno: 'Uživatel' });
  vystup.innerText = odpoved;
});*/