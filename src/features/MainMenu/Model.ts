export interface Order {
    _id: string;
    store: Store;
    information: string;
    pickingdate: Date;
    deliverydate: Date;
    ordercode: string;
    products: Products[];
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

export interface Products {
    _id: string;
    flower: Flower;
    state: State;
    location: Location;
    amount: number;
    amountToDeliver: number;
    information: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

export interface Store {
    _id: string;
    name: string;
    group: string;
}

export interface Flower {
    _id: string;
    name: string;
    group: string;
}

export interface State {
    _id: string;
    state: string;
    color: string;
    fontcolor: string;
    default: boolean;
    nextState: string;
}

export interface Location {
    _id: string;
    location: string;
    default: boolean;
    nextLocation: string;
}

export interface Status {
    _id: string;
    status: string;
    color: string;
    fontcolor: string;
    default: boolean;
    nextStatus: string;
}