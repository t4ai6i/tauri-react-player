use std::cmp::Ordering;
use serde::{ Serialize, Deserialize };

#[derive(Serialize, Clone, Debug, PartialOrd, PartialEq, Ord, Eq)]
#[serde(tag = "type")]
pub enum Entry {
    #[serde(rename = "dir")]
    Dir {
        name: String,
        path: String,
    },
    #[serde(rename = "file")]
    File {
        name: String,
        path: String,
    },
}

#[derive(Serialize, Deserialize, Copy, Clone, Debug, PartialOrd, PartialEq, Ord, Eq)]
#[serde(tag = "type")]
pub enum SortOrder {
    #[serde(rename = "asc")]
    Ascending,
    #[serde(rename = "des")]
    Descending,
}

pub fn compare_and_swap(a: &Entry, b: &Entry, swap_condition: Ordering) -> Ordering {
    use Entry::*;
    let ordering = if swap_condition.eq(&Ordering::Greater) {
        a.cmp(b)
    } else {
        b.cmp(a)
    };
    match ordering {
        Ordering::Equal => {
            match (a, b) {
                (
                    Dir {
                        name: a_name, ..
                    },
                    Dir {
                        name: b_name, ..
                    }
                ) => {
                    if swap_condition.eq(&Ordering::Greater) {
                        a_name.cmp(&b_name)
                    } else {
                        b_name.cmp(&a_name)
                    }
                }
                (
                    File {
                        name: a_name, ..
                    },
                    File {
                        name: b_name, ..
                    }
                ) => {
                    if swap_condition.eq(&Ordering::Greater) {
                        a_name.cmp(&b_name)
                    } else {
                        b_name.cmp(&a_name)
                    }
                }
                _ => Ordering::Equal
            }
        }
        _ => ordering
    }
}

mod tests {
    use super::*;

    fn do_sort(entries: &mut [Entry], sort_order: &SortOrder)
    {
        let swap_condition = match sort_order {
            SortOrder::Ascending => Ordering::Greater,
            SortOrder::Descending => Ordering::Less,
        };

        let comparator = |a: &Entry, b: &Entry| -> Ordering {
            compare_and_swap(a, b, swap_condition)
        };

        entries.sort_by(comparator);
    }

    #[test]
    fn entry_sort_ascending() {
        let file1 = Entry::File { name: "file1".to_string(), path: "/path/to/file1".to_string() };
        let file2 = Entry::File { name: "file2".to_string(), path: "/path/to/file2".to_string() };
        let dir1 = Entry::Dir { name: "dir1".to_string(), path: "/path/to/dir1".to_string() };
        let dir2 = Entry::Dir { name: "dir2".to_string(), path: "/path/to/dir2".to_string() };
        let mut input = vec![
            file2.clone(),
            file1.clone(),
            dir2.clone(),
            dir1.clone(),
        ];
        do_sort(&mut input, &SortOrder::Ascending);
        let expected = vec![
            dir1.clone(),
            dir2.clone(),
            file1.clone(),
            file2.clone(),
        ];
        assert_eq!(input, expected);
    }

    #[test]
    fn entry_sort_descending() {
        let file1 = Entry::File { name: "file1".to_string(), path: "/path/to/file1".to_string() };
        let file2 = Entry::File { name: "file2".to_string(), path: "/path/to/file2".to_string() };
        let dir1 = Entry::Dir { name: "dir1".to_string(), path: "/path/to/dir1".to_string() };
        let dir2 = Entry::Dir { name: "dir2".to_string(), path: "/path/to/dir2".to_string() };
        let mut input = vec![
            file2.clone(),
            file1.clone(),
            dir2.clone(),
            dir1.clone(),
        ];
        do_sort(&mut input, &SortOrder::Descending);
        let expected = vec![
            file2.clone(),
            file1.clone(),
            dir2.clone(),
            dir1.clone(),
        ];
        assert_eq!(input, expected);
    }
}
