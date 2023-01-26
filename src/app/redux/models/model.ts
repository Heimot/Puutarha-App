export enum ActionType {
    UserData = "SET_USER_DATA",
    StatusSettings = "SET_STATUS_SETTINGS",
    StateSettings = "SET_STATE_SETTINGS",
    LocationSettings = "SET_LOCATION_SETTINGS",
    FlowerSettings = "SET_FLOWER_SETTINGS",
    StoreSettings = "SET_STORE_SETTINGS",
    PDFSettings = "SET_PDF_SETTINGS",
    ChosenStatus = "SET_CHOSEN_STATUS",
    ChosenLocation = "SET_CHOSEN_LOCATION",
    ChosenDate = "SET_CHOSEN_DATE",
    ChosenMode = "SET_CHOSEN_MODE",
    UpdatePacket = "SET_UPDATE_PACKET"
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

interface FlowerSettingsAction {
    type: ActionType.FlowerSettings;
    payload?: any;
}

interface StoreSettingsAction {
    type: ActionType.StoreSettings;
    payload?: any;
}


interface PDFSettingsAction {
    type: ActionType.PDFSettings;
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

export type Action = UserDataAction | StatusSettingsAction | StateSettingsAction | LocationSettingsAction | FlowerSettingsAction | StoreSettingsAction | PDFSettingsAction | ChosenStatus | ChosenLocation | ChosenDate | ChosenMode | UpdatePacket;