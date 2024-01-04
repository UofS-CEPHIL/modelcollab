import { Button, Typography } from '@mui/material';
import React, { Fragment, ReactElement } from 'react';

import FirebaseManager from "../../data/FirebaseManager";

interface Props {
    firebaseManager: FirebaseManager;
};

export default class LoginScreen extends React.Component<Props> {
    public render(): ReactElement {
        return (
            <Fragment>
                <Typography variant="h3">
                    Welcome to ModelCollab!
                </Typography>
                <Typography sx={{ maxWidth: "800px" }}>
                    ModelCollab is a brand new application for system dynamics
                    modelling with an innovative collaborative user interface for
                    group modelling over the web. This application is still under
                    construction and may still have bugs and/or lack features.
                    To request a feature, report a bug, or for more information,
                    see our&nbsp;
                    <a href="https://github.com/UofS-CEPHIL/modelcollab">
                        Github page
                    </a>.
                    All authentication is handled through Google:
                    click the button below to log in!
                </Typography>

                <Button
                    onClick={() => this.props.firebaseManager.login()}
                    variant="contained"
                    id="login-button"
                >
                    Sign in with Google
                </Button>
            </Fragment>
        );
    }

}
