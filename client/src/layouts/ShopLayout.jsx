
import { Outlet, Link, NavLink } from 'react-router-dom';

import {
    ShoppingBag,
    Search,
    UserRound,
    Menu,
    Moon,
    Sun
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../config/firebase';
import { getCart } from '../utilities/cart.js';
import MochiMartIcon from '../components/common/MochiMartIcon.jsx';

export function ShopLayout() {
    const [dark, setDark] = useState(
        () => localStorage.getItem('mochimart_theme') === 'dark'
    );

    const [cartCount, setCartCount] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Apply theme globally and save preference
    useEffect(() => {
        const theme = dark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', theme);

        localStorage.setItem('mochimart_theme', theme);
    }, [dark]);

    // Firebase Authentication State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Cart Count
    useEffect(() => {
        const updateCartCount = () => {
            const cart = getCart();

            const totalItems = cart.reduce(
                (total, item) => total + item.quantity,
                0
            );

            setCartCount(totalItems);
        };

        updateCartCount();

        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    return (
        <div className="min-h-screen bg-base-100 text-base-content">

            {/* Announcement Bar */}
            <div className="flex items-center justify-center gap-2 bg-mochi py-1.5 text-center text-xs font-semibold text-white">
                <span>Little Things, Big Smiles</span>
                <MochiMartIcon size={30} />
                <span>Welcome to MochiMart</span>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/95 backdrop-blur">

                <div className="container flex h-[76px] items-center gap-8">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-0.5 text-2xl font-extrabold tracking-tight"
                    >
                        <span className="text-mochi">mochi</span>
                        <span className="text-base-content">mart</span>
                        <MochiMartIcon size={55} className="ml-0" />
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden gap-7 text-sm font-semibold text-base-content/70 md:flex">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/shop">Shop</NavLink>
                        <a href="/#categories">Categories</a>
                        <a href="/#deals">Deals</a>
                    </nav>

                    {/* Navbar Actions */}
                    <div className="ml-auto flex items-center gap-4">

                        {/* Search */}
                        <label className="hidden items-center gap-2 rounded-full bg-base-200 px-4 py-2 text-base-content/50 lg:flex">
                            <Search size={16} />

                            <input
                                className="w-40 bg-transparent text-sm outline-none"
                                placeholder="Search products"
                            />
                        </label>

                        {/* Theme Toggle */}
                        <button
                            type="button"
                            aria-label={
                                dark ? 'Switch to light mode' : 'Switch to dark mode'
                            }
                            title={dark ? 'Light Mode' : 'Dark Mode'}
                            onClick={() => setDark(previous => !previous)}
                            className="rounded-full p-2 text-base-content hover:bg-base-200"
                        >
                            {dark ? (
                                <Sun size={20} className="text-mochi" />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>

                        {/* Account */}
                        <Link
                            to={authLoading ? '/login' : currentUser ? '/account' : '/login'}
                            aria-label="Account"
                            title={currentUser ? 'My Account' : 'Sign In'}
                            className="text-base-content transition-colors hover:text-primary"
                        >
                            <UserRound size={20} />
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            aria-label="Cart"
                            className="relative text-base-content"
                        >
                            <ShoppingBag size={21} />

                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-mochi px-1 text-[10px] text-white">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu */}
                        <button
                            type="button"
                            aria-label="Open menu"
                            className="text-base-content md:hidden"
                        >
                            <Menu />
                        </button>

                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="mt-20 bg-neutral text-neutral-content">

                <div className="container grid gap-8 py-12 md:grid-cols-3">

                    <div>
                        <div className="flex items-center gap-1 text-2xl font-extrabold">
                            <span>mochimart</span>
                            <MochiMartIcon size={50} className="ml-0" />
                        </div>

                        <p className="mt-3 max-w-xs text-sm opacity-70">
                            Your happy little shopping place. Discover small joys, every day.
                        </p>
                    </div>

                    <div>
                        <b>Explore</b>

                        <div className="mt-3 grid gap-2 text-sm opacity-70">
                            <Link to="/shop">Shop all</Link>
                            <Link to="/cart">Your cart</Link>
                            <Link to={currentUser ? '/account' : '/login'}>
                                My account
                            </Link>
                        </div>
                    </div>

                    <div>
                        <b>Stay in the loop</b>

                        <p className="mt-3 text-sm opacity-70">
                            New finds and happy little offers, occasionally.
                        </p>

                        <div className="mt-3 flex">
                            <input
                                placeholder="Email address"
                                className="min-w-0 rounded-l-full bg-base-100 px-4 py-2 text-base-content"
                            />

                            <button className="rounded-r-full bg-mochi px-4 font-bold text-white">
                                Join
                            </button>
                        </div>
                    </div>

                </div>

                <div className="border-t border-white/10 py-4 text-center text-xs opacity-50">
                    © {new Date().getFullYear()} MochiMart. Demo storefront — policies and delivery settings require merchant configuration.
                </div>

            </footer>

        </div>
    );
}
