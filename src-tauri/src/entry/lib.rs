use std::cmp::Ordering;
use std::path::Path;
use serde::{Serialize, Deserialize};

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

impl Entry {
    pub fn drop_first_dot_name(name: String, path: String) -> Option<Self> {
        if name.starts_with(".") {
            None
        } else {
            Some(Entry::Dir { name, path })
        }
    }

    pub fn extract_video_file_only(name: String, path: String) -> Option<Self> {
        let extension = Path::new(path.as_str()).extension()?;
        if extension.eq("mp4") {
            Some(Entry::File { name, path })
        } else {
            None
        }
    }
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

    #[test]
    fn extract_video_file_only() {
        let name = "file1.mp4";
        let path = format!("/path/to/{}", name);

        let actual = Entry::extract_video_file_only(name.to_string(), path.clone());
        let expected = Some(Entry::File { name: name.to_string(), path: path.clone() });
        assert_eq!(actual, expected);

        let name = "file2.txt";
        let path = format!("/path/to/{}", name);

        let actual = Entry::extract_video_file_only(name.to_string(), path.clone());
        let expected = None;
        assert_eq!(actual, expected);

        let name = ".file3";
        let path = format!("/path/to/{}", name);

        let actual = Entry::extract_video_file_only(name.to_string(), path.clone());
        let expected = None;
        assert_eq!(actual, expected);
    }

    #[test]
    fn drop_first_dot_name() {
        let name = "dir1";
        let path = format!("/path/to/{}", name);

        let actual = Entry::drop_first_dot_name(name.to_string(), path.clone());
        let expected = Some(Entry::Dir { name: name.to_string(), path: path.clone() });
        assert_eq!(actual, expected);

        let name = ".dir2";
        let path = format!("/path/to/{}", name);

        let actual = Entry::drop_first_dot_name(name.to_string(), path.clone());
        let expected = None;
        assert_eq!(actual, expected);
    }
}
