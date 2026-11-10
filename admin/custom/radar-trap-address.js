import{d as e,f as t,n,s as r,t as i}from"./radar-trap-i18n-CY8rYRpP.js";var a=[`de`,`en`,`fr`,`it`];async function o(e,t,n,r){if(t){let i=new URLSearchParams({access_token:t,autocomplete:`true`,limit:`6`,language:n===`zh-cn`?`zh`:n,types:`address,poi,place,locality,neighborhood,postcode`}),a=await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(e)}.json?${i.toString()}`,{signal:r}),o=await a.json();if(!a.ok)throw Error(o.message||a.statusText);return(o.features||[]).map(e=>({address:e.place_name||``,coordinates:e.geometry?.coordinates||e.center})).filter(e=>e.address&&Array.isArray(e.coordinates))}let i=new URLSearchParams({q:e,limit:`6`});a.includes(n)&&i.set(`lang`,n);let o=await fetch(`https://photon.komoot.io/api/?${i.toString()}`,{signal:r});if(!o.ok)throw Error(o.statusText||String(o.status));return((await o.json()).features||[]).map(e=>{let t=e.properties||{},n=t.street?[t.street,t.housenumber].filter(Boolean).join(` `):``,r=[t.postcode,t.city||t.district].filter(Boolean).join(` `),i=[t.name===t.street?``:t.name,n,r,t.country].filter(Boolean);return{address:[...new Set(i)].join(`, `),coordinates:e.geometry?.coordinates}}).filter(e=>e.address&&Array.isArray(e.coordinates))}var s=`
:host { display: block; font-family: var(--iob-font-family, inherit); font-size: var(--iob-font-size, 14px); }
.box { position: relative; height: 100%; }
input {
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    border: 0;
    border-bottom: 1px solid var(--iob-text-secondary, #888);
    background: transparent;
    color: var(--iob-text, inherit);
    font: inherit;
    font-size: 16px;
    padding: 4px 0;
    outline: none;
}
input:focus { border-bottom: 2px solid var(--iob-primary, #3399cc); padding-bottom: 3px; }
.status { font-size: 12px; color: var(--iob-text-secondary, #888); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status.missing { color: var(--iob-warning, #ed6c02); }
.status.error { color: var(--iob-error, #d32f2f); }
ul {
    position: absolute;
    left: 0;
    right: 0;
    top: 34px;
    z-index: 1500;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    background: var(--iob-paper, #fff);
    color: var(--iob-text, #000);
    border-radius: var(--iob-border-radius, 4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-height: 260px;
    overflow-y: auto;
}
ul[hidden] { display: none; }
li { padding: 6px 12px; cursor: pointer; line-height: 1.3; }
li.active, li:hover { background: color-mix(in srgb, var(--iob-primary, #3399cc) 18%, transparent); }
li.info { cursor: default; color: var(--iob-text-secondary, #888); background: none; }
`,c=class extends e{#e;#t;#n;#r=[];#i=-1;#a=null;#o=null;#s=n(`en`);#c=``;constructor(){super();let e=this.attachShadow({mode:`open`}),t=document.createElement(`style`);t.textContent=s;let n=document.createElement(`div`);n.className=`box`,this.#e=document.createElement(`input`),this.#e.type=`text`,this.#e.autocomplete=`off`,this.#e.spellcheck=!1,this.#t=document.createElement(`div`),this.#t.className=`status`,this.#n=document.createElement(`ul`),this.#n.hidden=!0,this.#n.setAttribute(`role`,`listbox`),n.append(this.#e,this.#n,this.#t),e.append(t,n),this.#e.addEventListener(`input`,()=>this.#d()),this.#e.addEventListener(`keydown`,e=>this.#f(e)),this.#e.addEventListener(`blur`,()=>{setTimeout(()=>this.#m(!0),150)}),this.#n.addEventListener(`mousedown`,e=>{e.preventDefault();let t=e.target.closest(`li`),n=t?Number(t.dataset.index):-1;n>=0&&this.#r[n]&&this.#p(this.#r[n])})}disconnectedCallback(){super.disconnectedCallback(),this.#u()}#l(){return this.shadowRoot?.activeElement===this.#e}#u(){this.#a&&=(clearTimeout(this.#a),null),this.#o?.abort(),this.#o=null}#d(){this.#u(),this.#c=``;let e=this.#e.value.trim();e.length<3?(this.#r=[],this.#h(!1)):this.#a=setTimeout(()=>{this.#a=null;let t=new AbortController;this.#o=t,o(e,this.settings.token,this.systemLang,t.signal).then(e=>{t.signal.aborted||(this.#r=e,this.#i=e.length?0:-1,this.#h(!0))}).catch(e=>{t.signal.aborted||(this.#r=[],this.#c=this.#s(`search_failed`,e?.message||String(e)),this.#h(!1),this.render())})},350)}#f(e){if(e.stopPropagation(),e.key===`ArrowDown`||e.key===`ArrowUp`){if(this.#r.length){e.preventDefault();let t=e.key===`ArrowDown`?1:-1;this.#i=(this.#i+t+this.#r.length)%this.#r.length,this.#h(!0)}}else if(e.key===`Enter`){e.preventDefault();let t=this.#r[this.#i];t&&this.#p(t)}else e.key===`Escape`&&(e.preventDefault(),this.#m(!0))}#p(e){this.#u(),this.#e.value=e.address,this.#r=[],this.#h(!1),this.changeValue({address:e.address,geometry:{type:`Point`,coordinates:[e.coordinates[0],e.coordinates[1]]}}),this.render()}#m(e){this.#u(),this.#r=[],this.#h(!1),e&&!this.#l()&&(this.#e.value=this.value?.address||``,this.#c=``,this.render())}#h(e){e?(this.#n.innerHTML=this.#r.length?this.#r.map((e,t)=>`<li role="option" data-index="${t}" class="${t===this.#i?`active`:``}">${i(e.address)}</li>`).join(``):`<li class="info">${i(this.#s(`no_address_found`))}</li>`,this.#n.hidden=!1):(this.#n.hidden=!0,this.#n.replaceChildren())}render(){this.#s=n(this.systemLang),this.#e.placeholder=this.#s(`search_address`);let e=this.value;this.#l()||(this.#e.value=e?.address||``);let t=e?.geometry?.coordinates;this.#c?(this.#t.className=`status error`,this.#t.textContent=this.#c):Array.isArray(t)&&t.length===2?(this.#t.className=`status`,this.#t.textContent=`${Number(t[1]).toFixed(5)}, ${Number(t[0]).toFixed(5)}`):(this.#t.className=`status missing`,this.#t.textContent=this.#s(`pick_suggestion`))}};t(r.address.tag,c);