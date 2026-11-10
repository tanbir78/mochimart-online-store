import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCart,
  updateCartQuantity,
  removeFromCart
} from '../../utilities/cart.js';

export function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());

    const handleCartUpdate = () => {
      setCart(getCart());
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleQuantityChange = (id, quantity) => {
    updateCartQuantity(id, quantity);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[#F8FFFC] px-5 py-20 text-center">

        <div className="text-7xl">🛒</div>

        <h1 className="mt-5 text-3xl font-bold text-gray-800">
          Your Cart is Empty
        </h1>

        <p className="mt-3 text-gray-500">
          Looks like you haven't added anything to your cart yet.
        </p>

        <Link
          to="/shop"
          className="mt-7 inline-block rounded-lg bg-emerald-500 px-7 py-3 font-semibold text-white hover:bg-emerald-600"
        >
          Continue Shopping
        </Link>

      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FFFC] px-5 py-12">

      <div className="mx-auto max-w-6xl">

        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Cart Products */}
          <div className="space-y-5 lg:col-span-2">

            {cart.map((item) => {
              const image = item.images?.[0]?.url || item.images?.[0];

              return (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >

                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-emerald-50">

                    {image ? (
                      <img
                        src={image}
                        alt={item.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-5xl">🛍️</span>
                    )}

                  </div>

                  <div className="flex-1">

                    <h2 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h2>

                    <p className="mt-2 font-bold text-emerald-600">
                      ৳{Number(item.price).toLocaleString('en-BD')}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.stock} available
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="h-9 w-9 rounded-lg bg-gray-100 font-bold disabled:opacity-40"
                    >
                      -
                    </button>

                    <span className="min-w-6 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                      className="h-9 w-9 rounded-lg bg-gray-100 font-bold disabled:opacity-40"
                    >
                      +
                    </button>

                  </div>

                  <button
                    onClick={() => handleRemove(item._id)}
                    className="font-medium text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>

                </div>
              );
            })}

          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString('en-BD')}</span>
            </div>

            <div className="mt-4 flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-600">
                ৳{subtotal.toLocaleString('en-BD')}
              </span>
            </div>

            <Link
              to="/checkout"
              className="block w-full rounded-lg bg-emerald-500 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-600"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="mt-4 block text-center text-sm text-emerald-600 hover:underline"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}