import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <div className="container py-24 text-center">
            <p className="text-7xl">🍡</p>

            <h1 className="text-4xl font-extrabold mt-5">
                Oops, wrong aisle!
            </h1>

            <p className="text-slate-500 mt-3">
                We couldn't find that page.
            </p>

            <Link to="/" className="btn-mochi inline-block mt-7">
                Back home
            </Link>
        </div>
    )
}