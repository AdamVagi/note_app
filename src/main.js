// invoke() -> propojení frontend JavaScript a backend Rust
const { invoke } = window.__TAURI__.core;


// ======================================================
// INICIALIZACE APLIKACE (main)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  
  LoadSavedSettings();

  SidebarMovement();
  ButtonsNavigation();
  NodeOverlay();
  AutoOverlayAdjustment();
  EditOverlay();
  DeleteOverlay();
  SearchFunctionality();
  SettingsFunctionality();


  // loading nodes immediately after app launch
  LoadAndRenderNotes();
});


// ======================================================
// GLOBÁLNÍ PROMĚNNÉ PRO OZNAČENÍ KTEROU NODU PRÁVĚ OPRAVUJU
// ======================================================

let currentEditingFilename = "";
let currentDeletingFilename = "";
let currentEditingFavorite = false;
// instant search help
let allLoadedNotes = []; 


// ============================================================
// UI SETTINGS
// ============================================================

// načtení uložených hodnot při startu aplikace
function LoadSavedSettings() {

  const root = document.documentElement; 

  // načtení hodnot z localStorage nebo použití výchozích
  const savedTheme = localStorage.getItem("app-theme") || "dark";
  const savedFontSize = localStorage.getItem("app-font-size") || "16";
  const savedFont = localStorage.getItem("app-font") || "Rajdhani";

  root.setAttribute("data-theme", savedTheme);
  root.setAttribute("data-font", savedFont);

  // pro slider se nastavuje CSS hodnota přímo přes js
  root.style.setProperty("--base-font-size", `${savedFontSize}px`);

  // sychronizace UI s tlačítky a slidery v nastavení
  const themeToggle = document.getElementById("theme-toggle");
  const fontSizeSlider = document.getElementById("font-size");
  const fontSelect = document.getElementById("font-family");

  if (themeToggle) {
    themeToggle.checked = savedTheme === "light"; 
  }
  if (fontSizeSlider) {
    fontSizeSlider.value = savedFontSize;
  }
  if (fontSelect) {
    fontSelect.value = savedFont;
  }
}

// bindování tlačítek v settings
function SettingsFunctionality() {

  const root = document.documentElement;

  // dark / light
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {

    themeToggle.addEventListener("change", (e) => {
      
      const newTheme = e.target.checked ? "light" : "dark";
      root.setAttribute("data-theme", newTheme);
      localStorage.setItem("app-theme", newTheme);
    });
  }

  // font size
  const fontSizeSlider = document.getElementById("font-size");  
  if (fontSizeSlider) {
    
    fontSizeSlider.addEventListener("input", (e) => {
      
      const newSize = e.target.value;
      root.style.setProperty("--base-font-size", `${newSize}px`);
      localStorage.setItem("app-font-size", newSize);
    });
  }

  // font change
  const fontSelect = document.getElementById("font-family");  
  if (fontSelect) {

    fontSelect.addEventListener("change", (e) => {

      const newFont = e.target.value;
      root.setAttribute("data-font", newFont);
      localStorage.setItem("app-font", newFont);
    });
  }
}


// ============================================================
// FUNCTIONS FOR FUNCTIONALITY
// ============================================================

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
    LoadAndRenderNotes();
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
    LoadAndRenderNotes();
    
  });
}

// TODO: přidat tady tuto funkcionalitu i do všech dalších overlayů
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

// předvoj funkce na renderování poznámek na main 
async function LoadAndRenderNotes() {

  // global var as list of nodes
  allLoadedNotes = await invoke("list_notes"); 
  
  RenderNotes(allLoadedNotes, false); 
  RenderFavoriteNotes(allLoadedNotes);
}

// 
function RenderNotes(notesToRender, searchYesNoBool) {

  // kontejner na main page + clean up
  const container = document.getElementById("view-journal");
  if (!container) return;

  container.innerHTML = ""; 
  
  // empty stav (první spuštění aplikace) -> custom stav
  if (notesToRender.length === 0 && searchYesNoBool == false){
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>Zatím tu nic není</h2>
        <p>Klikni na <strong>+ New Journal</strong> v levém menu a napiš svoji první poznámku!</p>
      </div>
    `;
    RenderFavoriteNotes(notesToRender);
    return;
  }
  else if(notesToRender.length === 0 && searchYesNoBool == true){
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Vaše vyhledávání je špatné, žádné záznamy nebyly nalezeny :(</p>
      </div>
    `;
    RenderFavoriteNotes(notesToRender);
    return;
  }
  
  // vykreslení každé uložené poznámky
  notesToRender.forEach((note) =>{

    const article = document.createElement("article");
    article.className = "entry";
    // article.dataset.filename = note.filename;

    // HTML struktura
    article.innerHTML = `
      <div class="entry-header">
        <div class="date">${note.date}</div>
        <div class="entry-actions">
          <button class="btn-fav ${note.favorite ? 'active' : ''}">${note.favorite ? '★' : '☆'}</button>
          <button class="btn-edit" title="Edit node">✏️</button>
          <button class="btn-delete" title="Delete node">🗑️</button>
        </div>
      </div>
      <div class="content">
        <p class="note-text">${note.content || "<i>Prázdná poznámka...</i>"}</p>
      </div>
    `;

    const favBtn = article.querySelector('.btn-fav');
    favBtn.addEventListener('click', async function () {
      
      note.favorite = !note.favorite;

      // animace hvězdičky, překliknutí hvězdičky
      if (note.favorite) {
        favBtn.classList.add('active');
        favBtn.textContent = '★';
      } else {
        favBtn.classList.remove('active');
        favBtn.textContent = '☆';
      }

      // update dat v souboru musí
      await invoke("update_note",{ 
        filename: note.filename, 
        content: note.content, 
        favorite: note.favorite 
      });

      // napřed aktualizace dat a pak se sidebar překreslí s novými daty
      const updatedNotes = await invoke("list_notes");
      RenderFavoriteNotes(updatedNotes);
    });

    // přidáme na stránku
    container.appendChild(article);

    // node editing part
    const editBtn = article.querySelector('.btn-edit');
      
    editBtn.addEventListener("click", function () {

      // uložení aktuální poznámky do global variables
      currentEditingFilename = note.filename;
      currentEditingFavorite = note.favorite;

      // otevřeme overlay a vložíme do textarey text této poznámky
      document.getElementById("edit-node-content").value = note.content;
      document.getElementById("detail-content-overlay").classList.remove("hidden");
    });

    // přidáme na stránku
    container.appendChild(article);

    // node editing part
    const deleteBtn = article.querySelector('.btn-delete');
      
    deleteBtn.addEventListener("click", function () {

      currentDeletingFilename = note.filename;

      // overlay open 
      document.getElementById("delete-content-overlay").classList.remove("hidden");
    });

    // přidáme na stránku
    container.appendChild(article);
  });

  // počáteční vykreslení sidebaru při načtení aplikace
  RenderFavoriteNotes(notesToRender);
}


// LOGIC for favorite (on the side) -> separátní funkce, protože nechci tu funkcionalitu kombinovat až moc
function RenderFavoriteNotes(allNotes) {
  
  const kontajnerus = document.getElementById("note-list");
  if (!kontajnerus) return;

  kontajnerus.innerHTML = ""; 

  // filtrace
  const favoriteNotes = allNotes.filter(note => note.favorite === true);

  // empty seznam
  if (favoriteNotes.length === 0) {
    kontajnerus.innerHTML = `
      <div class="note-item empty">
        <div class="note-item-preview" style="color: #b5b1b1; font-style: italic;">Žádné oblíbené poznámky...</div>
      </div>
    `;
    return;
  }

  // func pozn: allignment bude fungovat, protože tady nám to uřízne v css díky je overflow: hidden a text-overflow: ellipsis

  favoriteNotes.forEach((note) =>{

    const div = document.createElement("div");
    div.className = "note-item"; 
    
    div.innerHTML = `
      <div class="note-item-preview">${note.content || "<i>Prázdná poznámka...</i>"}</div>
    `;

    kontajnerus.appendChild(div);
  });
}

// TODO: když bude moc textu v normální poznámce na main page (tak zkrátit) ->nvm ještě
// TODO: kliknutí na poznámku (favorite) -> forwarding na místo na main page, kde se nachází konkrétní node

// func. segment = původně jsem volal tuto funkci z foreach cyklu a addEventListener (přidání posluchače události) jsem dal ke každé poznámce (ale takhle by vznikl deadlock -> zárva)
//                 takže jeden overlay, jeden exit a save tlačítko se volá pokaždé jen jednou
//                 nebudeme si komplikovat život, prostě přes klikání na edit tlačítko se bude otevírat a hotovo, nic víc    


// another overlay for closer look (edit) at specific node 
function EditOverlay(){

  const overlay = document.getElementById("detail-content-overlay");
  const closeBtn = document.getElementById("close-detail-node");
  const saveBtn = document.getElementById("save-node");

  closeBtn.addEventListener("click", function () {
      overlay.classList.add("hidden");
  });

  saveBtn.addEventListener("click", async function () {
    
    const kontetos = document.getElementById("edit-node-content").value;

    // different error handling attempt
    try {
        await invoke("update_note", { 
            filename: currentEditingFilename, 
            content: kontetos, 
            favorite: currentEditingFavorite 
        });

        document.getElementById("edit-node-content").value = "";
        // overlay.classList.add("hidden");
        LoadAndRenderNotes();
        
    } catch (error) {
        console.error("Chyba při ukládání:", error);
    }

    // zavření
    overlay.classList.add("hidden");
  
  });
}

// node deletion
function DeleteOverlay() {

  const overlay = document.getElementById("delete-content-overlay");
  const yesBtn = document.getElementById("yes-btn-node");
  const noBtn = document.getElementById("no-btn-node");

  noBtn.addEventListener("click", function () {
      overlay.classList.add("hidden");
  });

  yesBtn.addEventListener("click", async function () {

    // different error handling attempt
    try {

      const isDeleted = await invoke("delete_note", { 
        filename: currentDeletingFilename 
      });

      if (isDeleted) {
        
        overlay.classList.add("hidden");
        LoadAndRenderNotes();
      } 
      else {
        console.error("Nepodařilo se smazat soubor.");
      }
    } catch (error) {
      console.error("Chyba při mazání:", error);
    }

  });
}

// search fun (sranda)
function SearchFunctionality() {

  const btnSearch = document.getElementById("btn-search");
  const searchWrapper = document.getElementById("search-input-wrapper");
  const searchInput = document.getElementById("search-input");
  const btnCloseSearch = document.getElementById("close-search-btn");
  const sidebar = document.getElementById("sidebar");

  btnSearch.addEventListener("click", function () {

    btnSearch.style.display = "none";
    searchWrapper.classList.remove("hidden");
      
    // giving sidebar closing and opening fixed position
    sidebar.classList.remove("collapsed");
    
    NavigateTo("view-journal");
    
    // ready to write immediatelly
    searchInput.focus();
  });

  // closing search (mostly html adjustments)
  btnCloseSearch.addEventListener("click", () => {
    searchWrapper.classList.add("hidden");
    btnSearch.style.display = "flex";
    searchInput.value = ""; 
    LoadAndRenderNotes();
  });

  // algorithm for searching
  searchInput.addEventListener("input", (e) => {
  
    // transforming input string into more usable form
    const query = e.target.value.toLowerCase().trim();

    // almost foreach throught all nodes
    const filteredNotes = allLoadedNotes.filter(note => {

      const contentText = (note.content || "").toLowerCase();
      const dateText = (note.date || "").toLowerCase();

      return contentText.includes(query) || dateText.includes(query);
    });

    RenderNotes(filteredNotes, true);
  });
}

// TODO: interpret na markdown (+ preview okno vedle editu, budou tam 2)
// TODO: při vkládání více poznámek denně záleží na random dropu druhé části názvu .md souboru (protože když bude první písmeno náhodou Z, tak už se všechny ostatní soubory toho stejného dne budou vkládat jenom za něj a nebudou přímo nahoře = prostě windows souborový systém), for now s tím dokážu žít, protože nevím jak to moc opravit
// TODO: když dělám search, tak se hledají aji favorite (to nechci)