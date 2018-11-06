import * as Dispatcher from "./Dispatcher";
export { Dispatcher };
export { Store } from './Store';
export { Component } from './Component';

export function init(params) {
    const baseCssClass = 'flux';
    const elems = document.querySelectorAll(`.${baseCssClass}`);
    const { components } = params;

    elems.forEach((v) => {
        Array.prototype.forEach.call(v.classList, (cssClass) => {
            const constructorName = cssClass.replace(/./, l => l.toUpperCase());

            if (
                cssClass === baseCssClass || 
                !components[constructorName]
            ) {
                return;
            }

            new components[constructorName]({
                dom: v
            });
        });
    });
}
