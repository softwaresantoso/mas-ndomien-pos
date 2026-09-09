import { doc, getDoc } from 'firebase/firestore';
import { db, BUSINESS_ID } from '../lib/firebase';

export async function getBusinessInfo() {
  const snap = await getDoc(doc(db, 'businesses', BUSINESS_ID));
  return snap.exists() ? snap.data() : null;
}
