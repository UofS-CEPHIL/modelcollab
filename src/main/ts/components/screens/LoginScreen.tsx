import React, { FC, useEffect } from 'react';
import applicationConfig from '../../config/applicationConfig';
import FirebaseManager from '../../FirebaseManager';

interface Props {
    firebaseManager: FirebaseManager;
};

const LoginScreen: FC<any> = (props: Props) => {

    useEffect(() => { document.title = applicationConfig.appName }, []);

    const onClickLoginButton = () => {
        console.log(`fbm = ${props.firebaseManager}`)
        props.firebaseManager.login();
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
