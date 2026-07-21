//---------------------------
// PLACE FOR BACKEND
//---------------------------

// includes:
use std::fs;                // file system (read, write, remove file)
use std::path::PathBuf;     // buffer pro ukládání a editaci paths, funkce (push, join, pop)
use tauri::Manager;         // important pro path volání


//------------------------
// FUNKCE:
//------------------------

// rust knowledge:
// let ->       vytvořené proměnné, 
// mut ->       měnitelná hodnota v průběhu (bez mut nelze měnit hodnotu)
// unwrap() ->  jestli je tam hodnota, vrať ji, jinak program skončí
// join() ->    do path vloží path + parametr, kterým může být například soubor


// vrací path do vytvořeného adresáře "notes" pro uložení notes 
fn notes_dir(app: &tauri::AppHandle) -> PathBuf{
    // zjištění path pro složku, kde budou uložena data aplikace
    let mut path = app.path().app_data_dir().unwrap();
    // do path se přidá další adresář (\MyApp\notes)
    path.push("notes");
    // pokud neexistuje -> vytvoř, pokud existuje jako notes, tak nech tak jak je (ošetření prvotního insertu
    fs::create_dir_all(&path).unwrap();
    path
}

// my inner knowledge update:
// getter = funkce, která ti vrátí (přečte) hodnotu private proměnné z jiného souboru (normálně nelze číst private values across files)
// setter = funkce, která ti umožní změnit (zapsat) hodnotu private proměnné (často i s kontrolou, zda zadáváš platná data)
// atribute makro = označení -> #[jmeno_makra] nad funkcí nebo strukturou
//                = instrukce pro kompilátor, když chceme vygenerovat ještě nějaký další kód při překladu (moc jsem nepochopil princip této věci), asi funkcionalita, která dělá něco s tím kódem (externě), ale potřebná pro spuštění (funkčnost, která se uvnitř kódu těžce implementuje)

// označení pro makro
#[tauri::command]
// vypsání všech použitelných poznámek (file.md) do jednoho seřazeného seznamu
fn list_notes(app: tauri::AppHandle) -> Vec<String>{

    // path do složky notes (volání předchozí definované funkce)
    let dir = notes_dir(&app);
    // načtení veškerého obsahu složky
    let entries = fs::read_dir(&dir).unwrap();
    // vytvoření prázdného seznamu
    let mut files = Vec::new();
    // Každý průchod vrátí = Result<DirEntry, Error>
    for entry_result in entries{
        // pokud se povedlo načíst správně položku (v našem případě soubor)
        if let Ok(entry) = entry_result{
            // vezme název souboru
            let filename = entry.file_name();
            // převede ho na string
            let filename = filename.to_string_lossy().to_string();
            // podívá se jestli končí .md (to chceme)
            if filename.ends_with(".md"){
                // přidání do seznamu
                files.push(filename);
            }
        }
    }
    
    // sort 
    files.sort_by(|a, b| b.cmp(a));
    // vrátí seznam
    return files;
}

#[tauri::command]
// vrátí obsah položky = node (souboru)
fn read_note(app: tauri::AppHandle, filename: String) -> String{

    // vybereme path k tomu specifickýmu objektu
    let path = notes_dir(&app).join(&filename);
    // otevře soubor, přečte ho a vrátí Result<String, Error>
    // unwrap_or_default - když se něco nepovede, tak nespadne, ale vrátí prázdnej string ("")
    fs::read_to_string(path).unwrap_or_default()
}

#[tauri::command]
// vložení node (+ check jestli jo nebo ne)
fn save_note(app: tauri::AppHandle, filename: String, content: String) -> bool{
    
    let path = notes_dir(&app).join(&filename);
    let result = fs::write(path, content);
    if result.is_ok(){

        return true;

    } 
    else{

        return false;
    }
}

#[tauri::command]
// odstranění filu + kontrola
fn delete_note(app: tauri::AppHandle, filename: String) -> bool{
    
    let path = notes_dir(&app).join(&filename);
    fs::remove_file(path).is_ok()
}

#[tauri::command]
// vytvoření prázdné nody
fn new_note(app: tauri::AppHandle) -> String{
    
    // aktuální čas
    let now = chrono::Local::now();
    // TODO: tady upravit formát podle toho, jak se bude zobrazovat after
    let date_string = now.format("%Y%m%d_%H%M%S");
    // vytvoří název souboru
    let filename = format!("{}.md", date_string);
    let path = notes_dir(&app).join(&filename);
    // soubor, do kterého se vloží prázdný string
    fs::write(&path, "").unwrap();
    return filename
}

//jakože main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(){

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // connection na fronted, vytvoření tabulky, kde název v reactu ("list_nodes") == rust funkce (list_notes())
        .invoke_handler(tauri::generate_handler![list_notes, read_note, save_note, delete_note, new_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}