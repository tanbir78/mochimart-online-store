
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCart } from '../../utilities/cart.js';

export function CheckoutPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setCart(getCart());
    }, []);

    // Price Calculation
    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const deliveryCharge = 60;
    const total = subtotal + deliveryCharge;

    // SweetAlert2 Theme
    const swalTheme = {
        customClass: {
            popup: 'mochi-swal-popup',
            title: 'mochi-swal-title',
            htmlContainer: 'mochi-swal-text',
            confirmButton: 'mochi-swal-confirm',
            cancelButton: 'mochi-swal-cancel'
        },
        buttonsStyling: true,
        confirmButtonColor: '#F28C28',
        cancelButtonColor: '#81766D'
    };

    // Handle Input Changes
    function handleChange(event) {
        const { name, value } = event.target;

        setCustomer((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    // Handle Order Submission
    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) return;

        if (cart.length === 0) {
            await Swal.fire({
                ...swalTheme,
                icon: 'warning',
                title: 'Your Cart is Empty!',
                text: 'Please add some products before checkout.',
                confirmButtonText: 'Explore Products'
            });

            navigate('/shop');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(
                'http://localhost:5000/api/orders',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        customer,
                        items: cart.map((item) => ({
                            productId: item._id,
                            quantity: item.quantity
                        }))
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Order could not be placed.'
                );
            }

            // Clear Cart
            localStorage.removeItem('mochimart_cart');
            window.dispatchEvent(new Event('cartUpdated'));

            setCart([]);

            // Success Popup
            await Swal.fire({
                ...swalTheme,
                icon: 'success',
                title: 'Order Placed Successfully!',
                text: `Thank you for shopping with MochiMart! Your Order ID: ${data.orderId}`,
                confirmButtonText: 'Continue Shopping',
                allowOutsideClick: false
            });

            navigate('/');

        } catch (error) {
            console.error('Order error:', error);

            // Error Popup
            await Swal.fire({
                ...swalTheme,
                icon: 'error',
                title: 'Order Failed!',
                text: error.message || 'Something went wrong. Please try again.',
                confirmButtonText: 'Try Again'
            });

        } finally {
            setIsSubmitting(false);
        }
    }

    // Empty Cart
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-base-100 px-4 py-20 text-center text-base-content">
                <div className="mx-auto max-w-3xl">

                    <div className="mb-5 text-7xl">
                        🛍️
                    </div>

                    <h2 className="text-2xl font-bold">
                        Your cart is empty
                    </h2>

                    <p className="mt-2 text-base-content/60">
                        Looks like you haven't added anything to your cart yet.
                    </p>

                    <Link
                        to="/shop"
                        className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-content transition hover:brightness-95"
                    >
                        Continue Shopping →
                    </Link>

                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-base-100 px-4 py-12 text-base-content">

            <div className="mx-auto max-w-6xl">

                {/* Page Heading */}
                <div className="mb-8">
                    <p className="text-xs font-bold tracking-widest text-primary">
                        ALMOST THERE!
                    </p>

                    <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
                        Checkout
                    </h1>

                    <p className="mt-2 text-base-content/60">
                        Complete your details and place your order.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">

                    {/* Customer Information */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-md"
                    >

                        <h2 className="text-xl font-bold">
                            Delivery Information
                        </h2>

                        {/* Full Name */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={customer.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                className="input input-bordered w-full bg-base-100 text-base-content"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={customer.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                required
                                className="input input-bordered w-full bg-base-100 text-base-content"
                            />
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={customer.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                className="input input-bordered w-full bg-base-100 text-base-content"
                            />
                        </div>

                        {/* Delivery Address */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Full Delivery Address
                            </label>

                            <textarea
                                name="address"
                                value={customer.address}
                                onChange={handleChange}
                                placeholder="Enter your complete delivery address"
                                required
                                rows="4"
                                className="textarea textarea-bordered w-full bg-base-100 text-base-content"
                            />
                        </div>

                        {/* Place Order */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-content transition duration-200 hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Placing Order...
                                </>
                            ) : (
                                'Place Order →'
                            )}
                        </button>

                    </form>

                    {/* Order Summary */}
                    <div className="h-fit rounded-2xl border border-base-300 bg-base-100 p-6 shadow-md">

                        <h2 className="mb-5 text-xl font-bold">
                            Order Summary
                        </h2>

                        {/* Cart Items */}
                        {cart.map((item) => (
                            <div
                                key={item._id}
                                className="flex justify-between gap-4 border-b border-base-300 py-4"
                            >
                                <div>
                                    <p className="font-semibold text-base-content">
                                        {item.name}
                                    </p>

                                    <p className="mt-1 text-sm text-base-content/60">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>

                                <p className="font-semibold text-base-content">
                                    ৳{(
                                        item.price * item.quantity
                                    ).toLocaleString('en-BD')}
                                </p>
                            </div>
                        ))}

                        {/* Price Details */}
                        <div className="mt-5 space-y-4">

                            <div className="flex justify-between text-base-content/70">
                                <span>Subtotal</span>

                                <span>
                                    ৳{subtotal.toLocaleString('en-BD')}
                                </span>
                            </div>

                            <div className="flex justify-between text-base-content/70">
                                <span>Delivery Charge</span>

                                <span>
                                    ৳{deliveryCharge.toLocaleString('en-BD')}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-base-300 pt-4 text-lg font-extrabold">
                                <span>Total</span>

                                <span className="text-primary">
                                    ৳{total.toLocaleString('en-BD')}
                                </span>
                            </div>

                        </div>

                        {/* Payment Method */}
                        <div className="mt-6 rounded-xl border border-base-300 bg-secondary p-4">

                            <p className="font-semibold text-base-content">
                                Payment Method
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xl">💵</span>

                                <span className="font-medium text-base-content">
                                    Cash on Delivery (COD)
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-base-content/60">
                                Pay when your order arrives at your doorstep.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default CheckoutPage;
