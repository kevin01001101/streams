import { ReactionType } from "../models/enums.js";
import { html, render, TemplateResult } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DateTime } from "luxon";
import { Activity } from "../models/activity.js";
import { repeat } from 'lit-html/directives/repeat.js';
import { Entity } from "../models/entity.js";

export class ActivityItem extends HTMLElement {

  _shadowRoot: ShadowRoot;

  get reaction() {
    return this.getAttribute('reaction');
  }
  set reaction(newValue) {
    if (newValue) { this.setAttribute('reaction', newValue); }
    else { this.removeAttribute('reaction'); }
  }

  // set reactions(newReactions: Map<Reaction,number>) {
  //   if (newReactions != undefined) {
  //     this._reactions = new Map(newReactions);
  //   }
  // }

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

  set activity(newValue: Activity) {
    ({
      id: this.activityId,
      author: this.author,
      content: this.content,
      created: this.created,
      reactionCount: this.reactions,
      restream: this.restreamedActivity,
      replies: this.replies
      } = newValue);
  }

  activityId: string = "";
  private author?: Entity;
  private content: string = "";
  private created: DateTime = DateTime.local();
  private reactions: Map<ReactionType,number> = new Map<ReactionType,number>();
  private restreamedActivity?: Activity;
  private replies: Activity[] = [];
  private previousReaction: ReactionType = ReactionType.None;


  static create(activity, author) {
    if (activity == undefined) return undefined;
    let newItem =  new ActivityItem();
    ({
     //id: newItem.activityId,
      content: newItem.content,
     // created: newItem.timestamp,
     // authorId: newItem.authorId,
     // myReaction: newItem.ReactionType,
     // reactions: newItem.reactions,
      //parentId: newItem.parentId?
    } = activity);
    ({
    //  id: newItem.authorId,
    //  displayName: newItem.authorName,
    //  email: newItem.authorEmail
    } = author);
    return newItem;
  }

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({mode:'open'});
    //Object.assign(this, activityData);
  }

  _template(): TemplateResult {
    const componentStyles = html`
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
      <link rel="stylesheet" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />
      <style type="text/css">
        ::shadow {
          display:flex;
          flex-direction:column;
        }

        .activity.card {
          margin:0.5rem;
          margin-bottom:1rem;
        }
        .activity.card.new {
          filter: drop-shadow(4px 4px 8px blue);
        }
        .activity.card.replying {
          margin-bottom:2rem;
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

        button i.ms-Icon ~span {
          margin-left:0.6rem;
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

        .card-footer ~ activity-item {
            border-left: solid thick #f7f7f7;
        }
        </style>`;

      const componentHtml = html`
        <div class="activity card ${classMap({"replying":this.isReplying, "new":this.isNew, "hideControls":this.hideControls})}" @resetActivity=${this.resetHandler} dir="ltr">
          <div class="card-header">
            <div class="avatar"><img src="images/genericuser.png" class="img-thumbnail rounded" /></div>
            <div class="author ml-1">${this.author?.displayName}</div>
            <span @click=${this.shareHandler} class="share control badge badge-pill badge-light showOnHover">
              <i class="ms-Icon ms-Icon--Share" aria-hidden="true"></i>
            </span>
            <span class="bookmark control badge badge-pill badge-light">
              <i class="ms-Icon ms-Icon--AddBookmark" aria-hidden="true"></i>
            </span>
          </div>
          <div class="card-body">
            <div style="text-align:right;"><small class="timestamp text-muted" title="${this.created?.toLocaleString(DateTime.DATETIME_SHORT)}">${(Number(DateTime.local()) - Number(this.created)) < 1000 ? "just now" : this.created.toRelative()}</small></div>
            <div class="content">${unsafeHTML(this.content)}</div>
            ${this.restreamedActivity ? html`
              <activity-item hide-controls='' .activity=${this.restreamedActivity}
                .content=${this.restreamedActivity.content} .reactions=${this.restreamedActivity.reactionCount}></activity-item>`
              : ''}

          </div>
          <div class="card-footer">
            <div class="reactions" @click=${this.reactionHandler}>
              <button type="button" data-reaction="${ReactionType.Happy}" class="${classMap({"active":this.reaction == ReactionType.Happy})} btn btn-sm btn-outline-secondary">
                <span class="emoji">😀</span>
                <span class="badge badge-light">${this.reactions.get(ReactionType.Happy) ? this.reactions.get(ReactionType.Happy) : ''}</span>
                <span class="sr-only">Happy response</span>
              </button>
              <button type="button" data-reaction="${ReactionType.Upset}" class="${classMap({"active":this.reaction == ReactionType.Upset})} btn btn-sm btn-outline-secondary">
                <span class="emoji">😿</span>
                <span class="badge badge-light">${this.reactions.get(ReactionType.Upset) ? this.reactions.get(ReactionType.Upset) : ''}</span>
                <span class="sr-only">Upset response</span>
              </button>
              <button type="button" data-reaction="${ReactionType.Confused}" class="${classMap({"active":this.reaction == ReactionType.Confused})} btn btn-sm btn-outline-secondary">
                <span class="emoji">😵</span>
                <span class="badge badge-light">${this.reactions.get(ReactionType.Confused) ? this.reactions.get(ReactionType.Confused) : ''}</span>
                <span class="sr-only">Confused response</span>
              </button>
              <button type="button" data-reaction="${ReactionType.Heart}" class="${classMap({"active":this.reaction == ReactionType.Heart})} btn btn-sm btn-outline-secondary">
                <span class="emoji">❤</span>
                <span class="badge badge-light">${this.reactions.get(ReactionType.Heart) ? this.reactions.get(ReactionType.Heart) : ''}</span>
                <span class="sr-only">Heart response</span>
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
          ${this.isReplying ? html`<activity-input reply-to=${this.activityId}></activity-input>` : ``}
        ${repeat((this.showComments ? this.replies : []), (i:Activity) => i.id, (i, index) => html`
            <activity-item hide-controls='' .activity=${i}
              .content=${i.content} .reactions=${i.reactionCount}></activity-item>`)}
        </div>`;
        //console.log('reply count ActivityItem ' + this.activityId + ' _update() --- ' + this.replies.length);

    return html`
        ${componentStyles}
        ${componentHtml}`;
  }


  restreamHandler = (evt: Event) => {
    console.log("Clicked to restream ", evt);

    this.dispatchEvent(new CustomEvent('restreamActivity', {
      bubbles: true,
      composed: true,
      detail: {
        activityElem: this      }
    }));
  }

  commentHandler = (evt:Event) => {
    if (this.isReplying == true) return;

    console.log("Clicked to comment ", evt);
    this.isReplying = true;
    //this._update();
  }

  toggleComments = (evt:Event) => {
    this.showComments = !this.showComments;
  }

  shareHandler(evt:Event) {
    console.log("Clicked to share ", evt);
    this.dispatchEvent(new CustomEvent('share', { bubbles: true }));
  }

  reactionHandler = (evt:Event) => {
    console.log(evt.target);
    let currentSelection = (<HTMLElement>evt.target).closest('button');
    if (!currentSelection) { return; }

    const selectedReaction = currentSelection.getAttribute('data-reaction');
    let newReaction = selectedReaction == null ? ReactionType.None : ReactionType[selectedReaction];

    let previousReaction = this.reaction;
    if (newReaction == previousReaction) {
      newReaction = ReactionType.None;
    }

    this.dispatchEvent(new CustomEvent('reactionChange', {
      bubbles: true,
      composed: true,
      detail: {
        newReaction,
        previousReaction
      }
    }));

    this.reaction = newReaction ?? ReactionType.None;
    if (previousReaction) {
      let prevCount = this.reactions.get(ReactionType[previousReaction]) ?? 0;
      this.reactions.set(ReactionType[previousReaction], --prevCount);
    }
    if (this.reaction) {
      let curCount = this.reactions.get(ReactionType[this.reaction]) ?? 0;
      this.reactions.set(ReactionType[this.reaction], ++curCount);
    }
    this._update();
  }

  // publishHandler = (evt:Event) => {
  //   console.log("Received publish at the ActivityItem, let propogate");
  //   // evt.stopPropagation();
  //   // this.dispatchEvent(new CustomEvent("publishActivity", {
  //   //   bubbles: true,
  //   //   composed: true,
  //   //   detail: (evt as CustomEvent).detail
  //   // }));
  // }

  resetHandler = (evt:Event) => {
    console.log("reset event received by Item");
    evt.stopPropagation();
    this.isReplying = false;
  }

  connectedCallback() {

    this._update();
  }

  _update() {
    console.log("this_ " + this.activityId + " replies: " + this.replies.length);
    render(this._template(), this._shadowRoot);
  }

  static get observedAttributes() {
    return ['reaction', 'hide-controls', 'new', 'replying', 'show-comments'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue == newValue) return;
    switch (name) {
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
        break;
      // case 'reaction':
      //   break;
    }
    this._update();
  }

  undoReactionChange = (reason) => {
    this.reaction = this.previousReaction;
    console.warn("Undo Reaction Change.  Reason: ", reason);
  }


  clone = () => {
    let clone = <ActivityItem>this.cloneNode(false);
    clone.activityId = this.activityId;
    clone.author = this.author;
    clone.content = this.content;
    clone.created = this.created;
    clone.isReplying = false;
    clone.hideControls = true;
    return clone;
  }
}