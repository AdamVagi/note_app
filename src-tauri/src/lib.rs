// PLACE FOR BACKEND

//------------------------
// INCLUDES:
//------------------------
use std::fs;                            // file system (read, write, remove file)
use std::path::PathBuf;                 // buffer for storing and editing paths, functions (push, join, pop)
use tauri::Manager;                     // important for path calls
use rand::{distr::Alphanumeric, Rng};   // generating random alphanumeric string
use serde::Serialize;                   // sending structs to js


// rust knowledge:
// let ->       variable creation
// mut ->       changeble value during execution (without mut the value cannot be changed)
// unwrap() ->  if there is a value, return it, otherwise the program ends
// join() ->    inserts path + parameter into path, which can be, for example, a file

// TUPLE = funkce vrací jednu hodnotu typu (String, i32, bool), ale ta hodnota obsahuje 3 prvky


//------------------------
// .md FILE STRUCTURE
//------------------------

/* Each entry is stored as its own Markdown file on disk. 
A file starts with a small `---`and then metadata header (filename, creation date, favorite)

--- 
filename: 2026-08-20_aB3dE9fG2h.md
date: 2026-08-20
favorite: false
---
The actual entry text goes here

 All filesystem access is scoped to a single `notes` directory inside the OS-provided app-data directory
*/


//------------------------
// DATA STRUCTS:
//------------------------

// struct for journal entry (needed when calling list_notes query - returning a list of structs is better and faster for js)
#[derive(Serialize, Debug, Clone)]
struct NoteData {
    // pub -> public
    pub filename: String,          // doing sort by name + search
    pub date: String,              // need to print the date on frontend
    pub content: String,   
    pub favorite: bool,     
}

// my inner knowledge update:
// getter = function that returns (reads) the value of a private variable from another file (normally you can't read private values ​​across files)
// setter = function that allows you to change (write) the value of a private variable (often with a check to see if you're entering valid data)
// atribute makro = label -> #[macro_name] above a function or structure
//                = instruction for the compiler when we want to generate some additional code during compilation (I didn't really understand the principle of this thing), probably a functionality that does something with the code (externally), but is needed for execution (functionality that is difficult to implement inside the code)


//------------------------
// HELPER FUNCTIONS:
//------------------------

// returns the directory where notes are stored in or creating it on first run
// this function may not always successfully return a path (if successful, it returns a PathBuf, if unsuccessful, it returns an error message of type string)
fn notes_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {

    // finding the path for the folder where the application data will be stored
    let mut path = app.path().app_data_dir().map_err(|e| format!("Could not resolve the app data directory: {e}"))?;

    // another folder is inserted into path (\MyApp\notes)
    // path.push("notes");

    // dev mode, this part will only compile when -> (npm run tauri dev)
    #[cfg(debug_assertions)]
    path.push("notes-dev");

    // building release, this part is compiled when creating a production version through GitHub Actio (.exe)
    #[cfg(not(debug_assertions))]
    path.push("notes");


    // if it doesn't exist -> create
    // if it exists as a directory "notes", leave it as is (processing the initial insert)
    fs::create_dir_all(&path).map_err(|e| format!("Could not create the notes directory: {e}"))?;

    // custom print (path k .md filům)
    println!(">>> CESTA K POZNÁMKÁM: {:?} <<<", path);
    
    Ok(path)
}

// generates a random alphanumeric string used to keep same-day filenames unique
fn random_string(length: usize) -> String {

    // turn on generation and create an iterator for character generation
    rand::rng()
        .sample_iter(&Alphanumeric)

        .take(length)
        // change to char and collecting
        .map(char::from)
        .collect()
}

// potential path traversal problem
// if we passes filename for example like this = delete_note("../../important_file.md") the program can create a path outside the notes directory
// every filename that reaches this backend comes from the frontend, and a Tauri command is reachable by anything running in the webview - so from the backend's point of view this string is untrusted input (destroy files outside the notes directory)
// rejects any filename that could escape the notes directory, or that doesn't look like a note file at all
fn is_safe_note_filename(filename: &str) -> bool {
    !filename.is_empty()
        && filename.ends_with(".md")
        && !filename.contains('/')
        && !filename.contains('\\')
        && !filename.contains("..")
}

// parses a note file's content into (filename, date, body, favorite)
fn parse_markdown_file(content: &str) -> (String, String, String, bool) {

    // split by --- into 3 parts and save to the list of parts of the text (&str)
    let parts: Vec<&str> = content.splitn(3, "---").collect();

    // preventive control (do we have all parts in the file ??)
    if parts.len() < 3 {
        return (
            String::new(),
            String::new(),
            content.to_string(),
            false,
        );
    }
    
    let header = parts[1];
    // trim -> remove whitespace at the beginning and end
    let body = parts[2].trim().to_string();

    let mut filename = String::new();
    let mut date = String::new();
    // default false
    let mut favorite = false;

    // split into lines (line 1 -> filename, line 2 -> date)
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
// TAURI COMMANDS (custom functions - macros):
//------------------------

// label for macro
#[tauri::command]
/// creates a new, empty note file and returns its generated filename or error
fn new_note(app: tauri::AppHandle) -> Result<String, String>{
    
    // current time
    let now = chrono::Local::now();

    let date_string = now.format("%Y-%m-%d").to_string();

    let random_id = random_string(10);
    let result = format!("{}_{}", date_string, random_id);

    // vytvoří název souboru
    let filename = format!("{}.md", result);
    let path = notes_dir(&app)?;
    let full_path = path.join(&filename);

    // insert header s metadaty
    let initial_file_content = format!(
        "---\nfilename: {}\ndate: {}\nfavorite: {}\n---\n",
        filename, date_string, false
    );

    // insert an empty note with a header
    fs::write(&full_path, initial_file_content)
        .map_err(|e| format!("Could not create note file: {e}"))?;
    
    // there is no need to return the entire struct to js here, because this is just creating a note, not an edit
    Ok(filename)
}

#[tauri::command]
// insert content of the note (+ check if yes or no)
fn insert_note(app: tauri::AppHandle, filename: String, content: String) -> Result<(), String>{

    if !is_safe_note_filename(&filename) {
        return Err("Wrong file, did not contained in local file system".to_string()); 
    }
    
    // call notes_dir with a question mark (if it fails, the function will immediately return Err)
    let path = notes_dir(&app)?.join(&filename);

    // fs -> filesystem
    // content is not directly String = Result<String, Error>, result can be either Ok(String) or Err(Error)
    let existing_content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file for editing: {e}"))?;

    // only need to extract filename bc we already have content (+ return date and favorite will always be false)
    let (_, date, _, _) = parse_markdown_file(&existing_content);

    if date.is_empty() { 
        return Err("The date in the original note is empty".to_string()); 
    }

    // znovu to složíme dohromady, ale s novým contentem z UI
    let full_text = format!(
        "---\nfilename: {}\ndate: {}\nfavorite: {}\n---\n{}",
        filename, date, false, content
    );

    fs::write(&path, full_text)
        .map_err(|e| format!("Failed to save edited note: {e}"))?;

    Ok(())
    
}

#[tauri::command]
// deletes a note file + check
fn delete_note(app: tauri::AppHandle, filename: String) -> Result<(), String> {

    if !is_safe_note_filename(&filename) {
        return Err("Wrong file, did not contained in local file system".to_string()); 
    }
    
    let path = notes_dir(&app)?.join(&filename);
    fs::remove_file(path)
        .map_err(|e| format!("Failed to delete note: {e}"))?;
    Ok(())
}

// overwrites an existing note's content and favorite flag, preserving its original creation date
#[tauri::command]
fn update_note(app: tauri::AppHandle, filename: String, content: String, favorite: bool) -> Result<(), String> {

    if !is_safe_note_filename(&filename) {
        return Err("Wrong file, did not contained in local file system".to_string()); 
    }

    let path = notes_dir(&app)?.join(&filename);
    
    // old data
    let existing_content = std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read note for its update: {e}"))?;

    let (filename, date, _, _) = parse_markdown_file(&existing_content);
        
    // compose back with new content and new favorite state
    let full_text = format!("---\nfilename: {}\ndate: {}\nfavorite: {}\n---\n{}", filename, date, favorite, content);

    std::fs::write(path, full_text)
        .map_err(|e| format!("Failed to update: {e}"))?;
        
    Ok(())
}

// indicating that this function can be called in js
#[tauri::command]
// returns every stored note, newest first (list of structs NodeData)
fn list_notes(app: tauri::AppHandle) -> Result<Vec<NoteData>, String> {

    let dir = notes_dir(&app)?;
    // create an empty list that can be modified
    let mut notes: Vec<NoteData> = Vec::new(); 

    // attempt to load the contents of the directory dir into entries, if not, return notes
    let entries = fs::read_dir(&dir)
        .map_err(|e| format!("Failed to load notes folder: {e}"))?;

    for entry_result in entries {

        // If one item in the folder is defective, we ignore it and move on
        let entry = match entry_result {
            Ok(entry) => entry,
            Err(_) => continue,
        };

        // display the file path and truncate to the absolute minimum (file.md) + to string
        let path = entry.path();
        let filename = entry.file_name().to_string_lossy().to_string();

        if !filename.ends_with(".md") {
            continue;
        }

        // read the content (still enum)
        let file_content = match fs::read_to_string(&path) {
            Ok(content) => content,
            Err(_) => continue,
        };

        // select values ​​+ insert into struct
        let (filename, date, content, favorite) = parse_markdown_file(&file_content);
        let note = NoteData { filename, date, content, favorite,};

        notes.push(note);
    }

    // sort by date added descending    
    notes.sort_by(|a, b| b.date.cmp(&a.date));
    Ok(notes)

}

//jakože main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(){

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // connection to fronted, creating a table where the name in react ("list_nodes") == rust function (list_notes())
        .invoke_handler(tauri::generate_handler![list_notes, update_note, delete_note, insert_note, new_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}