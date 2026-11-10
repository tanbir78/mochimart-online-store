import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        setCart(getCart());
    }, []);

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const deliveryCharge = 60;
    const total = subtotal + deliveryCharge;

    function handleChange(event) {
        const { name, value } = event.target;

        setCustomer((previous) => ({
            ...previous,
            [name]: value
        }));
    }


    async function handleSubmit(event) {
        event.preventDefault();

        if (cart.length === 0) {
            alert('Your cart is empty!');
            navigate('/shop');
            return;
        }

        try {
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
                throw new Error(data.error || 'Order could not be placed.');
            }

            alert(`Order placed successfully! Order ID: ${data.orderId}`);

            localStorage.removeItem('mochimart_cart');
            window.dispatchEvent(new Event('cartUpdated'));

            navigate('/');
        } catch (error) {
            console.error('Order error:', error);
            alert(error.message);
        }
    }


    if (cart.length === 0) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center">
                <h2 className="text-2xl font-bold">Your cart is empty</h2>

                <Link
                    to="/shop"
                    className="mt-6 inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Customer Information */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl bg-white p-6 shadow-md"
                >
                    <h2 className="text-xl font-bold">
                        Delivery Information
                    </h2>

                    <input
                        type="text"
                        name="name"
                        value={customer.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                        className="w-full rounded-lg border p-3"
                    />

                    <input
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        required
                        className="w-full rounded-lg border p-3"
                    />

                    <input
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full rounded-lg border p-3"
                    />

                    <textarea
                        name="address"
                        value={customer.address}
                        onChange={handleChange}
                        placeholder="Full Delivery Address"
                        required
                        rows="4"
                        className="w-full rounded-lg border p-3"
                    />

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600"
                    >
                        Place Order
                    </button>
                </form>

                {/* Order Summary */}
                <div className="h-fit rounded-xl bg-white p-6 shadow-md">
                    <h2 className="mb-5 text-xl font-bold">
                        Order Summary
                    </h2>

                    {cart.map((item) => (
                        <div
                            key={item._id}
                            className="flex justify-between border-b py-3"
                        >
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity}
                                </p>
                            </div>

                            <p className="font-semibold">
                                ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                            </p>
                        </div>
                    ))}

                    <div className="mt-5 space-y-3">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>৳{subtotal.toLocaleString('en-BD')}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Delivery Charge</span>
                            <span>৳{deliveryCharge}</span>
                        </div>

                        <div className="flex justify-between border-t pt-4 text-lg font-bold">
                            <span>Total</span>
                            <span className="text-emerald-600">
                                ৳{total.toLocaleString('en-BD')}
                            </span>
                        </div>
                    </div>

                    <p className="mt-5 text-sm text-gray-500">
                        Payment method: Cash on Delivery (COD)
                    </p>
                </div>
            </div>
        </div>
    );
}