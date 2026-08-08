// invoke() -> propojení frontend JavaScript a backend Rust
const { invoke } = window.__TAURI__.core;

// TODO: tady toho chci mít co nejmíň, protože se zatím nechci učit js

// ======================================================
// INICIALIZACE APLIKACE (main)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {

    SidebarMovement();
    ButtonsNavigation();
    // NavigateTo(viewId); -> nemůže bc tu funkci nepotřebujeme (volá se z jiné funkce)
    NodeOverlay();
    AutoOverlayAdjustment();
});


/* ============================================================
   VĚCI, KTERÉ Z UI MUSÍM PROSTĚ PŘEPSAT DO JS (nejde jinak)
   ============================================================ */

// TODO: toto ještě jednou projít pro osvěžení a lepší pochopení (protože je 23:41)

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

  // Schovej všechny stránky
  for (const view of allselectors)
  {
      view.classList.remove("active");
  }

  // Najdi stránku, kterou chceme zobrazit
  const targetView = document.getElementById(viewId);

  // Pokud existuje, zobraz ji
  if (targetView)
  {
      targetView.classList.add("active");
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

  // tady je nějakým způsobem waiting

  const close_button = document.querySelector(".close-new-node-btn");
  
  close_button.addEventListener("click", function () {
      overlay.classList.add("hidden");
  });
}

// function for allignment adjustment during node inserting (automatic)
function AutoOverlayAdjustment() {

  const text_area = document.getElementById('node-content');

  text_area.addEventListener('input', function() {

    // first reset výšky na 'auto', aby se pole mohlo případně i zmenšit, když uživatel maže text
    this.style.height = 'auto';
    
    // then set výšky podle skutečného obsahu + přičteme 2px kvůli borderu
    this.style.height = (this.scrollHeight + 2) + 'px';
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