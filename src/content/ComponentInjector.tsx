import * as React from 'react';
import { render } from 'react-dom';

export class ComponentInjector {

    private injected = false;
    private container: HTMLElement;
    private findIntervalRef?: number;
    private findInterval = 500;

    constructor(private component: React.ComponentClass<any, any>, private domSelector: () => HTMLElement) {

    }

    public inject(enable: boolean): void {
        enable ? this.add() : this.remove();
    }

    private add(): void {
        if (this.injected) return;

        this.findIntervalRef = window.setInterval(() => {
            const domElement = this.domSelector();

            if (!domElement) return;

            window.clearInterval(this.findIntervalRef);
            this.findIntervalRef = null;

            const container = document.createElement('div');
            domElement.appendChild(container);

            render(<this.component />, container);
            this.injected = true;
            this.container = container;
        }, this.findInterval);
    }

    private remove(): void {
        if (!this.injected) return;

        this.container.parentElement.removeChild(this.container);
        this.injected = false;
    }
}
