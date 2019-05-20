import * as React from 'react';
import { render } from 'react-dom';
import { WebEventEmitter } from '../common/events/WebEventEmitter';
import { Popup } from '../common/events/Events';
import { IEnabled } from '../common/IEnabled';

export class ComponentInjector {

    private searching = false;
    private injected = false;
    private container: HTMLElement;
    private findIntervalRef?: number;
    private findInterval = 500;

    constructor(private component: React.ComponentClass<any, any>, private domSelector: () => HTMLElement) {
        const pageEventEmitter = WebEventEmitter.instance;
        pageEventEmitter.on<IEnabled>(Popup.onChangeEnabled, (data) => {
            this.inject(data.enabled);
        });
    }

    public inject(enable: boolean): void {
        enable ? this.add() : this.remove();
    }

    private add(): void {
        if (this.searching) return;

        this.findIntervalRef = window.setInterval(() => {
            this.searching = true;
            const domElement = this.domSelector();

            if (!domElement || this.injected) {
                if (!domElement && this.injected) {
                    this.injected = false;
                }
                return;
            }

            const container = document.createElement('div');
            domElement.appendChild(container);

            render(<this.component />, container);
            this.injected = true;
            this.container = container;

        }, this.findInterval);
    }

    private remove(): void {
        if (!this.injected) return;

        clearInterval(this.findIntervalRef);
        this.container.parentElement.removeChild(this.container);
        this.injected = false;
        this.searching = false;
    }
}
