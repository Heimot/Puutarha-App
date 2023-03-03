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
    roller: Roller;
    truck: Truck;
    calendarPosition: Number;
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
    stickerPoint: boolean;
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
    [key: string]: any;
    _id: string;
    PDFName: string;
    width: number;
    height: number;
    pageLayout: 'Landscape' | 'Portrait';
    stickerDefault: boolean;
    orderDefault: boolean;
    data: [string];
    createdAt: Date;
    updatedAt: Date;
    PDFText: PDFText[];
    PDFImage: PDFImage[];
    table: PDFTable;
    header: PDFHeader;
}

export interface PDFHeader {
    [key: string]: any;
    _id: string;
    data: string[];
    PDFText: PDFText[];
    PDFImage: PDFImage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PDFTable {
    [key: string]: any;
    _id: string;
    headers: TableHeaders[];
    cells: TableCells[];
    xPosition: number;
    yPosition: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TableHeaders {
    [key: string]: any;
    _id: string;
    text: string;
}

export interface TableCells {
    [key: string]: any;
    _id: string;
    text: string;
}

export interface PDFText {
    [key: string]: any;
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
    [key: string]: any;
    _id: string;
    imageURL: string;
    height: number;
    width: number;
    xPosition: number;
    yPosition: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    _id: string;
    email: string;
    username: string;
    role: Role;
    lastSignInAt: Date;
    personalSettings: Settings;
    currentSignInAt: Date;
    signInCount: number;
}

export interface Role {
    _id: string;
    role: string;
    rights: Object;
    default: boolean;
}

export interface Message {
    title: string;
    message: string;
}

export interface Roller {
    _id: string;
    roller: string;
    lockColor: string;
    default: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Truck {
    _id: string;
    truckLicensePlate: string;
    default: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TruckData {
    deliverydate: string;
    truck: Truck;
}

export interface Card {
    _id: string;
    cardAccount: string | null;
    cardNumber: string;
    cardOwner: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Fonts {
    [key: string]: any;
    name: string;
    fontTypes: Object;
}

export interface GetFonts {
    [key: string]: string[];
}

export interface ImageData {
    _id: string;
    image: string;
    imageID: string;
}

export interface Settings {
    _id: string;
    showEmptyOrders: boolean;
    disableRFIDScanning: boolean;
    language: any;
}
