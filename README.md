# 🛒 SmartCart AI — Intelligent E-Commerce Storefront

SmartCart AI is a full-stack e-commerce web application that combines a modern shopping experience with AI-powered product assistance. Users can explore products, search and filter the catalog, manage their shopping cart, place orders, and interact with an AI assistant to discover products based on their needs.

Built with the MERN stack, the project demonstrates full-stack web development, REST API integration, database management, authentication, and reusable UI components.

## ✨ Features

- **Product Discovery:** Browse products with search, category filters, and sorting options.
- **AI Shopping Assistant:** Get product suggestions based on price, category, and shopping preferences.
- **Product Management:** Create, view, update, and delete product listings.
- **Product Details:** View individual product information and images.
- **User Authentication:** Register, log in, and access protected features using JWT authentication.
- **Shopping Cart:** Add products to the cart and maintain cart state using browser storage.
- **Checkout & Orders:** Place orders and view order history.
- **Image Uploads:** Upload product images with server-side file handling and validation.
- **Responsive Interface:** Navigate the storefront through a clean, component-based React interface.
- **RESTful APIs:** Communicate between the frontend, backend, and database through structured API endpoints.

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, HTML, CSS, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| File Uploads | Multer |
| API Communication | Fetch API, REST |
| Development Tools | Git, GitHub, npm |

## 🏗️ Architecture

SmartCart AI follows a client-server architecture.

1. **Frontend:** React components and pages provide the shopping interface and manage user interactions.
2. **Backend:** Express.js handles incoming requests, authentication, product operations, orders, and chatbot requests.
3. **Database:** MongoDB stores application data using Mongoose schemas and model relationships.
4. **API Layer:** REST endpoints connect the frontend to backend services.
5. **AI Assistant:** The chatbot processes shopping queries and helps users discover relevant products.

## 📂 Project Structure

```text
SmartCart-AI/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── package.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- MongoDB locally or a MongoDB Atlas database

### 1. Clone the repository

```bash
git clone https://github.com/archiemaini/SmartCart-AI-.git
cd SmartCart-AI-
```

### 2. Install dependencies

Install the root dependencies and the dependencies for the client and server:

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Configure environment variables

Create a `.env` file in the `server/` directory.

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smartcart
JWT_SECRET=replace_with_a_secure_random_secret
```

For MongoDB Atlas, replace `MONGO_URI` with your database connection string.

Use a strong, private JWT secret. Never commit actual credentials or API keys to GitHub.

### 4. Seed sample data

From the project root, run:

```bash
npm run seed
```

This populates the database with sample data if the seed script and database configuration are set up correctly.

### 5. Start the application

Open two terminal sessions from the project root.

**Terminal 1 — Backend**

```bash
npm run dev:server
```

The backend is expected to run at `http://localhost:5001`.

**Terminal 2 — Frontend**

```bash
npm run dev:client
```

The Vite development server is expected to run at `http://localhost:5173`.

Ensure MongoDB is running and the environment variables are configured before starting the application.

## 🔌 API Overview

The backend exposes REST endpoints for the main application features.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Retrieve products, with supported search and filter parameters |
| GET | `/api/products/categories` | Retrieve product categories |
| GET | `/api/products/:id` | Retrieve a product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the authenticated user's profile |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders/mine` | Retrieve the current user's orders |
| GET | `/api/orders` | Retrieve orders |

Protected endpoints require the appropriate authentication token. Product creation and updates may require multipart form data when uploading images.

## 🔐 Security Considerations

- Passwords are hashed before storage.
- Protected routes use JWT authentication.
- Uploaded files are processed through server-side upload middleware.
- Environment variables are used for database configuration and secrets.
- Production deployments should use HTTPS, secure secrets, and appropriate request validation.

## 🎯 Learning Outcomes

SmartCart AI brings together key full-stack development concepts:

- Building REST APIs with Express.js
- Designing MongoDB schemas and relationships
- Implementing asynchronous JavaScript and API requests
- Creating reusable React components
- Managing application and cart state
- Implementing authentication and protected routes
- Handling file uploads and form submissions
- Integrating an AI-assisted shopping experience

## 🚀 Future Enhancements

- Personalized product recommendations
- Improved chatbot understanding and conversational context
- Payment gateway integration
- Product reviews and ratings
- Wishlist functionality
- Advanced product ranking and filtering
- Automated testing and production deployment

## 👩‍💻 Built With

SmartCart AI is a collaborative full-stack development project created as part of the Back End Engineering coursework at Chitkara University.

---

*SmartCart AI — Smarter discovery. Simpler shopping.*
