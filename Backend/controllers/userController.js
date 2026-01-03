// backend/controllers/userController.js
import { db, admin } from '../config/firebase.js';
import User from '../models/User.js';

const registerUser = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required." });
    }

    // In a real application, user creation/authentication would ideally happen on the frontend
    // using Firebase client SDKs. The Admin SDK here is more for managing users created elsewhere
    // or for privileged operations.
    // For this example, we'll simulate user creation directly for demonstration purposes,
    // but a production app would involve client-side Firebase Auth.

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    const newUser = new User(userRecord.uid, email, displayName);
    await db.collection('users').doc(userRecord.uid).set(newUser.toFirestore());

    res.status(201).send({ message: "User registered successfully", user: newUser.toFirestore() });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).send({ message: "Email already registered." });
    }
    res.status(500).send({ message: "Failed to register user", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params; // User ID from authenticated request

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).send({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send({ message: "Failed to fetch user profile", error: error.message });
  }
};

export {
  registerUser,
  getUserProfile,
};

