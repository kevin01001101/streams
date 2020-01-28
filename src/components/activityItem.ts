import { Reaction } from "../models/activity";
import { html, render, TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DateTime } from "luxon";


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
         /* align-items:flex-end;*/
        }

        .avatar img {
          height:40px;
          width:40px;
        }

        .author {
          flex-grow:1;
        }

        .reactions .emoji {
          padding:0.5rem;
          border-radius:4px;
        }

        .reactions .emoji.active {
          background-color:silver;

        }

        .reactions .emoji:hover,
        .reactions .emoji.active:hover {
          cursor:pointer;
          background-color:rgba(128,128,128,0.7);
        }

        .card-footer {
          display:flex;
          padding:0.5rem;
          justify-content:space-around;
        }

        button i.ms-Icon {
          margin-right:0.6rem;
        }

        </style>
      <div class="activity card">
        <div class="card-header">
          <div class="avatar"><img src="images/genericuser.png" class="img-thumbnail rounded" /></div>
          <div class="author ml-1">${this.authorName}</div>
          <i class="ms-Icon ms-Icon--AddBookmark" aria-hidden="true"></i>
        </div>
        <div class="card-body">
          <div style="text-align:right;"><small class="timestamp text-muted" title="${this.timestamp.toLocaleString(DateTime.DATETIME_SHORT)}">${this.timestamp.toRelative()}</small></div>
          <div class="content">${unsafeHTML(this.content)}</div>
        </div>
        <div class="card-footer">
          <div class="reactions">
            <span class="emoji" title="happy">😀</span>
            <span class="emoji" title="upset">😡</span>
            <span class="emoji" title="confused">😕</span>
            <span class="emoji" title="clap">👏</span>
          </div>
          <button type="button" class="btn btn-sm btn-outline-secondary"><i class="ms-Icon ms-Icon--NoteReply" aria-hidden="true"></i><span>Restream</span></button>
          <button type="button" class="btn btn-sm btn-outline-secondary"><i class="ms-Icon ms-Icon--CommentAdd" aria-hidden="true"></i><span>Comment</span></button>
          <button type="button" class="btn btn-sm btn-outline-secondary"><i class="ms-Icon ms-Icon--Share" aria-hidden="true"></i><span>Share</span></button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.shadowRoot?.querySelector('.reactions')?.addEventListener('click', (evt) => {
      let targetElem = <HTMLElement>evt.target;
      if (targetElem.tagName == "SPAN" && targetElem.classList.contains('emoji')) {
        console.log("an emoji was selected");
        if (targetElem.classList.contains('active')) {
          targetElem.classList.remove('active');
        } else {
          this.shadowRoot?.querySelectorAll('.reactions .emoji').forEach(elem => {
            elem.classList.remove('active');
          });
          targetElem.classList.add('active');
        }
      }
    });

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