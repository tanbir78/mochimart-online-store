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
        <div className="container py-12">
            <p className="text-[#00a982] font-bold text-xs tracking-widest">
                THE MOCHI COLLECTION
            </p>

            <h1 className="text-4xl font-extrabold mt-2">
                Shop all the happy things
            </h1>

            <p className="text-slate-500 mt-2">
                A few lovely finds to brighten your everyday.
            </p>

            <div className="flex gap-3 mt-8 flex-wrap">
                <input
                    className="border rounded-full px-4 py-2"
                    placeholder="Search products"
                />

                <select className="border rounded-full px-4 py-2">
                    <option>All categories</option>
                    <option>Home</option>
                    <option>Tech</option>
                </select>

                <select className="border rounded-full px-4 py-2">
                    <option>Sort: Featured</option>
                    <option>Price low to high</option>
                </select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {items.map(([name, cat, price, emoji], i) => (
                    <article key={name} className="card-soft p-3">
                        <div className="aspect-square rounded-2xl bg-[#f0faf5] grid place-items-center text-7xl">
                            {emoji}
                        </div>

                        <p className="text-xs text-slate-400 mt-4">
                            {cat}
                        </p>

                        <h2 className="font-bold mt-1">
                            {name}
                        </h2>

                        <div className="flex justify-between items-center mt-3">
                            <b>${price.toFixed(2)}</b>

                            <Link
                                to={`/products/${i + 1}`}
                                className="text-xs font-bold text-[#009b78]"
                            >
                                Details →
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}