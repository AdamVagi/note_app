// translation dictionary and small runtime helpers for switching the UI language


// ===========================================================================
// complementary mechanisms cover the app's text:
//   1. Static HTML (labels, headings, button text that already exists in
//      index.html when the page loads) is tagged with data-i18n* attributes
//      and translated in one sweep by applyStaticTranslations()
//   2. Text main.js generates at runtime (toasts, empty states, per-entry
//      aria-labels, anything built via template literals or createElement)
//      is translated by calling t(key) directly at the point it's created,
//      since a one-time DOM sweep can never reach content that doesn't
//      exist yet
// Both draw from the same dictionary, so there's one place to add a string
// ===========================================================================
 

export const translations = {
  en: {
    // sidebar
    app_title: "JOURNAL",
    sidebar_toggle_title: "Collapse sidebar",
    new_entry_title: "New entry",
    new_entry_label: "New Journal",
    search_title: "Search",
    search_label: "Search",
    search_placeholder: "Search...",
    search_cancel_title: "Cancel search",
    favorites_heading: "Favorite Entries",
    footer_settings_title: "Settings",
    footer_settings_label: "Settings",
    footer_about_title: "About App",
    footer_about_label: "About App",
    footer_feedback_title: "Send feedback",
    footer_feedback_label: "App Improvement",
 
    // shared
    action_close: "Close",
 
    // settings panel
    settings_heading: "Settings",
    theme_label: "Colour Theme:",
    theme_desc: "Switch between light and dark theme",
    fontsize_label: "Font Size:",
    fontsize_desc: "Adjust the text size",
    typography_label: "Typography:",
    typography_desc: "Choose your preferred font style",
    font_default: "Rajdhani (Default)",
    font_system: "System Default",
    font_sans: "Sans-Serif (Modern)",
    font_serif: "Serif (Classic)",
    font_mono: "Monospace (Code)",
    language_label: "Language:",
    language_desc: "Choose your preferred language",
    language_option_en: "ENGLISH",
    language_option_cs: "ČEŠTINA",
    data_reset_heading: "Data & Reset",
    reset_label: "Reset Settings:",
    reset_desc: "Restore default UI preferences",
    reset_button: "Reset to Default",
    // TODO: reset_toast: "Settings restored to defaults.",
 
    // about panel
    about_heading: "About App",
    app_details_heading: "Application Details",
    version_label: "Current Version:",
    tech_label: "Technology:",
    tech_value: "Built with Tauri, Rust & JavaScript",
    license_label: "License:",
    license_value: "MIT License — Personal & Non-commercial",
    links_heading: "Links & Resources",
    source_label: "Source Code:",
    source_desc: "View repository on GitHub",
    whatsnew_label: "What's new in this version:",
    whatsnew_value: "First fully working version (MVP) — the initial public release!",
    copyright: "© 2026 Created with passion",
 
    // feedback panel
    feedback_heading: "App Feedback",
    feedback_email_label: "Your email:",
    feedback_email_placeholder: "email@example.com",
    feedback_message_label: "Your idea for improvement:",
    feedback_message_placeholder: "What would you change?",
    feedback_submit: "Send Feedback",
    feedback_success_toast: "Thanks for the feedback!",
    feedback_error_toast: "Something went wrong while sending your feedback. Please try again.",
    feedback_network_error_toast: "Couldn't reach the feedback server. Check your internet connection.",

    // new entry overlay
    new_overlay_title: "New Journal Entry",
    new_overlay_placeholder: "Write your thoughts...",
    markdown_hint: "Markdown is supported: **bold**, *italic*, # title, - list",
    new_entry_hint: "Your entry text after insertion...",
    new_entry_add: "Add Entry",
    new_entry_create_error_toast: "Couldn't create a new entry. Check that the app can write to disk.",
    new_entry_save_error_toast: "Saving the entry failed. Your text is still here - please try again.",

    // edit entry overlay
    edit_overlay_title: "Edit Entry",
    edit_overlay_placeholder: "Write your entry here...",
    edit_overlay_submit: "Save Entry",
    edit_save_error_toast: "Saving your changes failed. Please try again.",
 
    // delete confirmation overlay
    delete_overlay_title: "Delete Entry?",
    delete_overlay_desc: "This can't be undone. Are you sure you want to delete this entry?",
    delete_confirm: "Delete",
    delete_cancel: "Cancel",
    delete_error_toast: "Couldn't delete this entry. Please try again.",
 
    // entry cards
    entry_edit_title: "Edit entry",
    entry_delete_title: "Delete entry",
    empty_entry: "Empty entry…",
    favorite_toggle_error_toast: "Couldn't update favorites. Please try again.",
 
    // favorites sidebar list
    favorites_empty: "No favorite entries yet.",
 
    // empty states
    // TODO: tohle je všechno z js
    empty_no_entries_heading: "Nothing here yet",
    empty_no_entries_body: "Click <strong>{button}</strong> in the sidebar to write your first entry.",
    empty_no_entries_button_label: "+ New Journal",
    empty_no_search_results: "No entries match your search.",
  },

      // END HERE  ----------------

 
  cs: {
    // Sidebar
    app_title: "DENÍK",
    sidebar_toggle_title: "Sbalit postranní panel",
    sidebar_toggle_aria: "Sbalit nebo rozbalit postranní panel",
    new_entry_title: "Nový záznam",
    new_entry_aria: "Vytvořit nový zápis do deníku",
    new_entry_label: "Nový zápis",
    search_title: "Hledat",
    search_aria: "Prohledat vaše záznamy",
    search_label: "Hledat",
    search_input_sr_label: "Hledat v záznamech",
    search_placeholder: "Hledat...",
    search_cancel_title: "Zrušit hledání",
    search_cancel_aria: "Zrušit hledání",
    favorites_heading: "Oblíbené záznamy",
    footer_settings_title: "Nastavení",
    footer_settings_aria: "Otevřít nastavení",
    footer_settings_label: "Nastavení",
    footer_about_title: "O aplikaci",
    footer_about_aria: "O této aplikaci",
    footer_about_label: "O aplikaci",
    footer_feedback_title: "Odeslat zpětnou vazbu",
    footer_feedback_aria: "Poslat zpětnou vazbu k aplikaci",
    footer_feedback_label: "Vylepšení aplikace",
 
    // Shared
    action_close: "Zavřít",
 
    // Settings panel
    settings_heading: "Nastavení",
    settings_close_aria: "Zavřít nastavení",
    theme_label: "Barevný motiv:",
    theme_desc: "Přepínání mezi světlým a tmavým motivem",
    fontsize_label: "Velikost písma:",
    fontsize_desc: "Upravte velikost textu",
    fontsize_aria: "Velikost písma",
    typography_label: "Typografie:",
    typography_desc: "Vyberte preferovaný styl písma",
    font_default: "Rajdhani (výchozí)",
    font_system: "Systémové výchozí",
    font_sans: "Bezpatkové (moderní)",
    font_serif: "Patkové (klasické)",
    font_mono: "Monospace (kód)",
    language_label: "Jazyk:",
    language_desc: "Vyberte preferovaný jazyk",
    language_option_en: "ENGLISH",
    language_option_cs: "ČEŠTINA",
    data_reset_heading: "Data a obnovení",
    reset_label: "Obnovit nastavení:",
    reset_desc: "Obnovit výchozí nastavení rozhraní",
    reset_button: "Obnovit výchozí",
    reset_toast: "Nastavení bylo obnoveno na výchozí hodnoty.",
 
    // About panel
    about_heading: "O aplikaci",
    about_close_aria: "Zavřít stránku O aplikaci",
    app_details_heading: "Podrobnosti o aplikaci",
    version_label: "Aktuální verze:",
    tech_label: "Technologie:",
    tech_value: "Postaveno na Tauri, Rustu a JavaScriptu",
    license_label: "Licence:",
    license_value: "Licence MIT — pro osobní a nekomerční použití",
    links_heading: "Odkazy a zdroje",
    source_label: "Zdrojový kód:",
    source_desc: "Zobrazit repozitář na GitHubu",
    github_button: "GitHub",
    whatsnew_label: "Co je nového v této verzi:",
    whatsnew_value: "První funkční verze (MVP) — první veřejné vydání!",
    copyright: "© 2026 Vytvořeno s láskou",
 
    // Feedback panel
    feedback_heading: "Zpětná vazba",
    feedback_close_aria: "Zavřít formulář zpětné vazby",
    feedback_email_label: "Váš e-mail (nepovinné, pokud chcete odpověď):",
    feedback_email_placeholder: "email@priklad.cz",
    feedback_message_label: "Váš nápad na vylepšení:",
    feedback_message_placeholder: "Co byste změnili?",
    feedback_submit: "Odeslat zpětnou vazbu",
    feedback_success_toast: "Díky za zpětnou vazbu! Pokud jste nechali e-mail, ozveme se.",
    feedback_error_toast: "Při odesílání zpětné vazby se něco pokazilo. Zkuste to prosím znovu.",
    feedback_network_error_toast: "Nepodařilo se spojit se serverem. Zkontrolujte připojení k internetu.",
 
    // New entry overlay
    new_overlay_title: "Nový zápis do deníku",
    new_overlay_placeholder: "Napište své myšlenky... (podporuje Markdown)",
    new_overlay_submit: "Přidat záznam",
    entry_text_sr_label: "Text záznamu",
    new_entry_create_error_toast: "Nepodařilo se vytvořit nový záznam. Zkontrolujte, zda může aplikace zapisovat na disk.",
    new_entry_save_error_toast: "Uložení záznamu selhalo. Váš text zůstal zachován - zkuste to prosím znovu.",

    /*
    new_overlay_title: "New Journal Entry",
    new_overlay_placeholder: "Write your thoughts...",
    markdown_hint: "Markdown is supported: **bold**, *italic*, # title, - list",
    new_entry_hint: "Your entry text after insertion...",
    new_entry_add: "Add Entry",
    new_entry_create_error_toast: "Couldn't create a new entry. Check that the app can write to disk.",
    new_entry_save_error_toast: "Saving the entry failed. Your text is still here - please try again.",

    data-i18n="markdown_hint">Markdown is supported: **bold**, *italic*, # title, - list
    data-i18n-placeholder="new_entry_placeholder" placeholder="Write your thoughts..."
    data-i18n="new_entry_hint">Your entry text after insertion...
    data-i18n="new_entry_add">Add Entry
    */ 
 
    // Edit entry overlay
    edit_overlay_title: "Upravit záznam",
    edit_overlay_placeholder: "Napište svůj záznam sem...",
    edit_overlay_submit: "Uložit záznam",
    edit_save_error_toast: "Uložení změn selhalo. Zkuste to prosím znovu.",
 
    // Delete confirmation overlay
    delete_overlay_title: "Smazat záznam?",
    delete_overlay_desc: "Tuto akci nelze vzít zpět. Opravdu chcete tento záznam smazat?",
    delete_confirm: "Smazat",
    delete_cancel: "Zrušit",
    delete_error_toast: "Záznam se nepodařilo smazat. Zkuste to prosím znovu.",
 
    // Entry cards
    favorite_add_aria: "Přidat mezi oblíbené",
    favorite_remove_aria: "Odebrat z oblíbených",
    entry_edit_title: "Upravit záznam",
    entry_edit_aria: "Upravit záznam",
    entry_delete_title: "Smazat záznam",
    entry_delete_aria: "Smazat záznam",
    empty_entry: "Prázdný záznam…",
    favorite_toggle_error_toast: "Nepodařilo se upravit oblíbené. Zkuste to prosím znovu.",
 
    // Favorites sidebar list
    favorites_empty: "Zatím žádné oblíbené záznamy.",
    favorites_open_aria: "Otevřít oblíbený záznam z {date}",
 
    // Empty states
    empty_no_entries_heading: "Zatím tu nic není",
    empty_no_entries_body: "Kliknutím na <strong>{button}</strong> v postranním panelu napíšete svůj první záznam.",
    empty_no_entries_button_label: "+ Nový zápis",
    empty_no_search_results: "Žádné záznamy neodpovídají vašemu hledání.",
  },
};

 
// for the rest of the settings this is inside main.js
const STORAGE_KEY = "app-language";
const DEFAULT_LANG = "en";
 
let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
if (!translations[currentLang]) currentLang = DEFAULT_LANG;
 

// TODO: finish -> 
/**
 * Returns the translated string for `key` in the current language.
 * Falls back to English, then to the key itself, so a missing translation
 * shows something readable instead of breaking the page.
 * `vars` fills in {placeholders} in the string, e.g. t("x", { date: "..." }).
 */
/*export function t(key, vars) {
  const dict = translations[currentLang] || translations[DEFAULT_LANG];
  let str = dict[key] ?? translations[DEFAULT_LANG][key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.replaceAll(`{${name}}`, value);
    }
  }
  return str;
}
 
export function getLanguage() {
  return currentLang;
}*/
 
/** Returns the list of available language codes, e.g. ["en", "cs"]. */
/*export function availableLanguages() {
  return Object.keys(translations);
}
 
export function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.setAttribute("lang", lang);
  applyStaticTranslations();
}*/
 
/**
 * Applies translations to every element under `root` tagged with a
 * data-i18n* attribute. Covers text content, placeholder, aria-label and
 * title. This only reaches static HTML that already exists in the DOM -
 * content main.js generates at runtime (toasts, entry cards, empty states)
 * is translated at creation time via t(), not by this sweep.
 */
/*export function applyStaticTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
  });
}*/
 