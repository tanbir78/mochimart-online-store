import { Routes, Route } from 'react-router-dom';
import { ShopLayout } from './layouts/ShopLayout.jsx';
import { ShopPage } from './pages/public/ShopPage.jsx';
import { ProductPage } from './pages/public/ProductPage.jsx';
import { CartPage } from './pages/public/CartPage.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { DashboardPage } from './pages/admin/DashboardPage.jsx';
import { NotFoundPage } from './pages/public/NotFoundPage.jsx';
import Home from './pages/public/Home.jsx';
import { CheckoutPage } from './pages/public/CheckoutPage.jsx';

export default function App() {

    return (
        <Routes>
            <Route element={<ShopLayout />}>
                <Route
                    path="/"
                    element={<Home />}
                />
                <Route
                    path="/shop"
                    element={<ShopPage />}
                />
                <Route
                    path="/products/:id"
                    element={<ProductPage />}
                />
                <Route
                    path="/cart"
                    element={<CartPage />}
                />
                <Route
                    path="/login"
                    element={<LoginPage />}
                />
                <Route
                    path="/admin"
                    element={<DashboardPage />}
                />
                <Route
                    path="*"
                    element={<NotFoundPage />}
                />
                <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
        </Routes>
    );
}