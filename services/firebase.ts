import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged,
    User
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc
} from "firebase/firestore";
import { Answers } from "../types";

// Define interface for the global scope variables provided by the environment
interface CustomWindow extends Window {
    __app_id?: string;
    __firebase_config?: string;
    __initial_auth_token?: string;
}

declare const window: CustomWindow;

// --- Configuration ---
const getFirebaseConfig = () => {
    try {
        const rawConfig = window.__firebase_config || '{}';
        return JSON.parse(rawConfig);
    } catch (e) {
        console.error("Failed to parse firebase config", e);
        return {};
    }
};

const appId = window.__app_id || 'default-app-id';
const firebaseConfig = getFirebaseConfig();
const initialAuthToken = window.__initial_auth_token || null;

// --- Initialization ---
let db: any = null;
let auth: any = null;

const isConfigured = Object.keys(firebaseConfig).length > 0;

if (isConfigured) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

// --- Auth Service ---
export const initAuth = async (onUserChange: (user: User | null) => void) => {
    if (!auth) {
        onUserChange(null);
        return;
    }

    onAuthStateChanged(auth, (user) => {
        onUserChange(user);
    });

    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Auth failed, falling back to anonymous", error);
        try {
            await signInAnonymously(auth);
        } catch (anonError) {
            console.error("Anonymous login failed", anonError);
        }
    }
};

// --- Data Service ---
export const saveAssessmentData = async (userId: string, data: Answers) => {
    if (!db || !userId) throw new Error("Database not initialized or user not logged in");
    
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/iso_assessment/latest`);
    await setDoc(docRef, {
        timestamp: new Date().toISOString(),
        data: data
    });
};

export const loadAssessmentData = async (userId: string): Promise<Answers | null> => {
    if (!db || !userId) throw new Error("Database not initialized or user not logged in");

    const docRef = doc(db, `artifacts/${appId}/users/${userId}/iso_assessment/latest`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data().data as Answers;
    }
    return null;
};

export const isFirebaseReady = () => isConfigured;