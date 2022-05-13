import { initializeApp } from "firebase/app";
import firebaseConfig from "./config/firebaseConfig";

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
