# Firebase Setup Guide for Vue 3 User Registration App

## Overview
This Vue 3 application includes a user registration form that saves data to Firebase Firestore (NoSQL database). Follow these steps to set up Firebase for your project.

## Firebase Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "my-vue-user-app")
4. Follow the setup wizard (you can disable Google Analytics if not needed)

### 2. Create a Firestore Database
1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location close to your users
5. Click "Done"

### 3. Get Your Firebase Configuration
1. Go to Project Settings (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname (e.g., "my-vue-app")
5. Copy the Firebase configuration object

### 4. Update Firebase Configuration
1. Open `src/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 5. Firestore Security Rules (For Production)
When you're ready to deploy, update your Firestore rules for security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to users collection
    match /users/{document} {
      allow read, write: if true; // Update this for production security
    }
  }
}
```

## Running the Application

1. Make sure you've updated the Firebase configuration in `src/firebase.js`
2. Run the development server:
   ```bash
   npm run serve
   ```
3. Open your browser to `http://localhost:8080`

## Features

### User Registration Form
- **Name**: Required field with minimum 2 characters
- **Email**: Required field with email validation
- **Address**: Required field with minimum 10 characters
- **Phone**: Optional field

### Database Operations
- **Create**: Save new user data to Firestore
- **Read**: Display all saved users
- **Delete**: Remove users from the database
- **Validation**: Client-side form validation
- **Error Handling**: User-friendly error messages

### Data Structure
Each user document in Firestore contains:
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  address: "123 Main St, City, State 12345",
  phone: "+1234567890", // optional
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Troubleshooting

### Common Issues
1. **Firebase not configured**: Make sure you've replaced the placeholder values in `firebase.js`
2. **Permission denied**: Check your Firestore security rules
3. **Network errors**: Ensure you have internet connectivity

### Development Notes
- The app automatically loads existing users when it starts
- Form validation provides immediate feedback
- Success/error messages guide the user experience
- Responsive design works on mobile and desktop

## Next Steps
- Add user authentication
- Implement user editing functionality
- Add data export features
- Enhance security rules
- Add unit tests
