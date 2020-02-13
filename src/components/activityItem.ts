import { Reaction } from "../models/enums.js";
import { html, render, TemplateResult } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DateTime } from "luxon";

export class ActivityItem extends HTMLElement {

  _shadowRoot: ShadowRoot;
  _previousReaction: string;

  get activityId() {
    return this.getAttribute('activity-id');
  }
  set activityId(newValue) {
    if (newValue) { this.setAttribute('activity-id', newValue); }
  }

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

  get reaction() {
    return this.getAttribute('reaction');
  }
  set reaction(newValue) {
    if (newValue) { this.setAttribute('reaction', newValue); }
  }

  set reactions(newReactions) {
    if (newReactions != undefined) {
      this._reactions = Object.assign(this._reactions, newReactions);
    }
  }

  get hideControls(): boolean {
    return this.hasAttribute('hide-controls');
  }
  set hideControls(newValue) {
    if (newValue) { this.setAttribute('hide-controls', ''); }
    else { this.removeAttribute('hide-controls'); }
  }

  get isNew(): boolean {
    return this.hasAttribute('new');
  }
  set isNew(newValue) {
    if (newValue) { this.setAttribute('new', ''); }
    else { this.removeAttribute('new'); }
  }

  get isReplying(): boolean {
    return this.hasAttribute('replying');
  }
  set isReplying(newValue) {
    if (newValue) { this.setAttribute('replying', ''); }
    else { this.removeAttribute('replying'); }
  }

  get showComments(): boolean {
    return this.hasAttribute('show-comments');
  }
  set showComments(newValue) {
    if (newValue) { this.setAttribute('show-comments',''); }
    else { this.removeAttribute('show-comments'); }
  }

  restreamedActivity: ActivityItem | undefined;
  content: string = "";
  _reactions: Map<Reaction, number> = new Map<Reaction, number>();
  replies: ActivityItem[] = [];

  static Create(activityData) {
    let newItem =  new ActivityItem();
    Object.assign(newItem, activityData);
    return newItem;
  }

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({mode:'open'});
    //Object.assign(this, activityData);

    this._previousReaction = '';
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
        .activity.card.new {
          filter: drop-shadow(4px 4px 8px blue);
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
          /* margin-right:0.6rem; */
        }

        .prosemirror-tag-node,
        .prosemirror-mention-node {
            border-radius:4px;
            padding:0.1rem 0.2rem;
            font-family:Arial, Helvetica, sans-serif
        }
        .prosemirror-tag-node {
          background-color: rgba(192,192,192,0.6);
        }
        .prosemirror-mention-node {
          background-color: rgba(183,232,232,0.6);
        }
        .prosemirror-tag-node:hover,
        .prosemirror-mention-node:hover {
            cursor:pointer;
            text-decoration:underline;
          }



        :host([hide-controls]) .card-footer {
          display:none;
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
      <div class="activity card ${classMap({"replying":this.isReplying, "new":this.isNew, "hideControls":this.hideControls})}" @publishActivity=${this.publishHandler} @resetActivity=${this.resetHandler} dir="ltr">
        <div class="card-header">
          <div class="avatar"><img src="images/genericuser.png" class="img-thumbnail rounded" /></div>
          <div class="author ml-1">${this.authorName}</div>
          <span @click=${this.shareHandler} class="share control badge badge-pill badge-light showOnHover">
            <i class="ms-Icon ms-Icon--Share" aria-hidden="true"></i>
          </span>
          <span class="bookmark control badge badge-pill badge-light">
            <i class="ms-Icon ms-Icon--AddBookmark" aria-hidden="true"></i>
          </span>
        </div>
        <div class="card-body">
          <div style="text-align:right;"><small class="timestamp text-muted" title="${this.timestamp.toLocaleString(DateTime.DATETIME_SHORT)}">${this.timestamp.toRelative()}</small></div>
          <div class="content">${unsafeHTML(this.content)}</div>
          ${this.restreamedActivity}

        </div>
        <div class="card-footer">
          <div class="reactions" @click=${this.reactionHandler}>
            <button type="button" data-reaction="${Reaction.Happy}" class="${classMap({"active":this.reaction == Reaction.Happy})} btn btn-sm btn-outline-secondary">
              <span class="emoji">😀</span>
              <span class="badge badge-light">${this._reactions[Reaction.Happy] > 0 ? this._reactions[Reaction.Happy] : ''}</span>
              <span class="sr-only">happy response</span>
            </button>
            <button type="button" data-reaction="${Reaction.Upset}" class="${classMap({"active":this.reaction == Reaction.Upset})} btn btn-sm btn-outline-secondary">
              <span class="emoji">😿</span>
              <span class="badge badge-light">${this._reactions[Reaction.Upset] > 0 ? this._reactions[Reaction.Upset] : ''}</span>
              <span class="sr-only">upset response</span>
            </button>
            <button type="button" data-reaction="${Reaction.Confused}" class="${classMap({"active":this.reaction == Reaction.Confused})} btn btn-sm btn-outline-secondary">
              <span class="emoji">😵</span>
              <span class="badge badge-light">${this._reactions[Reaction.Confused] > 0 ? this._reactions[Reaction.Confused] : ''}</span>
              <span class="sr-only">confused response</span>
            </button>
            <button type="button" data-reaction="${Reaction.Heart}" class="${classMap({"active":this.reaction == Reaction.Heart})} btn btn-sm btn-outline-secondary">
              <span class="emoji">❤</span>
              <span class="badge badge-light">${this._reactions[Reaction.Heart] > 0 ? this._reactions[Reaction.Heart] : ''}</span>
              <span class="sr-only">heart response</span>
            </button>
          </div>
          <button type="button" title="Restream this activity" @click=${this.restreamHandler} class="restream showOnHover btn btn-sm btn-outline-secondary">
            <i class="ms-Icon ms-Icon--ReplyAllMirrored" aria-hidden="true"></i><span>Restream</span>
          </button>
          <button type="button" title="Comment on this activity" @click=${this.commentHandler} class="reply showOnHover btn btn-sm btn-outline-secondary">
            <i class="ms-Icon ms-Icon--CommentAdd" aria-hidden="true"></i><span>Reply</span>
          </button>
          <button type="button" title="View comments" @click=${this.toggleComments} class="comments btn btn-sm btn-outline-secondary">
            <i class="ms-Icon ms-Icon--Comment" aria-hidden="true"></i>
            <span class="badge badge-light">${this.replies.length || ''}</span>
          </button>
        </div>
        ${(this.isReplying ? html`<activity-input reply-to=${this.activityId}></activity-input>` : ``)}
      ${(this.showComments ? html`<activity-item></activity-item>` : ``)}
      </div>

    `;
  }


  restreamHandler = (evt: Event) => {
    console.log("Clicked to restream ", evt);

    this.dispatchEvent(new CustomEvent('restreamActivity', {
      bubbles: true,
      detail: {
        activityElem: this
      }
    }));
  }

  commentHandler = (evt:Event) => {
    if (this.isReplying == true) return;

    console.log("Clicked to comment ", evt);
    this.isReplying = true;
    //this._update();
  }

  toggleComments = (evt:Event) => {
    console.log("toggling the comments");
    this.showComments = !this.showComments;
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
    let previousSelection = this.shadowRoot?.querySelector('.reactions button.active');

    // Functions like radio buttons, but (unlike radio buttns) allows one to unselect the only selected item
    if (previousSelection == buttonElem) {
      buttonElem.classList.remove('active');
    } else {
      previousSelection?.classList.remove('active');
      buttonElem.classList.add('active');
    }

    let selectedReactionBtn = this.shadowRoot?.querySelector('.reactions button.active');
    let currentReaction = selectedReactionBtn?.getAttribute('data-reaction');
    this.dispatchEvent(new CustomEvent('reactionChange', {
      bubbles: true,
      detail: {
        currentReaction,
        previousReaction: previousSelection?.getAttribute('data-reaction')
      }
    }));
  }

  publishHandler = (evt:Event) => {
    console.log("Received publish at the ActivityItem, let propogate");
    // evt.stopPropagation();
    this.dispatchEvent(new CustomEvent("replyToActivity", {
      bubbles: true,
      detail: (evt as CustomEvent).detail
    }));
  }

  resetHandler = (evt:Event) => {
    console.log("reset event received by Item");
    evt.stopPropagation();
    this.isReplying = false;
  }

  connectedCallback() {

    this._update();
  }

  _update() {
    render(this._template(), this._shadowRoot);
  }

  static get observedAttributes() {
    return ['author-id', 'author-name', 'reaction', 'hide-controls', 'new', 'replying', 'show-comments'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue == newValue) return;
    switch (name) {
      case 'activity-id':
        this.activityId = newValue;
        break;
      case 'author-id':
        this.authorId = newValue;
        break;
      case 'author-name':
        this.authorName = newValue;
        break;
      case 'reaction':
        this.reaction = newValue;
        break;
      case 'hide-controls':
        this.hideControls = newValue != undefined;
        break;
      case 'new':
        this.isNew = newValue != undefined;
        break;
      case 'replying':
        this.isReplying = newValue != undefined;
        break;
      case 'show-comments':
        this.showComments = newValue != undefined;
        break;      case 'timestamp':
        this.timestamp = newValue;
        break;
      // case 'reaction':
      //   break;
    }
    this._update();
  }

  undoReactionChange = (reason) => {
    this.reaction = this._previousReaction;
    console.warn("Undo Reaction Change.  Reason: ", reason);
  }
}