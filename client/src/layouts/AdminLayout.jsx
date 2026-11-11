
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    ChartColumn,
    Settings,
    LogOut,
    Store,
    Moon,
    Sun
} from 'lucide-react';

import { auth } from '../config/firebase';
import MochiMartIcon from '../components/common/MochiMartIcon';

const menuItems = [
    {
        name: 'Dashboard',
        path: '/admin',
        icon: LayoutDashboard,
        end: true
    },
    {
        name: 'Products',
        path: '/admin/products',
        icon: Package
    },
    {
        name: 'Orders',
        path: '/admin/orders',
        icon: ShoppingCart
    },
    {
        name: 'Customers',
        path: '/admin/customers',
        icon: Users
    },
    {
        name: 'Analytics',
        path: '/admin/analytics',
        icon: ChartColumn
    },
    {
        name: 'Settings',
        path: '/admin/settings',
        icon: Settings
    }
];

export function AdminLayout() {
    const navigate = useNavigate();

    const [dark, setDark] = useState(
        () => localStorage.getItem('mochimart_theme') === 'dark'
    );

    // Apply and save the selected theme
    useEffect(() => {
        const theme = dark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mochimart_theme', theme);
    }, [dark]);

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <div className="min-h-screen flex bg-base-200 text-base-content">

            {/* Sidebar */}
            <aside className="w-64 shrink-0 bg-base-100 border-r border-base-300 flex flex-col">


                {/* Logo */}
                <div className="h-20 px-6 flex items-center border-b border-base-300">
                    <NavLink
                        to="/"
                        className="flex items-center gap-1 text-2xl font-extrabold tracking-tight"
                    >
                        <span className="text-mochi">mochi</span>
                        <span className="text-base-content">mart</span>
                        <MochiMartIcon size={50} />
                    </NavLink>
                </div>


                {/* Admin Info */}
                <div className="p-5">
                    <div className="bg-base-200 rounded-xl p-4">
                        <p className="text-xs text-base-content/60">
                            Welcome back,
                        </p>

                        <p className="font-bold text-base-content mt-1">
                            Administrator
                        </p>

                        <span className="text-xs font-semibold text-primary">
                            Store Manager
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2">

                    <p className="text-xs font-bold text-base-content/50 px-3 mb-3">
                        MAIN MENU
                    </p>

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
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

                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-base-300">

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error/10 transition"
                    >
                        <LogOut size={19} />
                        Logout
                    </button>

                    <NavLink
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 mt-2 text-sm text-base-content/60 hover:text-primary transition"
                    >
                        <Store size={19} />
                        Visit Store
                    </NavLink>

                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">

                {/* Header */}
                <header className="h-20 bg-base-100 border-b border-base-300 flex items-center justify-between px-8">

                    <div>
                        <h2 className="font-bold text-base-content">
                            MochiMart Admin
                        </h2>

                        <p className="text-xs text-base-content/50">
                            Manage your online store
                        </p>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={() => setDark(previous => !previous)}
                            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={dark ? 'Light Mode' : 'Dark Mode'}
                            className="p-2 rounded-full text-base-content hover:bg-base-200 transition"
                        >
                            {dark ? (
                                <Sun size={20} className="text-primary" />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>

                        {/* Admin Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                            A
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 md:p-8">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}
