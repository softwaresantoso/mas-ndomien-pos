import { doc, getDoc } from 'firebase/firestore';
import { db, BUSINESS_ID } from '../lib/firebase';

export async function getTableById(tableId) {
  if (!tableId) return null;
  const snap = await getDoc(doc(db, 'businesses', BUSINESS_ID, 'tables', tableId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
