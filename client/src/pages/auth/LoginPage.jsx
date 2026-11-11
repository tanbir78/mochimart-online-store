
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../config/firebase';
import MochiMartIcon from '../../components/common/MochiMartIcon';

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e) {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Get Firebase ID token for backend API requests.
            await userCredential.user.getIdToken();

            console.log('Firebase login successful');

            navigate('/admin');

        } catch (error) {
            console.error('Firebase Login Error:', error);
            console.log('Error Code:', error.code);
            console.log('Error Message:', error.message);

            setError(`${error.code}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container py-16 max-w-md">
            <div className="card-soft p-8">

                <div className="flex justify-center">
                    <MochiMartIcon size={100} />
                </div>

                <h1 className="text-3xl font-extrabold text-center mt-3">
                    Welcome back!
                </h1>

                <p className="text-center text-slate-400 text-sm mt-2">
                    Sign in to your happy place.
                </p>

                <form
                    className="grid gap-4 mt-8"
                    onSubmit={handleLogin}
                >
                    <label className="text-sm font-semibold">
                        Email

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full border rounded-xl p-3 mt-2"
                            placeholder="you@example.com"
                        />
                    </label>

                    <label className="text-sm font-semibold">
                        Password

                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full border rounded-xl p-3 mt-2"
                            placeholder="Your password"
                        />
                    </label>

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-mochi w-full disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-xs text-center text-slate-400 mt-6">
                    Secure authentication powered by Firebase.
                </p>
            </div>
        </div>
    );
}
