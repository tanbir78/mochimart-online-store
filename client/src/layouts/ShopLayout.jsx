import { Outlet, Link, NavLink } from 'react-router-dom';
import {
    ShoppingBag,
    Search,
    Heart,
    UserRound,
    Menu,
    Moon
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { getCart } from '../utilities/cart.js';

export function ShopLayout() {
    const [dark, setDark] = useState(false);
    const [cartCount, setCartCount] = useState(0);

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
        <div
            data-theme={dark ? 'dark' : 'light'}
            className={
                dark
                    ? 'min-h-screen bg-slate-950 text-slate-100'
                    : 'min-h-screen bg-[#f8fffc] text-slate-800'
            }
        >

            {/* Top Announcement */}
            <div className="bg-[#00b894] py-2 text-center text-xs font-semibold text-white">
                A little joy in every delivery ✨ · Welcome to MochiMart
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-30 border-b border-emerald-50 bg-white/90 backdrop-blur">

                <div className="container flex h-[76px] items-center gap-8">

                    <Link
                        to="/"
                        className="text-2xl font-extrabold tracking-tight text-[#00a982]"
                    >
                        mochi
                        <span className="text-slate-800">mart.</span>
                        <span className="ml-1 text-xl">🍡</span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden gap-7 text-sm font-semibold text-slate-600 md:flex">

                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/shop">Shop</NavLink>
                        <a href="/#categories">Categories</a>
                        <a href="/#deals">Deals</a>

                    </nav>

                    {/* Navbar Actions */}
                    <div className="ml-auto flex items-center gap-4">

                        {/* Search */}
                        <label className="hidden items-center gap-2 rounded-full bg-[#f2faf6] px-4 py-2 text-slate-400 lg:flex">

                            <Search size={16} />

                            <input
                                className="w-40 bg-transparent text-sm outline-none"
                                placeholder="Search products"
                            />

                        </label>

                        {/* Theme Toggle */}
                        <button
                            aria-label="Toggle theme"
                            onClick={() => setDark(!dark)}
                            className="text-slate-600"
                        >
                            <Moon size={19} />
                        </button>

                        {/* Account */}
                        <Link to="/login" aria-label="Account">
                            <UserRound size={20} />
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            aria-label="Cart"
                            className="relative"
                        >

                            <ShoppingBag size={21} />

                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-[#ffb6c1] text-[10px] text-white">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}

                        </Link>

                        {/* Mobile Menu */}
                        <button className="md:hidden">
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
            <footer className="mt-20 bg-[#123e35] text-white">

                <div className="container grid gap-8 py-12 md:grid-cols-3">

                    <div>
                        <div className="text-2xl font-extrabold">
                            mochimart. 🍡
                        </div>

                        <p className="mt-3 max-w-xs text-sm text-emerald-100/70">
                            Your happy little shopping place. Discover small joys, every day.
                        </p>
                    </div>

                    <div>
                        <b>Explore</b>

                        <div className="mt-3 grid gap-2 text-sm text-emerald-100/70">
                            <Link to="/shop">Shop all</Link>
                            <Link to="/cart">Your cart</Link>
                            <Link to="/login">My account</Link>
                        </div>
                    </div>

                    <div>
                        <b>Stay in the loop</b>

                        <p className="mt-3 text-sm text-emerald-100/70">
                            New finds and happy little offers, occasionally.
                        </p>

                        <div className="mt-3 flex">

                            <input
                                placeholder="Email address"
                                className="min-w-0 rounded-l-full px-4 py-2 text-slate-800"
                            />

                            <button className="rounded-r-full bg-[#00b894] px-4 font-bold">
                                Join
                            </button>

                        </div>
                    </div>

                </div>

                <div className="border-t border-white/10 py-4 text-center text-xs text-emerald-100/50">
                    © {new Date().getFullYear()} MochiMart. Demo storefront — policies and delivery settings require merchant configuration.
                </div>

            </footer>

        </div>
    );
}