import { faBan, faMagnifyingGlass, faPencil, faQuestion, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Autocomplete, CircularProgress, FormControl, FormControlLabel, IconButton, Radio, RadioGroup, Stack, TextField, Chip, Fade, Paper, Grid, Divider, Typography, Tooltip } from "@mui/material";
import { Component, Fragment, ReactElement } from "react";
import FirebaseDataModel, { UserPermissionInfo, UserPermissionInfoList, UsersList } from "../../data/FirebaseDataModel";
import { Permission, Visibility } from "../../data/RTDBSchema";
import { theme } from "../../Themes";
import ButtonBox from "./ButtonBox";
import ConfirmIconButton from "./ConfirmIconButton";

export interface Props {
    width?: number;
    onClose: () => void;
    firebaseDataModel: FirebaseDataModel;
    modelUuid: string;
}

export interface State {
    unsubscribe?: () => void;
    visibility?: Visibility;
    isUserSearchOpen: boolean;
    isLoadingUsers: boolean;
    userSearchText: string;
    loadedUsers: UsersList;
    sharedWith: UserPermissionInfoList;
}

export default class ModelPermissionsBox extends Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            isUserSearchOpen: false,
            isLoadingUsers: false,
            userSearchText: "",
            loadedUsers: {},
            sharedWith: {},
        };
    }

    public componentDidMount(): void {
        if (!this.state.unsubscribe) {
            const unsubVisibility = this.props.firebaseDataModel
                .subscribeToModelVisibility(
                    this.props.modelUuid,
                    v => this.setState({ visibility: v ?? undefined })
                );
            const unsubSharedWith = this.props.firebaseDataModel
                .subscribeToModelSharedUsers(
                    this.props.modelUuid,
                    sharedWith => this.setState({ sharedWith })
                );
            const unsubscribe = () => {
                unsubVisibility();
                unsubSharedWith();
            }
            this.setState({ unsubscribe });
        }
    }

    public componentWillUnmount(): void {
        if (this.state.unsubscribe) {
            this.state.unsubscribe();
            this.setState({ unsubscribe: undefined });
        }
    }

    public render(): ReactElement {
        return (
            <ButtonBox
                width={this.props.width}
                buttons={[
                    {
                        label: "Close",
                        callback: () => this.props.onClose(),
                    }
                ]}
            >
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Divider textAlign="left">
                            <Typography color={theme.palette.text.secondary}>
                                Share With Users
                            </Typography>
                        </Divider>
                        {this.makeUserSearchBar()}
                    </Grid>
                    <Grid item>
                        {this.makeSharedUserList()}
                    </Grid>
                    <Grid item>
                        <Divider textAlign="left">
                            <Typography color={theme.palette.text.secondary}>
                                Global Visibility
                            </Typography>
                        </Divider>
                        {this.makeVisibilityRadioButtons()}
                    </Grid>
                </Grid>
            </ButtonBox >

        );
    }

    private makeUserSearchBar(): ReactElement {
        const onSelect = (_: any, selectedUid: string | null) => {
            if (
                selectedUid
                && !Object.keys(this.state.sharedWith).includes(selectedUid)
            ) {
                this.props.firebaseDataModel.shareWithUser(
                    this.props.modelUuid,
                    selectedUid,
                    Permission.READWRITE
                );
                this.setState({ userSearchText: "" });
            }
        }

        return (
            <Autocomplete
                fullWidth
                open={this.state.isUserSearchOpen && !this.state.isLoadingUsers}
                onOpen={() => this.setState({ isUserSearchOpen: true })}
                onClose={() => this.setState({ isUserSearchOpen: false })}
                loading={this.state.isLoadingUsers}
                options={
                    Object.keys(
                        this.state.loadedUsers
                    ).filter(k => !this.state.sharedWith[k])
                }
                getOptionLabel={opt => this.state.loadedUsers[opt].name}
                onChange={onSelect}
                noOptionsText="No matches. Try searching again!"
                renderInput={params => (
                    <TextField
                        {...params}
                        label="Find Users"
                        value={this.state.userSearchText}
                        onChange={e => this.setState({
                            userSearchText: e.target.value
                        })}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: this.makeUserSearchEndAdornment(
                                params
                            ),
                        }}
                    />
                )}
            />
        );
    }

    private makeUserSearchEndAdornment(params: any): ReactElement {
        let customEnd: ReactElement | undefined;

        if (this.state.isLoadingUsers) {
            customEnd = (
                <CircularProgress
                    color="inherit"
                    size={20}
                />
            );
        }
        else {
            const onClick = () => {
                this.setState({ isLoadingUsers: true });
                this.props.firebaseDataModel.searchUsers(
                    this.state.userSearchText,
                    false
                ).then(users =>
                    this.setState({
                        isLoadingUsers: false,
                        userSearchText: "",
                        loadedUsers: users,
                    })
                ).catch(e =>
                    this.setState(
                        { isLoadingUsers: false },
                        () => alert(e)
                    )
                );
            }
            customEnd = (
                <IconButton
                    onClick={onClick}
                    color="primary"
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </IconButton>
            );
        }

        return (
            <Fragment>
                {customEnd}
                {params.InputProps.endAdornment}
            </Fragment>
        );
    }

    private makeSharedUserList(): ReactElement {
        return (
            <div style={{ maxHeight: "200px", overflow: "auto" }}>
                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                >
                    {
                        Object.entries(
                            this.state.sharedWith
                        ).map(([uid, data]) =>
                            this.makeSharedUserItem(uid, data)
                        )
                    }
                </Stack>
            </div>
        );
    }

    private makeSharedUserItem(
        uid: string,
        data: UserPermissionInfo
    ): ReactElement {
        // TODO make these things scrollable

        const canWrite = data.permission === Permission.READWRITE;

        function makePermissionIcon(): ReactElement {
            return (
                <Fragment>
                    <FontAwesomeIcon
                        icon={faPencil}
                        style={{
                            color: canWrite
                                ? theme.palette.primary.main
                                : undefined
                        }}
                    />
                    {
                        !canWrite &&
                        <FontAwesomeIcon
                            style={{
                                position: "absolute",
                                color: theme.palette.error.main
                            }}
                            icon={faBan}
                        />
                    }
                </Fragment>
            );
        }

        function makeDeleteIcon(): ReactElement {
            return (
                <FontAwesomeIcon icon={faTrash} />
            );
        }

        const makeIcon = () => {
            const nextPermission = data.permission === Permission.READ
                ? Permission.READWRITE
                : Permission.READ;

            return (
                <Fragment>
                    <ConfirmIconButton
                        size="small"
                        sx={{ marginLeft: 1 }}
                        onClick={() =>
                            this.props.firebaseDataModel.stopSharingWithUser(
                                this.props.modelUuid,
                                uid
                            )
                        }
                    >
                        {makeDeleteIcon()}
                    </ConfirmIconButton>
                    <IconButton
                        size="small"
                        onClick={() =>
                            this.props.firebaseDataModel.shareWithUser(
                                this.props.modelUuid,
                                uid,
                                nextPermission
                            )
                        }
                    >
                        {makePermissionIcon()}
                    </IconButton>
                </Fragment >
            );
        }

        const rw = canWrite ? "see and edit" : "only see";
        const rwTooltipText = `${data.name} (${data.email}) can ${rw} this model`;

        return (
            <Tooltip title={rwTooltipText} key={uid}>
                <Chip
                    label={data.name}
                    deleteIcon={
                        < FontAwesomeIcon icon={faTrash} size="xs" />
                    }
                    icon={makeIcon()}
                />
            </Tooltip>
        );
    }

    private makeVisibilityRadioButtons(): ReactElement {
        return (
            <FormControl>
                <RadioGroup
                    value={this.state.visibility}
                    onChange={e =>
                        this.props.firebaseDataModel
                            .setModelVisibility(
                                this.props.modelUuid,
                                e.target.value as Visibility
                            )
                    }
                    row
                >
                    <Tooltip
                        title="Only people listed above can see this model"
                    >
                        <FormControlLabel
                            value={Visibility.PRIVATE}
                            control={<Radio />}
                            label="Private"
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            "Everyone can see this model, but only "
                            + " people listed above can edit it"
                        }
                    >
                        <FormControlLabel
                            value={Visibility.READONLY}
                            control={<Radio />}
                            label="Public (read-only)"
                        />
                    </Tooltip>
                    <Tooltip
                        title="Everyone can see and edit this model"
                    >
                        <FormControlLabel
                            value={Visibility.PUBLIC}
                            control={<Radio />}
                            label="Public"
                        />
                    </Tooltip>
                </RadioGroup>
            </FormControl>
        );
    }

}
