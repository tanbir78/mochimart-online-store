const CART_KEY = 'mochimart_cart';

export function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event('cartUpdated'));
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