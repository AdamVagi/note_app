# Journal

A simple yet powerful note-taking app (notepad) that focuses on fast text storage and processing using Markdown.

## 🚀 Features

* **Markdown support:** Write with formatting (bold, italics, headings, lists) with instant live preview
* **Safe rendering:** Text processing is handled by `marked.js` and `DOMPurify` libraries
* **Note organization:** Create, edit, and delete notes with easy addition to favorites
* **Search:** Fast full-text search of note content, including creation date
* **Customization:** Switch between light and dark themes, adjust font size, and choose from multiple font families (including Rajdhani, Monospace, and more)

## 🛠 Technology

The application is built on a modern and fast desktop application stack:
* **Frontend:** JavaScript, HTML, CSS
* **Backend:** Rust, Tauri

## 📥 Download and Installation

You can download the latest version of the application directly from the [Releases](https://github.com/AdamVagi/note_app/releases/latest) page.

Installers are available for all major platforms:
* **Windows:** Download `.exe` or `.msi` file and install.
* **macOS:** Download the `.dmg` or `.app` file.
* **Linux:** `.deb` or `.AppImage` packages are available.

## ⚙️ Developer launch

Before launching, you must have the Rust and Tauri environments installed. Then, just clone the repository and run:

```bash
# Install frontend dependencies
npm install
# Run the application in dev mode
npm run tauri dev