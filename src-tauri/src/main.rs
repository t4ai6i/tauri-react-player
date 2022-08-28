#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

mod entry;

use std::cmp::Ordering;
use std::fs;
use crate::entry::lib::{
    compare_and_swap,
    Entry,
    SortOrder
};

#[tauri::command]
fn get_entries(path: &str, sort_order: SortOrder) -> Result<Vec<Entry>, String> {
    let entries = fs::read_dir(path).map_err(|e| format!("{}", e))?;
    let mut entries = entries
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
        .collect::<Vec<Entry>>();

    let swap_condition = match sort_order {
        SortOrder::Ascending => Ordering::Greater,
        SortOrder::Descending => Ordering::Less,
    };

    let comparator = |a: &Entry, b: &Entry| -> Ordering {
        compare_and_swap(a, b, swap_condition)
    };

    entries.sort_by(comparator);

    Ok(entries)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_entries])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
