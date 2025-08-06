import { BrandEnum } from "./brand.enum";
import { CategoryEnum } from "./category.enum";
import { FormatInterface } from "./format.interface";

export enum IGIC {
    alimentos = 0.03,
    bebidas = 0.07
}

export interface ProductInterface {
    id: string;
    prodName: string;
    format: FormatInterface[];
    cantidad?: number;
    igic: IGIC;
    category: CategoryEnum;
    brand: BrandEnum;
}



