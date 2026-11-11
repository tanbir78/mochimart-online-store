
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
    Store
} from 'lucide-react';

import { auth } from '../config/firebase';

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

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <div className="min-h-screen bg-[#f6fbf9] flex">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col">

                {/* Logo */}
                <div className="h-20 px-6 flex items-center border-b border-slate-100">
                    <NavLink
                        to="/"
                        className="text-2xl font-extrabold text-[#00a982]"
                    >
                        mochi<span className="text-slate-800">mart.</span>
                        <span className="ml-1">🍡</span>
                    </NavLink>
                </div>

                {/* Admin Info */}
                <div className="p-5">
                    <div className="bg-[#edfaf5] rounded-xl p-4">
                        <p className="text-xs text-slate-500">
                            Welcome back,
                        </p>

                        <p className="font-bold text-slate-800 mt-1">
                            Administrator
                        </p>

                        <span className="text-xs text-[#00a982]">
                            Store Manager
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2">
                    <p className="text-xs font-bold text-slate-400 px-3 mb-3">
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
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                        isActive
                                            ? 'bg-[#00a982] text-white shadow-md'
                                            : 'text-slate-600 hover:bg-[#edfaf5] hover:text-[#00a982]'
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
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                    >
                        <LogOut size={19} />
                        Logout
                    </button>

                    <NavLink
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 mt-2 text-sm text-slate-500 hover:text-[#00a982]"
                    >
                        <Store size={19} />
                        Visit Store
                    </NavLink>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
                    <div>
                        <h2 className="font-bold text-slate-800">
                            MochiMart Admin
                        </h2>

                        <p className="text-xs text-slate-400">
                            Manage your online store
                        </p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-[#edfaf5] text-[#00a982] flex items-center justify-center font-bold">
                        A
                    </div>
                </header>

                <div className="p-6 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
