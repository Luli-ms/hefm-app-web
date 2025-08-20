import { LvlEnum } from "./lvl.enum";

export interface UserInterface {
    uid: string;
    email: string;
    name: string;
    phone: string;
    lvlDescuento: LvlEnum;
    address: string;
}
