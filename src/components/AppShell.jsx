import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.KITCHEN_CASHIER] },
  { to: '/app/orders', label: 'Order', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { to: '/app/reservations', label: 'Reservasi', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { to: '/app/tables', label: 'Meja', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { to: '/app/kitchen', label: 'Dapur', roles: [ROLES.OWNER, ROLES.KITCHEN_CASHIER] },
  { to: '/app/cashier', label: 'Kasir', roles: [ROLES.OWNER, ROLES.KITCHEN_CASHIER] },
  { to: '/app/products', label: 'Menu', roles: [ROLES.OWNER, ROLES.ADMIN] }
];

export function AppShell({ children }) {
  const { role, staffProfile, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 border-r border-black/5 bg-white p-4">
        <p className="font-bold text-brand-red mb-6 px-2">Mas Ndomien</p>
        <nav className="flex flex-col gap-1 flex-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-red/10 text-brand-red' : 'text-brand-dark/70 hover:bg-black/5'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 pt-4 border-t border-black/5">
          <p className="text-xs text-brand-dark/50 mb-2">{staffProfile?.name} · {role}</p>
          <button onClick={handleLogout} className="text-xs font-semibold text-brand-red">Keluar</button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 flex justify-around py-2 z-30">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `text-xs font-medium px-2 py-1 ${isActive ? 'text-brand-red' : 'text-brand-dark/50'}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
