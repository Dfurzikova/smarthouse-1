type InitParams = { [keys: string]: any };

import * as Dispatcher from "./Dispatcher";
export { Dispatcher };
export { Store } from './Store';
export { Component } from './Component';

export function init(params: InitParams) {
    const baseCssClass = 'flux';
    const elems = document.querySelectorAll(`.${baseCssClass}`);
    const { components } = params;

    elems.forEach((v) => {
        Array.prototype.forEach.call(v.classList, (cssClass: string) => {
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
