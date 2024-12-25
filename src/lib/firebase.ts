// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDownloadURL, getStorage, uploadBytesResumable, ref } from "firebase/storage"; // Added `ref` import
import { error } from "console";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjnZFEC-dDgI4q64DfcQgATHuL0j-i5lI",
  authDomain: "github-ai-93494.firebaseapp.com",
  projectId: "github-ai-93494",
  storageBucket: "github-ai-93494.firebasestorage.app",
  messagingSenderId: "506681505939",
  appId: "1:506681505939:web:ca0b3e53a12d6b6d4b3566",
  measurementId: "G-2DX0LC2NY3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

export async function uploadFile(
  file: File,
  setProgress?: (progress: number) => void
) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name); // `ref` is now imported correctly
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (setProgress) setProgress(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("upload is paused");
              break;
            case "running":
              console.log("upload is running");
              break;
          }
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
