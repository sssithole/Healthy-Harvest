
// // Product data
// const products = {
//     quinoa: {
//         title: 'Organic Quinoa',
//         price: 190,
//         description: 'Premium quality organic quinoa, packed with protein and essential amino acids...',
//         image: '🌾'
//     },
//     spelt: {
//         title: 'Organic Spelt Grain/Flour',
//         price: 190,
//         description: 'Ancient grain spelt available as whole grain or flour. This 2kg pack contains nutrient-dense spelt...',
//         image: './image/remove.photos-removed-background.png'
//     },
//     garbanzo: {
//         title: 'Organic Garbanzo Beans (Chickpeas)',
//         price: 190,
//         description: 'High-quality organic garbanzo beans...',
//         image: '🥜'
//     }
// };

// // Always set product ID manually for specific product page
// const productId = 'spelt';

// // Safe cart initialization with type check
// let cart;
// try {
//     const storedCart = JSON.parse(localStorage.getItem('cart'));
//     cart = Array.isArray(storedCart) ? storedCart : [];
// } catch (e) {
//     cart = [];
// }

// // DOM elements
// const cartIcon = document.getElementById('cartIcon');
// const cartCount = document.getElementById('cartCount');
// const cartModal = document.getElementById('cartModal');
// const overlay = document.getElementById('overlay');
// const closeCart = document.getElementById('closeCart');
// const cartItems = document.getElementById('cartItems');
// const cartTotal = document.getElementById('cartTotal');
// const addToCartBtn = document.getElementById('addToCart');
// const productTitle = document.getElementById('productTitle');
// const productPrice = document.getElementById('productPrice');
// const productDescription = document.getElementById('productDescription');
// const productImage = document.getElementById('productImage');

// // Load product info into page
// function loadProduct() {
//     const currentProduct = products[productId];
//     if (!currentProduct) return;

//     productTitle.textContent = currentProduct.title;
//     productPrice.textContent = `R${currentProduct.price.toFixed(2)}`;
//     productDescription.textContent = currentProduct.description;

//     if (currentProduct.image.startsWith('./') || currentProduct.image.startsWith('http')) {
//         productImage.src = currentProduct.image;
//         productImage.alt = currentProduct.title;
//     } else {
//         productImage.alt = currentProduct.image;
//     }
// }

// // Add product to cart
// function addToCart() {
//     const currentProduct = products[productId];
//     if (!currentProduct) return;

//     // Find if item already in cart
//     const existingItem = cart.find(item => item.id === productId);
//     if (existingItem) {
//         existingItem.quantity += 1;
//     } else {
//         cart.push({
//             id: productId,
//             title: currentProduct.title,
//             price: currentProduct.price,
//             quantity: 1
//         });
//     }

//     updateCartCount();
//     localStorage.setItem('cart', JSON.stringify(cart));

//     addToCartBtn.textContent = 'Added to Cart!';
//     setTimeout(() => addToCartBtn.textContent = 'Add to Cart', 1500);
// }

// // Update cart count shown in UI
// function updateCartCount() {
//     const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//     cartCount.textContent = totalItems;
// }

// // Render cart modal with items and total
// function renderCart() {
//     cartItems.innerHTML = '';

//     if (cart.length === 0) {
//         cartItems.innerHTML = '<p>Your cart is empty</p>';
//         cartTotal.textContent = 'Total: R0.00';
//         return;
//     }

//     let subtotal = 0;

//     cart.forEach(item => {
//         const itemElement = document.createElement('div');
//         itemElement.className = 'cart-item';

//         const itemInfo = document.createElement('div');
//         itemInfo.innerHTML = `<strong>${item.title}</strong><br>${item.quantity} x R${item.price.toFixed(2)}`;

//         const itemTotal = document.createElement('div');
//         const total = item.quantity * item.price;
//         subtotal += total;
//         itemTotal.textContent = `R${total.toFixed(2)}`;

//         itemElement.appendChild(itemInfo);
//         itemElement.appendChild(itemTotal);
//         cartItems.appendChild(itemElement);
//     });

//     // Shipping fee
//     const shipping = 100;
//     subtotal += shipping;

//     const shippingElement = document.createElement('div');
//     shippingElement.className = 'cart-item';
//     shippingElement.innerHTML = `<div>Shipping</div><div>R${shipping.toFixed(2)}</div>`;
//     cartItems.appendChild(shippingElement);

//     cartTotal.textContent = `Total: R${subtotal.toFixed(2)}`;
// }

// // Event listeners
// addToCartBtn.addEventListener('click', addToCart);

// cartIcon.addEventListener('click', () => {
//     cartModal.style.display = 'block';
//     overlay.style.display = 'block';
//     renderCart();
// });

// closeCart.addEventListener('click', () => {
//     cartModal.style.display = 'none';
//     overlay.style.display = 'none';
// });

// overlay.addEventListener('click', () => {
//     cartModal.style.display = 'none';
//     overlay.style.display = 'none';
// });

// // Initialize page
// loadProduct();
// updateCartCount();
