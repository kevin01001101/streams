export class ActivityInput extends HTMLElement {
    text: string = "";

    connectedCallback() {
        this.attachShadow({mode:'open'});
        this.text = "Hello";
        this.render();
    }

    render() {
        const div = document.createElement('div');
        div.innerText = this.text;
        this.shadowRoot?.appendChild(div);
    }


}
