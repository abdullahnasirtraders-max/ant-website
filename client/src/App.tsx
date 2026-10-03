import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const { About, Contact, NotFound } = { About: lazy(() => import('./pages/Info').then((m) => ({ default: m.About }))), Contact: lazy(() => import('./pages/Info').then((m) => ({ default: m.Contact }))), NotFound: lazy(() => import('./pages/Info').then((m) => ({ default: m.NotFound }))) };
const Admin = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <Suspense fallback={<div className="grid h-screen place-items-center text-sm text-steel">Loading…</div>}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:orderNumber" element={<Confirmation />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
