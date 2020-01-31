import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser, ProseMirrorNode} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import {addMentionNodes, addTagNodes, getMentionsPlugin} from 'prosemirror-mentions'

import { DecorationSet, Decoration } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'


const _activityInputTemplate = document.createElement('template');
_activityInputTemplate.innerHTML = `
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
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
        height:10rem;
        max-height:15rem;
        overflow-y:auto;
      }
      .ProseMirror {
          line-height:1.4;
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
        content: 'type your activity details here';
      }


    </style>

        <div class="editor"></div>

        <button class="publish btn btn-sm btn-primary">publish</button>
        <button class="reset btn btn-sm btn-secondary">reset</button>
`;

export class ActivityInput extends HTMLElement {
    _plugins: any[] = [];
    _schema;
    _view: EditorView;
    _state: EditorState;

    constructor() {
        super();
        this.attachShadow({mode:'open'});
        this.style.display = 'none';
        this.shadowRoot?.appendChild(_activityInputTemplate.content.cloneNode(true));
        this.shadowRoot?.querySelector('#editorStyles')?.addEventListener('load', () => {
            console.log("proseMirror styles loaded");
            this.initialize();
        });
    }


    _placeholderPlugin = new Plugin({
        props: {
            decorations: state => {
                const decorations = [] as Decoration[];

                const decorate = (node: ProseMirrorNode, pos: number) => {
                    // && state.selection.$anchor.parent !== node
                    if (node.type.isBlock && node.childCount === 0) {
                        decorations.push(
                            Decoration.node(pos, pos + node.nodeSize, {
                                class: "empty-node"
                            })
                        )
                    }
                }
                state.doc.descendants(decorate)
                return DecorationSet.create(state.doc, decorations)
            },
        },
    })

    initialize() {
        // Mix the nodes from prosemirror-schema-list into the basic schema to
        // create a schema with list support.
        this._schema = new Schema({
            nodes: addTagNodes(addMentionNodes(addListNodes(schema.spec.nodes, "paragraph block*", "block"))),
            marks: schema.spec.marks
        });
        this._plugins = exampleSetup({schema: this._schema});
        this._plugins.unshift(this.mentionPlugin); // push it before keymap plugin to override keydown handlers
        this._plugins.push(this._placeholderPlugin);

        this._state = this.getNewEditorState();
        // let ep = new EditorProps();
        // ep.
        this._view = new EditorView(this.shadowRoot?.querySelector('.editor'), {
            state: this._state
            // state: EditorState.fromJSON({
            //         doc: DOMParser.fromSchema(mySchema).parse(document.createElement('p')),
            //         schema: mySchema,
            //         plugins: this._plugins
            //     }, JSON.parse(this._initialState))
        });

        let svg = document.getElementById('ProseMirror-icon-collection');
        if (svg) this.shadowRoot?.appendChild(svg);
        this.style.display = 'block';
        this.myFocus();        
    }

    myFocus() {
        let g = (this.shadowRoot?.querySelector('[contenteditable]') as HTMLElement);
        console.log('g ', g);
        console.log(document.activeElement);
        g.focus();
        setTimeout(() => {
            console.log("CB 1 ");
            this.focus();
            setTimeout(() => {
                console.log("CB 2 ");
                document.body.focus();
                setTimeout(() => {
                    console.log("CB 3 ", g);                    
                    g.focus();
                },1)
            },1)
        },1)
        console.log(document.activeElement);
    }

    connectedCallback() {
        console.log('connectedCallback');
        this.shadowRoot?.querySelector('button.publish')?.addEventListener('click', this.publish);
        this.shadowRoot?.querySelector('button.reset')?.addEventListener('click', this.reset);        
    }

    getNewEditorState = () => {
        return EditorState.create({
            doc: DOMParser.fromSchema(this._schema).parse(document.createElement('p')),
            plugins: this._plugins
        });
    }

    publish = (evt:Event) => {
        console.log("clicked on the button");
        console.log("State {0}", this._view.state);

        let data = {
            //"contentJson": JSON.stringify(this._view.state.toJSON())
            "contentHtml": (this.shadowRoot?.querySelector('.ProseMirror') as HTMLElement).innerHTML
        }
        this.dispatchEvent(new CustomEvent('publish', { bubbles: true, detail: data }));
    }

    reset = () => {
        console.log("clicked reset");
        this._state = this.getNewEditorState();
        this._view.updateState(this._state);
        let editor = this.shadowRoot?.querySelector('.ProseMirror.ProseMirror-example-setup-style');

        this.myFocus();
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
                fetch('https://localhost:44387/api/entities/' + text, {
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
                        return { "id":item.id, "name":item.text, "email":item.email }
                    }));
                });
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
