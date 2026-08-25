/**
 * SmartCart - Simple E-Commerce Application
 * 
 * This file is divided into 4 parts for a team presentation.
 * It explicitly demonstrates 14 core JavaScript topics.
 */

// ==========================================
// 👤 Person 1: Product Listing + Loops + Fetch
// Topics: Variables, Data Types, Async JS, DOM
// ==========================================

// Topic 1: Variables (let, const) & Data Types (Array, Object)
let allProducts = []; // Array to store all products
const productGrid = document.getElementById('productGrid'); // Topic 8: DOM Manipulation

// Topic 13 & 14: Async JS (Promises, Fetch)
async function fetchProducts() {
    try {
        // Topic 14: Fetch API
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        // Topic 2: Type conversion / JSON parsing
        const data = await response.json(); 
        
        allProducts = data;
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error fetching data:", error);
        productGrid.innerHTML = "Failed to load products.";
    }
}

// Topic 4: Functions (Declaration)
function renderProducts(productsArray) {
    // Clear the grid first
    productGrid.innerHTML = '';
    
    // Topic 2: Conditions (if)
    if (productsArray.length === 0) {
        productGrid.innerHTML = "<p>No products found.</p>";
        return;
    }

    // Topic 3: Loops (for...of loop)
    for (const product of productsArray) {
        
        // Topic 7: Objects & Destructuring
        const { id, title, price, category, image } = product;

        // Topic 8: DOM creation (createElement)
        const card = document.createElement('div');
        card.className = 'product-card';

        // Topic 12: ES6 Template literals
        card.innerHTML = `
            <img src="${image}" alt="${title}">
            <span style="font-size: 12px; color: gray;">${category}</span>
            <h4>${title}</h4>
            <div class="price">$${price}</div>
            <button class="add-to-cart-btn" onclick="addToCart(${id})">Add to Cart</button>
        `;
        
        // Append to DOM
        productGrid.appendChild(card);
    }
}

// Initialize the app
fetchProducts();


// ==========================================
// 👤 Person 2: Search + Filters + HOF
// Topics: Higher Order Functions, If-Else, Arrow Functions
// ==========================================

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

// Topic 4: Functions (Arrow function)
const filterProducts = () => {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    // Topic 6: Higher Order Functions (filter)
    const filteredArray = allProducts.filter(product => {
        // Topic 2: Operators & Conditions
        const matchesSearch = product.title.toLowerCase().includes(searchText);
        
        // Simple if-else logic
        let matchesCategory = false;
        if (selectedCategory === 'all') {
            matchesCategory = true;
        } else if (product.category === selectedCategory) {
            matchesCategory = true;
        }

        // Return true only if both match
        return matchesSearch && matchesCategory;
    });

    // Render the newly filtered array
    renderProducts(filteredArray);
};

// Topic 9: Events
searchBtn.addEventListener('click', filterProducts);
categoryFilter.addEventListener('change', filterProducts);

resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = 'all';
    renderProducts(allProducts);
});


// ==========================================
// 👤 Person 3: Cart + LocalStorage
// Topics: Arrays (push, splice), reduce, localStorage
// ==========================================

let cart = []; // Cart array to hold items
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotal = document.getElementById('cartTotal');
const cartSidebar = document.getElementById('cartSidebar');

// Topic 11: Storage (load from localStorage)
function loadCart() {
    const savedCart = localStorage.getItem('myCart');
    if (savedCart) {
        cart = JSON.parse(savedCart); // JSON parsing
    }
    updateCartUI();
}

// Topic 11: Storage (save to localStorage)
function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

// Topic 5: Arrays (push)
window.addToCart = function(productId) {
    // Topic 1: explicit Type conversion
    const idNum = Number(productId); 
    
    // Find the product to add
    let productToAdd = null;
    
    // Topic 3: Loops (Standard for loop)
    for (let i = 0; i < allProducts.length; i++) {
        if (allProducts[i].id === idNum) {
            productToAdd = allProducts[i];
            break;
        }
    }

    if (productToAdd) {
        cart.push(productToAdd); // Add to end of array
        saveCart();
        updateCartUI();
        alert(`${productToAdd.title} added to cart!`);
    }
};

// Topic 5: Arrays (splice)
window.removeFromCart = function(index) {
    cart.splice(index, 1); // Remove 1 item at specific index
    saveCart();
    updateCartUI();
};

function updateCartUI() {
    // Update counter
    cartCount.textContent = cart.length;

    // Clear cart HTML
    cartItemsContainer.innerHTML = '';

    // Topic 6: Higher Order Functions (map)
    // Mapping cart array to HTML strings
    const cartHTMLArray = cart.map((item, index) => {
        return `
            <div class="cart-item">
                <span>${item.title}</span>
                <span>$${item.price}</span>
                <button class="remove-btn" onclick="removeFromCart(${index})">X</button>
            </div>
        `;
    });

    // Join array into a single string
    cartItemsContainer.innerHTML = cartHTMLArray.join('');

    // Topic 6: Higher Order Functions (reduce) for total price
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = total.toFixed(2);
}

// Open/Close Cart Sidebar
document.getElementById('viewCartBtn').addEventListener('click', () => {
    cartSidebar.classList.remove('hidden');
});
document.getElementById('closeCartBtn').addEventListener('click', () => {
    cartSidebar.classList.add('hidden');
});

// Load cart when page starts
loadCart();


// ==========================================
// 👤 Person 4: Chatbot + Form + Events
// Topics: Forms, Validation, Switch statement, setTimeout
// ==========================================

// --- Form Validation (Topic 10: Forms) ---
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const formSuccessMessage = document.getElementById('formSuccessMessage');

contactForm.addEventListener('submit', function(event) {
    // Topic 9: Events (preventDefault)
    event.preventDefault(); 
    
    let isValid = true;

    // Name validation
    if (nameInput.value.length < 2) {
        document.getElementById('nameError').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('nameError').classList.add('hidden');
    }

    // Email validation
    if (!emailInput.value.includes('@')) {
        document.getElementById('emailError').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('emailError').classList.add('hidden');
    }

    if (isValid) {
        formSuccessMessage.classList.remove('hidden');
        contactForm.reset(); // Clear form
        
        // Topic 13: Async JS (setTimeout) to hide message after 3 seconds
        setTimeout(() => {
            formSuccessMessage.classList.add('hidden');
        }, 3000);
    }
});

// --- Simple Chatbot (Topic 2: Switch / If-Else) ---
const chatbotHeader = document.getElementById('chatbotHeader');
const chatbotBody = document.getElementById('chatbotBody');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');

chatbotHeader.addEventListener('click', () => {
    chatbotBody.classList.toggle('hidden');
});

function handleChat() {
    const text = chatInput.value.toLowerCase().trim();
    if (text === '') return;

    // Add User Message to UI
    addMessageToChat(text, 'user-msg');
    chatInput.value = '';

    // Bot Response Logic
    let botReply = "I am a simple bot. Ask me about 'price', 'delivery', or 'hello'.";

    // Keyword matching using switch and if-else
    if (text.includes('price')) {
        botReply = "All prices are listed in USD under the product image.";
    } else if (text.includes('delivery')) {
        botReply = "We offer free delivery on orders over $50!";
    } else {
        // Topic 2: Switch statement
        switch (text) {
            case 'hello':
            case 'hi':
                botReply = "Hello! Welcome to SmartCart. How can I help?";
                break;
            case 'bye':
                botReply = "Goodbye! Have a great day shopping.";
                break;
        }
    }

    // Fake delay for realistic feeling
    setTimeout(() => {
        addMessageToChat(botReply, 'bot-msg');
    }, 1000); // 1 second delay
}

function addMessageToChat(message, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChatBtn.addEventListener('click', handleChat);
