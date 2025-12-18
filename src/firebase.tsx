import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = JSON.parse(
  import.meta.env.VITE_FIREBASE_CONFIG_JSON as string,
);

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Helper to create session cookie from Firebase ID token
export const createSessionCookie = async (idToken: string): Promise<void> => {
  try {
    // Always use relative path - /api/create-session is served by Cloudflare Functions
    // in both local development (wrangler) and production (Cloudflare Pages)
    const response = await fetch("/api/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to create session cookie");
    }

    console.log("Session cookie created successfully");
  } catch (error) {
    console.error("Error creating session cookie:", error);
    throw error;
  }
};

export const signinWithGoogle = async () => {
  const oldToken = await auth.currentUser?.getIdToken();
  if (oldToken) {
    return { token: oldToken };
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    return { token };
  } catch (e) {
    console.error("Error in firebase popup", e);
  }
};

// Sign out and clear session
export const logout = async (): Promise<void> => {
  await auth.signOut();
  // Clear session cookie by setting expired date
  document.cookie = "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
  // Redirect to root (middleware will show login page)
  window.location.href = "/";
};

// Re-authenticate by triggering Google sign-in again
export const reauthenticate = async (): Promise<void> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    // Create new session cookie with fresh token
    await createSessionCookie(idToken);
  } catch (e) {
    console.error("Error re-authenticating", e);
  }
};
