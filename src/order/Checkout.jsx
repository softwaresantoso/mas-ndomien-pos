import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { Button } from '../components/ui/Button';
import { formatRupiah } from '../lib/format';
import { ORDER_TYPE } from '../constants';

export default function Checkout() {
  const { items, subtotal, orderType, tableId, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isTakeAway = orderType === ORDER_TYPE.TAKE_AWAY;
  const canSubmit = items.length > 0 && orderType && (!isTakeAway || customerName.trim().length > 0) && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await createOrder({
        orderType,
        tableId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        items,
        notes,
        createdBy: 'customer'
      });
      clearCart();
      navigate(`/order/track/${id}`);
    } catch (e) {
      // Never surface raw Firebase errors to the customer (product-40) —
      // but do log the real error for debugging via browser DevTools Console.
      console.error('createOrder failed:', e);
      setError('Pesanan belum berhasil dikirim. Periksa koneksi dan coba lagi.');
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-32 px-5 pt-4">
      <h1 className="font-bold text-lg mb-4">Checkout</h1>

      <div className="rounded-card border border-black/5 p-4 mb-4">
        <p className="text-sm font-semibold mb-2">
          {orderType === ORDER_TYPE.DINE_IN ? 'Dine In' : 'Take Away'}
          {tableId && ' — meja sudah terkonfirmasi lewat QR'}
        </p>
        <div className="text-sm text-brand-dark/70 space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.qty}× {item.name}</span>
              <span>{formatRupiah((item.price + (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0)) * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-sm mt-3 pt-3 border-t border-black/5">
          <span>Total</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
      </div>

      {isTakeAway && (
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Nama *</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm"
              placeholder="Nama untuk dipanggil"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">No. WhatsApp (opsional)</label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="text-sm font-semibold block mb-1">Catatan untuk pesanan (opsional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-black/10 p-3 text-sm resize-none"
          rows={2}
        />
      </div>

      {error && <p className="text-sm text-brand-red mb-3">{error}</p>}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 p-4">
        <Button className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? 'Mengirim pesanan…' : `Buat Pesanan — ${formatRupiah(subtotal)}`}
        </Button>
      </div>
    </div>
  );
}
