// ===============================
// script.js — Cart logic & page setup
// Products are sourced from products.js (getProducts / getProductById).
// This file must be loaded AFTER products.js on every page.
// ===============================

// ===============================
// Safe cart initialization
// ===============================
let cart;
try {
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    cart = Array.isArray(storedCart) ? storedCart : [];
} catch (e) {
    cart = [];
}

// ===============================
// Load product info into a product detail page
// Reads data from the centralized product store via getProductById().
// ===============================
function loadProduct(productId) {
    const product = getProductById(productId);
    if (!product) {
        // Product not found — redirect home
        console.warn('loadProduct: unknown product id:', productId);
        return;
    }

    const titleEl       = document.getElementById('productTitle');
    const priceEl       = document.getElementById('productPrice');
    const descEl        = document.getElementById('productDescription');
    const imageEl       = document.getElementById('productImage');
    const benefitsList  = document.getElementById('benefitsList');

    if (titleEl)  titleEl.textContent  = product.title;
    if (priceEl)  priceEl.textContent  = `R${Number(product.price).toFixed(2)}`;
    if (descEl)   descEl.textContent   = product.description;

    if (imageEl) {
        imageEl.src = product.image;
        imageEl.alt = product.title;
    }

    // Render benefits list if the element exists
    if (benefitsList && Array.isArray(product.benefits) && product.benefits.length) {
        benefitsList.innerHTML = product.benefits
            .map(b => `<li class="benefit-item">${b}</li>`)
            .join('');
    }

    // Update page title
    document.title = `${product.title} — Blossom-Hai`;
}

// ===============================
// Add product to cart
// ===============================
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }

    updateCart();

    const addToCartBtn = document.getElementById('addToCart');
    if (addToCartBtn) {
        const original = addToCartBtn.textContent;
        addToCartBtn.textContent = 'Added to Cart ✓';
        addToCartBtn.disabled = true;
        setTimeout(() => {
            addToCartBtn.textContent = original;
            addToCartBtn.disabled = false;
        }, 1500);
    }
}

// ===============================
// Remove item from cart (decrements quantity, removes at 0)
// ===============================
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity -= 1;
    } else {
        cart.splice(itemIndex, 1);
    }

    updateCart();
}

// ===============================
// Persist cart and refresh any live UI
// ===============================
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

// ===============================
// Update the cart badge count in the navbar
// ===============================
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// ===============================
// Render the full cart page
// ===============================
function renderCartPage() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSummary        = document.getElementById('cartSummary');
    const checkoutBtn        = document.getElementById('checkoutBtn');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="index.html" class="continue-shopping">Continue Shopping</a>
            </div>`;
        if (cartSummary) cartSummary.innerHTML = '';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    let itemsHTML = '';
    let subtotal  = 0;

    cart.forEach(item => {
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;

        itemsHTML += `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-action="remove">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-action="add">+</button>
                    </div>
                    <p>R${Number(item.price).toFixed(2)} each</p>
                </div>
                <div class="item-actions">
                    <div class="item-total">R${itemTotal.toFixed(2)}</div>
                    <button class="remove-btn">Remove</button>
                </div>
            </div>`;
    });

    const shipping = 100;
    const total    = subtotal + shipping;

    cartItemsContainer.innerHTML = itemsHTML;

    // Quantity +/- buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = this.closest('.cart-item').dataset.productId;
            if (this.dataset.action === 'add') {
                addToCart(productId);
            } else {
                removeFromCart(productId);
            }
        });
    });

    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = this.closest('.cart-item').dataset.productId;
            const idx = cart.findIndex(item => item.id === productId);
            if (idx !== -1) {
                cart.splice(idx, 1);
                updateCart();
            }
        });
    });

    if (cartSummary) {
        cartSummary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal</span>
                <span>R${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>R${shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
                <span>Total</span>
                <span>R${total.toFixed(2)}</span>
            </div>`;
    }

    if (checkoutBtn) checkoutBtn.style.display = 'block';
}

// ===============================
// Mobile zoom & pan on product image
// ===============================
function initializeMobileZoom() {
    const productImageWrap = document.querySelector('.product-image');
    if (!productImageWrap) return;

    const img = productImageWrap.querySelector('img');
    if (!img) return;

    let isZoomed   = false;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    productImageWrap.addEventListener('click', function (e) {
        if (window.innerWidth > 768) return;
        if (!isZoomed) {
            productImageWrap.classList.add('zoomed');
            isZoomed = true;
            img.style.transform = 'scale(1.8)';
            document.body.style.overflow = 'hidden';
        } else {
            resetZoom();
        }
    });

    productImageWrap.addEventListener('touchstart', function (e) {
        if (isZoomed && e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    });

    productImageWrap.addEventListener('touchmove', function (e) {
        if (!isZoomed) return;
        e.preventDefault();
        if (isDragging && e.touches.length === 1) {
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            const maxX = (img.clientWidth * 1.8 - productImageWrap.clientWidth) / 2;
            const maxY = (img.clientHeight * 1.8 - productImageWrap.clientHeight) / 2;
            translateX = Math.max(-maxX, Math.min(maxX, translateX));
            translateY = Math.max(-maxY, Math.min(maxY, translateY));
            img.style.transform = `scale(1.8) translate(${translateX / 1.8}px, ${translateY / 1.8}px)`;
        }
    }, { passive: false });

    productImageWrap.addEventListener('touchend', () => { isDragging = false; });

    document.addEventListener('click', function (e) {
        if (isZoomed && !productImageWrap.contains(e.target)) resetZoom();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isZoomed) resetZoom();
    });

    function resetZoom() {
        productImageWrap.classList.remove('zoomed');
        isZoomed = false;
        img.style.transform = '';
        translateX = 0;
        translateY = 0;
        document.body.style.overflow = '';
    }
}

// ===============================
// DOMContentLoaded — wire up common page elements
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    // Cart icon → navigate to cart
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    // Product detail page setup
    const addToCartBtn = document.getElementById('addToCart');
    if (addToCartBtn) {
        // Prefer data-product-id on <body>, fallback to ?id= query param
        let productId = document.body.getAttribute('data-product-id');
        if (!productId) {
            const urlParams = new URLSearchParams(window.location.search);
            productId = urlParams.get('id');
        }

        if (productId) {
            loadProduct(productId);
            addToCartBtn.addEventListener('click', () => addToCart(productId));
        }
    }

    // Cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }

    // Always refresh the badge
    updateCartCount();

    // Mobile zoom on product pages
    initializeMobileZoom();
});
