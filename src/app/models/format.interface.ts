import { LvlEnum } from "./lvl.enum";

type PricePerLvl = {
    [key in LvlEnum]: number;
}

export interface FormatInterface {
    format: string;
    img: string;
    price: PricePerLvl;
    desc: string;
    um: string; // unidad de medida
    formatId: string;
}
