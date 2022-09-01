interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;

    useEmulators: boolean;
    emulatorHost: string;
    emulatorPort: number;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "G-LC8NJC38E9",

    useEmulators: true,
    emulatorHost: "127.0.0.1",
    emulatorPort: 9000
};

export default firebaseConfig;
