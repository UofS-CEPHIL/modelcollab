import { FC, useEffect } from 'react';

import FirebaseManager from 'database/build/FirebaseManager';

interface Props {
    firebaseManager: FirebaseManager;
};

const LoginScreen: FC<any> = (props: Props) => {

    useEffect(() => { document.title = "ModelCollab" }, []);

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