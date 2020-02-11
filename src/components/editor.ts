import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema, DOMParser, DOMSerializer, ProseMirrorNode } from "prosemirror-model"
import { schema } from "prosemirror-schema-basic"
import { addListNodes } from "prosemirror-schema-list"
import { exampleSetup } from "prosemirror-example-setup"
import { addMentionNodes, addTagNodes, getMentionsPlugin } from 'prosemirror-mentions'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'


class EmbeddableActivityItem {
  // activity?:ActivityItem;

  constructor(view) {
    this.update(view, null)
  }

  update(view, lastState) {
    let editorElem = view.dom.closest('.editor');
    let activityElem = editorElem.querySelector('activity-item');
    if (activityElem != undefined) { activityElem.remove(); }

    if (view.props.embeddedElem) {
      editorElem.appendChild(view.props.embeddedElem);
      console.log("appended the activity item to the DOM");
    }
    // console.log(view);
    console.log("Update is called");
    return;
  }

  // destroy() {
  //     console.log("Destroy()");
  //     if (this.activity) {
  //         this.activity.remove();
  //     }
  // }
}

export class Editor {

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
  });

  _plugins: any[] = [];
  _activityItemPlugin: Plugin;
  _schema;
  _serializer;
  _view: EditorView;
  _state: EditorState;
  _root: HTMLElement | undefined;

  constructor() {
    this._activityItemPlugin = new Plugin({
      props: { "doogle": false },
      view(editorView) { return new EmbeddableActivityItem(editorView) }
    });

    // Mix the nodes from prosemirror-schema-list into the basic schema to
    // create a schema with list support.
    this._schema = new Schema({
      nodes: addTagNodes(addMentionNodes(addListNodes(schema.spec.nodes, "paragraph block*", "block"))),
      marks: schema.spec.marks
    });
    this._serializer = DOMSerializer.fromSchema(this._schema);
    this._plugins = exampleSetup({ schema: this._schema });
    this._plugins.unshift(this.mentionPlugin); // push it before keymap plugin to override keydown handlers
    this._plugins.push(this._placeholderPlugin);
    this._plugins.push(this._activityItemPlugin);

    this._state = this.GetNewEditorState();
  }

  Deserialize = (nodeObject) => {
    const node = this._schema.nodeFromJSON(nodeObject);
    let target = document.createElement('div');
    this._serializer.serializeFragment(node, {}, target);
    return target.innerHTML;
  }

  InitializeView = (editorElem: HTMLElement | null | undefined) => {
    if (editorElem == undefined) { return; }
    this._root = editorElem;

    this._view = new EditorView(this._root, {
      state: this._state
    });


            //console.log(this._view);
        //this._view.setProps({"isEmbedded":this._embedded != undefined});
        let menubar = <HTMLElement>this._root.querySelector('.ProseMirror-menubar');
        menubar.style.removeProperty('min-height');

        //console.log(this._view);
        let svg = document.getElementById('ProseMirror-icon-collection');
        if (svg) this._root.appendChild(svg);
        this._root.style.display = 'block';

        this.Focus();

    //this.style.display = 'none';
    //this.shadowRoot?.appendChild(_activityInputTemplate.content.cloneNode(true));
    // this.shadowRoot?.querySelector('#editorStyles')?.addEventListener('load', () => {
    //     console.log("proseMirror styles loaded");
    //     this.initialize();
    // });

  }

  GetEmbedded = () => {
    return this._view.props.embeddedElem;
  }

  SetEmbedded = (embeddedElem) => {
    this._view.setProps({ 'embeddedElem': embeddedElem });
  }

  // this._activityItemPlugin = new Plugin({
  //   props: {"doogle": false},
  //   view(editorView) { return new EmbeddableActivityItem(editorView) }
  // });

  GetNewEditorState = () => {
    return EditorState.create({
      doc: DOMParser.fromSchema(this._schema).parse(document.createElement('p')),
      plugins: this._plugins
    });
  }

  GetDoc = () => {
    return this._view.state.toJSON().doc;
  }

  Reset = () => {
    this.SetEmbedded(undefined);
    this._state = this.GetNewEditorState();
    this._view.updateState(this._state);
    this.Focus();
  }

  Focus = () => {
    if (this._root == undefined) return;

    let g = (this._root.querySelector('[contenteditable]') as HTMLElement);
    console.log('g ', g);
    console.log(document.activeElement);
    g.focus();
    setTimeout(() => {
      console.log("CB 1 ");
      this._root?.focus();
      setTimeout(() => {
        console.log("CB 2 ");
        document.body.focus();
        setTimeout(() => {
          console.log("CB 3 ", g);
          g.focus();
        }, 1)
      }, 1)
    }, 1)
    console.log(document.activeElement);
  }


  /**
   * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
   * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
   */
  getMentionSuggestionsHTML = items => '<div class="suggestion-item-list">' +
    items.map(i => '<div class="suggestion-item">' + i.name + '</div>').join('') +
    '</div>';

  /**
   * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
   * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
   */
  getTagSuggestionsHTML = items => '<div class="suggestion-item-list">' +
    items.map(i => '<div class="suggestion-item">' + i.tag + '</div>').join('') +
    '</div>';

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
              return { "id": item.id, "name": item.displayName, "email": item.email }
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
              return { "tag": item.text }
            }));
          });
      }
    },
    getSuggestionsHTML: (items, type) => {
      if (type === 'mention') {
        return this.getMentionSuggestionsHTML(items)
      } else if (type === 'tag') {
        return this.getTagSuggestionsHTML(items)
      }
    }
  });

}