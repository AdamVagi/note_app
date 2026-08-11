// PLACE FOR BACKEND

//------------------------
// INCLUDES:
//------------------------
use std::fs;                            // file system (read, write, remove file)
use std::path::PathBuf;                 // buffer pro ukládání a editaci paths, funkce (push, join, pop)
use tauri::Manager;                     // important pro path volání
use rand::{Rng, distr::Alphanumeric};   // generování random alfanumerického řetězce
use serde::Serialize;                   // sending structs to js


// rust knowledge:
// let ->       vytvořené proměnné, 
// mut ->       měnitelná hodnota v průběhu (bez mut nelze měnit hodnotu)
// unwrap() ->  jestli je tam hodnota, vrať ji, jinak program skončí
// join() ->    do path vloží path + parametr, kterým může být například soubor


//------------------------
// HELPER FUNCTIONS:
//------------------------

// vrací path do vytvořeného adresáře "notes" pro uložení notes 
fn notes_dir(app: &tauri::AppHandle) -> PathBuf{
    // zjištění path pro složku, kde budou uložena data aplikace
    let mut path = app.path().app_data_dir().unwrap();
    // do path se přidá další adresář (\MyApp\notes)
    path.push("notes");
    // pokud neexistuje -> vytvoř, pokud existuje jako notes, tak nech tak jak je (ošetření prvotního insertu)
    fs::create_dir_all(&path).unwrap();

    // print výpisy
    // TODO: to pak odstranit (jen testing)
    println!("Složka s poznámkami se nachází zde: {:?}", path);

    path
}

// generování random stringu
fn random_string(length: usize) -> String {

    // zapnutí generování a vytvoření iterátu pro generování znaků
    rand::rng()
        .sample_iter(&Alphanumeric)

        .take(length)
        // změna na char a collecting
        .map(char::from)
        .collect()
}

// vytažení metadat ze souboru
fn parse_markdown_file(content: &str) -> (String, String, String) {
    let parts: Vec<&str> = content.splitn(3, "---").collect();
    
    if parts.len() >= 3 {
        let header = parts[1];
        let body = parts[2].trim().to_string();

        let mut id = String::new();
        let mut date = String::new();
        let mut favorite = false;

        for line in header.lines() {
            if line.starts_with("id:") {
                id = line.replace("id:", "").trim().to_string();
            } else if line.starts_with("date:") {
                date = line.replace("date:", "").trim().to_string();
            } else if line.starts_with("favorite:") {
                favorite = line.replace("favorite:", "").trim() == "true"; 
            }
        }

        (date, id, favorite, body)
    } else {
        (String::new(), String::new(), content.to_string())
    }
}

//------------------------
// DATA STRUCTS:
//------------------------

// struct pro vypisování záznamů na frontend aplikace
#[derive(Serialize, Debug, Clone)]
struct NoteData {
    pub id: String,
    pub filename: String,          // podle názvu to budeme řadit
    pub date: String,              // date potřebujeme vypsat
    pub content: String,           // a content taky
    pub favorite: bool,
}

// my inner knowledge update:
// getter = funkce, která ti vrátí (přečte) hodnotu private proměnné z jiného souboru (normálně nelze číst private values across files)
// setter = funkce, která ti umožní změnit (zapsat) hodnotu private proměnné (často i s kontrolou, zda zadáváš platná data)
// atribute makro = označení -> #[jmeno_makra] nad funkcí nebo strukturou
//                = instrukce pro kompilátor, když chceme vygenerovat ještě nějaký další kód při překladu (moc jsem nepochopil princip této věci), asi funkcionalita, která dělá něco s tím kódem (externě), ale potřebná pro spuštění (funkčnost, která se uvnitř kódu těžce implementuje)

//------------------------
// TAURI COMMANDS (custom functions - macros):
//------------------------

// označení pro makro
#[tauri::command]
// vytvoření prázdné nody
fn new_note(app: tauri::AppHandle) -> NoteData{
    
    // aktuální čas
    let now = chrono::Local::now();

    // TODO: check formát (this is how we want it = 2026-03-30)
    let date_string = now.format("%Y-%m-%d").to_string();

    let random_id = random_string(10);
    let result = format!("{}_{}", date_string, random_id);

    // vytvoří název souboru
    let filename = format!("{}.md", result);
    let path = notes_dir(&app).join(&filename);

    // insert header s metadaty
    let initial_file_content = format!(
        "---\ndate_created: {}\n---\n",
        date_string
    );

    // vložení prázdné poznámky s hlavičkou
    let _ = fs::write(&path, initial_file_content);

    // Vracíme struct, aby JS měl všechna data hned po vytvoření
    NoteData {
        id: random_id,
        filename,
        date: date_string,
        content: String::new(),
    }
}

#[tauri::command]
// vložení node (+ check jestli jo nebo ne)
fn insert_note(app: tauri::AppHandle, filename: String, content: String) -> bool{
    
    let path = notes_dir(&app).join(&filename);

    // Přečteme soubor, abychom z něj dostali to původní id a datum
    if let Ok(existing_content) = fs::read_to_string(&path) {
        // Použijeme naši helper funkci na rozkódování!
        let (date, id, _) = parse_markdown_file(&existing_content);
        
        // Znovu to složíme dohromady, ale s novým contentem z UI
        let full_text = format!("---\nid: {}\ndate: {}\n---\n{}", id, date, content);
        
        // Zapíšeme a rovnou vrátíme true/false
        return fs::write(path, full_text).is_ok();
    }
    
    false
}

#[tauri::command]
// odstranění filu + kontrola
fn delete_note(app: tauri::AppHandle, filename: String) -> bool{
    
    let path = notes_dir(&app).join(&filename);
    fs::remove_file(path).is_ok()
}

// TODO: 
fn update_note(app: tauri::AppHandle, filename: String, content: String, favorite: bool) -> bool {
    let path = notes_dir(&app).join(&filename);
    
    // nejprve si přečteme stará data, abychom neztratili ID a Datum
    if let Ok(existing_content) = std::fs::read_to_string(&path) {
        let (date, id, _, _) = parse_markdown_file(&existing_content);
        
        // složíme to zpět s novým obsahem a novým stavem hvězdičky
        let full_text = format!("---\nid: {}\ndate: {}\nfavorite: {}\n---\n{}", id, date, favorite, content);
        
        return std::fs::write(path, full_text).is_ok();
    }
    false
}

//---------------------
// TODO: i am leaving it here for future (zatím není využití vymyšlený ještě)
#[tauri::command]
// vrátí obsah položky = node (souboru)
fn read_note(app: tauri::AppHandle, filename: String) -> String {

    // vybereme path k tomu specifickýmu objektu
    let path = notes_dir(&app).join(&filename);
    // otevře soubor, přečte ho a vrátí Result<String, Error>
    // unwrap_or_default - když se něco nepovede, tak nespadne, ale vrátí prázdnej string ("")
    fs::read_to_string(path).unwrap_or_default()
}

// označení, že tato funkce se může volat v js
#[tauri::command]
// vrácení všech poznámek do jednoho seřazeného seznamu souborů.md
fn list_notes(app: tauri::AppHandle) -> Vec<NoteData> {
    let dir = notes_dir(&app);
    let mut notes: Vec<NoteData> = Vec::new(); 

    if let Ok(entries) = fs::read_dir(&dir) {
        for entry_result in entries {
            if let Ok(entry) = entry_result {
                let path = entry.path();
                let filename = entry.file_name().to_string_lossy().to_string();
                
                if filename.ends_with(".md") {
                    if let Ok(file_content) = std::fs::read_to_string(&path) {
                        let (date, id, favorite, content) = parse_markdown_file(&file_content);
notes.push(NoteData { id, filename, date, content, favorite });
                    }
                }
            }
        }
    }

    // Seřazení podle názvu sestupně
    notes.sort_by(|a, b| b.filename.cmp(&a.filename));
    notes
}

// TODO: dodělat něco jako update nebo write (až budu dělat node update, tak)
// TODO: revision + add == getNote(), saveNote(), loadNote()

//jakože main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(){

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // connection na fronted, vytvoření tabulky, kde název v reactu ("list_nodes") == rust funkce (list_notes())
        .invoke_handler(tauri::generate_handler![list_notes, read_note, insert_note, delete_note, new_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}