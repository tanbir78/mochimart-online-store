
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    deleteUser
} from 'firebase/auth';
import Swal from 'sweetalert2';

import { auth } from '../../config/firebase';
import MochiMartIcon from '../../components/common/MochiMartIcon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleRegister(e) {
        e.preventDefault();

        setError('');

        if (name.trim().length < 2) {
            setError('Name must contain at least 2 characters.');
            return;
        }

        if (password.length < 6) {
            setError('Password must contain at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        let firebaseUser = null;
        let registrationCompleted = false;

        try {
            // Step 1: Create Firebase account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            firebaseUser = userCredential.user;

            // Step 2: Update Firebase display name
            await updateProfile(firebaseUser, {
                displayName: name.trim()
            });

            // Step 3: Get Firebase ID token
            const token = await firebaseUser.getIdToken();

            // Step 4: Save customer profile in MongoDB
            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        phone: phone.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to create customer profile.'
                );
            }

            registrationCompleted = true;

            await Swal.fire({
                icon: 'success',
                title: 'Account Created!',
                text: 'Your MochiMart account has been created successfully.',
                confirmButtonText: 'Continue to Login',
                customClass: {
                    popup: 'mochi-swal-popup',
                    title: 'mochi-swal-title',
                    htmlContainer: 'mochi-swal-text',
                    confirmButton: 'mochi-swal-confirm'
                }
            });

            // Sign out so the user can use the normal login flow
            const { signOut } = await import('firebase/auth');
            await signOut(auth);

            navigate('/login', {
                state: { registered: true },
                replace: true
            });

        } catch (err) {
            console.error('Registration Error:', err);

            // Roll back Firebase account if MongoDB registration failed
            if (firebaseUser && !registrationCompleted) {
                try {
                    await deleteUser(firebaseUser);
                } catch (deleteError) {
                    console.error(
                        'Firebase account cleanup failed:',
                        deleteError
                    );
                }
            }

            let message = err.message || 'Registration failed.';

            if (err.code === 'auth/email-already-in-use') {
                message = 'This email is already registered. Please login.';
            } else if (err.code === 'auth/invalid-email') {
                message = 'Please enter a valid email address.';
            } else if (err.code === 'auth/weak-password') {
                message = 'Please choose a stronger password.';
            } else if (err instanceof TypeError) {
                message = 'Unable to connect to the server. Please try again.';
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container max-w-md py-12 sm:py-16">
            <div className="card-soft p-6 sm:p-8">

                {/* Logo */}
                <div className="flex justify-center">
                    <MochiMartIcon size={90} />
                </div>

                {/* Heading */}
                <h1 className="mt-3 text-center text-3xl font-extrabold text-base-content">
                    Create Account
                </h1>

                <p className="mt-2 text-center text-sm text-base-content/60">
                    Join MochiMart and discover your happy place.
                </p>

                {/* Registration Form */}
                <form
                    onSubmit={handleRegister}
                    className="mt-8 grid gap-4"
                >
                    <label className="grid gap-2 text-sm font-semibold text-base-content">
                        Full Name

                        <input
                            type="text"
                            required
                            minLength={2}
                            maxLength={80}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input input-bordered w-full rounded-xl"
                            placeholder="Enter your full name"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-base-content">
                        Email Address

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
                        Phone Number

                        <input
                            type="tel"
                            required
                            maxLength={30}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input input-bordered w-full rounded-xl"
                            placeholder="01XXXXXXXXX"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-base-content">
                        Password

                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input input-bordered w-full rounded-xl"
                            placeholder="Minimum 6 characters"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-base-content">
                        Confirm Password

                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input input-bordered w-full rounded-xl"
                            placeholder="Enter password again"
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
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-base-content/60">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-bold text-primary hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

                <p className="mt-5 text-center text-xs text-base-content/50">
                    Secure authentication powered by Firebase.
                </p>
            </div>
        </div>
    );
}

export default RegisterPage