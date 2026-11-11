
import { Link } from 'react-router-dom';

const items = [
    ['Cloud Soft Tote', 'Accessories', 18, '👜'],
    ['Mellow Desk Lamp', 'Home', 32, '💡'],
    ['Daily Sip Bottle', 'Lifestyle', 14, '🥤'],
    ['Tiny Joy Headphones', 'Tech', 45, '🎧'],
    ['Sunday Planter', 'Home', 22, '🪴'],
    ['Pocket Notebook Set', 'Stationery', 9, '📓'],
    ['Cozy Throw', 'Home', 38, '🧶'],
    ['Everyday Cap', 'Style', 16, '🧢']
];

export function ShopPage() {
    return (
        <div className="container py-12 bg-base-100 text-base-content">

            {/* Page Heading */}
            <p className="text-primary font-bold text-xs tracking-widest">
                THE MOCHI COLLECTION
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-base-content">
                Shop all the happy things
            </h1>

            <p className="mt-2 text-base-content/60">
                A few lovely finds to brighten your everyday.
            </p>

            {/* Search and Filters */}
            <div className="mt-8 flex flex-wrap gap-3">

                <input
                    className="input input-bordered w-full max-w-xs rounded-full bg-base-100 text-base-content"
                    placeholder="Search products"
                />

                <select className="select select-bordered rounded-full bg-base-100 text-base-content">
                    <option>All categories</option>
                    <option>Home</option>
                    <option>Tech</option>
                </select>

                <select className="select select-bordered rounded-full bg-base-100 text-base-content">
                    <option>Sort: Featured</option>
                    <option>Price low to high</option>
                </select>

            </div>

            {/* Product Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

                {items.map(([name, cat, price, emoji], i) => (
                    <article
                        key={name}
                        className="card-soft rounded-2xl border border-base-300 bg-base-100 p-3 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >

                        <div className="grid aspect-square place-items-center rounded-2xl bg-secondary text-7xl">
                            {emoji}
                        </div>

                        <p className="mt-4 text-xs font-medium text-base-content/50">
                            {cat}
                        </p>

                        <h2 className="mt-1 font-bold text-base-content">
                            {name}
                        </h2>

                        <div className="mt-3 flex items-center justify-between">

                            <b className="text-primary">
                                ${price.toFixed(2)}
                            </b>

                            <Link
                                to={`/products/${i + 1}`}
                                className="text-xs font-bold text-primary transition hover:underline"
                            >
                                Details →
                            </Link>

                        </div>

                    </article>
                ))}

            </div>
        </div>
    );
}
