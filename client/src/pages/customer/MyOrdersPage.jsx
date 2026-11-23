
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Package,
    ShoppingBag,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Eye,
    X,
    MapPin,
    Phone,
    Mail,
    Clock,
    CreditCard,
    User,
    Truck
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

    return new Date(date).toLocaleString('en-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

export function MyOrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams();

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

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

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
                throw new Error(data.error || 'Unable to load your orders.');
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

    // Fetch individual order details
    const fetchOrderDetails = useCallback(async (orderId) => {
        if (!orderId) return;

        try {
            setDetailsLoading(true);
            setDetailsError('');
            setSelectedOrder(null);

            const user = auth.currentUser;

            if (!user) {
                throw new Error('Please login to view order details.');
            }

            const token = await user.getIdToken();

            const response = await fetch(
                `${API_URL}/api/orders/my-orders/${encodeURIComponent(orderId)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Unable to load order details.'
                );
            }

            setSelectedOrder(data.order || data);
        } catch (err) {
            console.error('Order Details Error:', err);
            setDetailsError(err.message || 'Unable to load order details.');
        } finally {
            setDetailsLoading(false);
        }
    }, []);

    // Open details from URL or notification
    useEffect(() => {
        const orderId = searchParams.get('orderId');

        if (orderId) {
            fetchOrderDetails(orderId);
        }
    }, [searchParams, fetchOrderDetails]);

    // Open order details from Order Summary button
    const handleViewDetails = (orderId) => {
        setSearchParams({ orderId });
    };

    // Close details modal
    const handleCloseDetails = () => {
        setSelectedOrder(null);
        setDetailsError('');
        setSearchParams({});
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    const orderAddress = selectedOrder?.customer?.address;

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
                    <p className="font-semibold text-error">{error}</p>

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
                                            onClick={() => handleViewDetails(orderId)}
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

            {/* Order Details Modal */}
            {(detailsLoading || selectedOrder || detailsError) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
                    <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-base-300 p-5">
                            <div>
                                <p className="text-xs font-bold tracking-widest text-primary">
                                    MOCHIMART
                                </p>

                                <h2 className="mt-1 text-xl font-extrabold text-base-content">
                                    Order Details
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseDetails}
                                className="rounded-xl border border-base-300 p-2 text-base-content transition hover:bg-base-200"
                                aria-label="Close order details"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-5">
                            {detailsLoading && (
                                <div className="flex min-h-64 items-center justify-center">
                                    <div className="text-center">
                                        <span className="loading loading-spinner loading-lg text-primary"></span>
                                        <p className="mt-3 text-sm text-base-content/60">
                                            Loading order details...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!detailsLoading && detailsError && (
                                <div className="rounded-xl border border-error/30 bg-error/5 p-5 text-center">
                                    <p className="font-semibold text-error">
                                        {detailsError}
                                    </p>
                                </div>
                            )}

                            {!detailsLoading && selectedOrder && (
                                <div className="space-y-6">

                                    {/* Order Status */}
                                    <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-base-content/50">
                                                    ORDER ID
                                                </p>

                                                <p className="mt-1 break-all font-bold text-base-content">
                                                    #{selectedOrder._id}
                                                </p>
                                            </div>

                                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[selectedOrder.orderStatus] || 'bg-base-200 text-base-content'}`}>
                                                {selectedOrder.orderStatus}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs text-base-content/50">
                                                    Order Date
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-base-content">
                                                    {formatDate(selectedOrder.createdAt)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-base-content/50">
                                                    Payment Status
                                                </p>
                                                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${paymentStyles[selectedOrder.paymentStatus] || 'bg-base-200 text-base-content'}`}>
                                                    {selectedOrder.paymentStatus || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <section>
                                        <h3 className="mb-3 flex items-center gap-2 font-bold text-base-content">
                                            <User size={18} className="text-primary" />
                                            Customer Information
                                        </h3>

                                        <div className="grid gap-3 rounded-xl border border-base-300 p-4 sm:grid-cols-2">
                                            <div className="flex items-start gap-2">
                                                <User size={16} className="mt-1 text-base-content/50" />
                                                <div>
                                                    <p className="text-xs text-base-content/50">Name</p>
                                                    <p className="text-sm font-semibold text-base-content">
                                                        {selectedOrder.customer?.name || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Phone size={16} className="mt-1 text-base-content/50" />
                                                <div>
                                                    <p className="text-xs text-base-content/50">Phone</p>
                                                    <p className="text-sm font-semibold text-base-content">
                                                        {selectedOrder.customer?.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Mail size={16} className="mt-1 text-base-content/50" />
                                                <div>
                                                    <p className="text-xs text-base-content/50">Email</p>
                                                    <p className="break-all text-sm font-semibold text-base-content">
                                                        {selectedOrder.customer?.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="mt-1 text-base-content/50" />
                                                <div>
                                                    <p className="text-xs text-base-content/50">Delivery Address</p>
                                                    <p className="text-sm font-semibold text-base-content">
                                                        {typeof orderAddress === 'string'
                                                            ? orderAddress
                                                            : orderAddress
                                                                ? Object.values(orderAddress).filter(Boolean).join(', ')
                                                                : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Products */}
                                    <section>
                                        <h3 className="mb-3 flex items-center gap-2 font-bold text-base-content">
                                            <ShoppingBag size={18} className="text-primary" />
                                            Ordered Products
                                        </h3>

                                        <div className="space-y-3">
                                            {(selectedOrder.items || []).map((item, index) => (
                                                <div
                                                    key={item.productId?.toString() || index}
                                                    className="flex items-center justify-between gap-4 rounded-xl border border-base-300 p-4"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-base-content">
                                                            {item.name || 'Product'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-base-content/50">
                                                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                                                        </p>
                                                    </div>

                                                    <p className="shrink-0 font-bold text-primary">
                                                        {formatCurrency(item.lineTotal ?? item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Payment Summary */}
                                    <section className="rounded-xl border border-base-300 p-4">
                                        <h3 className="mb-3 flex items-center gap-2 font-bold text-base-content">
                                            <CreditCard size={18} className="text-primary" />
                                            Payment Summary
                                        </h3>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-base-content/60">Subtotal</span>
                                                <span className="font-semibold text-base-content">
                                                    {formatCurrency(selectedOrder.subtotal)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between gap-3">
                                                <span className="text-base-content/60">Delivery Charge</span>
                                                <span className="font-semibold text-base-content">
                                                    {formatCurrency(selectedOrder.deliveryCharge)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between gap-3 border-t border-base-300 pt-3">
                                                <span className="font-bold text-base-content">Total</span>
                                                <span className="text-lg font-extrabold text-primary">
                                                    {formatCurrency(selectedOrder.total)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-base-300 pt-3">
                                            <span className="text-sm text-base-content/60">
                                                Payment Method
                                            </span>
                                            <span className="text-sm font-bold text-base-content">
                                                {selectedOrder.paymentMethod === 'COD'
                                                    ? 'Cash on Delivery'
                                                    : selectedOrder.paymentMethod || 'N/A'}
                                            </span>
                                        </div>
                                    </section>

                                    {/* Order Status History */}
                                    <section>
                                        <h3 className="mb-4 flex items-center gap-2 font-bold text-base-content">
                                            <Clock size={18} className="text-primary" />
                                            Order Status History
                                        </h3>

                                        {selectedOrder.statusHistory?.length > 0 ? (
                                            <div className="space-y-4">
                                                {selectedOrder.statusHistory.map((event, index) => (
                                                    <div
                                                        key={`${event.changedAt}-${index}`}
                                                        className="flex gap-3"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <div className="mt-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
                                                            {index !== selectedOrder.statusHistory.length - 1 && (
                                                                <div className="mt-2 min-h-10 w-px bg-base-300" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1 rounded-xl border border-base-300 p-3">
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <p className="text-sm font-bold capitalize text-base-content">
                                                                    {event.toStatus || 'Status updated'}
                                                                </p>

                                                                <p className="text-xs text-base-content/50">
                                                                    {formatDate(event.changedAt)}
                                                                </p>
                                                            </div>

                                                            {event.note && (
                                                                <p className="mt-1 text-sm text-base-content/60">
                                                                    {event.note}
                                                                </p>
                                                            )}

                                                            {event.changedBy?.name && (
                                                                <p className="mt-2 text-xs text-base-content/40">
                                                                    Updated by: {event.changedBy.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="rounded-xl border border-base-300 p-4 text-sm text-base-content/50">
                                                No status history available.
                                            </p>
                                        )}
                                    </section>

                                    {/* Delivery Information */}
                                    <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
                                        <Truck size={23} className="shrink-0 text-primary" />
                                        <div>
                                            <p className="font-bold text-base-content">
                                                Thank you for shopping with MochiMart!
                                            </p>
                                            <p className="mt-1 text-xs text-base-content/60">
                                                You can check this page to follow your order progress.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-base-300 p-4">
                            <button
                                type="button"
                                onClick={handleCloseDetails}
                                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-content transition hover:brightness-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyOrdersPage;
