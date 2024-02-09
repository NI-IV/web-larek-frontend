import { IActions, IOrder, IOrderForm, ISuccess, ISuccessActions } from "../types";
import { ensureAllElements, ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export class Order extends Form<IOrder> {
    protected _payment: HTMLButtonElement[];
    protected _address: HTMLInputElement;
    protected _button: HTMLElement;

    constructor(container: HTMLFormElement, events: IEvents, actions?: IActions) {
        super(container, events); 

        this._payment = ensureAllElements<HTMLButtonElement>(`.button_alt`, container);
        this._button = this.container.querySelector('.order__button');

        this._payment.forEach(button => {
            button.addEventListener('click', () => {
                this.unActiveButton();
                this.toggleClass(button, 'button_alt-active');
            })
        });

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('contacts:open');
            });
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    unActiveButton() {
        this._payment.forEach(button => {
            button.classList.remove('button_alt-active');
        })
    }

    getActiveButton() {
        return this.container.querySelector('.button_alt-active').textContent ?? '';
    }
    

}

export class Contacts extends Form<IOrderForm> {
    protected _button: HTMLElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._button = this.container.querySelector('.button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('success:open');
            });
        }
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}

export class Success extends Component<ISuccess> {
    protected _close: HTMLElement;
    protected _description: HTMLElement;

    constructor(container: HTMLElement, actions?: ISuccessActions) {
        super(container);

        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._description = ensureElement<HTMLElement>('.order-success__description', this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set description(value: string) {
        this.setText(this._description, `Списано ${value} синапсов`);
    }
}