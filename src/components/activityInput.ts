// Import the Slate editor factory.
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"


export class ActivityInput extends HTMLElement {
    _shadowRoot: ShadowRoot;
    text: string = "";
    proseEditor: HTMLDivElement;
    proseContent: HTMLDivElement;

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode:'open'});
        //this.text = "Helloooo";

        this.proseEditor = document.createElement('div');
        this.proseEditor.setAttribute('id', 'proseEditor');
        this.proseEditor.innerText = this.text;

        this.proseContent = document.createElement('div');
        this.proseContent.setAttribute('id', 'content');
        this.proseContent.innerText = this.text;

        const css = document.createElement('link');
        css.setAttribute('rel', 'stylesheet');
        css.href = "dist/css/editor.css";

        const s = document.createElement('link');
        s.setAttribute('rel', 'stylesheet');
        s.href = "dist/css/site.css";

        this._shadowRoot.appendChild(css);
        this._shadowRoot.appendChild(s);
        this._shadowRoot.appendChild(this.proseEditor);
        this._shadowRoot.appendChild(this.proseContent);
    }

    connectedCallback() {        
        // Mix the nodes from prosemirror-schema-list into the basic schema to
        // create a schema with list support.
        const mySchema = new Schema({
            nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
            marks: schema.spec.marks
        })
        console.log("what's wrong...", this.proseEditor);
        const view = new EditorView(this.proseEditor, {
            state: EditorState.create({
            doc: DOMParser.fromSchema(mySchema).parse(this.proseContent),
            plugins: exampleSetup({schema: mySchema})
            })
        });
        let svg = document.getElementById('ProseMirror-icon-collection');
        if (svg) this._shadowRoot.appendChild(svg);
        
    }
}
