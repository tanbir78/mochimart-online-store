import { Routes, Route } from 'react-router-dom';
import { ShopLayout } from './layouts/ShopLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';
import { ShopPage } from './pages/public/ShopPage.jsx';
import ProductPage from './pages/public/ProductPage.jsx';
import { CartPage } from './pages/public/CartPage.jsx';
import { CheckoutPage } from './pages/public/CheckoutPage.jsx';
import { NotFoundPage } from './pages/public/NotFoundPage.jsx';
import Home from './pages/public/Home.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { DashboardPage } from './pages/admin/DashboardPage.jsx';
import { AdminRoute } from './components/AdminRoute.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';
import OrdersPage from './pages/admin/OrdersPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import { CustomerRoute } from './components/CustomerRoute.jsx';
import AccountPage from './pages/customer/AccountPage.jsx';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import CustomerSettingsPage from './pages/customer/CustomerSettingsPage.jsx';

// Temporary pages for upcoming admin modules
function AdminPlaceholder({ title }) {
    return (
        <div className="card-soft p-8">
            <h1 className="text-3xl font-extrabold">
                {title}
            </h1>

            <p className="text-slate-500 mt-3">
                This section is coming soon.
            </p>
        </div>
    );
}

export default function App() {
    return (
        <Routes>

            {/* Public Store Routes */}
            <Route element={<ShopLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Customer Dashboard - No Store Navbar/Footer */}
            <Route element={<CustomerRoute />}>
                <Route path="/account" element={<CustomerLayout />}>
                    <Route index element={<AccountPage />} />
                    <Route path="settings" element={<CustomerSettingsPage />} />
                </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />

                    <Route
                        path="products"
                        element={<AdminPlaceholder title="Product Management" />}
                    />

                    <Route path="orders" element={<OrdersPage />} />

                    <Route
                        path="customers"
                        element={<AdminPlaceholder title="Customer Management" />}
                    />

                    <Route
                        path="analytics"
                        element={<AdminPlaceholder title="Sales Analytics" />}
                    />

                    <Route
                        path="settings"
                        element={<SettingsPage />}
                    />
                </Route>
            </Route>

        </Routes>
    );
}
