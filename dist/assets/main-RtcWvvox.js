import{c as e,d as t,i as n,l as r,m as i,p as a,r as o}from"./widget-CFC21BOE.js";var s=`valorant-rank-widget:config`,c={...t},l=null,u=null,d=null,f=null;function p(){try{let e=localStorage.getItem(s);return e?JSON.parse(e):{}}catch{return{}}}function m(){try{localStorage.setItem(s,JSON.stringify(c))}catch{}}function h(){let e=r(c);return`${window.location.origin+window.location.pathname.replace(/\/$/,``)}/widget/?${e.toString()}`}var g={default:{},valorant_red:{accent:`#ff4655`,accentLight:`#ff7b85`,accentGlow:`rgba(255,70,85,0.28)`,cardWidth:460,cardRadius:18,bgOpacity:0},valorant_blue:{accent:`#00d4ff`,accentLight:`#7de7ff`,accentGlow:`rgba(0,212,255,0.28)`,cardWidth:460,cardRadius:18,bgOpacity:0},valorant_green:{accent:`#00ffa3`,accentLight:`#7dffb8`,accentGlow:`rgba(0,255,163,0.28)`,cardWidth:460,cardRadius:18,bgOpacity:0},valorant_purple:{accent:`#b026ff`,accentLight:`#d17bff`,accentGlow:`rgba(176,38,255,0.28)`,cardWidth:460,cardRadius:18,bgOpacity:0},minimal:{accent:`#ffffff`,accentLight:`#aaaaaa`,accentGlow:`rgba(255,255,255,0.12)`,cardWidth:400,cardRadius:16,cardOpacity:.88,bgOpacity:0,showGrid:!1,fontSizeScale:.9},neon:{accent:`#ff0099`,accentLight:`#ff66cc`,accentGlow:`rgba(255,0,153,0.45)`,cardWidth:520,cardRadius:22,bgOpacity:0,showGrid:!0,fontSizeScale:1.05},valorant_icebox:{accent:`#00eaff`,accentLight:`#99f7ff`,accentGlow:`rgba(0,234,255,0.28)`,cardWidth:460,cardRadius:18,bgImage:`https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/stylizedbackgroundimage.png`,bgOpacity:.35},valorant_haven:{accent:`#ffaa00`,accentLight:`#ffd06b`,accentGlow:`rgba(255,170,0,0.28)`,cardWidth:460,cardRadius:18,bgImage:`https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/stylizedbackgroundimage.png`,bgOpacity:.35},valorant_bind:{accent:`#ffaa00`,accentLight:`#ffd06b`,accentGlow:`rgba(255,170,0,0.28)`,cardWidth:460,cardRadius:18,bgImage:`https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/stylizedbackgroundimage.png`,bgOpacity:.35},valorant_ascent:{accent:`#ff4655`,accentLight:`#ff7b85`,accentGlow:`rgba(255,70,85,0.28)`,cardWidth:460,cardRadius:18,bgImage:`https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/stylizedbackgroundimage.png`,bgOpacity:.35}};function _(e){let t=g[e]??g.default;Object.assign(c,t)}function v(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function y(){let t=document.getElementById(`preview-widget`);if(u){t.innerHTML=`<div class="loading error">${v(u)}</div>`;return}if(!l){t.innerHTML=`<div class="loading">Menunggu data rank...</div>`;return}e(t,c,l)}function b(){m();let e=document.getElementById(`generated-url`);c.name&&c.tag?e.value=h():e.value=``}async function x(){if(!c.name||!c.tag){l=null,u=null,y(),b();return}try{u=null,l=await a(c.name,c.tag,c.region),c.name!==f&&(i(`player_entered`,{name:c.name,tag:c.tag}),f=c.name)}catch(e){u=e instanceof Error?e.message:`Failed to load`,l=null}y(),b()}function S(){d&&clearTimeout(d),d=setTimeout(x,600)}function C(e){let n=g[e];return n?{bgImage:n.bgImage??``,bgOpacity:n.bgOpacity??t.bgOpacity}:{bgImage:``,bgOpacity:t.bgOpacity}}function w(){let e=document.getElementById(`bg-image`),t=document.getElementById(`bg-preset`),n=document.getElementById(`bg-opacity`);e&&(e.value=c.bgImage),t&&(t.value=Object.keys(g).find(e=>g[e].bgImage===c.bgImage)??``),n&&(n.value=String(c.bgOpacity))}function T(){let e=document.getElementById(`name`);e.value=c.name,e.addEventListener(`input`,()=>{c.name=e.value.trim(),b(),S()});let r=document.getElementById(`tag`);r.value=c.tag,r.addEventListener(`input`,()=>{c.tag=r.value.trim(),b(),S()});let a=document.getElementById(`region`);a.value=c.region,a.addEventListener(`change`,()=>{c.region=a.value,S(),b()});for(let[e,t]of Object.entries({"show-avatar":`showAvatar`,"show-name":`showName`,"show-change":`showChange`,"show-grid":`showGrid`,"show-history":`showMatchHistory`,sound:`sound`})){let n=document.getElementById(e);n&&(n.checked=c[t],n.addEventListener(`change`,()=>{c[t]=n.checked,y(),b()}))}let s=document.getElementById(`refresh-interval`);s.value=String(c.refreshInterval),s.addEventListener(`change`,()=>{c.refreshInterval=parseInt(s.value,10),b()});let u=document.getElementById(`accent`),d=document.getElementById(`accent-light`),f=document.getElementById(`card-width`),p=document.getElementById(`card-radius`),m=document.getElementById(`font-size`),h=document.getElementById(`card-opacity`);if(u&&(u.value=c.accent,u.addEventListener(`input`,()=>{c.accent=u.value,y(),b()})),d&&(d.value=c.accentLight,d.addEventListener(`input`,()=>{c.accentLight=d.value,y(),b()})),f){f.value=String(c.cardWidth);let e=document.getElementById(`card-width-val`);e&&(e.textContent=String(c.cardWidth)),f.addEventListener(`input`,()=>{c.cardWidth=parseInt(f.value||String(t.cardWidth),10),e&&(e.textContent=String(c.cardWidth)),y(),b()})}if(p){p.value=String(c.cardRadius);let e=document.getElementById(`card-radius-val`);e&&(e.textContent=String(c.cardRadius)),p.addEventListener(`input`,()=>{c.cardRadius=parseInt(p.value||String(t.cardRadius),10),e&&(e.textContent=String(c.cardRadius)),y(),b()})}m&&(m.value=String(c.fontSizeScale),m.addEventListener(`input`,()=>{c.fontSizeScale=parseFloat(m.value||String(t.fontSizeScale)),y(),b()})),h&&(h.value=String(c.cardOpacity),h.addEventListener(`input`,()=>{c.cardOpacity=parseFloat(h.value||String(t.cardOpacity)),y(),b()}));let g=document.getElementById(`bg-image`),v=document.getElementById(`bg-preset`),x=document.getElementById(`bg-opacity`);g&&(g.value=c.bgImage,g.addEventListener(`input`,()=>{c.bgImage=g.value.trim(),v&&(v.value=``),y(),b()})),v&&(w(),v.addEventListener(`change`,()=>{let{bgImage:e,bgOpacity:t}=C(v.value);c.bgImage=e,c.bgOpacity=t,g&&(g.value=c.bgImage),x&&(x.value=String(c.bgOpacity)),y(),b()}));let T=document.getElementById(`preset`);T&&(T.value=c.preset,T.addEventListener(`change`,()=>{c.preset=T.value,_(c.preset),w(),y(),b()})),x&&(x.value=String(c.bgOpacity),x.addEventListener(`input`,()=>{c.bgOpacity=parseFloat(x.value||String(t.bgOpacity)),y(),b()}));let E=document.getElementById(`design`);E&&(E.value=c.design,E.addEventListener(`change`,()=>{c.design=E.value,y(),b()})),document.querySelectorAll(`.demo-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.event,r=document.getElementById(`preview-widget`);if(!l){r.innerHTML=`<div class="loading">Isi Riot Name + Tag dulu untuk preview</div>`;return}o(r,t),n(t)})}),document.getElementById(`copy-url`).addEventListener(`click`,()=>{let e=document.getElementById(`generated-url`);if(e.value){navigator.clipboard.writeText(e.value),i(`widget_url_copied`,{name:c.name,tag:c.tag});let t=document.getElementById(`copy-url`);t.textContent=`Copied!`,setTimeout(()=>t.textContent=`Copy`,1500)}}),document.getElementById(`reset-btn`).addEventListener(`click`,()=>{let{name:e,tag:n}=c;if(c={...t,name:e,tag:n},s.value=String(c.refreshInterval),a.value=c.region,u&&(u.value=c.accent),d&&(d.value=c.accentLight),f){f.value=String(c.cardWidth);let e=document.getElementById(`card-width-val`);e&&(e.textContent=String(c.cardWidth))}if(p){p.value=String(c.cardRadius);let e=document.getElementById(`card-radius-val`);e&&(e.textContent=String(c.cardRadius))}m&&(m.value=String(c.fontSizeScale)),h&&(h.value=String(c.cardOpacity)),E&&(E.value=c.design),w(),y(),b()})}function E(){c={...t,...p()};let e=document.getElementById(`app`);e.innerHTML=`
    <div class="customizer">
      <header class="header">
        <h1 class="title">Valorant Rank Widget</h1>
        <p class="subtitle">OBS browser source widget for Valorant rank + RR</p>
      </header>

      <div class="layout">
        <div class="panel settings-panel">
          <h2 class="panel-title">Settings</h2>

          <div class="field">
            <label class="field-label" for="name">Riot Name</label>
            <div class="name-tag-row">
              <input type="text" id="name" class="input" placeholder="Name">
              <input type="text" id="tag" class="input tag-input" placeholder="#Tag">
            </div>
          </div>
          <div class="field">
            <label class="field-label" for="region">Region</label>
            <select id="region" class="input">
              <option value="ap">AP</option>
              <option value="eu">EU</option>
              <option value="na">NA</option>
              <option value="kr">KR</option>
              <option value="latam">LATAM</option>
              <option value="br">BR</option>
            </select>
          </div>

          <div class="section">
            <h3 class="section-title">Display Options</h3>
            <label class="checkbox-row"><input type="checkbox" id="show-avatar" checked><span>Show rank icon</span></label>
            <label class="checkbox-row"><input type="checkbox" id="show-name" checked><span>Show name + tag</span></label>
            <label class="checkbox-row"><input type="checkbox" id="show-grid" checked><span>Show grid</span></label>
            <label class="checkbox-row"><input type="checkbox" id="sound" checked><span>Sound alert</span></label>
          </div>

          <div class="section">
            <h3 class="section-title">Color</h3>
            <div class="field">
              <label class="field-label" for="accent">Accent</label>
              <input type="color" id="accent" class="input color-input" value="#ff4655">
            </div>
            <div class="field">
              <label class="field-label" for="accent-light">Accent Light</label>
              <input type="color" id="accent-light" class="input color-input" value="#ff7b85">
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="card-width">Card Width <span class="field-val" id="card-width-val">460</span></label>
            <input type="range" id="card-width" class="input range-input" value="460" min="300" max="800" step="10">
          </div>

          <div class="field">
            <label class="field-label" for="card-radius">Card Radius <span class="field-val" id="card-radius-val">18</span></label>
            <input type="range" id="card-radius" class="input range-input" value="18" min="0" max="40" step="1">
          </div>

          <div class="field">
            <label class="field-label" for="font-size">Font Size Scale</label>
            <input type="range" id="font-size" class="input range-input" value="1" min="0.8" max="1.4" step="0.05">
          </div>

          <div class="field">
            <label class="field-label" for="card-opacity">Background Opacity</label>
            <input type="range" id="card-opacity" class="input range-input" value="0.92" min="0.6" max="1" step="0.02">
          </div>

          <div class="field">
            <label class="field-label" for="preset">Preset Overlay</label>
            <select id="preset" class="input">
              <option value="default">Default</option>
              <option value="valorant_red">Valorant Red</option>
              <option value="valorant_blue">Valorant Blue</option>
              <option value="valorant_green">Valorant Green</option>
              <option value="valorant_purple">Valorant Purple</option>
              <option value="minimal">Minimal</option>
              <option value="neon">Neon</option>
            </select>
          </div>

          <div class="field">
            <label class="field-label" for="design">Design Layout</label>
            <select id="design" class="input">
              <option value="classic">Classic</option>
              <option value="centered">Centered</option>
              <option value="slim">Slim</option>
              <option value="hero">Hero</option>
            </select>
          </div>

          <div class="section">
            <h3 class="section-title">Background</h3>
            <div class="field">
              <label class="field-label" for="bg-preset">Map Background</label>
              <select id="bg-preset" class="input">
                <option value="">None</option>
                <option value="default">Default</option>
                <option value="valorant_ascent">Ascent</option>
                <option value="valorant_bind">Bind</option>
                <option value="valorant_haven">Haven</option>
                <option value="valorant_icebox">Icebox</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label" for="bg-image">Custom Background Image URL</label>
              <input type="text" id="bg-image" class="input" placeholder="https://... or leave empty for default">
            </div>
            <div class="field">
              <label class="field-label" for="bg-opacity">Background Image Opacity</label>
              <input type="range" id="bg-opacity" class="input range-input" value="0.35" min="0" max="0.8" step="0.05">
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="refresh-interval">Refresh interval</label>
            <select id="refresh-interval" class="input">
              <option value="30" selected>30 seconds</option>
              <option value="60">1 minute</option>
              <option value="180">3 minutes</option>
              <option value="300">5 minutes</option>
            </select>
          </div>

          <button class="btn btn-secondary" id="reset-btn">Restore defaults</button>
        </div>

        <div class="panel preview-panel">
          <h2 class="panel-title">Widget Preview</h2>
          <div id="preview-widget" class="preview-area"></div>

          <div class="demo-section">
            <label class="field-label">Demo Animations</label>
            <div class="demo-row">
              <button class="btn btn-secondary demo-btn" data-event="rankup">Rank Up</button>
              <button class="btn btn-secondary demo-btn" data-event="derank">Derank</button>
              <button class="btn btn-secondary demo-btn" data-event="win">Win</button>
              <button class="btn btn-secondary demo-btn" data-event="lose">Lose</button>
              <button class="btn btn-secondary demo-btn" data-event="tie">Tie</button>
            </div>
            <span class="field-hint">Preview animasi yang muncul saat event terdeteksi di widget.</span>
          </div>

          <div class="field" style="margin-top: 16px;">
            <label class="field-label">Widget URL</label>
            <div class="url-row">
              <input type="text" id="generated-url" class="input url-input" readonly placeholder="Enter name + tag">
              <button class="btn btn-primary" id="copy-url">Copy</button>
            </div>
            <span class="field-hint">Add this URL as Browser Source in OBS</span>
          </div>
        </div>
      </div>

      <footer class="footer">
        <p>Valorant Rank Widget · Data from <a href="https://api.henrikdev.xyz/dashboard" target="_blank">API Henrik.xyz</a></p>
      </footer>
    </div>
  `,T();let n=new URLSearchParams(window.location.search),r=n.get(`name`),i=n.get(`tag`),a=n.get(`region`),o=n.get(`design`);if(r&&(document.getElementById(`name`).value=r,c.name=r),i&&(document.getElementById(`tag`).value=i,c.tag=i),a&&(c.region=a,document.getElementById(`region`).value=a),o){c.design=o;let e=document.getElementById(`design`);e&&(e.value=o)}c.name&&c.tag?x():(y(),b())}E();