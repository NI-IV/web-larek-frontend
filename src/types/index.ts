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
}

export interface IOrderForm {
    payment: string;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export interface IOrder extends IOrderForm {
    items: string[],
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
}

export interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}

export interface IModalData {
    content: HTMLElement;
}

export interface IWebAPI {
    getProductsList: () => Promise<IProductItem[]>;
    getProductItem: (id: string) => Promise<IProductItem>;
}

export interface IFormState {
    valid: boolean;
    errors: string[];
}

export interface IBasketCard {
    index: number;
}

export interface ICatalogItem {
    category: string;
    image: string;
    description: string | string[];
}

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
    id: string,
    description: string,
    image: string,
    title: string,
    category: string,
    price: number,
    index: number;
    button: IProductItem[];
}

export interface ISuccess {
    description: string | number;
}

export interface ISuccessActions {
    onClick: () => void;
}

export interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean
}

