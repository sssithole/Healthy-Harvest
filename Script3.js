// Product data
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


// Set product ID for this page
const productId = 'spelt';

// Safe cart initialization
let cart;
try {
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    cart = Array.isArray(storedCart) ? storedCart : [];
} catch (e) {
    cart = [];
}

// DOM elements
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const addToCartBtn = document.getElementById('addToCart');
const productTitle = document.getElementById('productTitle');
const productPrice = document.getElementById('productPrice');
const productDescription = document.getElementById('productDescription');
const productImage = document.getElementById('productImage');

// Load product info into page
function loadProduct() {
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

// Add product to cart
function addToCart() {
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

    addToCartBtn.textContent = 'Added to Cart!';
    setTimeout(() => addToCartBtn.textContent = 'Add to Cart', 1500);
}

// Update cart count badge
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Event listeners
addToCartBtn.addEventListener('click', () => {
    addToCart();
});

cartIcon.addEventListener('click', () => {
    window.location.href = 'cart.html';
});

// Initialize page
loadProduct();
updateCartCount();


