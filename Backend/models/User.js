// backend/models/User.js

class User {
  constructor(uid, email, displayName, username, phone, institution, studyGoal, grade, createdAt = new Date(), updatedAt = new Date()) {
    this.uid = uid; // Firebase Auth UID
    this.email = email;
    this.displayName = displayName;
    this.username = username;
    this.phone = phone;
    this.institution = institution;
    this.studyGoal = studyGoal;
    this.grade = grade;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      displayName: this.displayName,
      username: this.username,
      phone: this.phone,
      institution: this.institution,
      studyGoal: this.studyGoal,
      grade: this.grade,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new User(data.uid, data.email, data.displayName, data.username, data.phone, data.institution, data.studyGoal, data.grade, data.createdAt.toDate(), data.updatedAt.toDate());
  }
}

export default User;

