import './scss/styles.scss';

import { WebAPI } from "./components/WebAPI";
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/events";
import { Page } from "./components/Page";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/common/Basket";
import { AppState, ProductItem, CatalogChangeEvent } from "./components/AppData";
import { CatalogItem, BasketCard } from './components/Card';
import { Contacts, Order, Success } from "./components/Order";
import { IOrderForm } from './types';

const events = new EventEmitter();
const api = new WebAPI(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLTemplateElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket (cloneTemplate(basketTemplate), events);
const order = new Order (cloneTemplate(orderTemplate), events);
const contacts = new Contacts (cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
    onClick: () => {
        modal.close();
        appData.clearBasket();
        events.emit('basket:changed');
    }
});
// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            category: item.category,
            title: item.title,
            image: item.image,
            price: item.price
        });
    });

});

// Открыть карточку
events.on('card:select', (item: ProductItem) => {
    appData.setPreview(item);
});

// Изменен открытый выбранный лот
events.on('preview:changed', (item: ProductItem) => {
    const showItem = (item: ProductItem) => {
        const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                if (appData.basket.filter(product => product.id === item.id).length < 1) {
                    events.emit('basket:add', item);
                } else {
                    events.emit('basket:remove', item);
                }
                events.emit('preview:changed', item);
            }
        });

        modal.render({
            content: card.render({
                id: item.id,
                description: item.description,
                image: item.image,
                title: item.title,
                category: item.category,
                price: item.price,
                button: appData.basket
            })
        });
    };

    if (item) {
        api.getProductItem(item.id)
            .then((result) => {
                item.description = result.description;
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});


// Открытие корзины
events.on('basket:open', () => {
    modal.render({
        content: createElement('div', {}, [
            basket.render()
        ])
    })
})

// Добавление карточки в корзину
events.on('basket:add', (item: ProductItem) => {
    appData.setBasket(item);
})

// Удаление карточки из корзины
events.on('basket:remove', (item: ProductItem) => {
    appData.removeBasket(item);
})

// Изменение корзины
events.on('basket:changed', () => {
    let index = 0;
    page.counter = appData.basket.length;
    basket.items = appData.basket.map(item => {
        const basketItem = new BasketCard(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                events.emit('basket:remove', item)
            }
        });
        return basketItem.render({
            title: item.title,
            price: item.price,
            index: ++index
        })
    })
    basket.selected = appData.basket;
    basket.total = appData.getTotal();
    
})

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const { address, email, phone } = errors;
    order.valid = !address;
    contacts.valid = !email && !phone;
    order.errors = Object.values({address}).filter(i => !!i).join('; ');
    contacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Открыть форму заказа
events.on('order:open', () => {
    order.unActiveButton();
    modal.render({
        content: order.render({
            address: '',
            valid: false,
            errors: []
        })
    });
});

events.on('contacts:open', () => {
    appData.setOrderField('payment', order.getActiveButton());
    modal.render({
        content: contacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});

events.on('success:open', () => {
    appData.order.total = appData.getTotal();
    appData.basket.forEach(order => {
        appData.setOrderField('items', order.id);
    });
    api.orderProducts(appData.order)
        .then(res => {
            modal.render({
                content: success.render({
                    description: appData.order.total
                })
            });
        })
        .catch(err => {
            console.log('Error: ' + err);
        })
    
})




// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

api.getProductsList()
    .then(res => {
        appData.setCatalog(res);
    })
    .catch(err => {
        console.log('Ошибка: ' + err)
    });