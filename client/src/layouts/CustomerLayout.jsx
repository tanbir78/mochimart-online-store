
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
    LayoutDashboard,
    ShoppingBag,
    MapPin,
    LogOut,
    Moon,
    Sun,
    Settings
} from 'lucide-react';

import { auth } from '../config/firebase';
import MochiMartIcon from '../components/common/MochiMartIcon';

const menuItems = [
    {
        name: 'Dashboard',
        path: '/account',
        icon: LayoutDashboard,
        end: true
    },
    {
        name: 'My Orders',
        path: '/account/orders',
        icon: ShoppingBag
    },
    {
        name: 'My Address',
        path: '/account/address',
        icon: MapPin
    },
    {
        name: 'Settings',
        path: '/account/settings',
        icon: Settings
    }
];

export default function CustomerLayout() {
    const navigate = useNavigate();

    const [dark, setDark] = useState(
        () => localStorage.getItem('mochimart_theme') === 'dark'
    );

    const [loggingOut, setLoggingOut] = useState(false);

    // Apply and save selected theme
    useEffect(() => {
        const theme = dark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mochimart_theme', theme);
    }, [dark]);

    // Logout
    async function handleLogout() {
        try {
            setLoggingOut(true);
            await signOut(auth);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            setLoggingOut(false);
        }
    }

    const currentUser = auth.currentUser;

    const displayName =
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'Customer';

    return (
        <div className="min-h-screen flex bg-base-200 text-base-content">

            {/* Sidebar */}
            <aside className="w-64 shrink-0 bg-base-100 border-r border-base-300 flex flex-col">

                {/* Logo */}
                <div className="h-20 px-6 flex items-center">
                    <NavLink
                        to="/"
                        className="flex items-center gap-1 text-2xl font-extrabold tracking-tight"
                    >
                        <span className="text-mochi">mochi</span>
                        <span className="text-base-content">mart</span>
                        <MochiMartIcon size={50} />
                    </NavLink>
                </div>

                {/* Navigation */}
                <nav className="px-4">

                    <p className="text-xs font-bold text-base-content/50 px-3 mb-3 mt-4">
                        MY ACCOUNT
                    </p>

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                        isActive
                                            ? 'bg-primary text-primary-content shadow-md'
                                            : 'text-base-content/75 hover:bg-secondary hover:text-secondary-content'
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.name}
                            </NavLink>
                        );
                    })}

                    {/* Logout - Below Settings */}
                    <div className="mt-4 border-t border-base-300 pt-4">
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error/10 transition disabled:opacity-50"
                        >
                            {loggingOut ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <LogOut size={19} />
                            )}

                            {loggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>

                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">

                {/* Header */}
                <header className="h-20 bg-base-100 border-b border-base-300 flex items-center justify-between px-5 md:px-8">

                    <div>
                        <h2 className="font-bold text-base-content">
                            MochiMart Customer
                        </h2>

                        <p className="text-xs text-base-content/50">
                            Manage your account and orders
                        </p>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={() => setDark(previous => !previous)}
                            aria-label={
                                dark
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                            title={dark ? 'Light Mode' : 'Dark Mode'}
                            className="p-2 rounded-full text-base-content hover:bg-base-200 transition"
                        >
                            {dark ? (
                                <Sun size={20} className="text-primary" />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>

                        {/* Customer Avatar */}
                        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary bg-secondary">
                            {currentUser?.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt="Customer Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center font-bold text-primary">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <div className="p-5 md:p-8">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}
