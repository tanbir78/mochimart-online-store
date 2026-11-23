
import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
    LayoutDashboard,
    ShoppingBag,
    MapPin,
    LogOut,
    Moon,
    Sun,
    Settings,
    Bell,
    CheckCheck,
    X
} from 'lucide-react';

import { auth } from '../config/firebase';
import MochiMartIcon from '../components/common/MochiMartIcon';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const menuItems = [
    { name: 'Dashboard', path: '/account', icon: LayoutDashboard, end: true },
    { name: 'My Orders', path: '/account/orders', icon: ShoppingBag },
    { name: 'My Address', path: '/account/address', icon: MapPin },
    { name: 'Settings', path: '/account/settings', icon: Settings }
];

function formatNotificationDate(value) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString([], {
        dateStyle: 'short',
        timeStyle: 'short'
    });
}

export default function CustomerLayout() {
    const navigate = useNavigate();

    const [dark, setDark] = useState(
        () => localStorage.getItem('mochimart_theme') === 'dark'
    );

    const [loggingOut, setLoggingOut] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState('');

    // Theme Management
    useEffect(() => {
        const theme = dark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mochimart_theme', theme);
    }, [dark]);

    // Fetch Notifications
    const fetchNotifications = useCallback(async (showLoading = false) => {
        const user = auth.currentUser;

        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        if (showLoading) {
            setNotificationLoading(true);
        }

        try {
            const token = await user.getIdToken();

            const response = await fetch(
                `${API_BASE_URL}/orders/notifications?limit=15`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Could not load notifications.'
                );
            }

            setNotifications(
                Array.isArray(data.notifications)
                    ? data.notifications
                    : []
            );

            setUnreadCount(Number(data.unreadCount) || 0);
            setNotificationError('');

        } catch (error) {
            console.error('Notification fetch failed:', error);

            setNotificationError(
                error.message || 'Could not load notifications.'
            );

        } finally {
            if (showLoading) {
                setNotificationLoading(false);
            }
        }
    }, []);

    // Initial Fetch + Auto Refresh
    useEffect(() => {
        fetchNotifications(true);

        const intervalId = window.setInterval(() => {
            fetchNotifications();
        }, 30000);

        const handleFocus = () => {
            fetchNotifications();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchNotifications]);

    // Mark Single Notification as Read
    async function markNotificationRead(notification) {
        if (notification.isRead || notification.read) {
            return true;
        }

        const user = auth.currentUser;

        if (!user) return false;

        try {
            const token = await user.getIdToken();

            const response = await fetch(
                `${API_BASE_URL}/orders/notifications/${notification._id}/read`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Could not update notification.'
                );
            }

            setNotifications(current =>
                current.map(item =>
                    item._id === notification._id
                        ? { ...item, isRead: true, read: true }
                        : item
                )
            );

            setUnreadCount(count => Math.max(0, count - 1));

            return true;

        } catch (error) {
            console.error('Mark notification read failed:', error);

            setNotificationError(
                error.message || 'Could not update notification.'
            );

            return false;
        }
    }

    // Mark All Notifications as Read
    async function markAllRead() {
        const user = auth.currentUser;

        if (!unreadCount || !user) return;

        try {
            const token = await user.getIdToken();

            const response = await fetch(
                `${API_BASE_URL}/orders/notifications/read-all`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Could not update notifications.'
                );
            }

            setNotifications(current =>
                current.map(item => ({
                    ...item,
                    isRead: true,
                    read: true
                }))
            );

            setUnreadCount(0);
            setNotificationError('');

        } catch (error) {
            console.error('Mark all notifications read failed:', error);

            setNotificationError(
                error.message || 'Could not update notifications.'
            );
        }
    }

    // Click Notification -> Open Related Order
    async function handleNotificationClick(notification) {
        if (!notification.isRead && !notification.read) {
            const success = await markNotificationRead(notification);

            if (!success) return;
        }

        setNotificationOpen(false);

        if (notification.orderId) {
            navigate(
                `/account/orders?orderId=${encodeURIComponent(
                    notification.orderId
                )}`
            );
        } else {
            navigate('/account/orders');
        }
    }

    // Logout
    async function handleLogout() {
        try {
            setLoggingOut(true);

            await signOut(auth);

            navigate('/login', {
                replace: true
            });

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

                    {/* Logout */}
                    <div className="mt-4 border-t border-base-300 pt-4">

                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error/10 transition disabled:opacity-50"
                        >
                            {loggingOut
                                ? <span className="loading loading-spinner loading-sm" />
                                : <LogOut size={19} />
                            }

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

                    <div className="flex items-center gap-3 md:gap-4">

                        {/* Notification Bell */}
                        <div className="relative">

                            <button
                                type="button"
                                onClick={() => {
                                    const next = !notificationOpen;

                                    setNotificationOpen(next);

                                    if (next) {
                                        fetchNotifications(true);
                                    }
                                }}
                                aria-label={`Notifications${
                                    unreadCount
                                        ? `, ${unreadCount} unread`
                                        : ''
                                }`}
                                aria-expanded={notificationOpen}
                                className="relative p-2 rounded-full text-base-content hover:bg-base-200 transition"
                            >
                                <Bell size={21} />

                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center">
                                        {unreadCount > 99
                                            ? '99+'
                                            : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {notificationOpen && (
                                <>
                                    <button
                                        aria-label="Close notifications"
                                        onClick={() => setNotificationOpen(false)}
                                        className="fixed inset-0 z-30 cursor-default"
                                    />

                                    <section className="absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] sm:w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl">

                                        {/* Dropdown Header */}
                                        <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">

                                            <div>
                                                <h3 className="font-bold">
                                                    Notifications
                                                </h3>

                                                <p className="text-xs text-base-content/50">
                                                    {unreadCount} unread
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">

                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllRead}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                                    >
                                                        <CheckCheck size={14} />
                                                        Mark all read
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setNotificationOpen(false)}
                                                    aria-label="Close"
                                                    className="rounded-lg p-1 hover:bg-base-200"
                                                >
                                                    <X size={17} />
                                                </button>

                                            </div>
                                        </div>

                                        {/* Notification List */}
                                        <div className="max-h-96 overflow-y-auto">

                                            {notificationLoading ? (
                                                <div className="flex justify-center p-8">
                                                    <span className="loading loading-spinner loading-md text-primary" />
                                                </div>

                                            ) : notificationError && notifications.length === 0 ? (
                                                <p className="p-5 text-sm text-error">
                                                    {notificationError}
                                                </p>

                                            ) : notifications.length === 0 ? (
                                                <div className="px-5 py-10 text-center">

                                                    <Bell
                                                        size={28}
                                                        className="mx-auto mb-2 text-base-content/30"
                                                    />

                                                    <p className="font-semibold">
                                                        You're all caught up!
                                                    </p>

                                                    <p className="mt-1 text-xs text-base-content/50">
                                                        New order updates will appear here.
                                                    </p>

                                                </div>

                                            ) : (
                                                notifications.map(notification => {
                                                    const isRead =
                                                        notification.isRead ||
                                                        notification.read;

                                                    return (
                                                        <button
                                                            key={notification._id}
                                                            onClick={() =>
                                                                handleNotificationClick(notification)
                                                            }
                                                            className={`block w-full border-b border-base-200 px-4 py-3 text-left transition hover:bg-base-200 ${
                                                                isRead
                                                                    ? ''
                                                                    : 'bg-primary/5'
                                                            }`}
                                                        >

                                                            <div className="flex items-start gap-3">

                                                                <span
                                                                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                                                                        isRead
                                                                            ? 'bg-base-300'
                                                                            : 'bg-primary'
                                                                    }`}
                                                                />

                                                                <span className="min-w-0 flex-1">

                                                                    <span className="block text-sm font-bold">
                                                                        {notification.title || 'Order update'}
                                                                    </span>

                                                                    <span className="mt-1 block text-xs leading-relaxed text-base-content/70">
                                                                        {notification.message}
                                                                    </span>

                                                                    <span className="mt-2 block text-[11px] text-base-content/45">
                                                                        {formatNotificationDate(
                                                                            notification.createdAt
                                                                        )}
                                                                    </span>

                                                                    {notification.orderId && (
                                                                        <span className="mt-2 inline-block text-[11px] font-semibold text-primary">
                                                                            View Order →
                                                                        </span>
                                                                    )}

                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}

                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

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
                            {dark
                                ? <Sun size={20} className="text-primary" />
                                : <Moon size={20} />
                            }
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
