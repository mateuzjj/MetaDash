// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB8btFsnoyDE4vsxikugs8AxabAXEt6Dbw",
    authDomain: "saas-dash-e84ae.firebaseapp.com",
    projectId: "saas-dash-e84ae",
    storageBucket: "saas-dash-e84ae.firebasestorage.app",
    messagingSenderId: "535554031195",
    appId: "1:535554031195:web:6cd8ddc02efb86b17a897e",
    measurementId: "G-NLZCL4LRHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
