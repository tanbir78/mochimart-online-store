
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function CustomerRoute() {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                if (active) setStatus('unauthenticated');
                return;
            }

            try {
                const token = await currentUser.getIdToken();

                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Unable to verify account.');
                }

                if (active) {
                    setStatus(
                        data.user?.role === 'customer'
                            ? 'customer'
                            : 'unauthorized'
                    );
                }
            } catch (error) {
                console.error('Customer verification failed:', error);

                if (active) setStatus('error');
            }
        });

        return () => {
            active = false;
            unsubscribe();
        };
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace />;
    }

    if (status === 'unauthorized') {
        return <Navigate to="/admin" replace />;
    }

    if (status === 'error') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
