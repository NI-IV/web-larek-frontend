// ▷▷▷ IMPORT
import { ProductItem } from "./AppData"
import { IProductItem } from "../types";
import { Component } from "./base/Component";
import { ensureElement } from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
    id: string,
    description: string,
    image: string,
    title: string,
    category: string,
    price: number,
    itemIndex: number;
    button: IProductItem[];
}

export class Card<T> extends Component<ICard<T>> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._price = ensureElement<HTMLImageElement>(`.${blockName}__price`, container);
        this._button = container.querySelector(`.${blockName}__button`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number) {
        if (value) {
          this.setText(this._price, `${value} синапсов`)
        }else {
          this.setText(this._price, `Бесценно`)
        }
    }
}


export interface ICatalogItem {
    category: string;
    image: string;
    description: string | string[];
}

export class CatalogItem extends Card<ICatalogItem> {
    protected _category: HTMLElement;
    protected _image: HTMLImageElement;
    protected _description: HTMLElement;
    
    constructor (container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions); 
        this._category = ensureElement<HTMLElement>(`.card__category`, container);
        this._image = ensureElement<HTMLImageElement>(`.card__image`, container);
        this._description = container.querySelector(`.card__text`);
    }

    categoryColor(value: string): string {
        switch (value) {
            case "софт-скил":
                return 'soft';
            case 'хард-скил':
                return 'hard';
            case 'кнопка':
                return 'button';
            case 'дополнительное':
                return 'additional';
            default : 
                return 'other'
        }
    }

    set category(value: string) {
        this.setText(this._category, value);
        this.toggleClass(this._category, `card__category_${this.categoryColor(value)}`)
    }


    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string) {
        this.setText(this._description, value)
    }

    set button(basket: ProductItem[]) {
        if (basket.filter(product => product.id === this.container.dataset.id).length > 0) {
            this.setText(this._button, 'Удалить из корзины');
        }else this.setText(this._button, 'Купить')
    }
}


export interface IBasketCard {
    itemIndex: number;
}

export class BasketCard extends Card<IBasketCard> {
    protected _itemIndex: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
        this._itemIndex = ensureElement<HTMLElement>(`.basket__item-index`, container);
        this._button = ensureElement<HTMLButtonElement>(`.basket__item-delete`, container);
    }

    set itemIndex(value: number) {
        this.setText(this._itemIndex, value)
    }
}