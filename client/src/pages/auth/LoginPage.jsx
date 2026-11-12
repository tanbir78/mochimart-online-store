
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../config/firebase';
import MochiMartIcon from '../../components/common/MochiMartIcon';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            email.trim(),
            password
        );

        const token = await userCredential.user.getIdToken();

        // Get user role from MongoDB
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Unable to verify user account.');
        }

        const role = data.user?.role;

        if (role === 'admin') {
            navigate('/admin', { replace: true });
        } else if (role === 'customer') {
            navigate('/account', { replace: true });
        } else {
            throw new Error('Your account does not have a valid role.');
        }

    } catch (error) {
        console.error('Login Error:', error);

        // Sign out if profile verification fails
        if (auth.currentUser) {
            await import('firebase/auth').then(({ signOut }) =>
                signOut(auth)
            );
        }

        if (error.code === 'auth/invalid-credential') {
            setError('Invalid email or password.');
        } else {
            setError(error.message || 'Login failed. Please try again.');
        }
    } finally {
        setLoading(false);
    }
}


    return (
        <div className="container max-w-md py-12 sm:py-16">
            <div className="card-soft p-6 sm:p-8">

                {/* Logo */}
                <div className="flex justify-center">
                    <MochiMartIcon size={100} />
                </div>

                {/* Heading */}
                <h1 className="mt-3 text-center text-3xl font-extrabold text-base-content">
                    Welcome back!
                </h1>

                <p className="mt-2 text-center text-sm text-base-content/60">
                    Sign in to your happy place.
                </p>

                {/* Login Form */}
                <form
                    className="mt-8 grid gap-4"
                    onSubmit={handleLogin}
                >
                    <label className="grid gap-2 text-sm font-semibold text-base-content">
                        Email

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input input-bordered w-full rounded-xl"
                            placeholder="you@example.com"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-base-content">
                        Password

                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input input-bordered w-full rounded-xl"
                            placeholder="Your password"
                        />
                    </label>

                    {error && (
                        <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary mt-2 w-full text-white disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                {/* Sign Up Link */}
                <p className="mt-6 text-center text-sm text-base-content/60">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-bold text-primary hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>

                {/* Footer */}
                <p className="mt-5 text-center text-xs text-base-content/50">
                    Secure authentication powered by Firebase.
                </p>
            </div>
        </div>
    );
}
