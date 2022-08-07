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
    apiKey: "AIzaSyAwHYCU_Gnx9tFjjTxIXFwerHaPEw_Le5k",
    authDomain: "modelcollab.firebaseapp.com",
    databaseURL: "https://modelcollab-default-rtdb.firebaseio.com",
    projectId: "modelcollab",
    storageBucket: "modelcollab.appspot.com",
    messagingSenderId: "388145787482",
    appId: "1:388145787482:web:39438739d24000e034de63",
    measurementId: "G-LC8NJC38E9",

    useEmulators: false,
    emulatorHost: "127.0.0.1",
    emulatorPort: 9000
};

export default firebaseConfig;
