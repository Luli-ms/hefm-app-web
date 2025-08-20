import { LvlEnum } from "./lvl.enum";

type PricePerLvl = {
    [key in LvlEnum]: number;
}

export interface FormatInterface {
    precioFinal: number;
    format: string;
    img: string;
    price: PricePerLvl;
    desc: string;
    um: string; // unidad de medida
    formatId: string;
}
