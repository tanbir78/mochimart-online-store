
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addToCart } from '../../utilities/cart';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch Product Details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError('');

                const apiUrl =
                    import.meta.env.VITE_API_URL ||
                    'http://localhost:5000';

                const response = await fetch(
                    `${apiUrl}/api/products/${id}`
                );

                if (!response.ok) {
                    throw new Error('Product not found');
                }

                const data = await response.json();

                const productData =
                    data.item || data.product || data;

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
            } catch (err) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // SweetAlert2: Add to Cart
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

    // Loading State
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

    // Error State
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

    // Prepare Images
    const images = (Array.isArray(product.images) ? product.images : [])
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

                <div className="grid gap-10 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm md:grid-cols-2 md:p-10">

                    {/* Product Images */}
                    <div>
                        {/* Main Image */}
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

                        {/* Category */}
                        <p className="text-sm font-bold uppercase tracking-widest text-primary">
                            {product.category || 'General'}
                        </p>

                        {/* Product Name */}
                        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-base-content md:text-4xl">
                            {product.name}
                        </h1>

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

                        {/* Add to Cart Button */}
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
            </div>
        </main>
    );
};

export default ProductPage;
