# SmartCart Vanilla JS - 4-Member Complete Syllabus Mapping Plan

This document precisely maps all 16 topics from the official JavaScript syllabus directly to code locations in `script.js`. The project has been divided equally among 4 members so that absolutely nothing is left out. Each person is assigned exactly 4 syllabus blocks.

---

## 👤 Member 1: Archie (Lines 8-71)
**Module**: Product Listing & API Data Fetching

| Syllabus Lecture | Topic Name | Code Location in `script.js` | Implementation Details / Functions |
| :--- | :--- | :--- | :--- |
| **L 1-2** | Variables (var, let, const), Data Types | **Line 14-15** | `let allProducts = [];` and `const productGrid = ...` |
| **L 5-6** | Loops (for, while, for...of, for...in) | **Line 45-66** | `for (const product of productsArray)` loop to iterate through fetched data. |
| **L 19-20** | DOM Manipulation, Creating Elements | **Line 51-65** | `document.createElement('div')` and assigning `innerHTML` to build cards. |
| **L 27-28** | Async/Await, Fetch API | **Line 18-32** | `async function fetchProducts()` using `await fetch('data.json')` |

### Presentation Script Idea:
> *"I handled the initial data load and rendering. For Lectures 27-28, I used the modern `Fetch API` inside an `async` function (Line 18) to grab our products. I declared my state variables using `let` and `const` (Lectures 1-2). To render them, I used a `for...of` loop (Lectures 5-6) on Line 45, and then utilized DOM Manipulation with `createElement` and `innerHTML` (Lectures 19-20) to dynamically inject them into the page."*

---

## 👤 Member 2: Kunal (Lines 73-119)
**Module**: Search, Filters & Higher Order Functions

| Syllabus Lecture | Topic Name | Code Location in `script.js` | Implementation Details / Functions |
| :--- | :--- | :--- | :--- |
| **L 3-4** | Operators, Conditional Statements | **Line 90-102** | `if (selectedCategory === 'all')`, `&&` logical operators for search match. |
| **L 7-8** | Function Declaration, Return Values | **Line 35-67** | The standard `function renderProducts(productsArray)` declaration block. |
| **L 9-10** | Arrow Functions, Scope | **Line 84-107** | `const filterProducts = () => { ... }` block utilizing block scope. |
| **L 13-14** | Higher Order Functions (map, filter, reduce) | **Line 89-103** | `allProducts.filter(product => { ... })` to filter the catalog array. |

### Presentation Script Idea:
> *"I developed the search and filtering logic for the application. Applying concepts from Lectures 9–10, I used modern arrow functions (Line 84) to structure the functionality. Within this, I leveraged the higher-order function filter() (Lectures 13–14) to process and refine the product array. The filtering logic was built using if-else conditional statements and logical operators (Lectures 3–4) to accurately match user input. Finally, the filtered results were passed into a standard function declaration (Lectures 7–8) to dynamically re-render the UI."*

---

## 👤 Member 3: Arnav (Lines 121-213)
**Module**: Cart Array Management & LocalStorage

| Syllabus Lecture | Topic Name | Code Location in `script.js` | Implementation Details / Functions |
| :--- | :--- | :--- | :--- |
| **L 11-12** | Array Methods (push, pop, splice, slice) | **Line 162 & 171** | `cart.push(productToAdd)` and `cart.splice(index, 1)` |
| **L 15-16** | Objects, Destructuring, JSON | **Line 49, 135, 142** | `const { id, title, price... } = product`, `JSON.parse()`, `JSON.stringify()` |
| **L 17-18** | DOM Introduction, Selecting Elements | **Line 126-129** | `document.getElementById()` used extensively for cart UI elements. |
| **L 23** | Local Storage, Session Storage | **Line 131-143** | `localStorage.getItem()` and `setItem()` in `saveCart()` / `loadCart()` |

### Presentation Script Idea:
> *"I built the shopping cart system. First, I selected my UI components using `getElementById` (Lectures 17-18). When a user adds an item, I mutate the cart array using Array Methods like `push()` and `splice()` (Lectures 11-12). To persist this cart, I utilize the Browser's Local Storage (Lecture 23), heavily relying on JSON methods and Object Destructuring (Lectures 15-16) to serialize and deserialize the cart data across page reloads."*

---

## 👤 Member 4: Lavanya (Lines 215-316)
**Module**: Chatbot Widget, Forms & Events

| Syllabus Lecture | Topic Name | Code Location in `script.js` | Implementation Details / Functions |
| :--- | :--- | :--- | :--- |
| **L 21** | Event Handling, Event Object, preventDefault() | **Line 226-228** | `contactForm.addEventListener('submit', function(event) { event.preventDefault(); })` |
| **L 22** | Forms, Form Validation, Error Messages | **Line 232-246** | Validates string lengths, `@` inclusion, and toggles `.hidden` on error spans. |
| **L 24** | ES6 Features (Template Literals, etc.) | **Line 56-62, 186-192** | `` `<span>${item.title}</span>` `` Backtick template strings used for cart rows. |
| **L 25-26** | Asynchronous JavaScript, setTimeout | **Line 252-255, 299-303** | `setTimeout()` creating fake delay for chatbot replies and hiding form alerts. |

### Presentation Script Idea:
> *"I implemented the interactive layers. Covering Lecture 21, I attached Event Listeners to our form, using the Event Object to call `preventDefault()`. I then ran Form Validation logic (Lecture 22) to catch errors and display feedback messages. For UI construction, I used ES6 Template Literals (Lecture 24) to inject variables cleanly. Lastly, I built a chatbot that fakes network delay using Asynchronous `setTimeout()` functions (Lectures 25-26)."*
