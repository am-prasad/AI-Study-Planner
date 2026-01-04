// backend/controllers/timetableController.js
import { db } from '../config/firebase.js';
import Timetable from '../models/Timetable.js';

// Internal utility function to create and save a timetable to Firestore
const createTimetable = async (userId, timetableData, availability, startDate, studyTime) => {
  try {
    if (!userId || !timetableData || !availability || !startDate || !studyTime) {
      throw new Error("userId, timetableData, availability, startDate, and studyTime are required to create a timetable.");
    }

    const newTimetable = new Timetable(userId, {
      timetable: timetableData, // Store the AI-generated timetable here
      inputDetails: {
        availability: availability,
        startDate: startDate,
        studyTime: studyTime
      }
    }, new Date(), new Date());
    const timetableRef = await db.collection('timetables').add(newTimetable.toFirestore());

    return { id: timetableRef.id, ...newTimetable.toFirestore() };
  } catch (error) {
    console.error("Error saving timetable to Firestore:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Route handler to get a user's latest timetable
const getTimetable = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send({ message: "userId is required." });
    }

    // Fetch the latest timetable for the user
    const snapshot = await db.collection('timetables').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(1).get();

    if (snapshot.empty) {
      return res.status(404).send({ message: "No timetable found for this user." });
    }

    const latestTimetable = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    res.status(200).send(latestTimetable);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).send({ message: "Failed to fetch timetable", error: error.message });
  }
};

// Route handler to update an existing timetable
const updateTimetable = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const { userId, timetableData, availability, startDate, studyTime } = req.body;

    if (!timetableId || !userId || !timetableData || !availability || !startDate || !studyTime) {
      return res.status(400).send({ message: "timetableId, userId, timetableData, availability, startDate, and studyTime are required." });
    }

    // Ensure the authenticated user is updating their own timetable
    if (req.user.uid !== userId) {
      return res.status(403).send({ message: "Unauthorized to update this timetable." });
    }

    const timetableRef = db.collection('timetables').doc(timetableId);
    await timetableRef.update({
      data: {
        timetable: timetableData,
        inputDetails: {
          availability: availability,
          startDate: startDate,
          studyTime: studyTime
        }
      },
      updatedAt: new Date()
    });

    const updatedDoc = await timetableRef.get();
    res.status(200).send({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error("Error updating timetable:", error);
    res.status(500).send({ message: "Failed to update timetable", error: error.message });
  }
};


// Route handler for uploading a syllabus PDF
const uploadSyllabusPdf = async (req, res) => {
  try {
    console.log('Received PDF upload request.');
    console.log('req.file:', req.file); // Log the file object
    console.log('req.body:', req.body); // Log the body object

    if (!req.file || req.file.mimetype !== 'application/pdf') {
      console.log('Validation failed: No PDF file or incorrect mimetype.');
      return res.status(400).send({ message: "No PDF file uploaded or invalid file type." });
    }

    const { userId, availability, startDate, studyTime } = req.body;
    const idToken = req.headers.authorization.split(' ')[1]; // Get ID token from authenticated request

    if (!userId || !availability || !startDate || !studyTime) {
      return res.status(400).send({ message: "userId, availability, startDate, and studyTime are required in the request body." });
    }

    // Forward the PDF buffer (base64 encoded) to the AI agent
    const aiAgentResponse = await forwardPdfToAIAgent(
      userId,
      req.file.buffer,
      availability,
      startDate,
      studyTime,
      idToken
    );

    // Save the AI agent's generated timetable to Firestore
    const savedTimetable = await createTimetable(
      userId,
      aiAgentResponse.timetable,
      availability,
      startDate,
      studyTime
    );

    res.status(200).send({
      message: "PDF processed by AI agent and timetable saved successfully",
      timetable: savedTimetable.data.timetable, // Return the actual timetable data
      timetableId: savedTimetable.id
    });

  } catch (error) {
    console.error("Error uploading syllabus PDF:", error);
    res.status(500).send({ message: "Failed to process PDF", error: error.message });
  }
};

// New route handler for text-based timetable generation
const generateTimetableFromText = async (req, res) => {
  try {
    const { userId, rawData, availability, startDate, studyTime } = req.body;
    const idToken = req.headers.authorization.split(' ')[1];

    if (!userId || !rawData || !availability || !startDate || !studyTime) {
      return res.status(400).send({ message: "userId, rawData, availability, startDate, and studyTime are required." });
    }

    // Call AI agent for text-based generation
    const aiAgentResponse = await fetch(`${process.env.AI_AGENT_BASE_URL || "http://localhost:8000"}/schedule/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        userId,
        rawData,
        availability,
        startDate,
        studyTime,
      }),
    });

    if (!aiAgentResponse.ok) {
      const errorData = await aiAgentResponse.json();
      throw new Error(`AI Agent Text Gen Error: ${errorData.detail || aiAgentResponse.statusText}`);
    }
    const aiTimetable = await aiAgentResponse.json();

    // Save the AI agent's generated timetable to Firestore
    const savedTimetable = await createTimetable(
      userId,
      aiTimetable.timetable,
      availability,
      startDate,
      studyTime
    );

    res.status(200).send({
      message: "Timetable generated and saved successfully",
      timetable: savedTimetable.data.timetable, // Return the actual timetable data
      timetableId: savedTimetable.id
    });

  } catch (error) {
    console.error("Error generating timetable from text:", error);
    res.status(500).send({ message: "Failed to generate timetable from text", error: error.message });
  }
};


async function forwardPdfToAIAgent(userId, pdfBuffer, availability, startDate, studyTime, idToken) {
  try {
    const aiAgentBaseUrl = process.env.AI_AGENT_BASE_URL || "http://localhost:8000";
    const response = await fetch(`${aiAgentBaseUrl}/schedule/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        userId: userId,
        pdfContent: pdfBuffer.toString('base64'), // Send PDF as base64 string
        availability: availability,
        startDate: startDate,
        studyTime: studyTime,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI Agent Error: ${errorData.detail || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error forwarding PDF to AI agent:", error);
    throw error;
  }
}

export {
  createTimetable as _createTimetable, // Export internally, not as a route handler
  getTimetable,
  updateTimetable, // New export
  uploadSyllabusPdf,
  generateTimetableFromText,
};
