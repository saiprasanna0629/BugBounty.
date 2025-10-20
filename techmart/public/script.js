// Load all products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = products.map(product => `
            <div class="product-card" onclick="window.location.href='product.html?itemRef=${product.id}'">
                <div class="product-icon">${product.image}</div>
                <h3>${product.name}</h3>
                <p class="product-price">${product.price.toFixed(2)}</p>
                <span class="product-category">${product.category}</span>
            </div>
        `).join('');
        
        // Add filter functionality
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                const cards = document.querySelectorAll('.product-card');
                
                cards.forEach(card => {
                    if (category === 'all') {
                        card.style.display = 'block';
                    } else {
                        const cardCategory = card.querySelector('.product-category').textContent;
                        card.style.display = cardCategory === category ? 'block' : 'none';
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load product detail
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemRef = urlParams.get('itemRef');
    
    if (!itemRef) {
        document.getElementById('productDetail').innerHTML = '<p>No product selected</p>';
        return;
    }
    
    try {
        const response = await fetch(`/api/product?itemRef=${itemRef}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            document.getElementById('productDetail').innerHTML = errorText;
            return;
        }
        
        const product = await response.json();
        
        document.getElementById('productDetail').innerHTML = `
            <div class="product-detail-content">
                <div class="product-detail-icon">${product.image}</div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <div class="product-meta">
                        <p class="product-price">${product.price.toFixed(2)}</p>
                        <span class="product-category">${product.category}</span>
                    </div>
                    <div class="product-description">
                        <h3>Product Description</h3>
                        <p>${product.description}</p>
                        <p>Experience the future with our cutting-edge ${product.name}. This revolutionary product combines advanced technology with user-friendly design to deliver an unparalleled experience.</p>
                        <h3 style="margin-top: 1.5rem;">Features</h3>
                        <ul style="margin-left: 2rem; line-height: 2;">
                            <li>State-of-the-art technology</li>
                            <li>Premium quality materials</li>
                            <li>2-year warranty included</li>
                            <li>Free shipping worldwide</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('productDetail').innerHTML = '<p>Error loading product</p>';
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('loginMessage');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Login successful! Redirecting...';
            setTimeout(() => {
                window.location.href = 'account.html';
            }, 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Login failed. Please try again.';
    }
}

// Check session
async function checkSession() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        
        const loginLink = document.getElementById('loginLink');
        const accountLink = document.getElementById('accountLink');
        
        if (data.authenticated) {
            if (loginLink) loginLink.style.display = 'none';
            if (accountLink) accountLink.style.display = 'inline';
        } else {
            if (loginLink) loginLink.style.display = 'inline';
            if (accountLink) accountLink.style.display = 'none';
        }
    } catch (error) {
        console.error('Session check failed:', error);
    }
}

// Check authentication for account page
async function checkAuthentication() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        window.location.href = 'login.html';
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Handle avatar upload
async function handleAvatarUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('avatarFile');
    const messageDiv = document.getElementById('uploadMessage');
    const file = fileInput.files[0];
    
    if (!file) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please select a file';
        return;
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
        const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Avatar uploaded successfully!';
            
            // Update avatar display
            setTimeout(() => {
                const avatarImg = document.querySelector('.current-avatar img');
                avatarImg.src = data.path + '?t=' + new Date().getTime();
            }, 500);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.error;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Upload failed. Please try again.';
    }
}