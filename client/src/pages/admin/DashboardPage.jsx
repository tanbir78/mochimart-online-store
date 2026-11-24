
import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../../config/firebase';

const API_URL = 'http://localhost:5000/api';

export function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const [token, setToken] = useState('');

    // ========================================
    // Load Dashboard Statistics
    // ========================================

    const loadDashboard = useCallback(async (authToken) => {
        try {
            const response = await fetch(
                `${API_URL}/admin/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to load dashboard.'
                );
            }

            setStats(data);

        } catch (err) {
            console.error('Dashboard error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ========================================
    // Load Pending Reviews
    // ========================================

    const loadReviews = useCallback(async (authToken) => {
        try {
            setReviewsLoading(true);
            setReviewError('');

            const response = await fetch(
                `${API_URL}/admin/reviews?status=pending&page=1&limit=5`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to load reviews.'
                );
            }

            setReviews(data.reviews || []);

        } catch (err) {
            console.error('Review loading error:', err);
            setReviewError(err.message);
        } finally {
            setReviewsLoading(false);
        }
    }, []);

    // ========================================
    // Firebase Authentication
    // ========================================

    useEffect(() => {
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                if (!user) {
                    if (isMounted) {
                        setError('Please login first.');
                        setLoading(false);
                        setReviewsLoading(false);
                    }

                    return;
                }

                try {
                    const authToken = await user.getIdToken();

                    if (!isMounted) return;

                    setToken(authToken);

                    await Promise.all([
                        loadDashboard(authToken),
                        loadReviews(authToken)
                    ]);

                } catch (err) {
                    if (isMounted) {
                        setError(err.message);
                        setLoading(false);
                        setReviewsLoading(false);
                    }
                }
            }
        );

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [loadDashboard, loadReviews]);

    // ========================================
    // Approve / Reject Review
    // ========================================

    const handleReviewAction = async (reviewId, status) => {
        if (!token || processingId) return;

        try {
            setProcessingId(reviewId);
            setReviewError('');

            const response = await fetch(
                `${API_URL}/admin/reviews/${reviewId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to update review.'
                );
            }

            // Remove moderated review from pending list
            setReviews((previous) =>
                previous.filter(
                    (review) => review._id !== reviewId
                )
            );

        } catch (err) {
            console.error('Review action error:', err);
            setReviewError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    // ========================================
    // Loading State
    // ========================================

    if (loading) {
        return (
            <div className="py-12 text-base-content">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <p className="text-error">{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        ['Products', stats.totalProducts],
        ['Orders', stats.totalOrders],
        ['Customers', stats.totalUsers],
        ['Pending Orders', stats.pendingOrders]
    ];

    return (
        <div className="py-8 text-base-content">

            {/* Dashboard Header */}

            <p className="text-xs tracking-widest font-bold text-primary">
                STORE CONTROL
            </p>

            <h1 className="text-4xl font-extrabold mt-2">
                Dashboard overview
            </h1>

            <p className="text-base-content/60 mt-2">
                Live statistics from your MochiMart database.
            </p>

            {/* Statistics Cards */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

                {cards.map(([label, value]) => (
                    <div
                        className="card-soft p-6"
                        key={label}
                    >
                        <p className="text-sm text-base-content/60">
                            {label}
                        </p>

                        <p className="text-3xl font-extrabold mt-2 text-primary">
                            {value}
                        </p>
                    </div>
                ))}

            </div>

            {/* Pending Reviews */}

            <section className="mt-12">

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

                    <div>
                        <p className="text-xs tracking-widest font-bold text-primary">
                            CUSTOMER FEEDBACK
                        </p>

                        <h2 className="text-2xl font-extrabold mt-2">
                            Pending Reviews
                        </h2>

                        <p className="text-sm text-base-content/60 mt-1">
                            Review and moderate customer feedback.
                        </p>
                    </div>

                    <div className="badge badge-warning badge-lg">
                        {reviews.length} Pending
                    </div>

                </div>

                {reviewError && (
                    <div className="alert alert-error mb-4">
                        <span>{reviewError}</span>
                    </div>
                )}

                {reviewsLoading ? (
                    <div className="card-soft p-8 text-center">
                        <span className="loading loading-spinner loading-md text-primary" />
                        <p className="mt-3 text-base-content/60">
                            Loading reviews...
                        </p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="card-soft p-10 text-center">
                        <div className="text-4xl mb-3">⭐</div>

                        <h3 className="font-bold text-lg">
                            All caught up!
                        </h3>

                        <p className="text-sm text-base-content/60 mt-2">
                            There are no pending reviews right now.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">

                        {reviews.map((review) => (
                            <div
                                key={review._id}
                                className="card-soft p-5 sm:p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">

                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {review.userName || 'Customer'}
                                        </h3>

                                        <p className="text-xs text-base-content/50 mt-1">
                                            Product ID: {String(review.productId)}
                                        </p>
                                    </div>

                                    <div className="badge badge-warning">
                                        Pending
                                    </div>

                                </div>

                                {/* Rating */}

                                <div className="flex items-center gap-1 mt-4">

                                    {Array.from(
                                        { length: 5 },
                                        (_, index) => (
                                            <span
                                                key={index}
                                                className={
                                                    index < review.rating
                                                        ? 'text-warning'
                                                        : 'text-base-content/20'
                                                }
                                            >
                                                ★
                                            </span>
                                        )
                                    )}

                                    <span className="text-sm font-bold ml-2">
                                        {review.rating}/5
                                    </span>

                                </div>

                                {/* Review Comment */}

                                <p className="text-sm text-base-content/80 leading-7 mt-3 whitespace-pre-wrap">
                                    {review.comment}
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-base-300">

                                    <p className="text-xs text-base-content/50">
                                        {review.createdAt
                                            ? new Date(review.createdAt).toLocaleDateString()
                                            : 'Date unavailable'}
                                    </p>

                                    <div className="flex gap-2">

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-error btn-outline"
                                            disabled={processingId !== null}
                                            onClick={() =>
                                                handleReviewAction(
                                                    review._id,
                                                    'rejected'
                                                )
                                            }
                                        >
                                            {processingId === review._id
                                                ? 'Processing...'
                                                : 'Reject'}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            disabled={processingId !== null}
                                            onClick={() =>
                                                handleReviewAction(
                                                    review._id,
                                                    'approved'
                                                )
                                            }
                                        >
                                            Approve
                                        </button>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}
