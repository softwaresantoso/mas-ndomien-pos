import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBusinessInfo } from '../services/businessService';
import { getTableById } from '../services/tableService';
import { subscribeCategories, subscribeProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/order/ProductCard';
import { StickyCartBar } from '../components/order/StickyCartBar';

export default function OrderLanding() {
  const [searchParams] = useSearchParams();
  const tableIdFromQr = searchParams.get('table');
  const { bindTable, tableId } = useCart();

  const [business, setBusiness] = useState(null);
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bind table once from the QR param — subsequent renders keep whatever
  // is already in CartContext (product-11: locked once entered via QR).
  useEffect(() => {
    if (tableIdFromQr && tableIdFromQr !== tableId) {
      bindTable(tableIdFromQr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableIdFromQr]);

  useEffect(() => {
    getBusinessInfo().then(setBusiness);
  }, []);

  useEffect(() => {
    if (tableId) getTableById(tableId).then(setTable);
  }, [tableId]);

  useEffect(() => {
    const unsubCat = subscribeCategories(setCategories);
    const unsubProd = subscribeProducts((items) => {
      setProducts(items);
      setLoading(false);
    });
    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  const featured = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <div className="pb-28">
      {/* Hero */}
      <div className="bg-brand-red text-white px-5 pt-8 pb-10 rounded-b-3xl">
        <p className="text-xs uppercase tracking-wide text-white/70">
          {table ? `Meja ${table.tableNumber}` : 'Selamat datang di'}
        </p>
        <h1 className="text-2xl font-bold mt-1">{business?.name || 'Pondok Es Teler Mas Ndomien'}</h1>
        <div className="flex gap-3 mt-5">
          <Link to="/order/menu" className="flex-1">
            <Button className="w-full">Pesan Sekarang</Button>
          </Link>
          <Link to="/order/reservasi" className="flex-1">
            <Button variant="outline" className="w-full !border-white !text-white">Reservasi Meja</Button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="px-5 mt-6 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/order/menu?category=${c.slug}`}
              className="whitespace-nowrap rounded-full border border-black/10 px-4 py-2 text-sm font-medium"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Featured products */}
      <div className="px-5 mt-6">
        <h2 className="font-semibold mb-3">Menu Populer</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : featured.length === 0 ? (
          <p className="text-sm text-brand-dark/50">Belum ada menu andalan yang ditandai.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <StickyCartBar />
    </div>
  );
}
