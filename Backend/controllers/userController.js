// backend/controllers/userController.js
import { db, admin } from '../config/firebase.js';
import User from '../models/User.js';

const registerUser = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const displayName = req.user.displayName || ''; // Default to empty string if displayName is undefined/null
    const { username = '', phone = '', institution = '', studyGoal = '', grade = '' } = req.body; // Get additional info from body

    const userDoc = await db.collection('users').doc(uid).get();

    if (userDoc.exists) {
      // If user profile already exists in Firestore, return it
      return res.status(200).send({ message: "User profile already exists", user: userDoc.data() });
    }

    // If not, create a new user profile in Firestore
    const newUser = new User(uid, email, displayName, username, phone, institution, studyGoal, grade);
    await db.collection('users').doc(uid).set(newUser.toFirestore());

    res.status(201).send({ message: "User profile created successfully", user: newUser.toFirestore() });
  } catch (error) {
    console.error("Error processing user registration/profile creation:", error);
    res.status(500).send({ message: "Failed to create/fetch user profile", error: error.message });
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

const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body; // Contains partial user data to update

    // Ensure the authenticated user is updating their own profile
    if (req.user.uid !== uid) {
      return res.status(403).send({ message: "Unauthorized to update this profile." });
    }

    const userRef = db.collection('users').doc(uid);
    await userRef.update(updates);

    const updatedUserDoc = await userRef.get();
    res.status(200).send({ id: updatedUserDoc.id, ...updatedUserDoc.data() });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send({ message: "Failed to update user profile", error: error.message });
  }
};

export {
  registerUser,
  getUserProfile,
  updateUserProfile,
};

