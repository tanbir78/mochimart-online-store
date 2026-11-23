
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    ShoppingBag,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Eye
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusStyles = {
    pending: 'bg-warning/15 text-warning',
    processing: 'bg-info/15 text-info',
    shipped: 'bg-primary/15 text-primary',
    delivered: 'bg-success/15 text-success',
    cancelled: 'bg-error/15 text-error'
};

const paymentStyles = {
    pending: 'bg-warning/15 text-warning',
    paid: 'bg-success/15 text-success',
    failed: 'bg-error/15 text-error',
    refunded: 'bg-info/15 text-info'
};

function formatDate(date) {
    if (!date) return 'Date unavailable';

    return new Date(date).toLocaleDateString('en-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatCurrency(amount) {
    return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

export function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        limit: 10
    });

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const user = auth.currentUser;

            if (!user) {
                throw new Error('Please login to view your orders.');
            }

            const token = await user.getIdToken();

            const params = new URLSearchParams({
                page: String(page),
                limit: '10'
            });

            if (status !== 'all') {
                params.set('status', status);
            }

            const response = await fetch(
                `${API_URL}/api/orders/my-orders?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Unable to load your orders.'
                );
            }

            setOrders(data.orders || []);

            setPagination(
                data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalOrders: 0,
                    limit: 10
                }
            );

        } catch (err) {
            console.error('My Orders Error:', err);
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    // Load orders after Firebase authentication resolves
    useEffect(() => {
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!isMounted) return;

            if (!user) {
                setError('Please login to view your orders.');
                setLoading(false);
                return;
            }

            await fetchOrders();
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [fetchOrders]);

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="space-y-7">

            {/* Page Heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-xs font-bold tracking-widest text-primary">
                        YOUR PURCHASES
                    </p>

                    <h1 className="mt-2 text-2xl font-extrabold text-base-content sm:text-3xl">
                        My Orders
                    </h1>

                    <p className="mt-2 text-sm text-base-content/60">
                        Track and manage your MochiMart purchases.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchOrders}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-base-300 bg-base-100 px-4 py-2.5 text-sm font-semibold text-base-content transition hover:bg-base-200 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? 'animate-spin' : ''}
                    />
                    Refresh Orders
                </button>
            </div>

            {/* Order Statistics */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60">
                                Total Orders
                            </p>

                            <p className="mt-2 text-3xl font-extrabold text-base-content">
                                {pagination.totalOrders}
                            </p>
                        </div>

                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <Package size={25} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60">
                                Orders on This Page
                            </p>

                            <p className="mt-2 text-3xl font-extrabold text-base-content">
                                {orders.length}
                            </p>
                        </div>

                        <div className="rounded-xl bg-secondary p-3 text-primary">
                            <ShoppingBag size={25} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-bold text-base-content">
                        Order History
                    </h2>

                    <p className="mt-1 text-xs text-base-content/50">
                        View your recent orders and their status.
                    </p>
                </div>

                <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="select select-bordered w-full bg-base-100 text-base-content sm:w-48"
                >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-base-300 bg-base-100">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="mt-3 text-sm text-base-content/60">
                            Loading your orders...
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-2xl border border-error/30 bg-error/5 p-6 text-center">
                    <p className="font-semibold text-error">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchOrders}
                        className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-content"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty Orders */}
            {!loading && !error && orders.length === 0 && (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-base-300 bg-base-100 px-5 py-12 text-center">
                    <div className="rounded-full bg-secondary p-5 text-primary">
                        <ShoppingBag size={38} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-base-content">
                        No Orders Found
                    </h2>

                    <p className="mt-2 max-w-sm text-sm text-base-content/60">
                        {status === 'all'
                            ? "You haven't placed any orders yet. Start shopping and your orders will appear here."
                            : `You don't have any ${status} orders.`}
                    </p>

                    <Link
                        to="/shop"
                        className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-content transition hover:brightness-95"
                    >
                        Start Shopping →
                    </Link>
                </div>
            )}

            {/* Orders List */}
            {!loading && !error && orders.length > 0 && (
                <div className="space-y-5">

                    {orders.map((order) => {
                        const orderId = order._id?.toString();

                        return (
                            <div
                                key={orderId}
                                className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition hover:shadow-md"
                            >

                                {/* Order Header */}
                                <div className="flex flex-col gap-4 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <p className="text-xs text-base-content/50">
                                            ORDER ID
                                        </p>

                                        <p className="mt-1 break-all font-bold text-base-content">
                                            #{orderId}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[order.orderStatus] || 'bg-base-200 text-base-content'}`}>
                                            {order.orderStatus || 'Unknown'}
                                        </span>

                                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${paymentStyles[order.paymentStatus] || 'bg-base-200 text-base-content'}`}>
                                            Payment: {order.paymentStatus || 'Unknown'}
                                        </span>

                                    </div>

                                </div>

                                {/* Order Information */}
                                <div className="grid gap-5 p-5 sm:grid-cols-2">

                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-base-content/50">
                                            <CalendarDays size={16} />
                                            Order Date
                                        </div>

                                        <p className="mt-2 font-semibold text-base-content">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-base-content/50">
                                            Payment Method
                                        </p>

                                        <p className="mt-2 font-semibold text-base-content">
                                            {order.paymentMethod === 'COD'
                                                ? 'Cash on Delivery'
                                                : order.paymentMethod || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-base-content/50">
                                            Products
                                        </p>

                                        <div className="mt-2 space-y-2">
                                            {(order.items || []).map((item, index) => (
                                                <div
                                                    key={item.productId?.toString() || index}
                                                    className="flex justify-between gap-3 text-sm"
                                                >
                                                    <span className="text-base-content">
                                                        {item.name} × {item.quantity}
                                                    </span>

                                                    <span className="font-medium text-base-content">
                                                        {formatCurrency(item.lineTotal ?? item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between gap-4 sm:items-end">
                                        <div>
                                            <p className="text-sm text-base-content/50">
                                                Total Amount
                                            </p>

                                            <p className="mt-2 text-2xl font-extrabold text-primary">
                                                {formatCurrency(order.total)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Detailed order page can be added next.
                                                window.dispatchEvent(
                                                    new CustomEvent('showOrderDetails', {
                                                        detail: { orderId }
                                                    })
                                                );
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl border border-base-300 px-4 py-2 text-sm font-semibold text-base-content transition hover:bg-base-200"
                                        >
                                            <Eye size={16} />
                                            Order Summary
                                        </button>
                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:flex-row">

                    <p className="text-sm text-base-content/60">
                        Page {pagination.currentPage} of {pagination.totalPages}
                        {' · '}
                        {pagination.totalOrders} orders
                    </p>

                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((previous) => previous - 1)}
                            className="inline-flex items-center gap-1 rounded-xl border border-base-300 px-4 py-2 text-sm font-semibold text-base-content transition hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={17} />
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((previous) => previous + 1)}
                            className="inline-flex items-center gap-1 rounded-xl border border-base-300 px-4 py-2 text-sm font-semibold text-base-content transition hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={17} />
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

export default MyOrdersPage;
