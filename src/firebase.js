// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
//begin
// Import the functions you need from the SDKs you need
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE9eCLPdpODohfXoV9yP59ackTn-sTVzg",
  authDomain: "my-vue-user-app.firebaseapp.com",
  projectId: "my-vue-user-app",
  storageBucket: "my-vue-user-app.firebasestorage.app",
  messagingSenderId: "735558060501",
  appId: "1:735558060501:web:f3dbab89ce29d89720155c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//end


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
