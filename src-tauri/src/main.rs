// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// main, kterej jde do souboru lib.rs a tam spustí "main"
fn main() {
    journal_app_lib::run()
}
