
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

    // Empty Cart
    if (cart.length === 0) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-base-100 px-5 py-20 text-center text-base-content">

                <div>
                    <div className="text-7xl">🛒</div>

                    <h1 className="mt-5 text-3xl font-bold">
                        Your Cart is Empty
                    </h1>

                    <p className="mt-3 text-base-content/60">
                        Looks like you haven't added anything to your cart yet.
                    </p>

                    <Link
                        to="/shop"
                        className="mt-7 inline-block rounded-xl bg-primary px-7 py-3 font-semibold text-primary-content transition hover:brightness-95"
                    >
                        Continue Shopping →
                    </Link>
                </div>

            </main>
        );
    }

    return (
        <main className="min-h-screen bg-base-100 px-5 py-12 text-base-content">

            <div className="mx-auto max-w-6xl">

                {/* Page Heading */}
                <div className="mb-8">
                    <p className="text-xs font-bold tracking-widest text-primary">
                        YOUR HAPPY FINDS
                    </p>

                    <h1 className="mt-2 text-3xl font-extrabold">
                        Shopping Cart
                    </h1>

                    <p className="mt-2 text-base-content/60">
                        Review your items before checkout.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Cart Products */}
                    <div className="space-y-5 lg:col-span-2">

                        {cart.map((item) => {
                            const image =
                                item.images?.find?.((img) => img?.isPrimary)?.url ||
                                item.images?.[0]?.url ||
                                (typeof item.images?.[0] === 'string'
                                    ? item.images[0]
                                    : '');

                            return (
                                <div
                                    key={item._id}
                                    className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                                >

                                    {/* Product Image */}
                                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">

                                        {image ? (
                                            <img
                                                src={image}
                                                alt={item.name}
                                                className="h-full w-full rounded-xl object-cover"
                                            />
                                        ) : (
                                            <span className="text-5xl">🛍️</span>
                                        )}

                                    </div>

                                    {/* Product Information */}
                                    <div className="flex-1">

                                        <h2 className="text-lg font-semibold text-base-content">
                                            {item.name}
                                        </h2>

                                        <p className="mt-2 font-bold text-primary">
                                            ৳{Number(item.price).toLocaleString('en-BD')}
                                        </p>

                                        <p className="mt-1 text-sm text-base-content/60">
                                            {item.stock} available
                                        </p>

                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item._id,
                                                    item.quantity - 1
                                                )
                                            }
                                            disabled={item.quantity <= 1}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-base-content transition hover:bg-primary hover:text-primary-content disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            -
                                        </button>

                                        <span className="min-w-6 text-center font-semibold">
                                            {item.quantity}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item._id,
                                                    item.quantity + 1
                                                )
                                            }
                                            disabled={item.quantity >= item.stock}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-base-content transition hover:bg-primary hover:text-primary-content disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            +
                                        </button>

                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(item._id)}
                                        className="font-medium text-error transition hover:opacity-70"
                                    >
                                        Remove
                                    </button>

                                </div>
                            );
                        })}

                    </div>

                    {/* Order Summary */}
                    <div className="h-fit rounded-2xl border border-base-300 bg-base-100 p-6 shadow-md">

                        <h2 className="text-xl font-bold text-base-content">
                            Order Summary
                        </h2>

                        <div className="mt-6 flex justify-between text-base-content/70">
                            <span>Subtotal</span>

                            <span>
                                ৳{subtotal.toLocaleString('en-BD')}
                            </span>
                        </div>

                        <div className="mt-4 flex justify-between text-base-content/70">
                            <span>Shipping</span>

                            <span className="text-right text-sm">
                                Calculated at checkout
                            </span>
                        </div>

                        <div className="my-5 border-t border-base-300" />

                        <div className="flex justify-between text-lg font-extrabold">
                            <span>Total</span>

                            <span className="text-primary">
                                ৳{subtotal.toLocaleString('en-BD')}
                            </span>
                        </div>

                        {/* Checkout Button */}
                        <Link
                            to="/checkout"
                            className="mt-6 block w-full rounded-xl bg-primary px-5 py-3 text-center font-semibold text-primary-content transition duration-200 hover:-translate-y-0.5 hover:brightness-95"
                        >
                            Proceed to Checkout →
                        </Link>

                        {/* Continue Shopping */}
                        <Link
                            to="/shop"
                            className="mt-4 block text-center text-sm font-semibold text-primary transition hover:underline"
                        >
                            ← Continue Shopping
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}
