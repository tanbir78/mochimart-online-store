
import { auth } from '../config/firebase';

const GUEST_CART_KEY = 'mochimart_guest_cart';
const LEGACY_CART_KEY = 'mochimart_cart';

const getCustomerCartKey = (uid) => `mochimart_customer_cart_${uid}`;

function readCart(key) {
    try {
        const cart = localStorage.getItem(key);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Unable to read cart:', error);
        return [];
    }
}

function saveCartData(key, cart) {
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
}

function getGuestCart() {
    let cart = readCart(GUEST_CART_KEY);

    // Preserve existing cart data from the old storage key.
    if (!localStorage.getItem(GUEST_CART_KEY)) {
        const oldCart = readCart(LEGACY_CART_KEY);

        if (oldCart.length > 0) {
            cart = oldCart;
            saveCartData(GUEST_CART_KEY, cart);
            localStorage.removeItem(LEGACY_CART_KEY);
        }
    }

    return cart;
}

function getActiveCartKey() {
    const uid = auth.currentUser?.uid;

    return uid
        ? getCustomerCartKey(uid)
        : GUEST_CART_KEY;
}

export function getCart() {
    const uid = auth.currentUser?.uid;

    return uid
        ? readCart(getCustomerCartKey(uid))
        : getGuestCart();
}

function saveCart(cart) {
    saveCartData(getActiveCartKey(), cart);
}

export function mergeGuestCartIntoCustomer(uid) {
    if (!uid) {
        console.error('Customer UID is required to merge carts.');
        return;
    }

    const guestCart = getGuestCart();
    const customerCartKey = getCustomerCartKey(uid);
    const customerCart = readCart(customerCartKey);

    const mergedCart = [...customerCart];

    guestCart.forEach((guestItem) => {
        const existingItem = mergedCart.find(
            (item) => item._id === guestItem._id
        );

        if (existingItem) {
            const stock = Number(existingItem.stock ?? guestItem.stock);

            existingItem.quantity = Math.min(
                existingItem.quantity + guestItem.quantity,
                stock
            );
        } else {
            mergedCart.push({ ...guestItem });
        }
    });

    saveCartData(customerCartKey, mergedCart);

    // Clear guest cart after successful merge.
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(LEGACY_CART_KEY);

    window.dispatchEvent(new Event('cartUpdated'));

    console.log('Guest cart merged successfully:', mergedCart);
}

export function addToCart(product) {
    if (!product || !product._id) {
        console.error('Invalid product');
        return;
    }

    if (product.stock <= 0) {
        alert('This product is out of stock!');
        return;
    }

    const cart = getCart();

    const existingProduct = cart.find(
        (item) => item._id === product._id
    );

    if (existingProduct) {
        if (existingProduct.quantity >= product.stock) {
            alert('Maximum available stock reached!');
            return;
        }

        existingProduct.quantity += 1;
    } else {
        cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            images: product.images || [],
            stock: product.stock,
            quantity: 1
        });
    }

    saveCart(cart);
    console.log('Updated cart:', cart);
}

export function updateCartQuantity(productId, quantity) {
    const cart = getCart();

    const updatedCart = cart.map((item) => {
        if (item._id === productId) {
            return {
                ...item,
                quantity: Math.min(
                    Math.max(1, quantity),
                    item.stock
                )
            };
        }

        return item;
    });

    saveCart(updatedCart);
}

export function removeFromCart(productId) {
    const cart = getCart();

    const updatedCart = cart.filter(
        (item) => item._id !== productId
    );

    saveCart(updatedCart);
}

export function clearCart() {
    saveCart([]);
}
