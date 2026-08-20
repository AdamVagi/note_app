# Journal

A simple yet powerful note-taking app (notepad) that focuses on fast text storage and processing using Markdown.

## 🚀 Features

* **Markdown support:** Write with formatting (bold, italics, headings, lists) with instant live preview[cite: 1, 2].
* **Safe rendering:** Text processing is handled by `marked.js` and `DOMPurify` libraries[cite: 1, 2].
* **Note organization:** Create, edit, and delete notes with easy addition to favorites[cite: 2, 4].
* **Search:** Fast full-text search of note content, including creation date[cite: 2].
* **Customization:** Switch between light and dark themes, adjust font size, and choose from multiple font families (including Rajdhani, Monospace, and more)[cite: 1, 2].

## 🛠 Technology

The application is built on a modern and fast desktop application stack:
* **Frontend:** JavaScript, HTML, CSS[cite: 1, 2, 3].
* **Backend:** Rust, Tauri[cite: 1, 4].

## ⚙️ Developer launch

Before launching, you must have the Rust and Tauri environments installed. Then, just clone the repository and run:

```bash
# Install frontend dependencies
npm install
# Run the application in dev mode
npm run tauri dev