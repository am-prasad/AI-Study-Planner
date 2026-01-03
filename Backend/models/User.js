// backend/models/User.js

class User {
  constructor(uid, email, displayName, createdAt = new Date(), updatedAt = new Date()) {
    this.uid = uid; // Firebase Auth UID
    this.email = email;
    this.displayName = displayName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      displayName: this.displayName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new User(data.uid, data.email, data.displayName, data.createdAt.toDate(), data.updatedAt.toDate());
  }
}

export default User;

