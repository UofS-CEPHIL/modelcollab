import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { FirebaseComponentModel as schema } from "database/build/export";

import LoginScreen from "./components/Screens/LoginScreen";
import CanvasScreen from "./components/maxgraph/CanvasScreen";
import FirebaseManagerImpl from "./data/FirebaseManagerImpl";
import CanvasScreenToolbar, { Props as ToolbarProps } from './components/Toolbar/CanvasScreenToolbar';
import ImportModelBox from './components/ImportModelBox/ImportModelBox';
import { Props as ImportModelBoxProps } from './components/ButtonListBox/ButtonListBox';
import ScenariosBox, { Props as ScenariosBoxProps } from "./components/ScenariosBox/ScenariosBox";
import SaveModelBox, { Props as SaveModelBoxProps } from "./components/SaveModelBox/SaveModelBox";
import FirebaseDataModelImpl from "./data/FirebaseDataModelImpl";

const firebaseManager = new FirebaseManagerImpl();

interface Props {

}

interface State {
    isSignedIn: boolean;
    currentSession: string | null;
}

export default class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { isSignedIn: false, currentSession: null };

        firebaseManager.registerAuthChangedCallback(
            isSignedIn => this.setState({ isSignedIn })
        );
    }

    render(): ReactElement {
        if (!this.state.isSignedIn) {
            return (
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={<LoginScreen firebaseManager={firebaseManager} />}
                        />
                    </Routes>
                </Router>
            );
        }
        // else if (!this.state.currentSession) {
        //     return (<Router>
        //         <Routes>
        //             <Route
        //                 path="/"
        //                 element={<SessionSelectScreen
        //                     firebaseData={new FirebaseDataModelImpl(firebaseManager)}
        //                     openSession={s => this.setState({ ...this.state, currentSession: s })}
        //                 />}
        //             />
        //         </Routes>
        //     </Router>
        //     );
        // }
        else {
            return (
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <CanvasScreen
                                    firebaseDataModel={new FirebaseDataModelImpl(firebaseManager)}
                                    sessionId={"NULL"}
                                />
                            }
                        />
                    </Routes>
                </Router>
            );
        }
    }

    private createScenariosBox(props: ScenariosBoxProps): ReactElement {
        return (<ScenariosBox {...props} />);
    }

    private createImportModelBox(props: ImportModelBoxProps): ReactElement {
        return (
            <ImportModelBox {...props} />
        );
    }

    private createSaveModelBox(props: SaveModelBoxProps): ReactElement {
        return (
            <SaveModelBox {...props} />
        );
    }

    private createToolbar(props: ToolbarProps): ReactElement {
        return (
            <CanvasScreenToolbar {...props} />
        );
    }
}
