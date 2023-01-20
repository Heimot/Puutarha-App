import { combineReducers, configureStore } from '@reduxjs/toolkit';
import dataReducer from './reducers';

const reducers = combineReducers({
    data: dataReducer
});

export const Store = configureStore({ reducer: reducers });

export type State = ReturnType<typeof reducers>;