
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

const API_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroImages = [
        '/images/cover2.png',
        '/images/cover1.png',
        '/images/cover0.png'
    ];

    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((previous) => (previous + 1) % heroImages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(`${API_URL}/api/products`);

                if (!response.ok) {
                    throw new Error('Failed to load products');
                }

                const data = await response.json();

                setProducts(data.items || []);

            } catch (err) {
                setError(err.message || 'Something went wrong');

            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const featuredProducts = products.filter(
        (product) => product.featured
    );

    return (
        <main className="min-h-screen bg-base-100 text-base-content">

            {/* Hero Section */}
            <section className="px-5 py-16 md:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">

                    {/* Hero Content */}
                    <div>

                        <span className="inline-block rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-content">
                            Welcome to MochiMart
                        </span>


                        <h1 className="hero-title hero-title-glow mt-6 text-4xl font-extrabold leading-tight text-base-content md:text-6xl">
                            <span className="hero-line hero-line-one block">
                                Your Happy Little
                            </span>

                            <span className="hero-line hero-line-two block text-primary">
                                Shopping Place
                            </span>
                        </h1>


                        <p className="mt-5 max-w-lg text-base-content/70">
                            Discover lovely products, amazing deals and
                            everyday essentials at MochiMart.
                        </p>

                        <a
                            href="/shop"
                            className="mt-8 inline-flex items-center rounded-xl bg-primary px-7 py-3 font-semibold text-primary-content shadow-md transition duration-200 hover:brightness-95 hover:-translate-y-1 hero-button-glow"
                        >
                            Explore Products →
                        </a>

                    </div>

                    {/* Hero Image Slider */}
                    <div className="relative min-h-64 overflow-hidden rounded-3xl bg-secondary shadow-lg">

                        {/* Images */}
                        {heroImages.map((image, index) => (
                            <img
                                key={image}
                                src={image}
                                alt={`MochiMart Shopping Banner ${index + 1}`}
                                className={`absolute inset-0 h-full min-h-64 w-full object-cover transition-opacity duration-700 ${currentSlide === index
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                    }`}
                            />
                        ))}

                        {/* Previous Button */}
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentSlide(
                                    (currentSlide - 1 + heroImages.length) % heroImages.length
                                )
                            }
                            aria-label="Previous slide"
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-gray-800 shadow-md hover:bg-white"
                        >
                            ❮
                        </button>

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentSlide(
                                    (currentSlide + 1) % heroImages.length
                                )
                            }
                            aria-label="Next slide"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-gray-800 shadow-md hover:bg-white"
                        >
                            ❯
                        </button>

                        {/* Slider Indicators */}
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">

                            {heroImages.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setCurrentSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === index
                                        ? 'w-8 bg-orange-500'
                                        : 'w-2.5 bg-white/80'
                                        }`}
                                />
                            ))}

                        </div>

                    </div>

                </div>
            </section>

            {/* Featured Products */}
            <section className="mx-auto max-w-7xl px-5 py-12">

                <div className="mb-8">
                    <p className="font-bold tracking-widest text-sm text-primary">
                        HANDPICKED FOR YOU
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-base-content">
                        Featured Products
                    </h2>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-base-content/60">
                        Loading products...
                    </p>
                ) : error ? (
                    <p className="rounded-xl bg-error/10 p-5 text-center text-error">
                        {error}. Please check whether the backend server is running.
                    </p>
                ) : featuredProducts.length === 0 ? (
                    <p className="py-8 text-center text-base-content/60">
                        No featured products available yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}

            </section>

            {/* All Products */}
            <section className="mx-auto max-w-7xl px-5 py-12">

                <div className="mb-8">
                    <p className="font-bold tracking-widest text-sm text-primary">
                        OUR COLLECTION
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-base-content">
                        All Products
                    </h2>

                    <p className="mt-2 text-base-content/60">
                        Explore our latest collection.
                    </p>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-base-content/60">
                        Loading products...
                    </p>
                ) : error ? null : products.length === 0 ? (
                    <p className="py-10 text-center text-base-content/60">
                        No products found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}

            </section>

        </main>
    );
}

export default Home;
