# ConnectSphere - Real-time Chat Application (Frontend)

This is the frontend for ConnectSphere, a real-time chat application built with React, Socket.IO, and Supabase.

## Features

*   **User Authentication:** Secure signup, login, and logout functionality using Supabase Auth.
*   **Real-time Messaging:** Instantaneous message delivery within chat rooms using Socket.IO.
*   **Room Management:**
    *   Users can create new chat rooms.
    *   Dashboard with "My Rooms" and "Discover Rooms" tabs.
    *   Users can request to join rooms.
    *   Room creators/admins can manage join requests (approve/deny).
    *   Room creators can delete rooms they created.
*   **File Sharing:** Users can upload and share images and videos within chat rooms, leveraging Supabase Storage.
*   **User Profiles:** Basic user profiles with avatars based on gender selection during signup.
*   **Admin Panels:** In-room panels for admins to view members and manage pending join requests.
*   **Responsive UI:** Styled for a good experience across devices.
*   **Theming:** Light and Dark mode support, with theme preference saved in local storage.

## Tech Stack

*   **React:** JavaScript library for building user interfaces.
*   **React Router:** For client-side routing.
*   **Socket.IO Client:** For real-time, bidirectional event-based communication.
*   **Supabase Client JS:** To interact with Supabase for authentication, database operations, and storage.
*   **`react-icons`:** For UI icons.
*   **CSS:** Custom styling with CSS variables for theming.

## Project Structure (Key Frontend Directories/Files)

*   `public/`: Static assets.
    *   `index.html`: Main HTML shell.
    *   `manifest.json`: Web app manifest.
*   `src/`: Main application source code.
    *   `App.jsx`: Main application component with routing.
    *   `index.js`: Entry point of the React application.
    *   `index.css`: Global styles and CSS variables for theming.
    *   `App.css`: App-specific global styles.
    *   `supabaseClient.js`: Supabase client initialization.
    *   `components/`: Reusable UI components (e.g., `Navbar.jsx`, `Footer.jsx`).
    *   `pages/`: Top-level page components (e.g., `Login.jsx`, `Signup.jsx`, `Dashboard.jsx`, `RoomChat.jsx`).
    *   `context/`: React context for global state management (e.g., `AuthContext.jsx`).

## Setup and Running Locally

1.  **Prerequisites:**
    *   Node.js and npm (or yarn) installed.
    *   A Supabase project set up with the required database schema, RLS policies, storage bucket (`message-files`), and SQL functions.
    *   The backend server for this project running.

2.  **Clone the Repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-folder>/frontend
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the `frontend` directory with the following variables:
    ```env
    REACT_APP_SUPABASE_URL=your_supabase_project_url
    REACT_APP_SUPABASE_KEY=your_supabase_anon_key
    REACT_APP_BACKEND_URL=http://localhost:3001 # Or your backend server URL
    ```
    Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase project credentials.

5.  **Start the Development Server:**
    ```bash
    npm start
    # or
    # yarn start
    ```
    The application should now be running, typically at `http://localhost:3000`.

## Backend

This frontend requires the corresponding [ConnectSphere Backend](<link-to-your-backend-repo-if-separate>) to be running. Ensure the backend's `.env` file is also configured with its Supabase URL and `service_role` key, and the correct `FRONTEND_URL`.

## Contributing

Please refer to the main project repository for contribution guidelines.

---

*This README was generated as part of the ConnectSphere development process.*
