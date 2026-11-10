
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addToCart } from '../../utilities/cart';

export function ProductPage() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedImage, setSelectedImage] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
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

                setProduct(data);

                // Select primary image by default
                const images = Array.isArray(data.images)
                    ? data.images
                    : [];

                const primaryImage =
                    images.find(
                        (image) =>
                            typeof image === 'object' &&
                            image.isPrimary
                    )?.url;

                const firstImage =
                    images.find((image) => {
                        return typeof image === 'string'
                            ? image
                            : image?.url;
                    });

                const initialImage =
                    primaryImage ||
                    (typeof firstImage === 'string'
                        ? firstImage
                        : firstImage?.url) ||
                    '';

                setSelectedImage(initialImage);
                setImageError(false);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="py-20 text-center">
                Loading product...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-2xl font-bold text-red-500">
                    Product not found
                </h2>

                <Link
                    to="/shop"
                    className="mt-5 inline-block text-emerald-600"
                >
                    Back to Shop
                </Link>
            </div>
        );
    }

    // Prepare product images
    const images = (product.images || [])
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

    const mainImage =
        images.find((image) => image.url === selectedImage) ||
        images.find((image) => image.isPrimary) ||
        images[0];

    return (
        <main className="min-h-screen bg-[#F8FFFC] px-5 py-12">

            <div className="mx-auto max-w-6xl">

                <Link
                    to="/shop"
                    className="mb-8 inline-block text-emerald-600 hover:underline"
                >
                    ← Back to Shop
                </Link>

                <div className="grid gap-10 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">

                    {/* Product Image Gallery */}
                    <div>

                        {/* Main Image */}
                        <div className="flex h-[350px] items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 md:h-[450px]">

                            {mainImage && !imageError ? (
                                <img
                                    src={mainImage.url}
                                    alt={mainImage.alt || product.name}
                                    className="h-full w-full object-contain p-4"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <span className="text-9xl">
                                    🛍️
                                </span>
                            )}

                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="mt-5 grid grid-cols-4 gap-3">

                                {images.map((image, index) => (
                                    <button
                                        key={`${image.url}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(image.url);
                                            setImageError(false);
                                        }}
                                        className={`h-20 overflow-hidden rounded-xl border-2 bg-emerald-50 transition md:h-24 ${
                                            selectedImage === image.url
                                                ? 'border-emerald-500 ring-2 ring-emerald-100'
                                                : 'border-transparent hover:border-emerald-300'
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={
                                                image.alt ||
                                                `${product.name} image ${index + 1}`
                                            }
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

                        <p className="font-semibold uppercase tracking-wide text-emerald-600">
                            {product.category}
                        </p>

                        <h1 className="mt-3 text-3xl font-bold text-gray-800 md:text-4xl">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="mt-5 flex items-center gap-3">

                            <span className="text-3xl font-bold text-emerald-600">
                                ৳{Number(product.price).toLocaleString('en-BD')}
                            </span>

                            {product.compareAtPrice > product.price && (
                                <span className="text-lg text-gray-400 line-through">
                                    ৳{Number(product.compareAtPrice).toLocaleString('en-BD')}
                                </span>
                            )}

                        </div>

                        {/* Description */}
                        <p className="mt-6 leading-7 text-gray-600">
                            {product.description ||
                                'No description available.'}
                        </p>

                        {/* Availability */}
                        <div className="mt-6 rounded-xl bg-emerald-50 p-4">

                            <p className="font-medium text-gray-700">
                                Availability:

                                <span
                                    className={
                                        product.stock > 0
                                            ? 'ml-2 text-green-600'
                                            : 'ml-2 text-red-500'
                                    }
                                >
                                    {product.stock > 0
                                        ? 'In Stock'
                                        : 'Out of Stock'}
                                </span>
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                Available Quantity: {product.stock}
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                SKU: {product.sku}
                            </p>

                        </div>

                        {/* Add to Cart */}
                        <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={() => {
                                addToCart(product);
                                alert(
                                    'Product added to cart successfully!'
                                );
                            }}
                            className="mt-7 w-full rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:bg-gray-300"
                        >
                            Add to Cart
                        </button>

                    </div>

                </div>

            </div>

        </main>
    );
}
