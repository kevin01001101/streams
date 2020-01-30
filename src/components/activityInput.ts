import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import {addMentionNodes, addTagNodes, getMentionsPlugin} from 'prosemirror-mentions'

const _activityInputTemplate = document.createElement('template');
_activityInputTemplate.innerHTML = `
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <link rel="stylesheet" href="src/css/style.css" id="styles">
    <link rel="stylesheet" href="src/css/editor.css" id="editorStyles">
    <style type="text/css">
    .editor {
        margin-bottom:0.4rem;
        padding-top:0;
        height:10rem;
        max-height:15rem;
        overflow-y:auto;
      }

      .prosemirror-mention-node {
          color:blue;
          font-family:Arial, Helvetica, sans-serif
      }
      .prosemirror-tag-node {
          background-color: rgba(192,192,192,0.6);
          border-radius:4px;
          padding:0.2rem;
      }

    </style>

        <div class="editor"></div>
        <div class="content"></div>

        <button class="publish btn btn-sm btn-primary">publish</button>
        <button class="cancel btn btn-sm btn-secondary">cancel</button>
`;

export class ActivityInput extends HTMLElement {
    _shadowRoot: ShadowRoot;
    _plugins: any[] = [];
    _view: EditorView;

    _initialState = "{\"doc\":{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"What does this look like when \"},{\"type\":\"mention\",\"attrs\":{\"id\":\"102\",\"name\":\"Joe Lewis\",\"email\":\"lewis@gmail.com\"}},{\"type\":\"text\",\"text\":\" something \"},{\"type\":\"tag\",\"attrs\":{\"tag\":\"WikiLeaks\"}},{\"type\":\"text\",\"text\":\" else\"}]}]},\"selection\":{\"type\":\"text\",\"anchor\":49,\"head\":49}}";

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode:'open'});
        this.style.display = 'none';
        this._shadowRoot.appendChild(_activityInputTemplate.content.cloneNode(true));
        this._shadowRoot.querySelector('#editorStyles')?.addEventListener('load', () => {
            console.log("proseMirror styles loaded");
            this.initialize();
         });

    }

    initialize() {
        // Mix the nodes from prosemirror-schema-list into the basic schema to
        // create a schema with list support.
        const mySchema = new Schema({
            nodes: addTagNodes(addMentionNodes(addListNodes(schema.spec.nodes, "paragraph block*", "block"))),
            marks: schema.spec.marks
        });
        this._plugins = exampleSetup({schema: mySchema});
        this._plugins.unshift(this.mentionPlugin); // push it before keymap plugin to override keydown handlers

        this._view = new EditorView(this._shadowRoot.querySelector('.editor'), {
            // state: EditorState.create({
            //     doc: DOMParser.fromSchema(mySchema).parse(this._shadowRoot.querySelector('.content')),
            //     plugins: this._plugins
            // })
            state: EditorState.fromJSON({
                    doc: DOMParser.fromSchema(mySchema).parse(this._shadowRoot.querySelector('.content')),
                    schema: mySchema,
                    plugins: this._plugins
                }, JSON.parse(this._initialState))
        });
        let svg = document.getElementById('ProseMirror-icon-collection');
        if (svg) this._shadowRoot.appendChild(svg);
        this.style.display = 'block';
    }

    connectedCallback() {
        this._shadowRoot.querySelector('button.publish')?.addEventListener('click', this.publish);
    }

    publish = (evt:Event) => {
        console.log("clicked on the button");
        console.log("State {0}", this._view.state);

        let data = {
            //"contentJson": JSON.stringify(this._view.state.toJSON())
            "contentHtml": (this._shadowRoot.querySelector('.ProseMirror') as HTMLElement).innerHTML
        }
        this.dispatchEvent(new CustomEvent('publish', { bubbles: true, detail: data }));
    }


    /**
     * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
     * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
     */
    getMentionSuggestionsHTML = items => '<div class="suggestion-item-list">'+
        items.map(i => '<div class="suggestion-item">'+i.name+'</div>').join('')+
        '</div>';

    /**
     * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
     * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
     */
    getTagSuggestionsHTML = items => '<div class="suggestion-item-list">'+
        items.map(i => '<div class="suggestion-item">'+i.tag+'</div>').join('')+
        '</div>';



    mentions = [
        {name: 'Joe Lewis', id: '102', email: 'lewis@gmail.com'},
        {name: 'John Doe', id: '101', email: 'joe@gmail.com'}
    ];

    mentionPlugin = getMentionsPlugin({
        getSuggestions: (type, text: string, done) => {
            if (type === 'mention') {

            } else {
                fetch('https://localhost:44387/api/tags/' + text, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    done(data.map(item => {
                        return { "tag":item.text }
                    }));
                });
            }
        },
        getSuggestionsHTML: (items, type) =>  {
            if (type === 'mention') {
                return this.getMentionSuggestionsHTML(items)
            } else if (type === 'tag') {
                return this.getTagSuggestionsHTML(items)
            }
        }
    });

}
