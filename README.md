# AI Study Planner

**AI Study Planner** is a comprehensive web application designed to help students organize their academic lives. It leverages Artificial Intelligence to analyze syllabus documents (PDFs) and automatically generate personalized, optimized study timetables.

The project is built using a modern microservices architecture, consisting of a **React Frontend**, a **Node.js/Express Backend**, and a **Python-based AI Agent** for intelligent processing.

---

## 🚀 Features

* **Intelligent Syllabus Parsing**: Upload course syllabus PDFs. The AI agent extracts key topics, estimates study duration, and structures the data.
* **Automated Timetable Generation**: Specific algorithms create a balanced study schedule based on your syllabus and availability.
* **Interactive Dashboard**: A user-friendly interface to view, manage, and track your study progress.
* **Subject Management**: Organize subjects and track completion status.
* **Secure Authentication**: User login and registration powered by Firebase/Supabase.
* **Responsive Design**: Built with Tailwind CSS and Shadcn UI for a seamless experience on desktop and mobile.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework**: React (Vite) with TypeScript
* **UI Library**: [shadcn/ui](https://ui.shadcn.com/), Tailwind CSS
* **State Management**: Zustand, React Query (@tanstack/react-query)
* **Routing**: React Router DOM
* **HTTP Client**: Axios
* **Icons**: Lucide React

### **Backend (API)**
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database/Auth**: Firebase Admin SDK
* **File Handling**: Multer

### **AI Agent (Service)**
* **Framework**: FastAPI (Python)
* **Vector Database**: Pinecone
* **NLP & ML**:
    * Transformers (Hugging Face)
    * Sentence-Transformers
    * Spacy
    * Scikit-learn
* **PDF Processing**: PyPDF2, pdfminer.six, PyMuPDF (fitz)
* **Data Processing**: Pandas, NumPy

---

## 📂 Project Structure

```bash
AI-Study-Planner/
├── AI-agent/           # Python FastAPI service for parsing and scheduling
│   ├── src/
│   │   ├── pdf/        # PDF extraction logic
│   │   ├── preprocessing/ # Embeddings and text cleaning
│   │   ├── schedule/   # Timetable generation algorithms
│   │   ├── vectorstore/# Pinecone integration
│   │   └── main.py     # Entry point
│   ├── notebooks/      # Experimentation notebooks
│   └── requirements.txt
│
├── Backend/            # Node.js Express server
│   ├── config/         # Firebase configuration
│   ├── controllers/    # API controllers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   └── app.js          # Entry point
│
└── Frontend/           # React application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Application pages (Dashboard, Timetable, etc.)
    │   ├── store/      # Zustand state stores
    │   └── lib/        # Utilities
    └── package.json
⚡ Getting Started
Follow these instructions to set up the project locally.

Prerequisites
Node.js (v18+ recommended)

Python (3.9+)

Pinecone API Key (for Vector DB)

Firebase/Supabase Project Credentials

1. Setup the AI Agent
The AI agent handles the heavy lifting of PDF parsing and schedule generation.

Bash

cd AI-agent

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download Spacy model
python -m spacy download en_core_web_sm

# Setup Environment Variables
# Create a .env file in AI-agent/ and add:
# PINECONE_API_KEY=your_key
# PINECONE_ENV=your_env
To run the AI Agent:

Bash

uvicorn src.main:app --reload
# The agent will run on http://localhost:8000 (default)
2. Setup the Backend
The Node.js backend manages user data and communicates with the frontend.

Bash

cd Backend

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file in Backend/ and add your Firebase credentials
# PORT=5000
To run the Backend:

Bash

npm start
# The server will run on http://localhost:5000 (default)
3. Setup the Frontend
The client-side interface for users.

Bash

cd Frontend

# Install dependencies
npm install
# OR if using bun
bun install

# Setup Environment Variables
# Create a .env file in Frontend/ if needed for API endpoints
# VITE_API_URL=http://localhost:5000
To run the Frontend:

Bash

npm run dev
# The app will be available at http://localhost:5173
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.

Create a new branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.
