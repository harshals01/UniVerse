# UniVerse

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)

<img width="1915" height="862" alt="image" src="https://github.com/user-attachments/assets/7e912bfd-0a5e-4618-9e50-66af99240c37" />


**UniVerse** is a modular, full-stack platform designed to connect students and streamline campus life. Featuring a newly enhanced, responsive modern UI and significant backend performance improvements, UniVerse consolidates essential tools into one cohesive application. It brings a safer, smarter, and more engaging digital experience to university environments.

## 🌟 Features

UniVerse solves modern campus friction by providing these key integrated features:

*   **Secure User Authentication**: Robust JWT authentication combined with encrypted data storage for secure, localized access.
*   **Responsive Modern UI**: A beautiful, glassmorphism-inspired aesthetic with dark mode and smooth animations for a seamless user experience.
*   **Dashboard & User Management**: Comprehensive profile and listing management allowing students to easily track their marketplace and lost & found activities.
*   **API Integration**: Dynamic and modular full-stack architecture with reliable API endpoints handling requests efficiently.
*   **Lost & Found System**: A centralized hub to report missing items or list found belongings, drastically improving the chances of recovering lost property on campus.
*   **Student Marketplace**: A secure, peer-to-peer marketplace where students can buy, sell, or trade textbooks, electronics, and dorm essentials with trusted classmates.
*   **AI-Powered Notes Module**: Work smarter, not harder. Upload, organize, and analyze lecture notes using built-in Groq and Gemini AI capabilities to instantly generate summaries and smart study guides.
*   **File Uploads & Media Support**: Integrated handling for uploading images of items and documents securely.
*   **Performance Improvements**: Optimized database queries and caching mechanisms for lightning-fast page loads and API responses.


## 🚀 Getting Started

Follow these steps to get a local development environment up and running.

### Prerequisites

Ensure you have the following installed to run UniVerse locally:
*   [Node.js](https://nodejs.org/en/) (v16.14.0 or higher recommended)
*   [npm](https://www.npmjs.com/) (v8+)
*   A running [MongoDB](https://www.mongodb.com/try/download/community) instance or a MongoDB Atlas URI

### 1. Clone the repository

```bash
git clone https://github.com/your-username/universe.git
cd universe
```

### 2. Backend Setup

The backend utilizes Express.js, MongoDB, and Mongoose.

```bash
cd backend

# Install dependencies
npm install
```

Create a `.env` file in the `backend/` directory by copying the example or using these parameters:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend server should now be running on `http://localhost:5000`.

### 3. Frontend Setup

The frontend is built with React and Vite for a lightning-fast development experience.

Open a new terminal session, then navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env` file in the `frontend/` directory pointing to the local API:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The UI should now be accessible at `http://localhost:5173`.

### 💡 Usage Example

Once both servers are running:
1. Navigate to `http://localhost:5173`.
2. Register a new student account.
3. Access the **Marketplace** to post an old textbook.
4. Try out the **Notes** module by writing a brief text or uploading a standard markdown note to generate simple AI summaries.


## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
