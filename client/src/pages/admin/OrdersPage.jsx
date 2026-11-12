
import { useCallback, useEffect, useState } from 'react';
import { auth } from '../../config/firebase';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ORDER_STATUSES = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
];

const PAYMENT_STATUSES = [
    'pending',
    'paid',
    'failed',
    'refunded'
];

const statusColors = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-secondary',
    delivered: 'badge-success',
    cancelled: 'badge-error'
};

const paymentColors = {
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-error',
    refunded: 'badge-info'
};

function formatDate(date) {
    if (!date) return 'N/A';

    return new Date(date).toLocaleString('en-BD', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price) {
    return `৳${Number(price || 0).toLocaleString('en-BD')}`;
}

function getOrderId(id) {
    return id ? id.slice(-8).toUpperCase() : 'N/A';
}

function getErrorMessage(error) {
    return error instanceof Error ? error.message : 'Something went wrong.';
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        totalOrders: 0,
        totalPages: 0
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const getToken = async () => {
        const user = auth.currentUser;

        if (!user) {
            throw new Error('Please login again.');
        }

        return user.getIdToken();
    };

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);

            const token = await getToken();

            const params = new URLSearchParams({
                page: String(page),
                limit: '10'
            });

            if (search.trim()) {
                params.set('search', search.trim());
            }

            if (status) {
                params.set('status', status);
            }

            const response = await fetch(
                `${API_URL}/api/admin/orders?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load orders.');
            }

            setOrders(data.orders || []);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Orders fetch error:', error);

            Swal.fire({
                icon: 'error',
                title: 'Unable to load orders',
                text: getErrorMessage(error),
                customClass: {
                    popup: 'mochi-swal-popup',
                    title: 'mochi-swal-title',
                    htmlContainer: 'mochi-swal-text',
                    confirmButton: 'mochi-swal-confirm'
                }
            });
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const openOrderDetails = async (id) => {
        try {
            const token = await getToken();

            const response = await fetch(
                `${API_URL}/api/admin/orders/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load order details.');
            }

            setSelectedOrder(data.order);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: getErrorMessage(error),
                customClass: {
                    popup: 'mochi-swal-popup',
                    confirmButton: 'mochi-swal-confirm'
                }
            });
        }
    };

    const updateOrder = async (id, field, value) => {
        const isOrderStatus = field === 'orderStatus';

        const result = await Swal.fire({
            title: isOrderStatus
                ? 'Update Order Status?'
                : 'Update Payment Status?',
            text: `Change status to "${value}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Update',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'mochi-swal-popup',
                title: 'mochi-swal-title',
                htmlContainer: 'mochi-swal-text',
                confirmButton: 'mochi-swal-confirm',
                cancelButton: 'mochi-swal-cancel'
            }
        });

        if (!result.isConfirmed) return;

        try {
            setUpdating(true);

            const token = await getToken();

            const endpoint = isOrderStatus ? 'status' : 'payment';

            const response = await fetch(
                `${API_URL}/api/admin/orders/${id}/${endpoint}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        [field]: value
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Update failed.');
            }

            Swal.fire({
                icon: 'success',
                title: 'Updated Successfully',
                text: data.message,
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'mochi-swal-popup',
                    title: 'mochi-swal-title'
                }
            });

            await fetchOrders();

            if (selectedOrder?._id === id) {
                setSelectedOrder(data.order);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: getErrorMessage(error),
                customClass: {
                    popup: 'mochi-swal-popup',
                    confirmButton: 'mochi-swal-confirm'
                }
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
    };

    return (
        <div className="min-h-screen space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">
                        Orders Management
                    </h1>
                    <p className="mt-1 text-sm text-base-content/60">
                        Manage customer orders and payments.
                    </p>
                </div>

                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="btn btn-primary text-white"
                >
                    <i className="fa-solid fa-rotate-right"></i>
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm text-base-content/60">Total Orders</p>
                    <h2 className="mt-2 text-2xl font-bold text-base-content">
                        {pagination.totalOrders}
                    </h2>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm text-base-content/60">Current Page</p>
                    <h2 className="mt-2 text-2xl font-bold text-base-content">
                        {pagination.currentPage || 1}
                    </h2>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm text-base-content/60">Total Pages</p>
                    <h2 className="mt-2 text-2xl font-bold text-base-content">
                        {pagination.totalPages || 0}
                    </h2>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-3 md:flex-row"
                >
                    <div className="flex-1">
                        <label className="input input-bordered flex items-center gap-2">
                            <i className="fa-solid fa-magnifying-glass text-base-content/50"></i>
                            <input
                                type="text"
                                className="grow"
                                placeholder="Search order ID, customer name or phone..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                    </div>

                    <select
                        className="select select-bordered w-full md:w-52"
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Statuses</option>
                        {ORDER_STATUSES.map((item) => (
                            <option key={item} value={item}>
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="btn btn-primary text-white"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            setPage(1);
                        }}
                    >
                        Clear
                    </button>
                </form>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                <div className="border-b border-base-300 p-4">
                    <h2 className="font-semibold text-base-content">
                        All Orders
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-16 text-center">
                        <i className="fa-solid fa-box-open text-4xl text-base-content/30"></i>
                        <h3 className="mt-4 font-semibold text-base-content">
                            No orders found
                        </h3>
                        <p className="mt-1 text-sm text-base-content/60">
                            Try changing your search or filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr className="text-base-content/70">
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Order Status</th>
                                        <th>Payment</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <span className="font-semibold text-primary">
                                                    #{getOrderId(order._id)}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="font-medium text-base-content">
                                                    {order.customer?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    {order.customer?.phone || 'N/A'}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap text-sm">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            <td className="font-semibold">
                                                {formatPrice(order.total)}
                                            </td>

                                            <td>
                                                <span className={`badge ${statusColors[order.orderStatus] || 'badge-ghost'}`}>
                                                    {order.orderStatus || 'N/A'}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`badge ${paymentColors[order.paymentStatus] || 'badge-ghost'}`}>
                                                    {order.paymentStatus || 'N/A'}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    onClick={() => openOrderDetails(order._id)}
                                                    className="btn btn-sm btn-outline btn-primary"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-3 border-t border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-base-content/60">
                                Showing {orders.length} of {pagination.totalOrders} orders
                            </p>

                            <div className="join">
                                <button
                                    className="btn btn-sm join-item"
                                    disabled={page <= 1}
                                    onClick={() => setPage((current) => current - 1)}
                                >
                                    Previous
                                </button>

                                <button className="btn btn-sm join-item btn-primary text-white">
                                    {page} / {pagination.totalPages || 1}
                                </button>

                                <button
                                    className="btn btn-sm join-item"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage((current) => current + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-3xl bg-base-100 text-base-content">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-xl font-bold">
                                    Order Details
                                </h3>
                                <p className="mt-1 text-sm text-primary">
                                    #{getOrderId(selectedOrder._id)}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Close order details"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-xl bg-base-200 p-4">
                                <h4 className="mb-3 font-semibold">
                                    Customer Information
                                </h4>
                                <p className="text-sm">
                                    <strong>Name:</strong> {selectedOrder.customer?.name || 'N/A'}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Address:</strong> {selectedOrder.customer?.address || 'N/A'}
                                </p>
                            </div>

                            <div className="rounded-xl bg-base-200 p-4">
                                <h4 className="mb-3 font-semibold">
                                    Order Information
                                </h4>
                                <p className="text-sm">
                                    <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'N/A'}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Subtotal:</strong> {formatPrice(selectedOrder.subtotal)}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Delivery:</strong> {formatPrice(selectedOrder.deliveryCharge)}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Total:</strong> {formatPrice(selectedOrder.total)}
                                </p>
                            </div>
                        </div>

                        {/* Products */}
                        <h4 className="mb-3 font-semibold">
                            Ordered Products
                        </h4>

                        <div className="overflow-x-auto rounded-xl border border-base-300">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(selectedOrder.items || []).map((item, index) => (
                                        <tr key={`${item.productId}-${index}`}>
                                            <td>{item.name}</td>
                                            <td>{formatPrice(item.price)}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatPrice(item.lineTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Update Status */}
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Update Order Status
                                </label>

                                <select
                                    className="select select-bordered w-full"
                                    value={selectedOrder.orderStatus}
                                    disabled={updating}
                                    onChange={(event) =>
                                        updateOrder(
                                            selectedOrder._id,
                                            'orderStatus',
                                            event.target.value
                                        )
                                    }
                                >
                                    {ORDER_STATUSES.map((item) => (
                                        <option key={item} value={item}>
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Update Payment Status
                                </label>

                                <select
                                    className="select select-bordered w-full"
                                    value={selectedOrder.paymentStatus}
                                    disabled={updating}
                                    onChange={(event) =>
                                        updateOrder(
                                            selectedOrder._id,
                                            'paymentStatus',
                                            event.target.value
                                        )
                                    }
                                >
                                    {PAYMENT_STATUSES.map((item) => (
                                        <option key={item} value={item}>
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="btn btn-primary text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop bg-black/60"
                        onClick={() => setSelectedOrder(null)}
                    />
                </div>
            )}
        </div>
    );
}
