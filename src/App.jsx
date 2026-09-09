import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROLES } from './constants';

// Customer-facing pages
import OrderLanding from './order/OrderLanding';
import OrderMenu from './order/OrderMenu';
import ProductDetail from './order/ProductDetail';
import Cart from './order/Cart';
import Checkout from './order/Checkout';
import OrderTracking from './order/OrderTracking';
import ReservationForm from './order/ReservationForm';
import ReservationStatus from './order/ReservationStatus';

// Staff app pages
import Login from './app/Login';
import Dashboard from './app/Dashboard';
import OrdersManagement from './app/OrdersManagement';
import ReservationsManagement from './app/ReservationsManagement';
import TablesManagement from './app/TablesManagement';
import Kitchen from './app/Kitchen';
import Cashier from './app/Cashier';
import ProductsManagement from './app/ProductsManagement';
import Forbidden from './app/Forbidden';

const STAFF_ALL = [ROLES.OWNER, ROLES.ADMIN, ROLES.KITCHEN_CASHIER];

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/order" replace />} />

          {/* Customer — public, no auth */}
          <Route path="/order" element={<OrderLanding />} />
          <Route path="/order/menu" element={<OrderMenu />} />
          <Route path="/order/product/:slug" element={<ProductDetail />} />
          <Route path="/order/cart" element={<Cart />} />
          <Route path="/order/checkout" element={<Checkout />} />
          <Route path="/order/track/:orderId" element={<OrderTracking />} />
          <Route path="/order/reservasi" element={<ReservationForm />} />
          <Route path="/order/reservasi/:code" element={<ReservationStatus />} />

          {/* Staff */}
          <Route path="/login" element={<Login />} />
          <Route path="/app/forbidden" element={<Forbidden />} />

          <Route path="/app/dashboard" element={
            <ProtectedRoute allow={STAFF_ALL}><Dashboard /></ProtectedRoute>
          } />
          <Route path="/app/orders" element={
            <ProtectedRoute allow={[ROLES.OWNER, ROLES.ADMIN]}><OrdersManagement /></ProtectedRoute>
          } />
          <Route path="/app/reservations" element={
            <ProtectedRoute allow={[ROLES.OWNER, ROLES.ADMIN]}><ReservationsManagement /></ProtectedRoute>
          } />
          <Route path="/app/tables" element={
            <ProtectedRoute allow={[ROLES.OWNER, ROLES.ADMIN]}><TablesManagement /></ProtectedRoute>
          } />
          <Route path="/app/kitchen" element={
            <ProtectedRoute allow={[ROLES.OWNER, ROLES.KITCHEN_CASHIER]}><Kitchen /></ProtectedRoute>
          } />
          <Route path="/app/cashier" element={
            <ProtectedRoute allow={[ROLES.OWNER, ROLES.KITCHEN_CASHIER]}><Cashier /></ProtectedRoute>
          } />
          <Route path="/app/products" element={
            <ProtectedRoute allow={[ROLES.OWNER, ROLES.ADMIN]}><ProductsManagement /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/order" replace />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
