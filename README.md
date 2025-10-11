# Fullstack Task Manager (MERN)



# Overview
The Cloud-Based Task Manager is a web application designed to streamline team task management. Built using the MERN stack (MongoDB, Express.js, React, and Node.js), this platform provides a user-friendly interface for efficient task assignment, tracking, and collaboration. The application caters to administrators and regular users, offering comprehensive features to enhance productivity and organization.



### Why/Problem?
In a dynamic work environment, effective task management is crucial for team success. Traditional methods of task tracking through spreadsheets or manual systems can be cumbersome and prone to errors. The Cloud-Based Task Manager aims to address these challenges by providing a centralized platform for task management, enabling seamless collaboration and improved workflow efficiency.



### **Background**:
With the rise of remote work and dispersed teams, there is a growing need for tools that facilitate effective communication and task coordination. The Cloud-Based Task Manager addresses this need by leveraging modern web technologies to create an intuitive and responsive task management solution. The MERN stack ensures scalability, while the integration of Redux Toolkit, Headless UI, and Tailwind CSS enhances user experience and performance.


### 
## **Key Features:**

### **Task Management:**
1. **Modern CRM-Style Interface:**
    - Professional task table with sorting, filtering, and pagination
    - Advanced filters: Today's Tasks, Ongoing, Overdue, Scheduled, Complete, Group Tasks, Review, Trashed
    - Real-time search functionality
    - Status indicators with colored dots (Green=Complete, Orange=Ongoing, Red=Overdue)

2. **Task Creation & Assignment:**
    - Any authenticated user can create and assign tasks
    - Assign tasks to existing users only (database validation)
    - Support for individual and group task assignments
    - Priority levels: High, Medium, Low with color-coded badges
    - Task stages: Todo, In Progress, Completed

3. **Task Properties:**
    - Due date tracking with overdue detection
    - File attachments and links support
    - Task descriptions and sub-tasks
    - Activity tracking and comments

### **User Management:**
1. **Authentication System:**
    - User registration with validation
    - Secure login with JWT tokens
    - Password hashing with bcrypt

2. **User Roles:**
    - Admin and regular user roles
    - Role-based access control for certain features
    - User profile management

### **Enhanced UI/UX:**
1. **Responsive Design:**
    - Mobile-friendly interface
    - Tailwind CSS styling
    - Loading states and error handling

2. **Interactive Components:**
    - Modal-based task creation
    - Dropdown user selection
    - Real-time task list updates


## **General Features:**
1. **Authentication and Authorization:**
    - User login with secure authentication.
    - Role-based access control.

2. **Profile Management:**
    - Update user profiles.

3. **Password Management:**
    - Change passwords securely.

4. **Dashboard:**
    - Provide a summary of user activities.
    - Filter tasks into todo, in progress, or completed.




## **Technologies Used:**
- **Frontend:**
    - React (Vite) - Modern React development
    - Redux Toolkit - State management and API calls
    - Headless UI - Accessible UI components
    - Tailwind CSS - Utility-first styling
    - React Icons - Icon library
    - React Hook Form - Form handling

- **Backend:**
    - Node.js with Express.js - Server runtime and framework
    - JWT - Authentication tokens
    - bcryptjs - Password hashing
    - Mongoose - MongoDB object modeling
    - Express Async Handler - Error handling
    
- **Database:**
    - MongoDB - Document-based data storage
    - User and Task collections with relationships


The Cloud-Based Task Manager is an innovative solution that brings efficiency and organization to task management within teams. By harnessing the power of the MERN stack and modern frontend technologies, the platform provides a seamless experience for both administrators and users, fostering collaboration and productivity.

&nbsp;

## SETUP INSTRUCTIONS


# Server Setup

## Environment variables
First, create the environment variables file `.env` in the server folder. The `.env` file contains the following environment variables:

- MONGODB_URI = `mongodb://localhost:27017/taskme` (for local MongoDB)
- JWT_SECRET = `any secret key - must be secured`
- PORT = `8800` or any port number
- NODE_ENV = `development`


&nbsp;

## Set Up MongoDB:

1. Setting up MongoDB involves a few steps:
    - Visit MongoDB Atlas Website
        - Go to the MongoDB Atlas website: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).

    - Create an Account
    - Log in to your MongoDB Atlas account.
    - Create a New Cluster
    - Choose a Cloud Provider and Region
    - Configure Cluster Settings
    - Create Cluster
    - Wait for Cluster to Deploy
    - Create Database User
    - Set Up IP Whitelist
    - Connect to Cluster
    - Configure Your Application
    - Test the Connection

2. Create a new database and configure the `.env` file with the MongoDB connection URL. 

## Steps to run server

1. Open the project in any editor of choice.
2. Navigate into the server directory `cd server`.
3. Run `npm i` or `npm install` to install the packages.
4. Ensure MongoDB is running locally on port 27017.
5. Run `npm start` to start the server.
6. (Optional) Create test users by registering through the frontend.

If configured correctly, you should see a message indicating that the server is running successfully and `Database Connected`.

## Default Login Credentials
After registration, you can use any registered user credentials. Example:
- **Email:** admin@taskme.com
- **Password:** password123

&nbsp;

# Client Side Setup

## Environment variables
First, create the environment variables file `.env` in the client folder. The `.env` file contains the following environment variables:

- VITE_APP_BASE_URL = `http://localhost:8800` #Note: Change the port 8800 to your port number.
- VITE_APP_FIREBASE_API_KEY = `Firebase api key`

## Steps to run client

1. Navigate into the client directory `cd client`.
2. Run `npm i` or `npm install` to install the packages.
3. Run `npm run dev` to run the app on `http://localhost:3000`.
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Application Usage

1. **Registration:** Create a new account at `/register`
2. **Login:** Sign in at `/log-in` with your credentials
3. **Tasks Page:** Navigate to `/tasks` to view the modern task management interface
4. **Create Tasks:** Click "Create Task" button to assign tasks to registered users
5. **Filter & Search:** Use the filter dropdown and search bar to find specific tasks
6. **Task Management:** View, sort, and manage tasks in the professional table interface



&nbsp;

