import { collection, doc, getDoc, getDocs, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, BUSINESS_ID } from '../lib/firebase';

const categoriesRef = () => collection(db, 'businesses', BUSINESS_ID, 'categories');
const productsRef = () => collection(db, 'businesses', BUSINESS_ID, 'products');

/** Realtime categories, active only, sorted for menu tabs. */
export function subscribeCategories(callback) {
  const q = query(categoriesRef(), where('isActive', '==', true), orderBy('sortOrder', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/** Realtime products, available + not archived, sorted for menu grid. */
export function subscribeProducts(callback) {
  const q = query(
    productsRef(),
    where('isAvailable', '==', true),
    where('isArchived', '==', false),
    orderBy('sortOrder', 'asc')
  );
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/** One-time fetch of a single product by its Firestore doc id. */
export async function getProductById(productId) {
  const snap = await getDoc(doc(productsRef(), productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Products are looked up by slug in the URL, so fetch by slug (small
 *  catalog for MVP — a client-side scan is fine; move to a slug index
 *  query if the catalog grows). */
export async function getProductBySlug(slug) {
  const snap = await getDocs(productsRef());
  const match = snap.docs.find((d) => d.data().slug === slug);
  return match ? { id: match.id, ...match.data() } : null;
}
