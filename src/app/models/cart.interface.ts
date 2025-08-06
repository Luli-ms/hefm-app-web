import { FormatInterface } from "./format.interface";
import { ProductInterface } from "./product.interface";

export interface CartInterface {
    prod: ProductInterface;
    format: FormatInterface;
    cantidad: number;
}
