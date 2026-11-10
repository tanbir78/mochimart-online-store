import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/api/products`);

                if (!response.ok) {
                    throw new Error("Failed to load products");
                }

                const data = await response.json();

                setProducts(data.items || []);
            } catch (err) {
                setError(err.message || "Something went wrong");
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
        <main className="min-h-screen bg-[#F8FFFC]">
            {/* Hero Section */}
            <section className="px-5 py-16 md:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
                    <div>
                        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                            Welcome to MochiMart
                        </span>

                        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-800 md:text-6xl">
                            Your Happy Little
                            <span className="block text-emerald-500">
                                Shopping Place
                            </span>
                        </h1>

                        <p className="mt-5 max-w-lg text-gray-600">
                            Discover lovely products, amazing deals and
                            everyday essentials at MochiMart.
                        </p>

                        <a
                            href="/shop"
                            className="mt-8 inline-block rounded-xl bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-600"
                        >
                            Explore Products →
                        </a>
                    </div>

                    <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-3xl bg-emerald-100">
                        <img
                            src="/images/mochi mart-hero.png"
                            alt="MochiMart Happy Shopping"
                            className="h-full min-h-64 w-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="mx-auto max-w-7xl px-5 py-12">
                <div className="mb-8">
                    <p className="font-semibold text-emerald-600">
                        HANDPICKED FOR YOU
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-800">
                        Featured Products
                    </h2>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-gray-500">
                        Loading products...
                    </p>
                ) : error ? (
                    <p className="rounded-xl bg-red-50 p-5 text-center text-red-600">
                        {error}. Please check whether the backend server is running.
                    </p>
                ) : featuredProducts.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">
                        No featured products available yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* All Products */}
            <section className="mx-auto max-w-7xl px-5 py-12">
                <div className="mb-8">
                    <p className="font-semibold text-emerald-600">
                        OUR COLLECTION
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-800">
                        All Products
                    </h2>
                    <p className="mt-2 text-gray-500">
                        Explore our latest collection.
                    </p>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-gray-500">
                        Loading products...
                    </p>
                ) : error ? null : products.length === 0 ? (
                    <p className="py-10 text-center text-gray-500">
                        No products found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Home;