
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
    UserRound,
    ShoppingBag,
    MapPin,
    LogOut,
    Mail,
    Phone,
    ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

import { auth } from '../../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AccountPage() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const currentUser = auth.currentUser;

                if (!currentUser) {
                    navigate('/login', { replace: true });
                    return;
                }

                const token = await currentUser.getIdToken();

                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load profile.');
                }

                if (active) setUser(data.user);
            } catch (error) {
                console.error('Profile loading error:', error);

                if (active) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unable to load profile',
                        text: error.message,
                        confirmButtonColor: '#F28C28'
                    });
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
    }, [navigate]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of your account.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#F28C28',
            customClass: {
                popup: 'mochi-swal-popup',
                title: 'mochi-swal-title',
                htmlContainer: 'mochi-swal-text',
                confirmButton: 'mochi-swal-confirm',
                cancelButton: 'mochi-swal-cancel'
            }
        });

        if (!result.isConfirmed) return;

        try {
            setLoggingOut(true);
            await signOut(auth);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);

            Swal.fire({
                icon: 'error',
                title: 'Logout failed',
                text: 'Please try again.',
                confirmButtonColor: '#F28C28'
            });

            setLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (!user) return null;

    const displayName = user.name || 'MochiMart Customer';

    return (
        <section className="min-h-screen bg-base-200/40 py-10 md:py-14">
            <div className="container mx-auto max-w-6xl px-4">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                        My Account
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-base-content md:text-4xl">
                        Welcome, {displayName}!
                    </h1>

                    <p className="mt-2 text-base-content/60">
                        Manage your profile and shopping activities.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Profile Card */}
                    <div className="card border border-base-300 bg-base-100 shadow-sm lg:col-span-1">
                        <div className="card-body items-center text-center">

                            <div className="avatar">
                                <div className="w-24 rounded-full bg-primary/10 text-primary">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={displayName} />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <UserRound size={42} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2 className="mt-3 text-xl font-bold text-base-content">
                                {displayName}
                            </h2>

                            <div className="badge badge-primary badge-outline gap-1">
                                <ShieldCheck size={13} />
                                Customer
                            </div>

                            <div className="my-4 w-full space-y-4 text-left">
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-base-content/50">Email</p>
                                        <p className="break-all text-sm text-base-content">
                                            {user.email || 'Not available'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-primary" />
                                    <div>
                                        <p className="text-xs text-base-content/50">Phone</p>
                                        <p className="text-sm text-base-content">
                                            {user.phone || 'Not added'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="btn btn-outline btn-error mt-3 w-full"
                            >
                                {loggingOut ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <LogOut size={17} />
                                )}
                                {loggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>

                    {/* Account Overview */}
                    <div className="space-y-6 lg:col-span-2">

                        <div className="card border border-base-300 bg-base-100 shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title text-base-content">
                                    Account Overview
                                </h2>

                                <p className="text-sm text-base-content/60">
                                    Your MochiMart customer account is ready.
                                    You can manage your shopping activities here.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">

                            <Link
                                to="/account/orders"
                                className="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-1 hover:border-primary"
                            >
                                <div className="card-body">
                                    <ShoppingBag size={28} className="text-primary" />
                                    <h3 className="font-bold text-base-content">
                                        My Orders
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        View your order history and order status.
                                    </p>
                                    <span className="mt-2 text-sm font-semibold text-primary">
                                        View Orders →
                                    </span>
                                </div>
                            </Link>

                            <Link
                                to="/account/address"
                                className="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-1 hover:border-primary"
                            >
                                <div className="card-body">
                                    <MapPin size={28} className="text-primary" />
                                    <h3 className="font-bold text-base-content">
                                        My Address
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        Manage your delivery address.
                                    </p>
                                    <span className="mt-2 text-sm font-semibold text-primary">
                                        Manage Address →
                                    </span>
                                </div>
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
