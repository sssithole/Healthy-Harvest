// ===============================
// Product data
// ===============================
const products = {
  seamoss100: {
        title: "Organic Sea Moss (100g)",
        price: 125,
        description: "Premium dried organic sea moss (Irish moss) in 100g package. This superfood is rich in 92 of the 102 minerals our bodies need. Great for making gels, adding to smoothies, or as a natural thickener. Supports thyroid function, digestion, and skin health.",
        image: "./image/sea moss.png"
    },
    seamoss200: {
        title: "Organic Sea Moss (200g)",
        price: 225,
        description: "Double the amount of our popular sea moss at a better value. Perfect for regular users.",
        image: "./image/sea moss.png"
    },
    quinoa: {
        title: "Organic Quinoa (2kg)",
        price: 190,
        description: "Premium quality organic quinoa, packed with protein and essential amino acids. Perfect for healthy meals.",
        image: "./image/quinoa.png"
    },
    spelt: {
        title: "Organic Spelt Grain/Flour (2kg)",
        price: 190,
        description: "Ancient grain spelt available as whole grain or flour. Nutrient-dense and easy to digest.",
        image: "./image/remove.photos-removed-background.png"
    },
    garbanzo: {
        title: "Organic Garbanzo Beans (2kg)",
        price: 190,
        description: "High-quality organic garbanzo beans (chickpeas), perfect for hummus, salads, and stews.",
        image: "./image/pishon.png"
    },
    teabags: {
        title: "Organic Herbal Tea Bags (20 pack)",
        price: 85,
        description: "Natural herbal tea bags for daily relaxation and wellness.",
        image: "./image/TeaBags.png"
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

    updateCart();

    const addToCartBtn = document.getElementById('addToCart');
    if (addToCartBtn) {
        addToCartBtn.textContent = 'Added to Cart!';
        setTimeout(() => addToCartBtn.textContent = 'Add to Cart', 1500);
    }
}

// ===============================
// Remove item from cart
// ===============================
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;
    
    if (cart[itemIndex].quantity > 1) {
        // If more than 1 quantity, just decrease by 1
        cart[itemIndex].quantity -= 1;
    } else {
        // If only 1 quantity, remove the item completely
        cart.splice(itemIndex, 1);
    }
    
    updateCart();
}

// ===============================
// Update cart in storage and UI
// ===============================
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Refresh cart display if on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
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
// Send order to WhatsApp
// ===============================
// function sendOrderToWhatsApp() {
//     if (cart.length === 0) {
//         alert('Your cart is empty!');
//         return;
//     }

//     // Format order details
//     let orderMessage = `*NEW ORDER - Healthy Harvest*\n\n`;
//     let subtotal = 0;
    
//     cart.forEach(item => {
//         const itemTotal = item.quantity * item.price;
//         subtotal += itemTotal;
//         orderMessage += `➤ ${item.title}\n`;
//         orderMessage += `   Quantity: ${item.quantity}\n`;
//         orderMessage += `   Price: R${item.price.toFixed(2)} each\n`;
//         orderMessage += `   Subtotal: R${itemTotal.toFixed(2)}\n\n`;
//     });

//     const shipping = 100;
//     const total = subtotal + shipping;
    
//     orderMessage += `\n*ORDER SUMMARY*\n`;
//     orderMessage += `Subtotal: R${subtotal.toFixed(2)}\n`;
//     orderMessage += `Shipping: R${shipping.toFixed(2)}\n`;
//     orderMessage += `*TOTAL: R${total.toFixed(2)}*\n\n`;
//     orderMessage += `Please confirm this order and provide delivery details.`;

//     // Encode the message for URL
//     const encodedMessage = encodeURIComponent(orderMessage);
    
//     // Replace with your WhatsApp number (include country code without + or 0)
//     const whatsappNumber = '27783567678'; // Example: South Africa number
    
//     // Create WhatsApp URL
//     const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
//     // Open in new tab
//     window.open(whatsappUrl, '_blank');
    
//     // Optional: Clear cart after sending
//     // cart = [];
//     // updateCart();
// }

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
