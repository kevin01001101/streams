import { html, render, TemplateResult } from 'lit-html';
import { Editor } from './editor';

export class ActivityInput extends HTMLElement {
    _shadowRoot: ShadowRoot;
    _editor: Editor;

    get embedded(): HTMLElement | null {
        return this._editor.GetEmbedded();
    }
    set embedded(newValue) {
        console.log("New value for embedded: ", newValue);
        //this._activityItemPlugin.activity = newValue;
        //this._embedded = newValue;
        this._editor.SetEmbedded(newValue);
        this._editor._view.focus();
        //this._update();
    }

    get replyTo(): string | null {
        return this.getAttribute('reply-to');
    }
    set replyTo(newValue) {
        if (newValue == null) {
            this.removeAttribute('reply-to');
         } else {
             this.setAttribute('reply-to', newValue);
         }
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode:'open'});
        this._editor = new Editor();
    }

    connectedCallback() {
        console.log('connectedCallback');
        this._update();
        this._editor.InitializeView(this.shadowRoot?.querySelector('.editor'));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue == newValue) return;
        switch (name) {
          case 'reply-to':
            this.replyTo = newValue;
            break;
        }
    }

    _update() {
        render(this._template(), this._shadowRoot);
    }

    _template(): TemplateResult {
        return html`<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="src/css/style.css" id="styles">
        <link rel="stylesheet" href="src/css/editor.css" id="editorStyles">
        <style type="text/css">
        :host {
            margin-top:1rem;
            margin-bottom:2rem;
        }
        .editor {
            margin-bottom:0.4rem;
            padding-top:0;
          }
          .ProseMirror {
              line-height:1.4;
          }

          .ProseMirror[contenteditable] {
            max-height:10rem;
            overflow-y:auto;
          }

          /* also part of activityItem */
          .prosemirror-mention-node {
              color:blue;
              font-family:Arial, Helvetica, sans-serif
          }
          .prosemirror-tag-node,
          .prosemirror-mention-node {
              border-radius:4px;
              padding:0.1rem 0.2rem;
          }
          .prosemirror-tag-node {
            background-color: rgba(192,192,192,0.6);
          }
          .prosemirror-mention-node {
            background-color: rgba(183,232,232,0.6);
        }
        /* END also part of activityItem */

          .ProseMirror .placeholder {
            color: #aaa;
            pointer-events: none;
            height: 0;
          }

          .ProseMirror:focus .placeholder {
            display: none;
          }
          .ProseMirror .empty-node::before {
            position: absolute;
            color: #aaa;
            cursor: text;
          }

          .ProseMirror .empty-node:hover::before {
            color: #777;
          }

          .ProseMirror p.empty-node:first-child::before {
            /* content: 'type your activity details here'; */
          }

        </style>
        <input type="hidden" class="focusFix">
            <form>
                <select class="custom-select custom-select-sm mb-1" style="width:70%;">
                    <option>CLASSIFICATION A</option>
                    <option>CLASSIFICATION B</option>
                    <option>CLASSIFICATION C</option>
                </select>
            </form>
            <div class="editor"></div>
            <button @click=${this.publish} class="publish btn btn-sm btn-primary">publish</button>
            <button @click=${this.reset} class="reset btn btn-sm btn-secondary">reset</button>`;
    }

    publish = (evt:Event) => {
        console.log("clicked on the button");
        //console.log("State {0}", this._view.state);
        //let replyToId = this.replyTo

        let data = {
            "content": JSON.stringify(this._editor.GetDoc()),
            "inputElem": this,
            "replyTo": this.replyTo
        };
        this.dispatchEvent(new CustomEvent('publishActivity', { bubbles: true, composed: true, detail: data }));
    }

    reset = () => {
        console.log("clicked reset");
        this._editor.Reset();
        this.dispatchEvent(new CustomEvent('resetActivity', { bubbles: true }));
    }

}
