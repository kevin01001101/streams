import { Reaction } from "../models/activity";
import { html, render, TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DateTime } from "luxon";
import { ActivityInput } from './activityInput.js';


export class ActivityItem extends HTMLElement {

  _shadowRoot: ShadowRoot;

  get authorId() {
    return this.getAttribute('author-id');
  }
  set authorId(newValue) {
    if (newValue) { this.setAttribute('author-id', newValue); }
  }

  get authorName() {
    return this.getAttribute('author-name');
  }
  set authorName(newValue) {
    if (newValue) { this.setAttribute('author-name', newValue); }
  }

  get timestamp() {
    let t = this.getAttribute('timestamp');
    return t ? DateTime.fromISO(t) : DateTime.local();
  }
  set timestamp(newValue) {
    if (newValue) { this.setAttribute('timestamp', newValue.toISO()); }
  }

  // get reactions() {
  //   return this._reactions;
  // }
  // set reactions(reactions: Reaction[]) {
  //   this._reactions = reactions
  // }

  // get replies() {
  //   return this._replies;
  // }
  // set replies(replies: ActivityItem[]) {
  //   this._replies = replies;
  // }

  content: string = "";
  reactions: Reaction[] = [];
  replies: ActivityItem[] = [];
  _isReplying: boolean = false;
  //commentEditor: ActivityInput | null = null;


  constructor() {
    super();
    this._shadowRoot = this.attachShadow({mode:'open'});
  }

  _template(): TemplateResult {
    return html`
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
      <link rel="stylesheet" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />
      <style type="text/css">
        ::shadow {
          display:flex;
          flex-direction:column;
        }

        .activity.card {
          margin:0.5rem;
        }

        .card-header {
          display:flex;
          padding: 0.5rem;
          border-bottom:none;
         /* align-items:flex-end;*/
        }

        .avatar img {
          height:40px;
          width:40px;
        }

        .author {
          flex-grow:1;
        }
        .card-body {
          padding: 0.5rem 0.75rem;
        }

        .control:hover {
          cursor:pointer;
        }

        .card-footer {
          display:flex;
          padding:0.5rem;
          border-top:none;
          justify-content:space-around;
        }

        button i.ms-Icon {
          margin-right:0.6rem;
        }

        .prosemirror-mention-node {
          color:blue;
          font-family:Arial, Helvetica, sans-serif
        }
        .prosemirror-tag-node {
          background-color: rgba(192,192,192,0.6);
          border-radius:4px;
          padding:0 0.2rem;
        }

        .card-footer .reactions button {
          border-color:transparent;
        }
        .card-footer div.reactions .btn-outline-secondary.active {
          background-color:lightgray;
        }
        .card-footer div.reactions .btn-outline-secondary.active:hover {
          background-color:gray;
        }


        .card:hover .card-footer button {
          border-color:unset;
        }

        .card-footer button.showOnHover {
          opacity:0;
        }
        .card:hover .card-footer button.showOnHover {
          opacity:1;
          transition: 0.4s;
        }

        .bookmark {
          height:100%;
          background-color:none;
        }
        .bookmark:hover {
          background-color:lightgray;
          color:black;
        }


        activity-input {
          margin:0.4rem;
        }

        </style>
      <div class="activity card" data-id="${this.id}" @publish=${this.publishHandler}>
        <div class="card-header">
          <div class="avatar"><img src="images/genericuser.png" class="img-thumbnail rounded" /></div>
          <div class="author ml-1">${this.authorName}</div>
          <span class="bookmark control badge badge-pill badge-light">
            <i class="ms-Icon ms-Icon--AddBookmark" aria-hidden="true"></i>
          </span>
        </div>
        <div class="card-body">
          <div style="text-align:right;"><small class="timestamp text-muted" title="${this.timestamp.toLocaleString(DateTime.DATETIME_SHORT)}">${this.timestamp.toRelative()}</small></div>
          <div class="content">${unsafeHTML(this.content)}</div>
        </div>
        <div class="card-footer">
          <div class="reactions" @click=${this.reactionHandler}>
            <button type="button" class="btn btn-sm btn-outline-secondary">
              <span class="emoji happy">😀</span>
              <span class="badge badge-light">9</span>
              <span class="sr-only">happy responses</span>
            </button>
            <button type="button" class="active btn btn-sm btn-outline-secondary">
              <span class="emoji upset">😿</span>
              <span class="badge badge-light">9</span>
              <span class="sr-only">happy responses</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary">
              <span class="emoji confused">😵</span>
              <span class="badge badge-light"></span>
              <span class="sr-only">happy responses</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary">
              <span class="emoji clap">❤</span>
              <span class="badge badge-light">9</span>
              <span class="sr-only">happy responses</span>
            </button>
          </div>
          <button type="button" @click=${this.restreamHandler} class="restream showOnHover btn btn-sm btn-outline-secondary">
            <i class="ms-Icon ms-Icon--NoteReply" aria-hidden="true"></i><span>Restream</span>
          </button>
          <button type="button" @click=${this.commentHandler} class="comment showOnHover btn btn-sm btn-outline-secondary">
            <i class="ms-Icon ms-Icon--CommentAdd" aria-hidden="true"></i><span>Comment</span>
          </button>
          <button type="button" @click=${this.shareHandler} class="share showOnHover btn btn-sm btn-outline-secondary">
            <i class="ms-Icon ms-Icon--Share" aria-hidden="true"></i><span>Share</span>
          </button>
        </div>
        ${(this._isReplying ? html`<activity-input></activity-input>` : ``)}
      </div>
    `;
  }

  restreamHandler(evt: Event) {
    console.log("Clicked to restream ", evt);
      this.dispatchEvent(new CustomEvent('reply', { bubbles: true }));
  }

  commentHandler = (evt:Event) => {
    if (this._isReplying == true) return;

    console.log("Clicked to comment ", evt);
    this._isReplying = true;
    this._update();
  }

  shareHandler(evt:Event) {
    console.log("Clicked to share ", evt);
    this.dispatchEvent(new CustomEvent('share', { bubbles: true }));
  }

  reactionHandler = (evt:Event) => {
    console.log(evt.target);
    let buttonElem = (<HTMLElement>evt.target).closest('button');
    if (buttonElem == null) return;

    console.log("an emoji was selected");
    // Functions like radio buttons, but (unlike radio buttns) allows one to unselect the only selected item
    if (buttonElem.classList.contains('active')) {
      buttonElem.classList.remove('active');
    } else {
      this.shadowRoot?.querySelectorAll('.reactions button').forEach(elem => {
        elem.classList.remove('active');
      });
      buttonElem.classList.add('active');
    }

    let currentlySelectedEmojiBtn = this.shadowRoot?.querySelector('.reactions button.active');
    this.dispatchEvent(new CustomEvent('reaction', { bubbles: true, detail: currentlySelectedEmojiBtn }));
  }

  publishHandler = (evt:Event) => {
    console.log("Received publish>");
    evt.stopPropagation();
    this.dispatchEvent(new CustomEvent("reply", { 
      bubbles: true,
      detail: {
        parentId: this.id,
        details: "message details"
      } 
    }));
    
  }

  connectedCallback() {

    this._update();
  }

  _update() {
    render(this._template(), this._shadowRoot);
  }

  static get observedAttributes() {
    return ['author-id', 'author-name'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue == newValue) return;
    switch (name) {
      case 'author-id':
        this.authorId = newValue;
        //this.setAttribute('author-id', newValue);
        break;
      case 'author-name':
        this.authorName = newValue;
        break;
      case 'timestamp':
        this.timestamp = newValue;
        break;
      // case 'reaction':
      //   break;
    }
  }
}