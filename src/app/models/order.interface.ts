import { CartInterface } from "./cart.interface";

export interface OrderInterface {
    orderId: string;
    total: number;
    name: string;
    email: string;
    order: CartInterface[];
}
