/**
 * ISTE SC MBCET — Admin Seed Script
 * Run once to create the first admin account.
 * Usage: node scripts/seed-admin.mjs
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZ5LY7J9dbhL7y3KPHI5hBOBW7ovLM3sU",
  authDomain: "iste-528bd.firebaseapp.com",
  projectId: "iste-528bd",
  storageBucket: "iste-528bd.firebasestorage.app",
  messagingSenderId: "100194839456",
  appId: "1:100194839456:web:de2028c1182acc4ef292c5"
};

const ADMIN_EMAIL    = 'adhithyamohans.b24ec1205@mbcet.ac.in';
const ADMIN_PASSWORD = 'Adhy@2006';

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

async function seed() {
  console.log('🌱 ISTE SC MBCET — Admin Seed Script');
  console.log('=====================================');

  let uid;

  // ── Step 1: Create or sign into the admin Firebase Auth account ────────────
  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    uid = cred.user.uid;
    console.log(`✅ Created Firebase Auth account: ${ADMIN_EMAIL}  (uid: ${uid})`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Auth account already exists — signing in to get UID…');
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      uid = cred.user.uid;
      console.log(`✅ Signed in as existing user  (uid: ${uid})`);
    } else {
      throw err;
    }
  }

  // ── Step 2: Write Firestore user profile ───────────────────────────────────
  const userRef = doc(db, 'users', uid);
  const snap    = await getDoc(userRef);

  const adminProfile = {
    id: uid,
    fullName: 'Adhithya Mohan S',
    email: ADMIN_EMAIL,
    branchBatch: 'B24EC',
    department: 'EC',
    contact: '',
    skills: ['Leadership', 'Management'],
    areasOfExpertise: 'Society Management',
    socialLinks: {},
    role: 'chapterAdmin',
    designation: 'Chairperson',
    activeStatus: 'active',
    corePoints: 0,
  };

  if (!snap.exists()) {
    await setDoc(userRef, adminProfile);
    console.log('✅ Firestore user profile created.');
  } else {
    // Ensure role is elevated even if doc exists
    await setDoc(userRef, { ...snap.data(), role: 'chapterAdmin', designation: 'Chairperson' }, { merge: true });
    console.log('✅ Firestore profile already exists — ensured chapterAdmin role.');
  }

  // ── Step 3: Add to allowedUsers whitelist ──────────────────────────────────
  const whitelistRef = doc(db, 'allowedUsers', ADMIN_EMAIL.toLowerCase());
  await setDoc(whitelistRef, {
    email: ADMIN_EMAIL.toLowerCase(),
    role: 'chapterAdmin',
    designation: 'Chairperson',
    addedBy: 'seed-script',
    addedAt: new Date().toISOString(),
    isActive: true,
  });
  console.log('✅ Added to allowedUsers whitelist.');

  console.log('\n🎉 Done! You can now log in at http://localhost:3000/login');
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('\n   Use the "Admin" tab on the login page.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
