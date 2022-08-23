#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use std::fs;
use serde::Serialize;

#[derive(Serialize)]
#[serde(tag = "type")]
enum Entry {
    #[serde(rename = "file")]
    File {
        name: String,
        path: String,
    },
    #[serde(rename = "dir")]
    Dir {
        name: String,
        path: String,
    },
}

#[tauri::command]
fn get_entries(path: &str) -> Result<Vec<Entry>, String> {
    let entries = fs::read_dir(path).map_err(|e| format!("{}", e))?;
    let res: Vec<Entry> = entries
        .filter_map(|entry| -> Option<Entry> {
            let entry = entry.ok()?;
            let name = entry.file_name().to_string_lossy().to_string();
            let path = entry.path().to_string_lossy().to_string();
            let r#type = entry.file_type().ok()?;

            if r#type.is_dir() {
                Some(Entry::Dir { name, path })
            } else if r#type.is_file() {
                Some(Entry::File { name, path })
            } else {
                None
            }
        })
        .collect();
    Ok(res)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_entries])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
