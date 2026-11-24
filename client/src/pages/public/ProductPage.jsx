
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addToCart } from '../../utilities/cart';
import { auth } from '../../config/firebase';

const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Review States
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({
        averageRating: 0,
        totalReviews: 0
    });
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewError, setReviewError] = useState('');

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    // ========================================
    // Fetch Product Details + Reviews
    // ========================================

    useEffect(() => {
        let isMounted = true;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(
                    `${API_URL}/api/products/${id}`
                );

                if (!response.ok) {
                    throw new Error('Product not found');
                }

                const data = await response.json();

                const productData =
                    data.item || data.product || data;

                if (!isMounted) return;

                setProduct(productData);

                const images = Array.isArray(productData.images)
                    ? productData.images
                    : [];

                const primaryImage = images.find(
                    (image) =>
                        typeof image === 'object' &&
                        image?.isPrimary &&
                        image?.url
                );

                const firstImage = images.find((image) =>
                    typeof image === 'string'
                        ? image.length > 0
                        : Boolean(image?.url)
                );

                const imageUrl =
                    primaryImage?.url ||
                    (typeof firstImage === 'string'
                        ? firstImage
                        : firstImage?.url) ||
                    '';

                setSelectedImage(imageUrl);

                // Fetch approved reviews
                const productId = productData._id;

                if (productId) {
                    setReviewsLoading(true);

                    try {
                        const reviewResponse = await fetch(
                            `${API_URL}/api/reviews/${productId}`
                        );

                        const reviewData = await reviewResponse.json();

                        if (!reviewResponse.ok) {
                            throw new Error(
                                reviewData.error || 'Unable to load reviews.'
                            );
                        }

                        if (isMounted) {
                            setReviews(reviewData.reviews || []);

                            setReviewSummary(
                                reviewData.summary || {
                                    averageRating: 0,
                                    totalReviews: 0
                                }
                            );
                        }

                    } catch (reviewErr) {
                        if (isMounted) {
                            setReviewError(reviewErr.message);
                        }
                    } finally {
                        if (isMounted) {
                            setReviewsLoading(false);
                        }
                    }
                } else {
                    setReviewsLoading(false);
                }

            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Something went wrong');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProduct();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // ========================================
    // Add to Cart
    // ========================================

    const handleAddToCart = async () => {
        if (!product || Number(product.stock) <= 0) {
            return;
        }

        try {
            addToCart(product);

            const result = await Swal.fire({
                icon: 'success',
                title: 'Added Successfully!',
                text: `${product.name} has been added to your cart.`,
                showCancelButton: true,
                confirmButtonText: 'View Cart',
                cancelButtonText: 'Continue Shopping',
                confirmButtonColor: '#F28C28',
                cancelButtonColor: '#81766D',
                reverseButtons: true,
                buttonsStyling: true,
                allowOutsideClick: true,
                customClass: {
                    popup: 'mochi-swal-popup',
                    title: 'mochi-swal-title',
                    htmlContainer: 'mochi-swal-text',
                    confirmButton: 'mochi-swal-confirm',
                    cancelButton: 'mochi-swal-cancel'
                }
            });

            if (result.isConfirmed) {
                navigate('/cart');
            }

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Unable to add this product to your cart.',
                confirmButtonColor: '#F28C28'
            });
        }
    };

    // ========================================
    // Submit Product Review
    // ========================================

    const handleSubmitReview = async (event) => {
        event.preventDefault();

        if (!auth.currentUser) {
            await Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to submit a product review.',
                confirmButtonColor: '#F28C28'
            });

            return;
        }

        if (!comment.trim() || comment.trim().length < 5) {
            setReviewError(
                'Please write at least 5 characters in your review.'
            );
            return;
        }

        if (comment.trim().length > 2000) {
            setReviewError(
                'Review cannot exceed 2000 characters.'
            );
            return;
        }

        if (!product?._id) {
            setReviewError('Product information is unavailable.');
            return;
        }

        try {
            setReviewSubmitting(true);
            setReviewError('');

            const token = await auth.currentUser.getIdToken();

            const response = await fetch(
                `${API_URL}/api/reviews/${product._id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rating,
                        comment: comment.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to submit review.'
                );
            }

            setComment('');
            setRating(5);

            await Swal.fire({
                icon: 'success',
                title: 'Review Submitted!',
                text: 'Thank you! Your review has been submitted and is waiting for admin approval.',
                confirmButtonColor: '#F28C28'
            });

        } catch (err) {
            setReviewError(err.message);

            Swal.fire({
                icon: 'error',
                title: 'Unable to Submit Review',
                text: err.message,
                confirmButtonColor: '#F28C28'
            });

        } finally {
            setReviewSubmitting(false);
        }
    };

    // ========================================
    // Loading State
    // ========================================

    if (loading) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center bg-base-100 text-base-content">
                <span className="loading loading-spinner loading-lg text-primary"></span>

                <p className="mt-4 text-base-content/60">
                    Loading product...
                </p>
            </div>
        );
    }

    // ========================================
    // Error State
    // ========================================

    if (error || !product) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center bg-base-100 px-5 text-center text-base-content">
                <div className="text-6xl">🛍️</div>

                <h2 className="mt-5 text-2xl font-bold text-error">
                    Product Not Found
                </h2>

                <p className="mt-2 text-base-content/60">
                    {error || 'This product is not available.'}
                </p>

                <Link
                    to="/shop"
                    className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-content transition hover:brightness-95"
                >
                    Back to Shop
                </Link>
            </div>
        );
    }

    // ========================================
    // Prepare Images
    // ========================================

    const images = (
        Array.isArray(product.images) ? product.images : []
    )
        .map((image) => {
            if (typeof image === 'string') {
                return {
                    url: image,
                    alt: product.name,
                    isPrimary: false
                };
            }

            return image;
        })
        .filter((image) => image?.url);

    const currentImage =
        images.find((image) => image.url === selectedImage) ||
        images.find((image) => image.isPrimary) ||
        images[0];

    const comparePrice = Number(
        product.compareAtPrice ?? product.compareAt ?? 0
    );

    // ========================================
    // Render
    // ========================================

    return (
        <main className="min-h-screen bg-base-100 px-5 py-12 text-base-content">
            <div className="mx-auto max-w-6xl">

                {/* Back to Shop */}

                <Link
                    to="/shop"
                    className="mb-8 inline-flex items-center gap-2 font-semibold text-primary transition hover:gap-3"
                >
                    <span>←</span>
                    Back to Shop
                </Link>

                {/* Product Information */}

                <div className="grid gap-10 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm md:grid-cols-2 md:p-10">

                    {/* Product Images */}

                    <div>

                        <div className="flex h-[350px] items-center justify-center overflow-hidden rounded-2xl bg-secondary md:h-[450px]">
                            {currentImage ? (
                                <img
                                    src={currentImage.url}
                                    alt={currentImage.alt || product.name}
                                    className="h-full w-full object-contain p-5"
                                />
                            ) : (
                                <span className="text-8xl">🛍️</span>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}

                        {images.length > 1 && (
                            <div className="mt-5 grid grid-cols-4 gap-3">
                                {images.map((image, index) => (
                                    <button
                                        key={`${image.url}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            setSelectedImage(image.url)
                                        }
                                        className={`h-20 overflow-hidden rounded-xl border-2 bg-secondary transition md:h-24 ${
                                            selectedImage === image.url
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-base-300 hover:border-primary/50'
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full object-contain p-1"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Information */}

                    <div className="flex flex-col justify-center">

                        <p className="text-sm font-bold uppercase tracking-widest text-primary">
                            {product.category || 'General'}
                        </p>

                        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-base-content md:text-4xl">
                            {product.name}
                        </h1>

                        {/* Product Rating */}

                        <div className="mt-3 flex flex-wrap items-center gap-2">

                            <span className="text-warning">
                                {'★'.repeat(
                                    Math.round(reviewSummary.averageRating)
                                )}
                                <span className="text-base-content/20">
                                    {'★'.repeat(
                                        5 - Math.round(reviewSummary.averageRating)
                                    )}
                                </span>
                            </span>

                            <span className="text-sm font-semibold">
                                {reviewSummary.averageRating.toFixed(1)}
                            </span>

                            <span className="text-sm text-base-content/50">
                                ({reviewSummary.totalReviews} reviews)
                            </span>

                        </div>

                        {/* Price */}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <span className="text-3xl font-extrabold text-primary">
                                ৳{Number(product.price).toLocaleString('en-BD')}
                            </span>

                            {comparePrice > Number(product.price) && (
                                <span className="text-lg text-base-content/40 line-through">
                                    ৳{comparePrice.toLocaleString('en-BD')}
                                </span>
                            )}
                        </div>

                        {/* Description */}

                        <p className="mt-6 leading-8 text-base-content/70">
                            {product.description ||
                                'No description available for this product.'}
                        </p>

                        {/* Product Details */}

                        <div className="mt-7 space-y-4 rounded-2xl border border-base-300 bg-secondary p-5">

                            <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-base-content/70">
                                    Availability
                                </span>

                                <span
                                    className={`font-bold ${
                                        Number(product.stock) > 0
                                            ? 'text-success'
                                            : 'text-error'
                                    }`}
                                >
                                    {Number(product.stock) > 0
                                        ? 'In Stock'
                                        : 'Out of Stock'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-base-content/70">
                                    Available Quantity
                                </span>

                                <span className="font-semibold text-base-content">
                                    {product.stock ?? 0}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-base-content/70">
                                    SKU
                                </span>

                                <span className="font-semibold text-base-content">
                                    {product.sku || 'N/A'}
                                </span>
                            </div>

                        </div>

                        {/* Add to Cart */}

                        <button
                            type="button"
                            disabled={Number(product.stock) <= 0}
                            onClick={handleAddToCart}
                            className="mt-7 w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-content shadow-md transition duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {Number(product.stock) > 0
                                ? 'Add to Cart →'
                                : 'Out of Stock'}
                        </button>

                        <p className="mt-4 text-center text-xs text-base-content/50">
                            🧡 Little Things, Big Smiles
                        </p>

                    </div>
                </div>

                {/* ========================================
                    Customer Reviews
                ======================================== */}

                <section className="mt-16">

                    <div className="mb-8">
                        <p className="text-xs font-bold tracking-widest text-primary">
                            CUSTOMER FEEDBACK
                        </p>

                        <h2 className="mt-2 text-3xl font-extrabold">
                            Customer Reviews
                        </h2>

                        <p className="mt-2 text-sm text-base-content/60">
                            See what customers think about this product.
                        </p>
                    </div>

                    {/* Review Summary */}

                    <div className="mb-8 grid gap-5 rounded-2xl border border-base-300 bg-secondary p-6 sm:grid-cols-2">

                        <div>
                            <p className="text-sm text-base-content/60">
                                Average Rating
                            </p>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-4xl font-extrabold text-primary">
                                    {reviewSummary.averageRating.toFixed(1)}
                                </span>

                                <div>
                                    <p className="text-xl text-warning">
                                        {'★'.repeat(
                                            Math.round(reviewSummary.averageRating)
                                        )}
                                    </p>

                                    <p className="text-xs text-base-content/50">
                                        Out of 5 stars
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <p className="text-sm text-base-content/60">
                                Total Approved Reviews
                            </p>

                            <p className="mt-2 text-3xl font-extrabold">
                                {reviewSummary.totalReviews}
                            </p>
                        </div>

                    </div>

                    {/* Review List */}

                    <div className="space-y-4">

                        {reviewsLoading ? (
                            <div className="py-10 text-center">
                                <span className="loading loading-spinner loading-md text-primary" />
                                <p className="mt-3 text-sm text-base-content/60">
                                    Loading reviews...
                                </p>
                            </div>
                        ) : reviewError ? (
                            <div className="rounded-xl border border-error/30 p-5 text-sm text-error">
                                {reviewError}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-8 text-center">
                                <div className="text-4xl">💬</div>

                                <h3 className="mt-3 text-lg font-bold">
                                    No reviews yet
                                </h3>

                                <p className="mt-2 text-sm text-base-content/60">
                                    Be the first customer to share your experience!
                                </p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <article
                                    key={review._id}
                                    className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">

                                        <div>
                                            <h3 className="font-bold">
                                                {review.userName || 'Customer'}
                                            </h3>

                                            <p className="mt-1 text-xs text-base-content/50">
                                                {review.createdAt
                                                    ? new Date(
                                                        review.createdAt
                                                    ).toLocaleDateString()
                                                    : ''}
                                            </p>
                                        </div>

                                        {review.verifiedPurchase && (
                                            <span className="badge badge-success badge-outline">
                                                Verified Purchase
                                            </span>
                                        )}

                                    </div>

                                    <div className="mt-3 text-lg text-warning">
                                        {'★'.repeat(review.rating)}
                                        <span className="text-base-content/20">
                                            {'★'.repeat(5 - review.rating)}
                                        </span>
                                    </div>

                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-base-content/80">
                                        {review.comment}
                                    </p>

                                </article>
                            ))
                        )}

                    </div>

                    {/* Submit Review Form */}

                    <div className="mt-12 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">

                        <p className="text-xs font-bold tracking-widest text-primary">
                            SHARE YOUR EXPERIENCE
                        </p>

                        <h3 className="mt-2 text-2xl font-extrabold">
                            Write a Review
                        </h3>

                        <p className="mt-2 text-sm text-base-content/60">
                            Tell other customers what you think about this product.
                        </p>

                        <form
                            onSubmit={handleSubmitReview}
                            className="mt-7 space-y-6"
                        >

                            {/* Rating Selection */}

                            <div>
                                <label className="mb-3 block text-sm font-bold">
                                    Your Rating
                                </label>

                                <div className="flex items-center gap-2">

                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            aria-label={`Rate ${star} out of 5`}
                                            className={`text-3xl transition hover:scale-110 ${
                                                star <= rating
                                                    ? 'text-warning'
                                                    : 'text-base-content/20'
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}

                                    <span className="ml-2 text-sm font-semibold">
                                        {rating}/5
                                    </span>

                                </div>
                            </div>

                            {/* Review Comment */}

                            <div>
                                <label
                                    htmlFor="reviewComment"
                                    className="mb-2 block text-sm font-bold"
                                >
                                    Your Review
                                </label>

                                <textarea
                                    id="reviewComment"
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(event.target.value)
                                    }
                                    placeholder="Share your experience with this product..."
                                    rows={5}
                                    maxLength={2000}
                                    minLength={5}
                                    required
                                    className="textarea textarea-bordered w-full bg-base-100 text-base-content focus:border-primary focus:outline-none"
                                />

                                <p className="mt-2 text-right text-xs text-base-content/50">
                                    {comment.length}/2000 characters
                                </p>
                            </div>

                            {reviewError && (
                                <div className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
                                    {reviewError}
                                </div>
                            )}

                            {/* Submit Button */}

                            <button
                                type="submit"
                                disabled={reviewSubmitting}
                                className="btn btn-primary w-full sm:w-auto"
                            >
                                {reviewSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review →'
                                )}
                            </button>

                            <p className="text-xs leading-6 text-base-content/50">
                                Only customers who have received this product can submit a review. Reviews will appear publicly after admin approval.
                            </p>

                        </form>

                    </div>

                </section>

            </div>
        </main>
    );
};

export default ProductPage;
