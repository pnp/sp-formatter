import * as React from 'react';
import { render } from 'react-dom';
import { observe, Observer } from 'selector-observer';

import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Popup, Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';

export function enableComponentInjector(component: React.FC<any>, domSelector: string, propsSelector: () => any) {
    const pagePipe = WebEventEmitter.instance;
    const injector = new ComponentInjector(component, domSelector, propsSelector);

    pagePipe.on<IEnabled>(Popup.onChangeEnabled, (data) => {
        injector.inject(data.enabled);
    });
}

class ComponentInjector {

    private container: HTMLElement;
    private observer: Observer;

    constructor(private component: React.FC<any>, private domSelector: string, private propsSelector: () => any) {
        //
    }

    public inject(enable: boolean): void {
        enable ? this.add() : this.remove();
    }

    private add(): void {
        if (this.observer) return;

        this.observer = observe(this.domSelector, {
            add: (domElement): void => {
                this.container = document.createElement('div');
                domElement.appendChild(this.container);
                const props = this.propsSelector();
                render(<this.component {...props} />, this.container);
            },
            remove: (): void => {
                this.triggerRemoveFormatter();
            }
        });
    }

    private remove(): void {
        if (this.observer) {
            this.observer.abort();
            this.observer = null;
        }
        if (this.container) {
            this.container.parentElement.removeChild(this.container);
        }
        this.triggerRemoveFormatter();
    }

    private triggerRemoveFormatter(): void {
        WebEventEmitter.instance.emit<IEnabled>(Content.onToggleEnabledColumngFormatter, {
            enabled: false
        });
    }
}
