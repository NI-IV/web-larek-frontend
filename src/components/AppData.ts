import { Model } from "./base/Model";
import { FormErrors, IAppState, IProductItem, IOrder, IOrderForm } from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProductItem> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;

    get productId(): string {
        return this.id;
    }

    get categoryColor(): string {
        switch (this.category) {
            case 'софт-скил':
                return '_soft';
            case 'хард-скил':
                return '_hard';
            case 'кнопка':
                return '_button';
            case 'дополнительное':
                return '_additional';
            default:
                return '_other;'
        }
    }

}


export class AppState extends Model<IAppState> {
    basket: ProductItem[] = [];
    catalog: ProductItem[];
    loading: boolean;
    order: IOrder = {
        email: '-',
        phone: '-',
        items: [],
        payment: '',
        address: '',
        total: 0
    };
    preview: string | null;
    formErrors: FormErrors = {};

    clearBasket() {
        this.basket = [];
        this.order.items = [];
    }

    getTotal() {
        return this.basket.reduce((a, b) => { return a + b.price }, 0)
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setBasket(item: ProductItem) {
        this.basket.push(item);
        this.emitChanges('basket:changed');
    }

    removeBasket(item: ProductItem) {
        this.basket = this.basket.filter(el => el.id != item.id);
        this.emitChanges('basket:changed');
    }

    setOrderField(field: keyof IOrderForm, value: string | number) {
        if (field === 'total') {
            this.order[field] = value as number;
        } else if (field === 'items') {
            const arr = this.order[field];
            arr.push(value as string);
        } else {
            this.order[field] = value as string;
        }

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        if (!this.order.address) {
            errors.address = 'Неоходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}