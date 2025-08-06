import { LvlEnum } from "./lvl.enum";

export interface UserInterface {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber: string;
    lvlDescuento: LvlEnum;
    address: string;
}
