// ===============================
// products.js — Centralized Product Store
// All product data is persisted in localStorage under 'hh_products'.
// Use getProducts() / saveProducts() / addProduct() / removeProduct()
// across every page instead of a hard-coded object.
// ===============================

const PRODUCTS_KEY = 'hh_products';

// Default seed data — loaded once when localStorage has no products yet.
const DEFAULT_PRODUCTS = [
    {
        id: 'seamoss100',
        title: 'Organic Sea Moss (100g)',
        price: 125,
        description: 'Premium dried organic sea moss (Irish moss) in 100g package. This superfood is rich in 92 of the 102 minerals our bodies need. Great for making gels, adding to smoothies, or as a natural thickener. Supports thyroid function, digestion, and skin health.',
        image: './image/sea moss.png',
        benefits: ['Heart Health', 'Energy & Fatigue', 'Iodine Source', 'Libido Support', 'Healthy Thyroid'],
        available: true
    },
    {
        id: 'seamoss200',
        title: 'Organic Sea Moss (200g)',
        price: 225,
        description: 'Double the amount of our popular sea moss at a better value. Perfect for regular users who rely on sea moss as a daily supplement.',
        image: './image/sea moss.png',
        benefits: ['Heart Health', 'Energy & Fatigue', 'Iodine Source', 'Libido Support', 'Healthy Thyroid'],
        available: true
    },
    {
        id: 'quinoa',
        title: 'Organic Quinoa (2kg)',
        price: 190,
        description: 'Premium quality organic quinoa, packed with protein and essential amino acids. This 2kg pack is perfect for healthy meals, gluten-free diets, and adding nutritious value to your dishes.',
        image: './image/quinoa.png',
        benefits: ['Complete Protein Source', 'High in Fiber', 'Rich in Antioxidants', 'Gluten-Free', 'High in Iron & Magnesium'],
        available: true
    },
    {
        id: 'spelt',
        title: 'Organic Spelt Grain/Flour (2kg)',
        price: 190,
        description: 'Ancient grain spelt available as whole grain or flour. Nutrient-dense and easier to digest than modern wheat. Excellent for baking bread, pasta, and other wholesome recipes.',
        image: './image/remove.photos-removed-background.png',
        benefits: ['High in Protein', 'Rich in Fiber', 'Contains B Vitamins', 'Easier to Digest than Wheat', 'Good Source of Iron'],
        available: true
    },
    {
        id: 'garbanzo',
        title: 'Organic Garbanzo Beans (2kg)',
        price: 190,
        description: 'High-quality organic garbanzo beans (chickpeas), perfect for hummus, salads, and stews. A fantastic plant-based protein source packed with fiber and essential nutrients.',
        image: './image/pishon.png',
        benefits: ['High in Plant Protein', 'Rich in Fiber', 'Supports Blood Sugar', 'Heart Healthy', 'Versatile in Cooking'],
        available: true
    },
    {
        id: 'teabags',
        title: 'Graviola/Soursop Teabags (20 pack)',
        price: 135,
        description: 'Premium soursop leaf teabags, also known as graviola. Each box contains carefully selected soursop leaves known for their potential health benefits. Naturally caffeine-free with a unique, slightly sweet flavor.',
        image: './image/TeaBags.png',
        benefits: ['High in Iron', 'Anti-inflammatory', 'Kidney Protection', 'Caffeine-Free', 'Antioxidant Rich'],
        available: true
    }
];

// -------------------------------------------------------
// getProducts() → returns the live array from localStorage,
// seeding with defaults if it has never been set.
// -------------------------------------------------------
function getProducts() {
    try {
        const raw = localStorage.getItem(PRODUCTS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('products.js: failed to parse stored products, resetting to defaults.', e);
    }
    // Seed defaults
    saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS.map(p => ({ ...p }));
}

// -------------------------------------------------------
// saveProducts(array) → persists the full products array.
// -------------------------------------------------------
function saveProducts(productsArray) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(productsArray));
}

// -------------------------------------------------------
// getProductById(id) → find a single product by its id.
// -------------------------------------------------------
function getProductById(id) {
    return getProducts().find(p => p.id === id) || null;
}

// -------------------------------------------------------
// addProduct(productObj) → add or update a product.
// productObj must have at least: { id, title, price, description, image }
// Optional: { benefits: [], available: true }
// -------------------------------------------------------
function addProduct(productObj) {
    const products = getProducts();
    const idx = products.findIndex(p => p.id === productObj.id);

    const normalized = {
        id: productObj.id,
        title: productObj.title,
        price: Number(productObj.price),
        description: productObj.description,
        image: productObj.image || '',
        benefits: Array.isArray(productObj.benefits) ? productObj.benefits : [],
        available: productObj.available !== false
    };

    if (idx >= 0) {
        products[idx] = normalized; // update existing
    } else {
        products.push(normalized);  // add new
    }

    saveProducts(products);
    return normalized;
}

// -------------------------------------------------------
// removeProduct(id) → mark a product as unavailable (soft delete)
// or pass hardDelete=true to fully remove from the store.
// -------------------------------------------------------
function removeProduct(id, hardDelete = true) {
    let products = getProducts();
    if (hardDelete) {
        products = products.filter(p => p.id !== id);
    } else {
        const p = products.find(p => p.id === id);
        if (p) p.available = false;
    }
    saveProducts(products);
}

// -------------------------------------------------------
// resetProducts() → wipe stored data and re-seed defaults.
// -------------------------------------------------------
function resetProducts() {
    saveProducts(DEFAULT_PRODUCTS);
}
