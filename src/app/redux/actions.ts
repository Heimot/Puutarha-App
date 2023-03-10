import { Dispatch } from "@reduxjs/toolkit";
import { Action, ActionType } from "./models/model";

export const setUserData = (userData: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.UserData,
    payload: userData
  });
};

export const setStatus = (statusSettings: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.StatusSettings,
    payload: statusSettings
  });
};

export const setState = (stateSettings: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.StateSettings,
    payload: stateSettings
  });
};

export const setLocation = (locationSettings: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.LocationSettings,
    payload: locationSettings
  });
};

export const setPDF = (pdfSettings: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.PDFSettings,
    payload: pdfSettings
  });
};

export const setRoller = (rollerSettings: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.RollerSettings,
    payload: rollerSettings
  });
};

export const setChosenStatus = (chosenStatus: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.ChosenStatus,
    payload: chosenStatus
  });
};

export const setChosenLocation = (chosenLocation: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.ChosenLocation,
    payload: chosenLocation
  });
};

export const setChosenDate = (chosenDate: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.ChosenDate,
    payload: chosenDate
  });
};

export const setChosenMode = (chosenMode: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.ChosenMode,
    payload: chosenMode
  });
};

export const setUpdatePacket = (updatePacket: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.UpdatePacket,
    payload: updatePacket
  });
};

export const setSearchWord = (searchWord: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.SearchWord,
    payload: searchWord
  });
};

export const setPersonalSettings = (personalSettings: any) => (dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.PersonalSettings,
    payload: personalSettings
  });
};
