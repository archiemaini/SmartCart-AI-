# SmartCart — Full-Stack MERN Storefront
### Course: 24CAI0303 / Back End Engineering (Sessions 25–48)
**Chitkara University**

SmartCart is a streamlined, readable, full-stack MERN (MongoDB, Express, React, Node.js) web application designed strictly around the syllabus requirements of **24CAI0303 / Back End Engineering**.

---

## 👥 Equal Team Work Division Matrix

The syllabus topics (Sessions 25–48) and application features are divided equally among the 4 team members. Every file in the repository includes a standardized contributor header attributing that module:

| Contributor | Assigned Role | Syllabus Sessions Covered | Features & Code Modules Owned | Primary Files & Folders |
| :--- | :--- | :--- | :--- | :--- |
| **KUNAL** | **Lead Backend & Database Architect** | **Sessions 31–32, 36, 39, 41, 48** | • MongoDB connection & Atlas config<br>• User Schema, validation & bcrypt hashing<br>• JWT Authentication middleware & token logic<br>• Auth REST APIs (Register, Login, Me, Profile)<br>• Client Auth context & Sign In/Register flows | • [`server/config/db.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/config/db.js)<br>• [`server/models/User.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/models/User.js)<br>• [`server/middleware/auth.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/middleware/auth.js)<br>• [`server/routes/auth.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/routes/auth.js)<br>• [`client/src/context/AuthContext.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/context/AuthContext.jsx)<br>• [`client/src/pages/Login.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Login.jsx)<br>• [`client/src/pages/Register.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Register.jsx) |
| **ARNAV** | **Product Backend & Storage Engineer** | **Sessions 33–35, 37–38, 40, 41, 48** | • Product Schema, indexes & Mongoose models<br>• Multer file upload diskStorage & file filters<br>• Product CRUD REST APIs (Create, Read, Update, Delete)<br>• Public API Ingestion (DummyJSON 190+ items)<br>• Add Product Page with image picker & preview | • [`server/models/Product.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/models/Product.js)<br>• [`server/middleware/upload.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/middleware/upload.js)<br>• [`server/routes/products.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/routes/products.js)<br>• [`server/seed.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/seed.js)<br>• [`client/src/pages/AddProduct.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/AddProduct.jsx) |
| **ARCHIE** | **Order Management & State Specialist** | **Sessions 25–26, 29–30, 39, 41, 46–48** | • Order Mongoose Model with User/Product refs<br>• Mongoose `.populate()` queries for relations<br>• Centralized Error Handling Middleware<br>• Client Cart Context with LocalStorage persistence<br>• Cart, Controlled Checkout & Order History views | • [`server/models/Order.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/models/Order.js)<br>• [`server/routes/orders.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/routes/orders.js)<br>• [`server/middleware/errorHandler.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/middleware/errorHandler.js)<br>• [`client/src/context/CartContext.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/context/CartContext.jsx)<br>• [`client/src/pages/Cart.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Cart.jsx)<br>• [`client/src/pages/Orders.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Orders.jsx) |
| **LAVANYA** | **Lead Frontend UI/UX & Assistant Engineer** | **Sessions 27–28, 42, 43–45, 46–48** | • Main Express Server pipeline & static uploads<br>• AI Assistant Chatbot API (price & category search)<br>• React SPA structure, Vite config & API service<br>• Landing page layout, Hero & Category Sidebar<br>• Floating Chatbot Widget & Product detail view | • [`server/server.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/server.js)<br>• [`server/routes/chat.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/routes/chat.js)<br>• [`client/src/lib/api.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/lib/api.js)<br>• [`client/src/App.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/App.jsx)<br>• [`client/src/pages/Home.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Home.jsx)<br>• [`client/src/pages/ProductDetail.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/ProductDetail.jsx)<br>• [`client/src/components/ChatWidget.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/components/ChatWidget.jsx)<br>• [`client/src/components/Navbar.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/components/Navbar.jsx)<br>• [`client/src/components/ProductCard.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/components/ProductCard.jsx)<br>• [`client/src/components/Footer.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/components/Footer.jsx) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or use MongoDB Atlas.

### 2. Setup Environment Variables
The `server/.env` file is already configured for your local MongoDB:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smartcart
JWT_SECRET=smartcart_secret_key_2026
```
*(For MongoDB Atlas, replace `MONGO_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartcart?retryWrites=true&w=majority`)*

### 3. Seed Sample Data into MongoDB
Populates sample products, demo user, and demo order:
```bash
npm run seed
```
Demo Credentials:
- **Email**: `demo@smartcart.com`
- **Password**: `demo1234`

### 4. Run Locally
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server listens on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Storefront opens at http://localhost:5173
```

---

## 📚 Complete Syllabus Coverage (Sessions 25–48)

| Session | Syllabus Topic | Where & How It Is Implemented in Code |
| :--- | :--- | :--- |
| **25–26** | **Callbacks, Asynchronous JS, Promises & Error Handling** | Implemented in [`client/src/lib/api.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/lib/api.js) via Promise-based request wrappers, `.catch()`, and server route try/catch blocks. |
| **27–28** | **Async/Await, Fetch API, REST Consumption & JSON** | Frontend uses native `fetch()` with `async/await` and `res.json()` in [`client/src/lib/api.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/lib/api.js) and [`client/src/pages/Home.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Home.jsx). |
| **29–30** | **Mini Project: LocalStorage & Form Handling** | Cart state persistence in `localStorage` in [`client/src/context/CartContext.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/context/CartContext.jsx) and JWT token persistence in `tokenStore`. |
| **31–32** | **Node.js, V8 Engine, Non-Blocking I/O & Global Objects** | Demonstrated in [`server/server.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/server.js) using `process.env`, `process.uptime()`, and non-blocking asynchronous event loops. |
| **33–35** | **Modules (ESM), File System (fs), Path Module & HTTP Lifecycle** | Native `import`/`export`, `path.join()`, and `fs.existsSync()`/`fs.mkdirSync()` used in [`server/middleware/upload.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/middleware/upload.js) & request logger in [`server/server.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/server.js). |
| **36** | **NPM, package.json & Environment Variables** | Script definitions in [`server/package.json`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/package.json), and environment secrets loaded using `dotenv`. |
| **37–38** | **Express.js Server, Routing, Middleware & CRUD APIs** | Express server setup, `express.json()`, `express.urlencoded()`, and full CRUD routes (GET, POST, PUT, DELETE) in [`server/routes/products.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/routes/products.js). |
| **39** | **Validation, Error Middleware, JWT Auth & bcrypt** | Centralized error handler in [`server/middleware/errorHandler.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/middleware/errorHandler.js), `bcrypt` password hashing pre-save hook in [`server/models/User.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/models/User.js), and JWT verification in [`server/middleware/auth.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/middleware/auth.js). |
| **40** | **Multer File Uploads & API Testing** | Multer disk storage in [`server/middleware/upload.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/middleware/upload.js), static uploads serving via `express.static('uploads')`, and upload UI in [`client/src/pages/AddProduct.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/AddProduct.jsx). |
| **41** | **MongoDB, Mongoose Schemas, Validation & Populate** | Connected to MongoDB with Mongoose in [`server/config/db.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/config/db.js). References and `.populate('user', 'name email').populate('items.product')` in [`server/routes/orders.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/server/routes/orders.js). |
| **42** | **React & Single Page Applications (SPA) with Vite** | Single-page client structure with React Router configured in [`client/src/App.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/App.jsx) and fast Vite build in [`client/vite.config.js`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/vite.config.js). |
| **43–45** | **Components, Reusability & Props Communication** | Modular components (`Navbar`, `ProductCard`, `Footer`, `SyllabusModal`) passing data and callbacks (`onDelete`) via Props. |
| **46–48** | **useState(), Multiple State Variables & Controlled Forms** | Controlled form inputs, event handling (`onChange`, `onSubmit`), and state hooks in [`client/src/pages/AddProduct.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/AddProduct.jsx), [`client/src/pages/Cart.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Cart.jsx), and [`client/src/pages/Login.jsx`](file:///c:/Users/Kunal/Downloads/smartcart%20fa2/smartcart/client/src/pages/Login.jsx). |

---

## 📡 REST API Reference (For Postman Testing - Session 40)

### Auth Endpoints
- `POST /api/auth/register` — Register a new account (`{ name, email, password }`)
- `POST /api/auth/login` — Login user (`{ email, password }`) -> returns JWT token
- `GET /api/auth/me` — Get authenticated user profile *(Requires Header: `Authorization: Bearer <token>`)*

### Product CRUD Endpoints
- `GET /api/products` — Get all products (query params: `search`, `category`, `sort`)
- `GET /api/products/categories` — Get distinct category list
- `GET /api/products/:id` — Get single product details by ID
- `POST /api/products` — Create product *(Supports Multer multipart form file upload field `image`)*
- `PUT /api/products/:id` — Update product details by ID
- `DELETE /api/products/:id` — Delete product by ID

### Order Endpoints (Mongoose Populate)
- `POST /api/orders` — Create new order *(Requires JWT Auth)*
- `GET /api/orders/mine` — Get current user's orders with `.populate('user')` and `.populate('items.product')` *(Requires JWT Auth)*
- `GET /api/orders` — Get all system orders with populate

---

## 🗂️ Minimalist Project Structure

The codebase is organized with minimal files and zero bloat:

```
smartcart/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & protected routes
│   │   ├── errorHandler.js       # Centralized error handler
│   │   └── upload.js             # Multer image file upload configuration
│   ├── models/
│   │   ├── Order.js              # Order schema with User/Product refs (.populate)
│   │   ├── Product.js            # Product schema with validation & text index
│   │   └── User.js               # User schema with bcrypt hashing & validation
│   ├── routes/
│   │   ├── auth.js               # Register, login, me routes
│   │   ├── orders.js             # Order creation & populate routes
│   │   └── products.js           # Full CRUD product routes (GET, POST, PUT, DELETE)
│   ├── uploads/                  # Multer static uploaded images storage
│   ├── .env                      # MongoDB URI & JWT secret
│   ├── package.json              # Server dependencies & scripts
│   ├── seed.js                   # Seeder script for sample data
│   └── server.js                 # Unified Express application entry point
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with Syllabus & Add Product links
│   │   │   ├── ProductCard.jsx   # Reusable product card with delete prop
│   │   │   ├── SyllabusModal.jsx # Interactive modal showcasing sessions 25-48 mapping
│   │   │   ├── Footer.jsx        # Footer with course info
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # User authentication state
│   │   │   └── CartContext.jsx   # Shopping cart state with LocalStorage
│   │   ├── lib/
│   │   │   ├── api.js            # Fetch API wrapper with async/await & JWT handling
│   │   │   └── format.js         # Currency and image fallback formatting
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Product catalog with search, category filter & delete
│   │   │   ├── AddProduct.jsx    # Multer image upload & controlled form handling
│   │   │   ├── ProductDetail.jsx # Product detail view
│   │   │   ├── Cart.jsx          # Shopping cart & checkout form
│   │   │   ├── Orders.jsx        # Order history with populated User & Product details
│   │   │   └── Login.jsx         # Controlled login form with demo account button
│   │   ├── App.jsx               # Single Page Application router
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Tailwind CSS styles & design tokens
│   ├── package.json              # Client dependencies
│   └── vite.config.js            # Vite configuration with /api & /uploads proxy
│
└── package.json                  # Root runner scripts (seed, dev:server, dev:client)
```
