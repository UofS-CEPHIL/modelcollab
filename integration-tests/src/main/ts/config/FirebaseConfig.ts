interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;

    useEmulators: boolean;
    emulatorHost: string;
    emulatorPort: number;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyAo3oO8Kx0EScVGsUmKBA4y6QEaqBAaZto",
    authDomain: "model-collab.firebaseapp.com",
    databaseURL: "https://model-collab-default-rtdb.firebaseio.com",
    projectId: "model-collab",
    storageBucket: "model-collab.appspot.com",
    messagingSenderId: "920735074076",
    appId: "1:920735074076:web:c767b1c5bfffda0f701cd9",

    useEmulators: true,
    emulatorHost: "127.0.0.1",
    emulatorPort: 9000
};

export default firebaseConfig;
