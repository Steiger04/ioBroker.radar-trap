import{a as e,d as t,f as n,i as r,n as i,o as a,r as o,s,t as c}from"./radar-trap-i18n-CY8rYRpP.js";import{a as l,c as u,d,f,i as p,l as m,n as h,r as g,s as _,t as v,u as y}from"./radar-trap-maps-CmO_EF0K.js";var b=`
.trap-popup { min-width: 200px; max-width: 300px; font-size: 13px; line-height: 1.4; }
.trap-popup .head {
    background: var(--iob-primary, #3399cc);
    color: var(--iob-primary-contrast, #fff);
    padding: 6px 28px 6px 10px;
    font-size: 15px;
    font-weight: 500;
}
.trap-popup .body { padding: 6px 10px 8px; }
.trap-popup .line b { font-weight: 600; }
.trap-popup hr { border: 0; border-top: 1px solid var(--iob-divider, #ddd); margin: 4px 0; }
.maplibregl-popup-close-button { color: var(--iob-primary-contrast, #fff); font-size: 18px; padding: 0 6px; }
`;function x(e,t){return`<div class="line"><b>${c(e)}:</b> ${c(t)}</div>`}function S(e,t){let n=r(e.vmax),i=[];e.typeText&&i.push(x(t(`kind`),t.text(e.typeText))),n&&i.push(x(t(`maximum_speed`),n===`unknown`?t(`unknown_speed`):n)),e.reason&&i.push(x(t(`reason`),String(e.reason))),e.length&&i.push(x(t(`jam_length`),`${e.length} km`)),e.duration&&i.push(x(t(`duration`),`${e.duration} min.`)),e.delay&&i.push(x(t(`delay`),`${e.delay} min.`)),e.createDate&&i.push(x(t(`reported`),String(e.createDate))),e.confirmDate&&i.push(x(t(`confirmed`),String(e.confirmDate)));let a=[];e.state&&a.push(x(t(`state`),String(e.state))),e.street&&a.push(x(t(`street`),String(e.street))),e.zipCode&&e.city&&a.push(x(t(`city`),`${e.zipCode} ${e.city}`)),e.cityDistrict&&a.push(x(t(`city_district`),String(e.cityDistrict)));let o=e.typeDesc?`<div class="head">${c(t.text(String(e.typeDesc)))}</div>`:``,s=i.length&&a.length?`<hr>`:``;return`<div class="trap-popup">${o}<div class="body">${i.join(``)}${s}${a.join(``)}</div></div>`}function C(e,t){let n=[];return e.street&&n.push(x(t(`street`),e.street)),e.city&&n.push(x(t(`city`),`${e.zip||``} ${e.city}`.trim())),`<div class="trap-popup"><div class="head">${c(t(`traffic_closure`))}</div><div class="body">${n.join(``)}</div></div>`}function w(t){return t.instance||e(t.source)?.split(`.`).slice(0,2).join(`.`)||``}var T={refresh:`<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg>`,fit:`<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`},E=`
:host { display: block; font-family: var(--iob-font-family, inherit); font-size: var(--iob-font-size, 14px); color: var(--iob-text, inherit); }
.root { display: flex; flex-direction: column; height: 100%; gap: 6px; box-sizing: border-box; }
.root.widget { padding: 8px 10px 10px; }
/* devices puts its own buttons over the top corners while it is edited */
.root.widget.edit .bar { padding: 0 26px; }
.bar { display: flex; gap: 4px 8px; align-items: center; flex-wrap: wrap; }
/* a narrow tile: the choice and the button in one row, what is going on below */
.root.widget .bar.with-select .info { order: 3; flex-basis: 100%; }
select {
    flex: 1 1 0;
    min-width: 0;
    max-width: 420px;
    height: 32px;
    border: 1px solid var(--iob-divider, #ccc);
    border-radius: var(--iob-border-radius, 4px);
    background: var(--iob-paper, #fff);
    color: var(--iob-text, inherit);
    font: inherit;
    padding: 0 8px;
}
.info {
    flex: 1 1 0;
    min-width: 0;
    font-size: 12px;
    color: var(--iob-text-secondary, #888);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.info.busy { color: var(--iob-primary, #3399cc); }
button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 32px;
    border: 1px solid var(--iob-divider, #ccc);
    border-radius: var(--iob-border-radius, 4px);
    background: transparent;
    color: var(--iob-text, inherit);
    cursor: pointer;
}
button:hover:not(:disabled) { border-color: var(--iob-primary, #3399cc); color: var(--iob-primary, #3399cc); }
button:disabled { opacity: 0.45; cursor: default; }
.banner {
    padding: 6px 10px;
    border-radius: var(--iob-border-radius, 4px);
    background: color-mix(in srgb, var(--iob-warning, #ed6c02) 18%, transparent);
    border: 1px solid var(--iob-warning, #ed6c02);
    font-size: 13px;
}
.banner[hidden] { display: none; }
select[hidden] { display: none; }
/* the button "fit" sits in the controls of the map, in their look */
.maplibregl-ctrl-group button.fit { display: flex; align-items: center; justify-content: center; color: #333; }
.maplibregl-ctrl-group button.fit:disabled { opacity: 0.4; }
.map { position: relative; flex: 1 1 auto; min-height: 200px; border-radius: var(--iob-border-radius, 4px); overflow: hidden; background: var(--iob-background, #eee); }
.message {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    background: color-mix(in srgb, var(--iob-background, #fff) 82%, transparent);
    font-size: 15px;
}
.message[hidden] { display: none; }
${h}
${b}
`;function D(e){let t=Object.values(e||{}).filter(e=>e?.geometry);return t.length?{type:`FeatureCollection`,features:t}:null}var O=class extends t{#e;#t;#n;#r;#i;#a;#o;#s;#c;#l;#u;#d=!1;#f=null;#p=!1;#m=null;#h=``;#g=i(`en`);#_=null;#v=!1;#y=``;#b=null;#x=!1;#S=!1;#C=``;#w=!1;#T=!1;#E=null;#D=``;#O=null;#k;constructor(){super(),this.#e=this.attachShadow({mode:`open`});let e=document.createElement(`style`);e.textContent=E;let t=document.createElement(`div`);t.className=`root`,this.#t=t;let n=document.createElement(`div`);n.className=`bar`,this.#n=n,this.#r=document.createElement(`select`),this.#i=document.createElement(`div`),this.#i.className=`info`,this.#a=document.createElement(`button`),this.#a.type=`button`,this.#a.innerHTML=T.refresh,this.#o=document.createElement(`button`),this.#o.type=`button`,this.#o.className=`fit`,this.#o.innerHTML=T.fit,n.append(this.#r,this.#i,this.#a),this.#s=document.createElement(`div`),this.#s.className=`banner`,this.#s.hidden=!0,this.#c=document.createElement(`div`),this.#c.className=`map`,this.#l=document.createElement(`div`),this.#l.className=`message`,this.#c.append(this.#l),t.append(n,this.#s,this.#c),this.#e.append(e,t),this.#r.addEventListener(`change`,()=>this.#I(this.#r.value)),this.#o.addEventListener(`click`,()=>this.#J(!0)),this.#a.addEventListener(`click`,()=>{let e=this.#A();e&&this.#y&&!this.editMode&&(this.#w=!0,this.setState(`${e}.${this.#y}.cron-job.run`,!0),this.render())}),this.#u=new IntersectionObserver(e=>{this.#d=e.some(e=>e.isIntersecting),this.#d&&this.#B()})}connectedCallback(){super.connectedCallback(),this.#u.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.#u.disconnect(),this.#O?.disconnect(),this.#O=null,this.#R(null),this.#m?.remove(),this.#m=null,this.#f?.remove(),this.#f=null,this.#h=``}getStateIds(e){let t=w(e);return t?[`system.adapter.${t}.alive`]:[]}getObjectIds(e){let t=w(e);return t?[`system.adapter.${t}`]:[]}#A(){return w(this.settings)}#j(){let e=this.#A();return!!e&&!!this.states[`system.adapter.${e}.alive`]?.val}#M(){let e=this.objects[`system.adapter.${this.#A()}`]?.native;return{token:this.settings.token||e?.settings?.mbxAccessToken||``,style:this.settings.style||e?.mapStyle||`osm`}}#N(){return e(this.settings.source)?.split(`.`)[2]||``}#P(){return`radar-trap-map-${this.#A()}`}async#F(){let e=this.socket,t=this.#A();if(!(!e||!t||this.#v)){this.#v=!0;try{let n=await e.sendTo(t,`getSources`,{});if(n?.error)throw Error(n.error);this.#_=n?.sources||[],this.#C=``;let r=this.#N();this.#D=r;let i=this.#y||r;if(!i)try{i=window.localStorage.getItem(this.#P())||``}catch{}this.#_.some(e=>e.id===i)||(i=this.#_[0]?.id||``),this.#v=!1,this.#I(i,!0)}catch(e){this.#_=null,this.#C=this.#g(`load_failed`,e?.message||String(e))}finally{this.#v=!1,this.render()}}}#I(e,t=!1){if(e===this.#y&&!t)return;if(e!==this.#y&&(this.#b=null,this.#m?.remove(),this.#w=!1),this.#y=e,!this.#N())try{window.localStorage.setItem(this.#P(),e)}catch{}let n=this.#_?.find(t=>t.id===e);this.#R(n||null),this.#L(!0)}async#L(e){let t=this.socket,n=this.#A(),r=this.#y;if(!t||!n||!r)this.#q(!1),this.render();else{this.#x=!0,this.render();try{let i=await t.sendTo(n,`getSource`,{id:r});if(i?.error)throw Error(i.error);if(r!==this.#y)return;this.#b=i?.source||null,this.#C=``,this.#q(e)}catch(e){this.#C=this.#g(`load_failed`,e?.message||String(e))}finally{this.#x=!1,this.render()}}}#R(e){let t=this.socket,n=this.#A(),r=e&&n?a(`${n}.${e.id}`,e.type).lastUpdated:``;(this.#E?.id!==r||this.#E.socket!==t)&&(this.#E&&=(this.#E.socket?.unsubscribeState(this.#E.id,this.#z),null),this.#k=void 0,r&&t&&(this.#E={id:r,socket:t},t.subscribeState(r,this.#z)))}#z=(e,t)=>{let n=t?.val;this.#k!==void 0&&n!==this.#k&&(this.#w=!1,this.#L(!1)),this.#k=n??null,this.render()};async#B(){if(!(this.#f||this.#p||!this.isConnected)){this.#p=!0;try{let{maplibre:e,css:t}=await m();if(!this.#e.querySelector(`style.maplibre`)){let e=document.createElement(`style`);e.className=`maplibre`,e.textContent=t,this.#e.prepend(e)}if(!this.isConnected||this.#f)return;let{token:n,style:r}=this.#M();this.#h=`${r}|${n}`;let i=new e.Map({container:this.#c,style:u(r,n),center:[10.45,51.16],zoom:5,attributionControl:{compact:!0}});i.addControl(new e.NavigationControl({}),`top-right`);let a=this.#o;i.addControl({onAdd:()=>{let e=document.createElement(`div`);return e.className=`maplibregl-ctrl maplibregl-ctrl-group`,e.append(a),e},onRemove:()=>a.parentElement?.remove()},`top-right`),i.addControl(new e.FullscreenControl({container:this.#c}),`top-right`),i.addControl(new e.ScaleControl({}),`bottom-left`),this.settings.form||this.#V(),this.#f=i,this.#m=new e.Popup({closeButton:!0,maxWidth:`320px`,offset:12}),y(i,()=>{l(i),p(i),this.#G(),this.#q(this.#S)});for(let e of[v.traps,v.clusters,v.trafficClosure])i.on(`mouseenter`,e,()=>{i.getCanvas().style.cursor=`pointer`}),i.on(`mouseleave`,e,()=>{i.getCanvas().style.cursor=``});i.on(`click`,v.clusters,e=>this.#H(e)),i.on(`click`,v.traps,e=>this.#U(e)),i.on(`click`,v.trafficClosure,e=>this.#W(e))}catch(e){this.#C=this.#g(`load_failed`,e?.message||String(e)),this.render()}finally{this.#p=!1}}}#V(){let e=this.#c.querySelector(`.maplibregl-ctrl-attrib`);if(!e)return;let t=()=>e.classList.remove(`maplibregl-compact-show`);e.classList.contains(`maplibregl-compact`)&&t(),this.#O?.disconnect(),this.#O=new MutationObserver(n=>{n.some(e=>!(e.oldValue||``).split(` `).includes(`maplibregl-compact`))&&e.classList.contains(`maplibregl-compact`)&&t()}),this.#O.observe(e,{attributes:!0,attributeFilter:[`class`],attributeOldValue:!0})}#H(e){let t=e.features?.[0],n=this.#f,r=t&&n?.getSource(t.source);t&&r&&`getClusterExpansionZoom`in r&&r.getClusterExpansionZoom(Number(t.properties?.cluster_id)).then(e=>{n.easeTo({center:t.geometry.coordinates,zoom:e,duration:600})}).catch(()=>void 0)}#U(e){let t=e.features?.[0]?.properties?.trapInfo;if(!t||!this.#f||!this.#m)return;let n;try{n=typeof t==`string`?JSON.parse(t):t}catch{return}this.#m.setLngLat(e.lngLat).setHTML(S(n,this.#g)).addTo(this.#f)}#W(e){let t=e.features?.[0]?.properties?.address;if(!this.#f||!this.#m)return;let n={};try{n=typeof t==`string`?JSON.parse(t):t||{}}catch{}this.#m.setLngLat(e.lngLat).setHTML(C(n,this.#g)).addTo(this.#f)}#G(){let e=this.#f;e?.getSource(g.traps)&&d(e,this.settings.traffic?this.#M().token:``)}#K(){let e=this.#b;return{directions:e?.directions,area:D(e?.areaPolygons),traps:e?.traps,polyLines:e?.polyLines}}#q(e){let t=this.#f;!t||!t.getSource(g.traps)?this.#S||=e:(f(t,this.#K()),e&&(this.#S=!1,this.#J(!1)))}#J(e){let t=this.#K(),n=_([t.directions,t.area,t.traps]);n&&this.#f&&this.#f.fitBounds(n,{padding:40,animate:e,maxZoom:15})}render(){this.#g=i(this.systemLang);let e=this.#g;this.#a.title=e(`refresh`),this.#o.title=e(`fit`),this.#r.title=e(`select_source`);let t=this.#j();t&&(!this.#T||!this.#_)&&!this.#v&&this.socket?(this.#T=!0,this.#F()):t||(this.#T=!1),this.#E&&this.#E.socket!==this.socket&&this.#R(this.#_?.find(e=>e.id===this.#y)||null);let n=this.#N();this.#_&&n!==this.#D&&(this.#D=n,n&&this.#_.some(e=>e.id===n)&&this.#I(n));let r=this.#_||[],a=r.map(e=>`<option value="${c(e.id)}"${e.id===this.#y?` selected`:``}>${c(e.name)}</option>`).join(``);this.#r.dataset.options!==a&&(this.#r.dataset.options=a,this.#r.innerHTML=a),this.#r.value=this.#y,this.#r.disabled=!r.length,this.#r.hidden=this.settings.showSelect===!1,this.#t.className=`root${this.settings.form?``:` widget`}${this.editMode?` edit`:``}`,this.#n.className=this.#r.hidden?`bar`:`bar with-select`;let s=this.#w||this.#b?.status===`loading`;if(this.#i.className=s||this.#x?`info busy`:`info`,s)this.#i.textContent=e(`computing`);else if(this.#x)this.#i.textContent=e(`loading`);else if(this.#b){let t=this.#b.traps?.features?.length||0,n=this.#k??this.#b.timestamp,r=n?o(n,this.systemLang):``;this.#i.textContent=[t?`${t} ${e(`traps`)}`:e(`no_traps`),r?e(`last_update`,r):``].filter(Boolean).join(` - `)}else this.#i.textContent=``;this.#a.disabled=!t||!this.#y||s||this.editMode,this.#o.disabled=!this.#b;let{token:l,style:d}=this.#M(),f=this.settings.changed?e(`save_to_compute`):this.settings.traffic&&!l?e(`traffic_needs_token`):``;this.#s.textContent=f,this.#s.hidden=!f;let p=``;t?this.#C?p=this.#C:this.#_&&!this.#_.length?p=e(`no_sources`):this.#_||(p=e(`loading`)):p=e(`instance_not_started`),this.#l.textContent=p,this.#l.hidden=!p;let m=this.#f;if(m){let e=`${d}|${l}`;e===this.#h?this.#G():(this.#h=e,m.setStyle(u(d,l)))}else this.#d&&this.#B()}};n(s.map.tag,O);