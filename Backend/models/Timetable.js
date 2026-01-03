// backend/models/Timetable.js
// This is more of a schema definition for documentation and validation purposes.
// In Firestore, documents are flexible, but defining a structure helps.

class Timetable {
  constructor(userId, data, createdAt = new Date(), updatedAt = new Date()) {
    this.userId = userId;
    this.data = data; // This will hold the generated timetable structure
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toFirestore() {
    return {
      userId: this.userId,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Timetable(data.userId, data.data, data.createdAt.toDate(), data.updatedAt.toDate());
  }
}

export default Timetable;

