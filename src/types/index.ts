export type LotStatus = 'wait' | 'active' | 'closed';

export interface IActions {
    onClick: () => void;
}

export interface IAuction {
    status: LotStatus;
    datetime: string;
    price: number;
    minPrice: number;
    history?: number[];
}

export interface IProductItem {
    id: string,
    description: string,
    image: string,
    title: string,
    category: string,
    price: number
}

export interface IAppState {
    catalog: IProductItem[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}

export interface IOrderForm {
    address: string;
    email: string;
    phone: string;
    payment?: string;
}

export interface IOrder extends IOrderForm {
    payment: string,
    address: string,
    items?: string[],
    total?: number
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
}