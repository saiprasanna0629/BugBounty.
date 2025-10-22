// Configuration
const API_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3002';

// State
let cart = [];
let currentProduct = null;
let ws = null;

// Products data
const products = [
    { id: 1, name: 'Wireless Headphones', price: 79.99, stock: 15, category: 'Electronics' },
    { id: 2, name: 'Smart Watch', price: 199.99, stock: 8, category: 'Electronics' },
    { id: 3, name: 'Laptop Backpack', price: 49.99, stock: 23, category: 'Accessories' },
    { id: 4, name: 'USB-C Hub', price: 34.99, stock: 42, category: 'Electronics' },
    { id: 5, name: 'Mechanical Keyboard', price: 129.99, stock: 12, category: 'Electronics' },
    { id: 6, name: 'Wireless Mouse', price: 39.99, stock: 31, category: 'Electronics' },
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    setupEventListeners();
    initWebSocket();
});

function htmlEncode(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderProducts(filter = '') {
    const grid = document.getElementById('products-grid');
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${API_URL}/api/product-image?filename=product-${product.id}.jpg" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="product-image-fallback" style="display:none;">
                    <span>P${product.id}</span>
                </div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-footer">
                    <div class="product-price">$${product.price}</div>
                    <button class="btn-stock" onclick="openStockModal(${product.id})">Check Stock</button>
                </div>
                <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            switchPage(page);
            
            // Update active state
            document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });
    
    // Stock modal
    document.getElementById('checkStockBtn').addEventListener('click', checkStock);
    
    // Contact form
    const contactForm = document.querySelector('#contact-page form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Chat
    document.getElementById('chatToggle').addEventListener('click', toggleChat);
    document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    
    // Close modal on outside click
    document.getElementById('stockModal').addEventListener('click', (e) => {
        if (e.target.id === 'stockModal') {
            closeStockModal();
        }
    });
}

// Switch page
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCartCount();
    
    showNotification(`${product.name} added to cart!`, 'success');
}

// Update cart count
function updateCartCount() {
    document.querySelector('.cart-count').textContent = cart.length;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle contact form submission
async function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;
    
    if (!email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Message sent successfully!', 'success');
            form.reset();
        } else {
            showNotification('Failed to send message', 'error');
        }
    } catch (error) {
        showNotification('Error sending message', 'error');
        console.error('Contact form error:', error);
    }
}

// Open stock modal
function openStockModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    document.getElementById('modalProductName').textContent = `Product: ${currentProduct.name}`;
    const resultDiv = document.getElementById('stockResult');
    resultDiv.style.display = 'none';
    resultDiv.textContent = '';
    document.getElementById('stockModal').classList.add('active');
}

// Close stock modal
function closeStockModal() {
    document.getElementById('stockModal').classList.remove('active');
}

async function checkStock() {
    const storeId = document.getElementById('storeSelect').value;
    const resultDiv = document.getElementById('stockResult');
    
    resultDiv.style.display = 'block';
    resultDiv.textContent = 'Checking stock...';
    
    try {
        const response = await fetch(`${API_URL}/api/stock/check-win`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: currentProduct.id,
                storeId: storeId  
            })
        });
        
        const data = await response.json();
        resultDiv.textContent = data.message;
    } catch (error) {
        resultDiv.textContent = 'Error checking stock: ' + error.message;
    }
}

function initWebSocket() {
    try {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log('WebSocket connected');
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            displayChatMessage(data);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(initWebSocket, 3000);
        };
    } catch (error) {
        console.error('WebSocket connection failed:', error);
    }
}

function toggleChat() {
    document.getElementById('chatWindow').classList.toggle('active');
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || !ws || ws.readyState !== WebSocket.OPEN) return;
    
    const encodedMessage = htmlEncode(message);
    
    displayChatMessage({
        type: 'user',
        content: encodedMessage,
        timestamp: new Date().toLocaleTimeString(),
        encoded: true
    });
    
    ws.send(encodedMessage);
    
    input.value = '';
}

function displayChatMessage(data) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    
    if (data.type === 'system') {
        messageEl.className = 'chat-system-msg';
        messageEl.textContent = data.content;
    } else {
        messageEl.className = `chat-message ${data.type}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'chat-bubble';
        
        const contentDiv = document.createElement('div');
        
        if (data.encoded || data.type === 'user') {
            contentDiv.innerHTML = data.content;
        } else {
            contentDiv.innerHTML = data.content;
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.style.fontSize = '0.75rem';
        timeDiv.style.opacity = '0.7';
        timeDiv.style.marginTop = '5px';
        timeDiv.textContent = data.timestamp || new Date().toLocaleTimeString();
        
        bubbleDiv.appendChild(contentDiv);
        bubbleDiv.appendChild(timeDiv);
        messageEl.appendChild(bubbleDiv);
    }
    
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}