export interface Order {
    [key: string]: any;
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
    [key: string]: any;
    _id: string;
    flower: Flower;
    state: State;
    location: Location;
    amount: number | string;
    amountToDeliver: number | string;
    information: string;
    status: Status;
    createdAt?: Date;
    updatedAt?: Date;
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

export interface Stickers {
    store: Store
    pickingdate: Date;
    deliverydate: Date;
    _id: string;
    flower: Flower;
    state: State;
    location: Location;
    amount: number | string;
    amountToDeliver: number | string;
    information: string;
    status: Status;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Acc {
    propName: string;
    value: any;
}

export interface PropData {
    _id: string;
    data: Acc[];
}

export interface PDFData {
    _id: string;
    PDFName: string;
    width: Number;
    height: Number;
    pageLayout: string;
    stickerDefault: boolean;
    orderDefault: boolean;
    data: [string];
    createdAt: Date;
    updatedAt: Date;
    PDFText: PDFText[];
    PDFImage: PDFImage[];
}

export interface PDFText {
    _id: string;
    text: string;
    font: string;
    fontSize: number;
    fontType: string;
    xPosition: number;
    yPosition: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PDFImage {
    _id: string;
    imageURL: string;
    height: number;
    width: number;
    xPosition: number;
    yPosition: number;
    createdAt: Date;
    updatedAt: Date;
}