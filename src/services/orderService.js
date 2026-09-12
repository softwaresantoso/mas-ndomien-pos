import {
  collection, doc, runTransaction, onSnapshot, query, where, orderBy, limit,
  serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db, BUSINESS_ID } from '../lib/firebase';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants';
import { assertValidOrderTransition } from '../lib/orderStateMachine';

const ordersRef = () => collection(db, 'businesses', BUSINESS_ID, 'orders');
const orderDoc = (orderId) => doc(db, 'businesses', BUSINESS_ID, 'orders', orderId);
// Kept in its own top-level "counters" collection (not under settings/),
// because customers must be able to write to it without auth — see the
// dedicated Security Rule for this path. It only ever holds an integer
// counter per day, never business-sensitive data.
const countersDoc = () => doc(db, 'businesses', BUSINESS_ID, 'counters', 'orderCounters');

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Generates ORD-YYYYMMDD-XXX atomically via a per-day counter document,
 * so two simultaneous checkouts can never collide on the same number.
 */
async function generateOrderNumber(transaction) {
  const key = todayKey();
  const counterSnap = await transaction.get(countersDoc());
  const current = counterSnap.exists() ? (counterSnap.data()[key] || 0) : 0;
  const next = current + 1;
  transaction.set(countersDoc(), { [key]: next }, { merge: true });
  return `ORD-${key}-${String(next).padStart(3, '0')}`;
}

/**
 * Creates a new order. Server/transaction-side computation of totals from
 * `items` (never trusts a client-supplied `total`) — see product-43,
 * "Jangan mempercayai total harga dari client tanpa validasi".
 */
export async function createOrder({ orderType, tableId, customerName, customerPhone, items, notes, createdBy }) {
  if (!items || items.length === 0) {
    throw new Error('Order harus memiliki minimal satu item.');
  }

  return runTransaction(db, async (transaction) => {
    const subtotal = items.reduce((sum, item) => {
      const modifierTotal = (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0);
      return sum + (item.price + modifierTotal) * item.qty;
    }, 0);

    // Tax/service charge percentages come from business settings, read
    // inside the same transaction for consistency — wired up once
    // src/services/businessService.js lands in the next step.
    const total = subtotal; // discount/tax applied once businessService is in place

    const orderNumber = await generateOrderNumber(transaction);
    const newDocRef = doc(ordersRef());

    transaction.set(newDocRef, {
      orderNumber,
      orderType,
      tableId: tableId || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      items,
      subtotal,
      discount: 0,
      tax: 0,
      serviceCharge: 0,
      total,
      orderStatus: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.UNPAID,
      notes: notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: createdBy || 'customer'
    });

    return { id: newDocRef.id, orderNumber };
  });
}

/**
 * Moves an order to `nextStatus`, validating the transition is legal
 * before writing. Throws on illegal transitions instead of silently
 * clamping — callers (UI) should catch and show a toast.
 */
export async function transitionOrderStatus(orderId, nextStatus) {
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(orderDoc(orderId));
    if (!snap.exists()) throw new Error('Order tidak ditemukan.');
    const current = snap.data().orderStatus;
    assertValidOrderTransition(current, nextStatus);
    transaction.update(orderDoc(orderId), {
      orderStatus: nextStatus,
      updatedAt: serverTimestamp()
    });
  });
}

/** Realtime subscription for admin/kitchen order lists. */
export function subscribeActiveOrders(callback) {
  const q = query(
    ordersRef(),
    where('orderStatus', 'not-in', [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED]),
    orderBy('orderStatus'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/** Realtime subscription for a single order — used by customer tracking page. */
export function subscribeOrder(orderId, callback) {
  return onSnapshot(orderDoc(orderId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

/**
 * Realtime subscription for the admin Order Management list — all orders
 * (any status), newest first. Filtering by status/payment/search is done
 * client-side in the UI rather than via more Firestore query variants, so
 * this single subscription/index covers every filter tab (product-25).
 */
export function subscribeAllOrders(callback, { limitCount = 200 } = {}) {
  const q = query(ordersRef(), orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
