// ===============================
// Product data
// ===============================
const products = {
    quinoa: {
        title: 'Organic Quinoa',
        price: 190,
        description: 'Premium quality organic quinoa, packed with protein and essential amino acids...',
        image: './image/remove.photos-removed-background.png'
    },
    spelt: {
        title: 'Organic Spelt Grain/Flour',
        price: 190,
        description: 'Ancient grain spelt available as whole grain or flour. This 2kg pack contains nutrient-dense spelt...',
        image: './image/remove.photos-removed-background.png'
    },
    garbanzo: {
        title: 'Organic Garbanzo Beans (Chickpeas)',
        price: 190,
        description: 'High-quality organic garbanzo beans...',
        image: './image/remove.photos-removed-background.png'
    }
};

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
// Load product info into page
// ===============================
function loadProduct(productId) {
    const productTitle = document.getElementById('productTitle');
    const productPrice = document.getElementById('productPrice');
    const productDescription = document.getElementById('productDescription');
    const productImage = document.getElementById('productImage');

    const currentProduct = products[productId];
    if (!currentProduct) return;

    productTitle.textContent = currentProduct.title;
    productPrice.textContent = `R${currentProduct.price.toFixed(2)}`;
    productDescription.textContent = currentProduct.description;

    if (currentProduct.image.startsWith('./') || currentProduct.image.startsWith('http')) {
        productImage.src = currentProduct.image;
        productImage.alt = currentProduct.title;
    } else {
        productImage.alt = currentProduct.image;
    }
}

// ===============================
// Add product to cart
// ===============================
function addToCart(productId) {
    const currentProduct = products[productId];
    if (!currentProduct) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            title: currentProduct.title,
            price: currentProduct.price,
            quantity: 1
        });
    }

    updateCartCount();
    localStorage.setItem('cart', JSON.stringify(cart));

    const addToCartBtn = document.getElementById('addToCart');
    if (addToCartBtn) {
        addToCartBtn.textContent = 'Added to Cart!';
        setTimeout(() => addToCartBtn.textContent = 'Add to Cart', 1500);
    }
}

// ===============================
// Update cart count badge
// ===============================
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// ===============================
// Event listeners & page setup
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    const addToCartBtn = document.getElementById('addToCart');
    if (addToCartBtn) {
        // Get product ID from the page (either data attribute or fallback)
        let productId = document.body.getAttribute('data-product-id');
        if (!productId) {
            // fallback: use URL param like ?id=spelt
            const urlParams = new URLSearchParams(window.location.search);
            productId = urlParams.get('id') || 'spelt'; // default to spelt
        }

        loadProduct(productId);

        addToCartBtn.addEventListener('click', () => {
            addToCart(productId);
        });
    }

    updateCartCount();
});
