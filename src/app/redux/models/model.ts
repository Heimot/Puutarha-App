export enum ActionType {
    UserData = "SET_USER_DATA",
    StatusSettings = "SET_STATUS_SETTINGS",
    StateSettings = "SET_STATE_SETTINGS",
    LocationSettings = "SET_LOCATION_SETTINGS",
    PDFSettings = "SET_PDF_SETTINGS",
    RollerSettings = "SET_ROLLER_SETTINGS",
    ChosenStatus = "SET_CHOSEN_STATUS",
    ChosenLocation = "SET_CHOSEN_LOCATION",
    ChosenDate = "SET_CHOSEN_DATE",
    ChosenMode = "SET_CHOSEN_MODE",
    UpdatePacket = "SET_UPDATE_PACKET",
    SearchWord = "SET_SEARCH_WORD",
    PersonalSettings = "SET_PERSONAL_SETTINGS",
}

interface UserDataAction {
    type: ActionType.UserData;
    payload?: any;
}

interface StatusSettingsAction {
    type: ActionType.StatusSettings;
    payload?: any;
}

interface StateSettingsAction {
    type: ActionType.StateSettings;
    payload?: any;
}

interface LocationSettingsAction {
    type: ActionType.LocationSettings;
    payload?: any;
}

interface PDFSettingsAction {
    type: ActionType.PDFSettings;
    payload?: any;
}

interface RollerSettings {
    type: ActionType.RollerSettings;
    payload?: any;
}

interface ChosenStatus {
    type: ActionType.ChosenStatus;
    payload?: string;
}

interface ChosenLocation {
    type: ActionType.ChosenLocation;
    payload?: string;
}

interface ChosenDate {
    type: ActionType.ChosenDate;
    payload?: string;
}

interface ChosenMode {
    type: ActionType.ChosenMode;
    payload?: string;
}

interface UpdatePacket {
    type: ActionType.UpdatePacket;
    payload?: string;
}

interface SeachWord {
    type: ActionType.SearchWord,
    payload?: any;
}

interface PersonalSettings {
    type: ActionType.PersonalSettings,
    payload?: any;
}

export type Action = UserDataAction | StatusSettingsAction | StateSettingsAction | LocationSettingsAction |
    PDFSettingsAction | RollerSettings | ChosenStatus | ChosenLocation | ChosenDate | ChosenMode | UpdatePacket |
    SeachWord | PersonalSettings;