# SmartCart E-Commerce (Vanilla JavaScript)

SmartCart is a simple, clean, and highly readable e-commerce web application built entirely with **Vanilla JavaScript, HTML, and CSS**. 

This project was specifically designed to demonstrate **all 16 core JavaScript syllabus topics** for a university/course evaluation, without relying on any external libraries or frameworks (no React, no jQuery, no Bootstrap).

## 🚀 Features
- **Product Listing**: Dynamically fetches and renders products from a local JSON dataset.
- **Category Filtering & Search**: Real-time filtering of products using Higher-Order array methods.
- **Interactive Shopping Cart**: Add items, remove items, calculate totals, and persist data using `localStorage`.
- **Customer Feedback Form**: Interactive form with `preventDefault()` validation logic.
- **AI Chatbot Widget**: A fake keyword-matching customer support bot that simulates network delays using `setTimeout()`.

## 🛠️ Tech Stack
- **HTML5**: Semantic structure.
- **CSS3**: Custom modern styling, CSS Grid, Flexbox, transitions (No external frameworks).
- **Vanilla JavaScript (ES6+)**: Core logic, DOM manipulation, state management, Async/Await.

## 🧑‍🤝‍🧑 Team Members & Division
The codebase (`script.js`) is neatly partitioned into 4 equal sections for easy presentation:
1. **Archie**: Product Listing & API Data Fetching (Variables, Loops, DOM, Async/Fetch)
2. **Kunal**: Search, Filters & Array logic (Operators, Functions, Higher-Order Functions)
3. **Arnav**: Cart Management & Storage (Array Methods, Objects/JSON, LocalStorage)
4. **Lavanya**: Chatbot, Form Validation & Events (Forms, EventHandling, ES6, setTimeout)

*For a detailed line-by-line breakdown of exactly which syllabus topics map to which person, please refer to the `team_presentation_plan.md` file.*

## ⚙️ How to Run Locally
Since this project uses the `fetch()` API to load local files (`data.json`), it must be run via a local web server (browsers block local file fetching for security reasons).

**Option 1: VS Code Live Server (Recommended)**
1. Open this folder in Visual Studio Code.
2. Install the **"Live Server"** extension.
3. Right-click on `index.html` and click **"Open with Live Server"**.

**Option 2: Node.js**
1. Open a terminal in this folder.
2. Run `npx serve`.
3. Open `http://localhost:3000` in your browser.

**Option 3: Python**
1. Open a terminal in this folder.
2. Run `python -m http.server`.
3. Open `http://localhost:8000` in your browser.

## 📁 Project Structure
- `index.html`: The single-page layout structure.
- `style.css`: All the styling and responsive design.
- `script.js`: The core application logic (250+ lines, divided into 4 parts).
- `data.json`: Local dummy product dataset.
- `images/`: Local product photography for offline compatibility.
- `team_presentation_plan.md`: The complete syllabus-to-code mapping matrix.
