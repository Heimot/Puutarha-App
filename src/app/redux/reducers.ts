import { Action, ActionType } from './models/model';

const initialState = {
    userData: null,
    statusSettings: null,
    stateSettings: null,
    locationSettings: null,
    pdfSettings: null,
    chosenStatus: "",
    chosenLocation: "",
    chosenDate: null
}

const dataReducer = (state: any = initialState, action: Action) => {
    switch (action.type) {
        case ActionType.UserData:
            return { ...state, userData: action.payload };
        case ActionType.StatusSettings:
            return { ...state, statusSettings: action.payload };
        case ActionType.StateSettings:
            return { ...state, stateSettings: action.payload };
        case ActionType.LocationSettings:
            return { ...state, locationSettings: action.payload };
        case ActionType.PDFSettings:
            return { ...state, pdfSettings: action.payload };
        case ActionType.ChosenStatus:
            return { ...state, chosenStatus: action.payload };
        case ActionType.ChosenLocation:
            return { ...state, chosenLocation: action.payload };
        case ActionType.ChosenDate:
            return { ...state, chosenDate: action.payload };
        default:
            return state;
    }
}

export default dataReducer;