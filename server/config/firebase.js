
import 'dotenv/config';
import admin from 'firebase-admin';

let firebaseApp;

export function initializeFirebaseAdmin() {
    if (firebaseApp) {
        return firebaseApp;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing Firebase Admin environment variables.'
        );
    }

    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n')
        })
    });

    return firebaseApp;
}

export function getFirebaseAuth() {
    if (!firebaseApp) {
        throw new Error(
            'Firebase Admin has not been initialized.'
        );
    }

    return admin.auth(firebaseApp);
}

export async function verifyFirebaseToken(token) {
    const auth = getFirebaseAuth();
    return auth.verifyIdToken(token);
}
