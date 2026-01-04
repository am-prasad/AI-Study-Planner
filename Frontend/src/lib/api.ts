// AI-Study-Planner/Frontend/src/lib/api.ts
import { auth } from "../config/firebase";

const API_BASE_URL = "http://localhost:5000/api"; // Your backend API base URL
const AI_AGENT_BASE_URL = "http://localhost:8000"; // Your AI Agent base URL

interface RequestOptions extends RequestInit {
  token?: string; // Optional token if already available
}

async function authenticatedFetch(url: string, options: RequestOptions = {}): Promise<any> {
  let user = auth.currentUser;
  
  // If user is not immediately available, wait for auth state to be ready
  if (!user) {
    console.log("authenticatedFetch: auth.currentUser is null, waiting for auth state change...");
    user = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
        unsubscribe(); // Unsubscribe immediately after state is determined
        if (firebaseUser) {
          console.log("authenticatedFetch: auth.onAuthStateChanged resolved with user:", firebaseUser.uid);
          resolve(firebaseUser);
        } else {
          console.log("authenticatedFetch: auth.onAuthStateChanged resolved with NO user.");
          reject(new Error("User not authenticated after waiting."));
        }
      });
    });
  }

  let idToken: string;
  if (options.token) {
    idToken = options.token;
  } else {
    idToken = await user.getIdToken();
  }

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    Authorization: `Bearer ${idToken}`,
  };

  if (!isFormData) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  // Merge additional headers, allowing them to override defaults
  Object.assign(headers, options.headers);

  const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `${API_BASE_URL}${url}`;
  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "Something went wrong with the API request.");
  }

  return response.json();
}

async function aiAgentFetch(url: string, options: RequestOptions = {}): Promise<any> {
  let user = auth.currentUser;
  
  // If user is not immediately available, wait for auth state to be ready
  if (!user) {
    console.log("aiAgentFetch: auth.currentUser is null, waiting for auth state change...");
    user = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
        unsubscribe(); // Unsubscribe immediately after state is determined
        if (firebaseUser) {
          console.log("aiAgentFetch: auth.onAuthStateChanged resolved with user:", firebaseUser.uid);
          resolve(firebaseUser);
        } else {
          console.log("aiAgentFetch: auth.onAuthStateChanged resolved with NO user.");
          reject(new Error("User not authenticated after waiting."));
        }
      });
    });
  }

  let idToken: string;
  if (options.token) {
    idToken = options.token;
  } else {
    idToken = await user.getIdToken();
  }

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    Authorization: `Bearer ${idToken}`,
  };

  if (!isFormData) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  // Merge additional headers, allowing them to override defaults
  Object.assign(headers, options.headers);

  // For AI agent, we might send a different payload, e.g., FormData for files
  // This example assumes JSON for now, but will be adjusted for file uploads later.
  const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `${AI_AGENT_BASE_URL}${url}`;
  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "Something went wrong with the AI Agent request.");
  }

  return response.json();
}

export { authenticatedFetch, aiAgentFetch, API_BASE_URL, AI_AGENT_BASE_URL };

