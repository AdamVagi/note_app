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

    // custom print (path k .md filům)
    println!(">>> CESTA K POZNÁMKÁM: {:?} <<<", path);
    
    return path
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

// knowledge okénko: TUPLE = funkce vrací jednu hodnotu typu (String, i32, bool), ale ta hodnota obsahuje 3 prvky

// vytažení všech dat ze souboru (filename, date, favorite, content)
fn parse_markdown_file(content: &str) -> (String, String, String, bool) {

    // split podle --- na 3 části a ulož do seznamů odkazů na části textu (&str)
    let parts: Vec<&str> = content.splitn(3, "---").collect();

    // preventive control (máme všechny části v souboru)
    if parts.len() < 3 {
        return (
            String::new(),
            String::new(),
            content.to_string(),
            false,
        );
    }
    
    let header = parts[1];
    // trim -> odstranění whitespaců na začátku a na konci
    let body = parts[2].trim().to_string();

    let mut filename = String::new();
    let mut date = String::new();
    // default chci false
    let mut favorite = false;

    // rozdělení do lines (line 1 -> filename, line 2 -> date)
    for line in header.lines() {
        if line.starts_with("filename:") {
            filename = line.replace("filename:", "").trim().to_string();
        }

        if line.starts_with("date:") {
            date = line.replace("date:", "").trim().to_string();
        }

        if line.starts_with("favorite:") {
            let value = line.replace("favorite:", "").trim().to_string();

            if value == "true" {
                favorite = true;
            }
        }
    }

    return (filename, date, body, favorite);
}

//------------------------
// DATA STRUCTS:
//------------------------

// struct pro záznamy (potřeba při volání list_notes dotazu - vrácení seznamu structů je pro js lepší a rychlejší)
#[derive(Serialize, Debug, Clone)]
struct NoteData {
    // pub -> public
    pub filename: String,          // podle názvu budu řadit + hledat
    pub date: String,              // date potřebujeme vypsat
    pub content: String,   
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
fn new_note(app: tauri::AppHandle) -> String{
    
    // aktuální čas
    let now = chrono::Local::now();

    let date_string = now.format("%Y-%m-%d").to_string();

    let random_id = random_string(10);
    let result = format!("{}_{}", date_string, random_id);

    // vytvoří název souboru
    let filename = format!("{}.md", result);
    let path = notes_dir(&app).join(&filename);

    // insert header s metadaty
    let initial_file_content = format!(
        "---\nfilename: {}\ndate: {}\nfavorite: {}\n---\n",
        filename, date_string, false
    );

    // vložení prázdné poznámky s hlavičkou
    let _ = fs::write(&path, initial_file_content);

    // tady není potřeba return celého structu do js, protože tohle je jenom vytváření poznámky, ne žádná úprava
    return filename;
}

#[tauri::command]
// vložení node (+ check jestli jo nebo ne)
fn insert_note(app: tauri::AppHandle, filename: String, content: String) -> bool{
    
    let path = notes_dir(&app).join(&filename);

    // fs -> filesystem
    // obsah není přímo String = Result<String, Error>, result může být buď Ok(String) nebo Err(Error)
    let obsah = fs::read_to_string(&path);

    if obsah.is_err() {
        return false;
    }

    // vytáhneme z enumu hodnotu 
    let existing_content = obsah.unwrap();

    // ta funkce bude univerzální, takže si potřebuju vytáhnout z té odpovědi jenom
    // filename + content máme, takže chci vrátit date + favorite bude vždycky false
    let (_, date, _, _) = parse_markdown_file(&existing_content);

    if date.is_empty() {
        return false;
    }

    // znovu to složíme dohromady, ale s novým contentem z UI
    let full_text = format!(
        "---\nfilename: {}\ndate: {}\nfavorite: {}\n---\n{}",
        filename, date, false, content
    );

    let write_result = fs::write(&path, full_text);

    if write_result.is_err() {
        return false;
    }

    return true;    
}

#[tauri::command]
// odstranění filu + kontrola
fn delete_note(app: tauri::AppHandle, filename: String) -> bool{
    
    let path = notes_dir(&app).join(&filename);
    fs::remove_file(path).is_ok()
}

// update metadat + případně i contentu
#[tauri::command]
fn update_note(app: tauri::AppHandle, filename: String, content: String, favorite: bool) -> bool {

    let path = notes_dir(&app).join(&filename);
    
    // stará data, chci date
    if let Ok(existing_content) = std::fs::read_to_string(&path) {
        let (filename, date, _, _) = parse_markdown_file(&existing_content);
        
        // složení zpět s novým obsahem a novým stavem favorite
        let full_text = format!("---\nfilename: {}\ndate: {}\nfavorite: {}\n---\n{}", filename, date, favorite, content);

        return std::fs::write(path, full_text).is_ok();
    }
    return false;
}

// označení, že tato funkce se může volat v js
#[tauri::command]
// vrácení všech poznámek do jednoho seřazeného seznamu structů NodeData
fn list_notes(app: tauri::AppHandle) -> Vec<NoteData> {

    let dir = notes_dir(&app);
    // vytvoření prázdného seznamu, který bude dát měnit
    let mut notes: Vec<NoteData> = Vec::new(); 

    // pokus o načtení obsahu adresáře dir do entries, pokud ne, vrať notes 
    let entries = match fs::read_dir(&dir) {
        Ok(entries) => entries,
        Err(_) => return notes,
    };

    // procházení všech položek v entries (pořád to jsou ještě enumy)
    for entry_result in entries {
        let entry = match entry_result {
            Ok(entry) => entry,
            Err(_) => continue,
        };

        // zobrazení cesty k souboru a osekání na naprosté minimum (file.md) + na string
        let path = entry.path();
        let filename = entry.file_name().to_string_lossy().to_string();

        if !filename.ends_with(".md") {
            continue;
        }

        // přečtení obsahu (pořád enum)
        let file_content = match fs::read_to_string(&path) {
            Ok(content) => content,
            Err(_) => continue,
        };

        // výběr hodnot + vložení do structu
        let (filename, date, content, favorite) = parse_markdown_file(&file_content);
        let note = NoteData { filename, date, content, favorite,};

        notes.push(note);
    }
        
    // seřazení podle názvu sestupně
    notes.sort_by(|a, b| b.filename.cmp(&a.filename));
    return notes;
}

//jakože main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(){

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // connection na fronted, vytvoření tabulky, kde název v reactu ("list_nodes") == rust funkce (list_notes())
        .invoke_handler(tauri::generate_handler![list_notes, update_note, delete_note, insert_note, new_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}