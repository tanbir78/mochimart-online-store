import { Link } from 'react-router-dom';

export function LoginPage() {
    return (
        <div className="container py-16 max-w-md">
            <div className="card-soft p-8">
                <div className="text-center text-4xl">🍡</div>

                <h1 className="text-3xl font-extrabold text-center mt-3">
                    Welcome back!
                </h1>

                <p className="text-center text-slate-400 text-sm mt-2">
                    Sign in to your happy place.
                </p>

                <form
                    className="grid gap-4 mt-8"
                    onSubmit={e => e.preventDefault()}
                >
                    <label className="text-sm font-semibold">
                        Email
                        <input
                            type="email"
                            required
                            className="block w-full border rounded-xl p-3 mt-2"
                            placeholder="you@example.com"
                        />
                    </label>

                    <label className="text-sm font-semibold">
                        Password
                        <input
                            type="password"
                            required
                            className="block w-full border rounded-xl p-3 mt-2"
                            placeholder="Your password"
                        />
                    </label>

                    <button className="btn-mochi w-full">
                        Sign in
                    </button>
                </form>

                <p className="text-xs text-center text-slate-400 mt-6">
                    Firebase credentials are required to enable real authentication.
                </p>
            </div>
        </div>
    )
}