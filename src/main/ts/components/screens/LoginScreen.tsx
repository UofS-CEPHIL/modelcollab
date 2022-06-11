import React, { FC, useEffect } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"
import firebaseApp from '../../firebase';

const LoginScreen: FC<any> = () => {

    useEffect(() => { document.title = "ModelCollab" }, []);

    const onClickLoginButton = () => {
        const authProvider = new GoogleAuthProvider();
        const auth = getAuth(firebaseApp);
        signInWithPopup(auth, authProvider)
            .then(() => {
                console.log("Successfully logged in.");
            })
            .catch((error) => {
                console.error(error);
                alert("Error signing in");
            });
    };

    return (
        <div>
            <button onClick={onClickLoginButton} id="login-button">
                Sign in with Google
            </button>
        </div>
    )
}

export default LoginScreen;
