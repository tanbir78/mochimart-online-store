
import { useEffect, useState } from 'react';
import { auth } from '../../config/firebase';

export function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const user = auth.currentUser;

                if (!user) {
                    throw new Error('Please login first.');
                }

                const token = await user.getIdToken();

                const response = await fetch(
                    'http://localhost:5000/api/admin/dashboard',
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || 'Failed to load dashboard.'
                    );
                }

                setStats(data);
            } catch (err) {
                console.error('Dashboard error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="container py-12">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-12">
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    const cards = [
        ['Products', stats.totalProducts],
        ['Orders', stats.totalOrders],
        ['Customers', stats.totalUsers],
        ['Pending Orders', stats.pendingOrders]
    ];

    return (
        <div className="container py-12">
            <p className="text-xs tracking-widest font-bold text-[#00a982]">
                STORE CONTROL
            </p>

            <h1 className="text-4xl font-extrabold mt-2">
                Dashboard overview
            </h1>

            <p className="text-slate-500 mt-2">
                Live statistics from your MochiMart database.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {cards.map(([label, value]) => (
                    <div className="card-soft p-6" key={label}>
                        <p className="text-sm text-slate-400">
                            {label}
                        </p>

                        <p className="text-3xl font-extrabold mt-2">
                            {value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
