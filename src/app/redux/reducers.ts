import dayjs from 'dayjs';
import { Action, ActionType } from './models/model';

const initialState = {
    userData: null,
    statusSettings: null,
    stateSettings: null,
    locationSettings: null,
    flowerSettings: null,
    storeSettings: null,
    pdfSettings: null,
    rollerSettings: null,
    chosenStatus: "",
    chosenLocation: "",
    chosenDate: sessionStorage.getItem('date') !== null ? sessionStorage.getItem('date') : dayjs().toString(),
    chosenMode: 'light',
    updatePacket: { _id: null, date: null },
    searchWord: { type: '', search: '' },
    personalSettings: null,
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
        case ActionType.FlowerSettings:
            return { ...state, flowerSettings: action.payload };
        case ActionType.StoreSettings:
            return { ...state, storeSettings: action.payload };
        case ActionType.PDFSettings:
            return { ...state, pdfSettings: action.payload };
        case ActionType.RollerSettings:
            return { ...state, rollerSettings: action.payload };
        case ActionType.ChosenStatus:
            return { ...state, chosenStatus: action.payload };
        case ActionType.ChosenLocation:
            return { ...state, chosenLocation: action.payload };
        case ActionType.ChosenDate:
            return { ...state, chosenDate: action.payload };
        case ActionType.ChosenMode:
            return { ...state, chosenMode: action.payload };
        case ActionType.UpdatePacket:
            return { ...state, updatePacket: action.payload };
        case ActionType.SearchWord:
            return { ...state, searchWord: action.payload };
        case ActionType.PersonalSettings:
            return { ...state, personalSettings: action.payload };
        default:
            return state;
    }
}

export default dataReducer;