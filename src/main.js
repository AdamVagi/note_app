// import language translation (functions) module from i18n.js 
import { t, getLanguage, setLanguage, applyStaticTranslations } from "./i18n.js";

// invoke() -> connection between frontend (JavaScript) calls and backend (Rust) commands
const { invoke } = window.__TAURI__.core;

// EOL breaks in markdown are badly translated into HTML (<br>) -> fix
marked.setOptions({ breaks: true, gfm: true });


// ======================================================
// APP INITIALIZATION (main)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {

  document.documentElement.setAttribute("lang", getLanguage());
  applyStaticTranslations();
  
  LoadSavedSettings();

  SidebarMovement();
  ButtonsNavigation();
  NodeOverlay();
  AutoOverlayAdjustment();
  EditOverlay();
  DeleteOverlay();
  SearchFunctionality();
  SettingsFunctionality();
  FeedbackSend();
  ExternalLinks();
  Notifications();

  // loading nodes immediately after app launch
  LoadAndRenderNotes();
});


// ======================================================
// GLOBAL VARIABLES
// -> tracks which entry is currently open in the edit/delete overlay, and
//    keeps the full, unfiltered list of entries from the last load
// ======================================================

let currentEditingFilename = "";
let currentDeletingFilename = "";
let currentEditingFavorite = false;
let allLoadedNotes = []; 


// ============================================================
// UI SETTINGS
// ============================================================

// applies saved settings (or defaults) on startup, and keeps the settings controls themselves in sync with whatever was applied
function LoadSavedSettings() {

  const root = document.documentElement; 

  // loading variables from localStorage or default
  const savedTheme = localStorage.getItem("app-theme") || "dark";
  const savedFontSize = localStorage.getItem("app-font-size") || "16";
  const savedFont = localStorage.getItem("app-font") || "Rajdhani";

  root.setAttribute("data-theme", savedTheme);
  root.setAttribute("data-font", savedFont);
  root.style.setProperty("--base-font-size", `${savedFontSize}px`);

  const themeToggle = document.getElementById("theme-toggle");
  const fontSizeSlider = document.getElementById("font-size");
  const fontSelect = document.getElementById("font-family");
  const languageSelect = document.getElementById("language-select");

  // sync
  if (themeToggle) {
    themeToggle.checked = savedTheme === "light";
  }
  if (fontSizeSlider) {
    fontSizeSlider.value = savedFontSize;
  }
  if (fontSelect) {
    fontSelect.value = savedFont;
  }
  if (languageSelect) {
    languageSelect.value = getLanguage();
  }
}

// binding the controls on the settings overlay
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

  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {

      // Static HTML is already retranslated by setLanguage()
      // Anything main.js that generated dynamically (entry cards, favorites sidebar) is created in render time, so it needs a fresh render to change language too
      setLanguage(e.target.value);
      LoadAndRenderNotes();
    });
  }

  // reset button
  const resetButton = document.getElementById("btn-reset-settings");
  if (resetButton) {

    resetButton.addEventListener("click", () => {

      localStorage.removeItem("app-theme");
      localStorage.removeItem("app-font-size");
      localStorage.removeItem("app-font");
      localStorage.removeItem("app-language");
      setLanguage("en");
      LoadSavedSettings();
      showNotification(t("reset_toast"), "success");
    });
  }
}


// ============================================================
// NOTIFICATIONS (toast messages)
// ============================================================
 
function Notifications() {

  // if the container already exists, do nothing and go away (duplicate protection)
  if (document.getElementById("toast-region")) return;
 
  // creates the main, empty and yet invisible "drawer" (div)
  const region = document.createElement("div");
  region.id = "toast-region";
  region.className = "toast-region";
  document.body.appendChild(region);
}
 
// shows a short, self-dismissing message. `type` is "success", "error", or "info"
function showNotification(message, type = "info") {

  const region = document.getElementById("toast-region");
  if (!region) return;
 
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  region.appendChild(toast);
 
  requestAnimationFrame(() => toast.classList.add("visible"));
 
  setTimeout(() => {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 4000);
}


// ============================================================
// EXTERNAL LINKS
// ============================================================
 
// opens http(s) links (the GitHub) in the user's default browser instead of navigating this app's own window away from itself
function ExternalLinks() {

  // listener is used for the entire application -> if the user clicked on the URL link outside the app
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='http://'], a[href^='https://']");
    // if it was not an external link (local button), the function will end immediately
    if (!link) return;
 
    event.preventDefault();
 
    // uses the Tauri "opener" plugin that's already configured on the Rust side
    const opener = window.__TAURI__ && window.__TAURI__.opener;
    if (opener && typeof opener.openUrl === "function") {
      opener.openUrl(link.href);
    } else {
      window.open(link.href, "_blank", "noopener,noreferrer");
    }
  });
}


// ============================================================
// SIDEBAR
// ============================================================

function SidebarMovement() {

  const sidebar = document.getElementById('sidebar');
  const btnToggle = document.getElementById('btn-toggle');

  // existence fault check (if error, js not responding by default)
  if (btnToggle && sidebar) {

    btnToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
};

// when the button is pressed, it is passed to another function that switches the active state
// single-page navigation: shows the requested view and hides the rest
function ButtonsNavigation() {
  
  // all the buttons responsible for view switching
  const buttons = document.querySelectorAll(".footer-btn, .close-btn");

  for (const button of buttons) {
    
    button.addEventListener("click", function () {
      
      // directing throught data-target (HTML)
      const target = button.getAttribute("data-target");
      NavigateTo(target);
    });
  }
}
  

// single-page navigation: shows the requested view and hides the rest
// buttons functionality connection to other pages (SPA = single page application)
function NavigateTo(viewId) {  // -> the argument we have in HTML (data-target)
 
  // all the elements that have the property = app-view (js is able to switch the page by ID)
  const allselectors = document.querySelectorAll('.app-view');

  // hide all the views first
  for (const view of allselectors)
  {
      view.classList.remove("active");
  }

  // display only the one 
  const targetView = document.getElementById(viewId);

  if (targetView)
  {
      targetView.classList.add("active");
  }

  // refresh on main page
  if (viewId === "view-journal") {
    LoadAndRenderNotes();
  }
}


// ============================================================
// OVERLAY HELPERS
// -> better manipulation in app just throught keystrokes
// ============================================================
 
// element the user was on just before opening the overlay
let lastFocusedElement = null;
 
// overlay open + focus set
function openOverlay(overlay, focusTarget) {

  lastFocusedElement = document.activeElement;
  overlay.classList.remove("hidden");
  const target = focusTarget || overlay.querySelector("textarea, button, input");
  if (target) target.focus();
}
 
// closing current overlay + return to last page
function closeOverlay(overlay) {

  overlay.classList.add("hidden");
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}
 

// the ways in which the user can close the overlay (by clicking outside the overlay) = click-on-backdrop-to-close behavior
function setupOverlayDismissal(overlay) {

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeOverlay(overlay);
    }
  });
 
  // Esc keystroke 
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeOverlay(overlay);
    }
  });
}

// ============================================================
// NEW ENTRY OVERLAY
// ============================================================

// another function bc overlay is not the same as page in SPA (opening and closing needs to be handle differently)
function NodeOverlay() {

  const open_button = document.querySelector(".action-open-btn");
  const overlay = document.getElementById("node-overlay");
  const content = document.getElementById("node-content");
  const close_button = document.querySelector(".close-new-node-btn");
  const add_button = document.querySelector(".add-node-btn");
  const contentDisplay = document.getElementById("node-content-preview");

  // background click check
  setupOverlayDismissal(overlay);

  open_button.addEventListener("click", () => {

    // clearing content before the window is shown
    document.getElementById("node-content").value = "";
    contentDisplay.innerHTML = `<i>${t('new_entry_hint')}</i>`;
    content.style.height = "";
    contentDisplay.style.height = "";

    openOverlay(overlay, content);
  });

  // ctrl/cmd+n keyword shortcut
  document.addEventListener("keydown", (event) => {
    
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {

      event.preventDefault();

      // clearing content before the window is shown
      document.getElementById("node-content").value = "";
      contentDisplay.innerHTML = `<i>${t('new_entry_hint')}</i>`;
      content.style.height = "";
      contentDisplay.style.height = "";

      openOverlay(overlay, content);
    }
  });

  close_button.addEventListener("click", () => {
  
    closeOverlay(overlay);
  });

  // -------------------- MARKDOWN PREVIEW ----------------------
  content.addEventListener("input", (e) => {

    const query = e.target.value;

    if (query.trim() === "") {
      contentDisplay.innerHTML = `<i>${t("new_entry_hint")}</i>`;
      return;
    }
    
    const justHtml = marked.parse(query);
    const readyHtmlContent = DOMPurify.sanitize(justHtml);

    // displaying
    contentDisplay.innerHTML = readyHtmlContent;
  });


  // ------------------- NODE ADD BUTTON PRESS -------------------
  add_button.addEventListener("click", submitNewEntry);


  // ------------------- NODE ADD KEYBOARD SHORTCUT -------------------
  // Ctrl/Cmd+Enter saves + EXIT the textarea, Ctrl/Cmd+S handle this situation the exact same way (calls same function below)
  content.addEventListener("keydown", (event) => {

    if ((event.metaKey || event.ctrlKey) && (event.key === "Enter" || event.key.toLowerCase() === "s")) {
    event.preventDefault(); 
    submitNewEntry();
  }
  });
}

// creates the note file, writes the typed content to it, and closes the page on success
// called from the "Add Entry" button or Ctrl/Cmd+Enter or Ctrl/Cmd+S (must by async)
async function submitNewEntry() {
  const overlay = document.getElementById("node-overlay");
  const textarea = document.getElementById("node-content");

  try {
      // we want filename + extract data from element (return je result || string = error)
      const newNoteData = await invoke("new_note");

      // check 
      if (!newNoteData) {
        showNotification(t("new_entry_create_error_toast"), "error");
        return;
      }

      // ff Rust returns Ok(()), the code continues normally on the next line
      // ff Rust returns Err("error"), the code immediately jumps to the `catch` block
      await invoke("insert_note", {
        filename: newNoteData,
        content: textarea.value
      });

      closeOverlay(overlay);
      showNotification(t("new_entry_created_toast"), "success");

      // update main page with notes
      LoadAndRenderNotes();
    
    } catch (error) {
    // string you defined in Rust in Err(...) is captured
    showNotification(t("new_entry_save_error_toast"), "error");
    
    // the overlay will remain open so the user doesn't lose the text
  }
}

// function for allignment adjustment during node inserting (automatic)
function AutoOverlayAdjustment() {

  const text_area = document.getElementById("node-content");

  text_area.addEventListener("input", function() {

    // first reset the height to 'auto' so that the field can eventually shrink when the user deletes text
    this.style.height = "auto";
    
    // then set the height according to the actual content + add 2px for the border
    this.style.height = (this.scrollHeight + 2) + "px";
  });
}


// ============================================================
// LOADING AND RENDERING ENTRIES
// ============================================================

// fetches every entry from the backend and refreshes both the main list and the favorites sidebar from that single, authoritative result
async function LoadAndRenderNotes() {

  // global var as list of nodes
  allLoadedNotes = await invoke("list_notes"); 
  
  RenderNotes(allLoadedNotes, false); 
  RenderFavoriteNotes(allLoadedNotes);
}

// renders the main journal list
function RenderNotes(notesToRender, searchYesNoBool) {

  // container for main page + cleanup
  const container = document.getElementById("view-journal");
  if (!container) return;

  container.innerHTML = ""; 
  
  // empty state (first application launch) -> custom state
  if (notesToRender.length === 0 && searchYesNoBool == false){
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>Zatím tu nic není</h2>
        <h2>${t("empty_no_entries_heading")}</h2>
        <p>${t("empty_no_entries_body")}</p>
      </div>
    `;
    return;
  }
  // no matching search results
  else if(notesToRender.length === 0 && searchYesNoBool == true){
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>${t("empty_no_search_results")}</p>
      </div>
    `;
    return;
  }
  
  // render each saved note
  notesToRender.forEach((note) =>{

    const article = document.createElement("article");
    article.className = "entry";

    // id for scrollIntoView() -> replacing all characters that are not allowed
    article.id = note.filename.replace(/[^a-zA-Z0-9_-]/g, "");

    // HTML -> markdown formating transition
    const justHtml = marked.parse(note.content);
    const readyHtmlContent = DOMPurify.sanitize(justHtml);

    // HTML struktura
    article.innerHTML = `
      <div class="entry-header">
        <div class="date">${note.date}</div>
        <div class="entry-actions">
          <button class="btn-fav ${note.favorite ? 'active' : ''}">${note.favorite ? '★' : '☆'}</button>
          <button class="btn-edit" title="${t('entry_edit_title')}">✏️</button>
          <button class="btn-delete" title="${t('entry_delete_title')}">🗑️</button>
        </div>
      </div>
      <div class="content">
        <p class="note-text">${readyHtmlContent || `<i>${t("empty_entry")}</i>`}</p>
      </div>
    `;

    // --- FAVORITE BUTTON ---
    const favBtn = article.querySelector('.btn-fav');
    favBtn.addEventListener('click', async function () {
      
      note.favorite = !note.favorite;

      // star animation, star change
      if (note.favorite) {
        favBtn.classList.add('active');
        favBtn.textContent = '★';
      } else {
        favBtn.classList.remove('active');
        favBtn.textContent = '☆';
      }

      // update data in file 
      try {
        await invoke("update_note", { 
          filename: note.filename, 
          content: note.content, 
          favorite: note.favorite 
        });

        // first update the data and then redraw the sidebar with the new data
        const updatedNotes = await invoke("list_notes");
        RenderFavoriteNotes(updatedNotes);

      } catch (error) {

        // if the write fails (filesystem error), return 
        note.favorite = !note.favorite;
        favBtn.classList.toggle('active', note.favorite);
        favBtn.textContent = note.favorite ? '★' : '☆';
        showNotification(t("favorite_toggle_error_toast"), "error");
        return;
      }
    });

    // --- EDIT BUTTON ---
    const editBtn = article.querySelector('.btn-edit');
      
    editBtn.addEventListener("click", function () {

      // save current note to global variables
      currentEditingFilename = note.filename;
      currentEditingFavorite = note.favorite;

      // open the overlay and insert the text of this note into the textarea
      document.getElementById("edit-node-content").value = note.content;
      document.getElementById("detail-content-overlay").classList.remove("hidden");
    });

    // --- DELETE BUTTON ---
    const deleteBtn = article.querySelector('.btn-delete');
      
    deleteBtn.addEventListener("click", function () {

      currentDeletingFilename = note.filename;

      // overlay open 
      document.getElementById("delete-content-overlay").classList.remove("hidden");
    });

    // add all the changes to the main page
    container.appendChild(article);
  });

  // initial rendering of the sidebar when the application loads
  RenderFavoriteNotes(allLoadedNotes);
}

// reduces Markdown source to plain text for the one-line sidebar preview (rendering it through the same pipeline used for the full entry)
// preview can never show headings and bold text (result come out as plain words)
function toPlainTextPreview(markdownContent) {

  if (!markdownContent) return "";
  const safeHtml = DOMPurify.sanitize(marked.parse(markdownContent));
  // helper container (temporary storage)
  const scratch = document.createElement("div");
  scratch.innerHTML = safeHtml;
  // transition HTML into plain text
  return scratch.textContent.replace(/\s+/g, " ").trim();
}
 
// renders the "Favorite Entries" list in the sidebar
function RenderFavoriteNotes(allNotes) {
  
  const kontajnerus = document.getElementById("note-list");
  if (!kontajnerus) return;

  kontajnerus.innerHTML = ""; 

  // filtration
  const favoriteNotes = allNotes.filter(note => note.favorite === true);

  // empty list
  if (favoriteNotes.length === 0) {
    kontajnerus.innerHTML = `
      <div class="note-item empty">
        <div class="note-item-preview" style="color: #b5b1b1; font-style: italic;">${t("favorites_empty")}</div>
      </div>
    `;
    return;
  }

  // function note: alignment will work because it cuts off here in CSS thanks to overflow: hidden and text-overflow: ellipsis

  favoriteNotes.forEach((note) =>{

    const div = document.createElement("div");
    div.className = "note-item";

    div.innerHTML = `
      <div class="note-item-preview">${toPlainTextPreview(note.content) || `<i>${t("empty_entry")}</i>`}</p>
    `;
 
    div.addEventListener("click", () => {
      
      NavigateTo("view-journal");
      // again create same id as before 
      const safeId = note.filename.replace(/[^a-zA-Z0-9_-]/g, "");
      
      const noteElement = document.getElementById(safeId);
      
      if (noteElement) {

        // scroll smoothly to the element
        noteElement.scrollIntoView({ 
          behavior: "smooth", 
          block: "start"     
        });

        noteElement.style.transition = "background-color 0.5s ease";
        noteElement.style.backgroundColor = "rgba(255, 255, 0, 0.3)"; 
        
        setTimeout(() => {
          noteElement.style.backgroundColor = ""; 
        }, 1500);
      }
    });

    kontajnerus.appendChild(div);
  });
}


// ============================================================
// EDIT ENTRY OVERLAY
// ============================================================

function EditOverlay(){

  const overlay = document.getElementById("detail-content-overlay");
  const closeBtn = document.getElementById("close-detail-node");
  const saveBtn = document.getElementById("save-node");
  const textarea = document.getElementById("edit-node-content");

  setupOverlayDismissal(overlay);

  closeBtn.addEventListener("click", function () {
      overlay.classList.add("hidden");
  });


  // ------------------- NODE EDIT BY BUTTON -------------------
  saveBtn.addEventListener("click", submitEditedEntry);


  // ------------------- NODE EDIT KEYBOARD SHORTCUT -------------------
  // Ctrl/Cmd+Enter saves + EXIT the textarea, Ctrl/Cmd+S handle this situation the exact same way (calls same function below)
  textarea.addEventListener("keydown", (event) => {

    if ((event.metaKey || event.ctrlKey) && (event.key === "Enter" || event.key.toLowerCase() === "s")) {
      event.preventDefault();
      submitEditedEntry();
    }
  });
}

// saves changes to whichever entry is currently open for editing
// called from the "Save Entry" button or Ctrl/Cmd+Enter or Ctrl/Cmd+S
async function submitEditedEntry() {
  const overlay = document.getElementById("detail-content-overlay");
  const textarea = document.getElementById("edit-node-content");

  // different error handling attempt
  try {
    await invoke("update_note", { 
        filename: currentEditingFilename, 
        content: textarea.value,
        favorite: currentEditingFavorite 
    });

    textarea.value = "";
    closeOverlay(overlay);
    LoadAndRenderNotes();
    showNotification(t("edit_entry_saved_toast"), "success");
      
  } catch (error) {
    showNotification(t("edit_save_error_toast"), "error");
  }
}


// ============================================================
// DELETE ENTRY OVERLAY
// ============================================================

function DeleteOverlay() {

  const overlay = document.getElementById("delete-content-overlay");
  const yesBtn = document.getElementById("yes-btn-node");
  const noBtn = document.getElementById("no-btn-node");

  setupOverlayDismissal(overlay);

  noBtn.addEventListener("click", function () {
      closeOverlay(overlay);
  });

  yesBtn.addEventListener("click", async function () {

    try {

      await invoke("delete_note", { 
        filename: currentDeletingFilename 
      });

      closeOverlay(overlay);
      LoadAndRenderNotes();
      showNotification(t("delete_entry_deleted_toast"), "success");

    } catch (error) {
      showNotification(t("delete_error_toast"), "error");
    }

  });
}

// ============================================================
// SEARCH
// ============================================================

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

  // ctrl/cmd+f keyword shortcut
  document.addEventListener("keydown", (event) => {
    
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {

      btnSearch.style.display = "none";
      searchWrapper.classList.remove("hidden");
        
      // giving sidebar closing and opening fixed position
      sidebar.classList.remove("collapsed");
      
      NavigateTo("view-journal");
      
      // ready to write immediatelly
      searchInput.focus();;
    }
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


// ============================================================
// FEEDBACK FORM
// ============================================================

function FeedbackSend(){
  
  const form = document.getElementById('feedback-form');

  form.addEventListener('submit', async function(event) {
    
    // prevent the page from reloading
    event.preventDefault(); 
    
    // get data from the form
    const data = new FormData(event.target);
    
    // send data
    fetch(event.target.action, {
      method: form.method,
      body: data,
      headers: {
          'Accept': 'application/json'
      }
    }).then(response => {

      if (response.ok) {

        showNotification(t("feedback_success_toast"), "success");
        form.reset();
        document.getElementById('close-feedback').click(); 
      } else {

        showNotification(t("feedback_error_toast"), "error");
      }
    }).catch(error => {
      showNotification(t("feedback_network_error_toast"), "error");
    });
  });
}