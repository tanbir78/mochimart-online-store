
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../../config/firebase';

export function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                if (isMounted) {
                    setError('Please login first.');
                    setLoading(false);
                }

                return;
            }

            try {
                setLoading(true);
                setError('');

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

                if (isMounted) {
                    setStats(data);
                }

            } catch (err) {
                console.error('Dashboard error:', err);

                if (isMounted) {
                    setError(err.message);
                }

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="py-12 text-base-content">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <p className="text-error">{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        ['Products', stats.totalProducts],
        ['Orders', stats.totalOrders],
        ['Customers', stats.totalUsers],
        ['Pending Orders', stats.pendingOrders]
    ];

    return (
        <div className="py-8 text-base-content">

            <p className="text-xs tracking-widest font-bold text-primary">
                STORE CONTROL
            </p>

            <h1 className="text-4xl font-extrabold mt-2">
                Dashboard overview
            </h1>

            <p className="text-base-content/60 mt-2">
                Live statistics from your MochiMart database.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

                {cards.map(([label, value]) => (
                    <div
                        className="card-soft p-6"
                        key={label}
                    >
                        <p className="text-sm text-base-content/60">
                            {label}
                        </p>

                        <p className="text-3xl font-extrabold mt-2 text-primary">
                            {value}
                        </p>
                    </div>
                ))}

            </div>
        </div>
    );
}
