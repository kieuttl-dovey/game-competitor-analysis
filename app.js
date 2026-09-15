(() => {
  'use strict';

  const BASE_STORAGE_KEY = 'game-competitor-analysis-v1';
  const BASE_GITHUB_CONFIG_KEY = 'game-competitor-analysis-github-config-v1';
  const GITHUB_TOKEN_KEY = 'game-competitor-analysis-github-token-v1';
  const SITE_SCOPE = (() => {
    const host=location.hostname||'local';
    if(host.endsWith('.github.io')){
      const seg=(location.pathname||'/').split('/').filter(Boolean);
      return seg[0] || host;
    }
    return host==='local' ? 'local' : `${host}${location.pathname||'/'}`;
  })();
  const STORAGE_KEY = `${BASE_STORAGE_KEY}::${SITE_SCOPE}`;
  const GITHUB_CONFIG_KEY = `${BASE_GITHUB_CONFIG_KEY}::${SITE_SCOPE}`;
  const FACTORS = [
    {key:'coreMechanic', label:'Core mechanic', weight:.20, question:'Cách chơi chính có giống idea gốc không?'},
    {key:'coreLoop', label:'Core loop', weight:.10, question:'Chu trình chơi → hoàn thành mục tiêu → nhận thưởng → chơi tiếp có giống không?'},
    {key:'metaProgression', label:'Meta / Progression', weight:.10, question:'Cách mở level, event, collection và tiến trình dài hạn có giống không?'},
    {key:'audienceTheme', label:'Audience / Theme / Intent', weight:.10, question:'Có nhắm cùng nhóm người chơi, theme và nhu cầu chơi không?'},
    {key:'usp', label:'USP / Value Proposition', weight:.10, question:'Điểm khác biệt chính của game là gì? Có trùng với idea gốc không?'},
    {key:'creatives', label:'Top Creatives / UA Angle', weight:.15, question:'Creative tốt nhất đang bán điểm gì: gameplay, cooking, fail/win, satisfying hay thử thách?'},
    {key:'store', label:'Store Positioning', weight:.05, question:'Icon, screenshot và thông điệp trên store đang bán điều gì? Có gần idea gốc không?'},
    {key:'monetization', label:'Monetization', weight:.10, question:'Game kiếm tiền bằng ads/IAP như thế nào? Vị trí ads, gói bán và giá có gì đáng học?'},
    {key:'balance', label:'Balance / Economy & Difficulty', weight:.05, question:'Game tăng độ khó ra sao? Reward, resource và monet có liên kết với độ khó như thế nào?'},
    {key:'traction', label:'Market Scale / Traction', weight:.05, question:'Game có đủ download, revenue, ranking hoặc creative scale để làm mốc tham khảo không?'}
  ];

  const ORIGINAL_FIELDS = [
    ['workingTitle','Working title'], ['genrePlatform','Genre / Platform'],
    ['coreMechanic','Core mechanic'], ['coreLoop','Core loop'],
    ['metaProgression','Meta / Progression'], ['audienceTheme','Audience / Theme'],
    ['uspHook','USP / Hook dự kiến'], ['monetExpected','Monet dự kiến']
  ];

  let state = loadState();
  let route = {view:'idea', competitorId:null};
  let saveTimer = null;
  let githubLastSha = null;
  let githubBusy = false;

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function canMigrateLegacyStorage(){
    if(!(location.hostname||'').endsWith('.github.io')) return true;
    try{
      const legacyCfg=JSON.parse(localStorage.getItem(BASE_GITHUB_CONFIG_KEY)||'{}');
      return !legacyCfg.repo || legacyCfg.repo===SITE_SCOPE;
    }catch(e){ return false; }
  }
  function loadState(){
    try{
      let raw = localStorage.getItem(STORAGE_KEY);
      if(!raw && canMigrateLegacyStorage()){
        raw=localStorage.getItem(BASE_STORAGE_KEY);
        if(raw) localStorage.setItem(STORAGE_KEY,raw);
      }
      return raw ? JSON.parse(raw) : clone(window.DEFAULT_PROJECT);
    }catch(e){ return clone(window.DEFAULT_PROJECT); }
  }
  function saveState(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      showToast('Đã lưu');
    }, 280);
  }
  function showToast(msg){
    const el=$('#toast'); el.textContent=msg; el.classList.add('show');
    clearTimeout(showToast.t); showToast.t=setTimeout(()=>el.classList.remove('show'),1200);
  }
  function uid(){ return 'comp-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function blankCompetitor(index){
    const factors={}; FACTORS.forEach(f=>factors[f.key]={score:null,analysis:''});
    return {
      id:uid(), name:`Competitor ${String(index).padStart(2,'0')}`,
      identification:{storeLink:'',platform:'',publisher:'',genre:'',marketSignal:'',sourceEvidence:'',marketFocus:'',lastChecked:new Date().toISOString().slice(0,10)},
      why:{reason:'',similarity:'',difference:''}, factors,
      learning:{learn:'',avoid:'',impact:'',risk:'',conclusion:'',sources:''}
    };
  }
  function createBlankProjectState(projectName='New Game — Competitor Analysis'){
    const fresh=clone(window.DEFAULT_PROJECT);
    fresh.projectName=projectName;
    fresh.originalIdea={workingTitle:'',genrePlatform:'',coreMechanic:'',coreLoop:'',metaProgression:'',audienceTheme:'',uspHook:'',monetExpected:''};
    fresh.competitors=[];
    fresh.ideaAdjustment.rows.forEach(r=>{r.competitorsDoing='';r.suggestion='';r.references='';r.rationale='';r.action='KEEP';r.priority='P1';if(r.current)r.current='';});
    fresh.ideaAdjustment.topChanges.forEach(r=>Object.keys(r).forEach(k=>r[k]=k==='priority'?'P1':k==='action'?'ADD':''));
    fresh.ideaAdjustment.final={summary:'',keep:'',add:'',change:'',remove:'',reference:'',call:'ITERATE IDEA',nextTest:''};
    return fresh;
  }
  function getComp(){ return state.competitors.find(c=>c.id===route.competitorId); }
  function getByPath(obj, path){ return path.split('.').reduce((a,k)=>a?.[k],obj); }
  function setByPath(obj, path, value){
    const keys=path.split('.'); let cur=obj;
    keys.slice(0,-1).forEach(k=>{ if(cur[k]==null) cur[k]={}; cur=cur[k]; });
    cur[keys.at(-1)] = value;
  }
  function calc(comp){
    let sum=0, answeredWeight=0, count=0;
    FACTORS.forEach(f=>{
      const raw=comp.factors?.[f.key]?.score;
      const score=(raw===null||raw===''||raw===undefined)?null:Number(raw);
      if(score!=null && !Number.isNaN(score)) {sum += f.weight*score; answeredWeight += f.weight; count++;}
    });
    const provisional = answeredWeight ? sum/(answeredWeight*5) : null;
    const official = count===FACTORS.length ? sum/5 : null;
    let type='Chưa đủ điểm';
    if(official!=null){
      const cm=Number(comp.factors.coreMechanic.score), cl=Number(comp.factors.coreLoop.score), at=Number(comp.factors.audienceTheme.score);
      if(cm>=4 && cl>=4 && at>=4 && official>=.75) type='Direct';
      else if(official>=.60) type='Adjacent';
      else if(official>=.45) type='Benchmark';
      else type='Not relevant';
    }
    return {sum,answeredWeight,count,provisional,official,type};
  }
  function typeClass(type){ return type.toLowerCase().replaceAll(' ','-'); }
  function pillAction(v){ return `<span class="pill ${esc(String(v).toLowerCase())}">${esc(v)}</span>`; }

  function render(){
    $('#projectNameInput').value=state.projectName||'';
    renderSidebar();
    if(route.view==='competitor' && !getComp()) route={view:'idea',competitorId:null};
    route.view==='idea' ? renderIdea() : renderCompetitor(getComp());
  }

  function renderSidebar(){
    const nav=$('#sidebarNav');
    nav.innerHTML=`<button class="nav-item ${route.view==='idea'?'active':''}" data-route="idea"><span class="nav-num">A</span><span class="nav-label">Idea Adjustment</span></button>`+
      state.competitors.map((c,i)=>`<button class="nav-item ${route.competitorId===c.id?'active':''}" data-route="competitor" data-id="${esc(c.id)}"><span class="nav-num">${String(i+1).padStart(2,'0')}</span><span class="nav-label">${esc(c.name||`Competitor ${i+1}`)}</span></button>`).join('');
  }

  function renderGuide(kind){
    const gp=$('#guidePanel');
    if(kind==='idea'){
      gp.innerHTML=`<h3 class="guide-title">HƯỚNG DẪN ĐIỀN TAB</h3><p class="guide-sub">Logic: Idea gốc → xem đối thủ → chốt GIỮ / BỔ SUNG / THAY ĐỔI / BỎ → viết lại idea.</p>
      <table class="guide-table"><thead><tr><th>Mục</th><th>Nên điền gì?</th></tr></thead><tbody>
      <tr><td>1. Idea gốc</td><td>Ghi lại idea ban đầu trước khi xem competitor.</td></tr>
      <tr><td>2. Dữ liệu competitor</td><td>Tự tổng hợp từ Mục 4 của từng tab competitor.</td></tr>
      <tr><td>3. Điều chỉnh idea</td><td>Với từng phần, chốt KEEP / ADD / CHANGE / REMOVE + game tham khảo.</td></tr>
      <tr><td>4. Top thay đổi</td><td>Chọn tối đa 3 thay đổi quan trọng nhất.</td></tr>
      <tr><td>5. Idea sau khi chỉnh</td><td>Review hướng mới sau khi áp dụng các đề xuất.</td></tr>
      <tr><td>6. Kết luận cuối</td><td>Chốt idea nên giữ, iterate, pivot hay drop và nói rõ bước test tiếp.</td></tr>
      </tbody></table><div class="guide-rule"><b>Nguyên tắc:</b> Mỗi đề xuất cần có game / dữ liệu làm căn cứ. Thiếu dữ liệu thì ghi rõ, không suy đoán.</div>`;
    } else {
      gp.innerHTML=`<h3 class="guide-title">HƯỚNG DẪN ĐIỀN TAB</h3><p class="guide-sub">Mục 3 là phần chính. Mục 4 chỉ chốt game này ảnh hưởng gì tới idea gốc.</p>
      <table class="guide-table"><thead><tr><th>Mục</th><th>Nên điền gì?</th></tr></thead><tbody>
      <tr><td>1. Thông tin game</td><td>Xác định đúng game, publisher, platform và nguồn dữ liệu.</td></tr>
      <tr><td>2. Vì sao là competitor</td><td>Nêu ngắn gọn điểm giống/khác quan trọng so với idea gốc.</td></tr>
      <tr><td>3. Fit Score + Phân tích</td><td>Chấm độ giống và giải thích game đang thiết kế yếu tố đó như thế nào. Viết rõ, tránh jargon.</td></tr>
      <tr><td>4. Kết luận</td><td>Chốt điểm nên học, không nên copy, idea cần đổi và rủi ro.</td></tr>
      </tbody></table>
      <div class="score-guide">
        <div class="score-row"><span class="score-badge">1</span><span>Rất khác idea gốc; chỉ tham khảo feature riêng lẻ.</span></div>
        <div class="score-row"><span class="score-badge">2</span><span>Có một số điểm giống nhưng direction chính khác.</span></div>
        <div class="score-row"><span class="score-badge">3</span><span>Overlap vừa; benchmark được nhưng cần adapt nhiều.</span></div>
        <div class="score-row"><span class="score-badge">4</span><span>Rất gần idea; cùng direction chính, khác execution.</span></div>
        <div class="score-row"><span class="score-badge">5</span><span>Gần như cùng direction; có thể xem là direct competitor.</span></div>
      </div>
      <div class="guide-rule"><b>Lưu ý:</b> Score đo mức độ fit với Original Idea, không phải game tốt/xấu. Riêng Market Scale / Traction đo độ mạnh của market proof.</div>`;
    }
  }

  function inputField(label,path,value,opts={}){
    const cls=opts.span2?'field span2':'field';
    const tag=opts.textarea?'textarea':'input';
    return `<div class="${cls}"><label>${esc(label)}</label>${tag==='textarea'?`<textarea data-bind="${esc(path)}" rows="${opts.rows||3}">${esc(value)}</textarea>`:`<input data-bind="${esc(path)}" value="${esc(value)}" ${opts.type?`type="${opts.type}"`:''}/>`}</div>`;
  }

  function renderIdea(){
    renderGuide('idea');
    const ia=state.ideaAdjustment || (state.ideaAdjustment={rows:[],topChanges:[],final:{}});
    const evidence=state.competitors.map((c,i)=>{
      const s=calc(c); const fit=s.official!=null?`${Math.round(s.official*100)}%`:`${s.count}/10 đã chấm`;
      return `<div class="evidence-card">
        <div class="evidence-card-head">
          <div class="evidence-card-title"><span class="evidence-index">${String(i+1).padStart(2,'0')}</span><button class="link-btn" data-open-comp="${esc(c.id)}">${esc(c.name)}</button></div>
          <div class="evidence-card-meta">${s.official!=null?`<span class="pill ${typeClass(s.type)}">${esc(s.type)}</span>`:'<span class="pill not-relevant">Chưa đủ điểm</span>'}<span class="pill adjacent mono">Fit ${esc(fit)}</span></div>
        </div>
        <div class="evidence-card-body">
          <div class="evidence-block"><strong>Điểm nên học</strong><p>${esc(c.learning?.learn||'Chưa điền')}</p></div>
          <div class="evidence-block"><strong>Điểm không nên copy</strong><p>${esc(c.learning?.avoid||'Chưa điền')}</p></div>
          <div class="evidence-block"><strong>Idea gốc nên thay đổi gì</strong><p>${esc(c.learning?.impact||'Chưa điền')}</p></div>
          <div class="evidence-block"><strong>Kết luận</strong><p>${esc(c.learning?.conclusion||'Chưa điền')}</p></div>
        </div>
      </div>`;
    }).join('') || `<div class="empty-state">Chưa có competitor.</div>`;

    const adjustRows=ia.rows.map((r,i)=>{
      const current=r.originalKey?state.originalIdea[r.originalKey]:(r.current||'');
      const actionClass='action-'+String(r.action||'KEEP').toLowerCase();
      const priorityClass='priority-'+String(r.priority||'P1').toLowerCase();
      return `<div class="adjustment-card ${actionClass}">
        <div class="adjustment-card-head">
          <div class="adjustment-category">${esc(r.category)}</div>
          <select class="cell-select action-select ${actionClass}" aria-label="Hành động" data-bind="ideaAdjustment.rows.${i}.action">${['KEEP','ADD','CHANGE','REMOVE'].map(x=>`<option ${r.action===x?'selected':''}>${x}</option>`).join('')}</select>
          <select class="cell-select priority-select ${priorityClass}" aria-label="Mức ưu tiên" data-bind="ideaAdjustment.rows.${i}.priority">${['P0','P1','P2'].map(x=>`<option ${r.priority===x?'selected':''}>${x}</option>`).join('')}</select>
        </div>
        <div class="adjustment-card-body">
          <div class="adjust-field field-current"><span class="mini-label"><span class="field-dot dot-current"></span>Idea hiện tại</span><div class="readonly-box">${esc(current||'Chưa xác định')}</div></div>
          <div class="adjust-field field-competitor"><span class="mini-label"><span class="field-dot dot-competitor"></span>Đối thủ đang làm gì</span><textarea class="cell-textarea" data-bind="ideaAdjustment.rows.${i}.competitorsDoing">${esc(r.competitorsDoing)}</textarea></div>
          <div class="adjust-field span-8 field-suggestion"><span class="mini-label"><span class="field-dot dot-suggestion"></span>Đề xuất cho idea</span><textarea class="cell-textarea" data-bind="ideaAdjustment.rows.${i}.suggestion">${esc(r.suggestion)}</textarea></div>
          <div class="adjust-field span-4 field-reference"><span class="mini-label"><span class="field-dot dot-reference"></span>Game tham khảo</span><input class="cell-input" data-bind="ideaAdjustment.rows.${i}.references" value="${esc(r.references)}"></div>
          <div class="adjust-field span-12 field-rationale"><span class="mini-label"><span class="field-dot dot-rationale"></span>Vì sao nên làm</span><textarea class="cell-textarea" data-bind="ideaAdjustment.rows.${i}.rationale">${esc(r.rationale)}</textarea></div>
        </div>
      </div>`;
    }).join('');

    const changes=ia.topChanges.map((r,i)=>`<div class="change-card">
      <div class="change-card-head"><span class="change-num">THAY ĐỔI ${i+1}</span><select class="cell-select" data-bind="ideaAdjustment.topChanges.${i}.priority">${['P0','P1','P2'].map(x=>`<option ${r.priority===x?'selected':''}>${x}</option>`).join('')}</select></div>
      <div class="change-card-body">
        <div class="change-row"><div class="field"><label>Idea cần thay đổi gì?</label><textarea data-bind="ideaAdjustment.topChanges.${i}.title">${esc(r.title)}</textarea></div><div class="field"><label>Action</label><select data-bind="ideaAdjustment.topChanges.${i}.action">${['KEEP','ADD','CHANGE','REMOVE'].map(x=>`<option ${r.action===x?'selected':''}>${x}</option>`).join('')}</select></div></div>
        <div class="field"><label>Học từ game nào?</label><input data-bind="ideaAdjustment.topChanges.${i}.reference" value="${esc(r.reference)}"></div>
        <div class="field"><label>Vì sao cần đổi?</label><textarea data-bind="ideaAdjustment.topChanges.${i}.why">${esc(r.why)}</textarea></div>
        <div class="field"><label>Kết quả mong đợi</label><textarea data-bind="ideaAdjustment.topChanges.${i}.expected">${esc(r.expected)}</textarea></div>
        <div class="field"><label>Cần test gì?</label><textarea data-bind="ideaAdjustment.topChanges.${i}.test">${esc(r.test)}</textarea></div>
      </div>
    </div>`).join('');

    const revised=ia.rows.map(r=>`<div class="revised-card"><div class="revised-card-head"><h4>${esc(r.category)}</h4>${pillAction(r.action)}</div><p>${esc(r.suggestion || (r.originalKey?state.originalIdea[r.originalKey]:(r.current||'')))}</p><div class="revised-meta"><b>Tham khảo:</b> ${esc(r.references||'—')} · <b>Lý do:</b> ${esc(r.rationale||'—')}</div></div>`).join('');

    $('#mainContent').innerHTML=`
      <div class="page-head"><div><h1 class="page-title">Game Idea Adjustment</h1><p class="page-sub">Idea gốc → phân tích competitor → chốt GIỮ / BỔ SUNG / THAY ĐỔI / BỎ → viết lại idea.</p></div></div>
      <div class="card"><div class="card-head"><div><h2 class="card-title"><span class="section-number">1</span>ORIGINAL IDEA — IDEA TRƯỚC KHI PHÂN TÍCH COMPETITOR</h2></div></div><div class="card-body"><div class="form-grid">${ORIGINAL_FIELDS.map(([k,l],idx)=>inputField(l,`originalIdea.${k}`,state.originalIdea[k]||'',{textarea:idx>1,span2:idx>1,rows:2})).join('')}</div></div></div>

      <div class="card"><div class="card-head"><div><h2 class="card-title"><span class="section-number">2</span>COMPETITOR EVIDENCE — MỖI TAB CON ĐÓNG GÓP GÌ?</h2><div class="card-desc">Tự kéo từ Mục 4 của từng competitor.</div></div></div><div class="card-body"><div class="evidence-list">${evidence}</div></div></div>

      <div class="card"><div class="card-head"><div><h2 class="card-title"><span class="section-number">3</span>IDEA ADJUSTMENT SCORECARD</h2><div class="card-desc">Với từng hạng mục, chốt nên giữ, bổ sung, thay đổi hay bỏ.</div></div></div><div class="card-body"><div class="decision-legend" aria-label="Quy ước màu"><span class="legend-label">Action</span><span class="legend-chip keep">KEEP · Giữ</span><span class="legend-chip add">ADD · Bổ sung</span><span class="legend-chip change">CHANGE · Thay đổi</span><span class="legend-chip remove">REMOVE · Bỏ / tránh</span><span class="legend-sep"></span><span class="legend-label">Priority</span><span class="legend-chip p0">P0 · Quan trọng nhất</span><span class="legend-chip p1">P1 · Quan trọng</span><span class="legend-chip p2">P2 · Có thể làm sau</span></div><div class="adjustment-list">${adjustRows}</div></div></div>

      <div class="card"><div class="card-head"><div><h2 class="card-title"><span class="section-number">4</span>TOP CHANGES — 3 THAY ĐỔI QUAN TRỌNG NHẤT</h2></div></div><div class="card-body"><div class="changes-list">${changes}</div></div></div>

      <div class="card"><div class="card-head"><div><h2 class="card-title"><span class="section-number">5</span>IDEA SAU KHI ĐIỀU CHỈNH</h2></div></div><div class="card-body"><div class="revised-list">${revised}</div></div></div>

      <div class="card"><div class="card-head"><div><h2 class="card-title"><span class="section-number">6</span>KẾT LUẬN CUỐI — IDEA NÊN THAY ĐỔI NHƯ THẾ NÀO?</h2></div></div><div class="card-body">
        <div class="form-grid">${inputField('Idea sau khi điều chỉnh','ideaAdjustment.final.summary',ia.final.summary||'',{textarea:true,span2:true,rows:4})}</div>
        <div class="idea-status" style="margin-top:12px">
          ${['keep','add','change','remove'].map((k,i)=>`<div class="status-box"><strong>${['Giữ lại','Bổ sung','Thay đổi','Bỏ / Tránh'][i]}</strong><textarea data-bind="ideaAdjustment.final.${k}">${esc(ia.final[k]||'')}</textarea></div>`).join('')}
        </div>
        <div class="form-grid" style="margin-top:12px">${inputField('Reference chính','ideaAdjustment.final.reference',ia.final.reference||'',{textarea:true,span2:true,rows:2})}</div>
        <div class="final-call" style="margin-top:14px"><div class="field"><label>Final Call</label><select data-bind="ideaAdjustment.final.call">${['KEEP IDEA','ITERATE IDEA','PIVOT IDEA','DROP IDEA'].map(x=>`<option ${ia.final.call===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>Việc cần test tiếp</label><textarea data-bind="ideaAdjustment.final.nextTest" rows="3">${esc(ia.final.nextTest||'')}</textarea></div></div>
      </div></div>`;
  }

  function renderCompetitor(comp){
    renderGuide('competitor');
    const s=calc(comp);
    const rows=FACTORS.map(f=>{
      const v=comp.factors[f.key]||{score:null,analysis:''};
      const weighted=(v.score===null||v.score==='')?'':(f.weight*Number(v.score)).toFixed(2);
      return `<tr><td class="factor">${esc(f.label)}</td><td class="weight">${Math.round(f.weight*100)}%</td><td class="score"><select class="cell-select" data-bind="factors.${f.key}.score"><option value="">—</option>${[1,2,3,4,5].map(x=>`<option value="${x}" ${Number(v.score)===x?'selected':''}>${x}</option>`).join('')}</select></td><td class="weight mono">${esc(weighted)}</td><td class="question">${esc(f.question)}</td><td class="analysis"><textarea class="cell-textarea" data-bind="factors.${f.key}.analysis">${esc(v.analysis)}</textarea></td></tr>`;
    }).join('');
    const official=s.official!=null?Math.round(s.official*100)+'%':'—';
    const provisional=s.provisional!=null?Math.round(s.provisional*100)+'%':'—';
    $('#mainContent').innerHTML=`
      <div class="page-head"><div><h1 class="page-title">${esc(comp.name||'Competitor')}</h1><p class="page-sub">Điền 10 yếu tố ở Mục 3; Mục 4 chỉ chốt những gì nên học và idea gốc cần thay đổi gì.</p></div><div class="page-actions"><button class="btn secondary" id="duplicateCompBtn">Nhân bản tab</button><button class="btn danger" id="deleteCompBtn">Xóa competitor</button></div></div>

      <div class="card"><div class="card-head"><h2 class="card-title"><span class="section-number">1</span>COMPETITOR IDENTIFICATION</h2></div><div class="card-body"><div class="form-grid three">
        ${inputField('Game name','name',comp.name||'')}
        ${inputField('Store / Link','identification.storeLink',comp.identification.storeLink||'')}
        ${inputField('Platform','identification.platform',comp.identification.platform||'')}
        ${inputField('Publisher','identification.publisher',comp.identification.publisher||'')}
        ${inputField('Genre','identification.genre',comp.identification.genre||'')}
        ${inputField('Status / Market Signal','identification.marketSignal',comp.identification.marketSignal||'',{textarea:true,rows:2})}
        ${inputField('Source / Evidence','identification.sourceEvidence',comp.identification.sourceEvidence||'',{textarea:true,rows:2})}
        ${inputField('Country / Market focus','identification.marketFocus',comp.identification.marketFocus||'')}
        ${inputField('Last checked','identification.lastChecked',comp.identification.lastChecked||'',{type:'date'})}
      </div></div></div>

      <div class="card"><div class="card-head"><h2 class="card-title"><span class="section-number">2</span>VÌ SAO GAME NÀY ĐƯỢC XEM LÀ COMPETITOR?</h2></div><div class="card-body"><div class="form-grid">
        ${inputField('Vì sao là đối thủ?','why.reason',comp.why.reason||'',{textarea:true,span2:true,rows:3})}
        ${inputField('Điểm giống quan trọng nhất','why.similarity',comp.why.similarity||'',{textarea:true,span2:true,rows:3})}
        ${inputField('Điểm khác quan trọng nhất','why.difference',comp.why.difference||'',{textarea:true,span2:true,rows:3})}
      </div></div></div>

      <div class="card"><div class="card-head"><div><h2 class="card-title"><span class="section-number">3</span>COMPETITOR FIT SCORE — 10 YẾU TỐ</h2><div class="card-desc">Điểm đo mức độ fit với Original Idea; Market Scale đo độ mạnh của market proof.</div></div></div><div class="card-body"><div class="table-wrap"><table class="data-table"><thead><tr><th>Yếu tố</th><th>Trọng số</th><th>Score 1–5</th><th>Điểm đóng góp</th><th>Cần xem gì?</th><th>Phân tích / Ý nghĩa</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="score-summary"><div class="metric"><div class="metric-label">Đã chấm</div><div class="metric-value">${s.count}/10</div><div class="metric-note">Cần đủ 10 yếu tố để chốt type</div></div><div class="metric accent"><div class="metric-label">Fit tạm tính</div><div class="metric-value">${provisional}</div><div class="metric-note">Tính trên các yếu tố đã chấm</div></div><div class="metric green"><div class="metric-label">Fit chính thức</div><div class="metric-value">${official}</div><div class="metric-note">Chỉ hiện khi đủ 10/10</div></div><div class="metric orange"><div class="metric-label">Loại competitor</div><div class="metric-value" style="font-size:16px">${esc(s.type)}</div><div class="metric-note">Direct / Adjacent / Benchmark / Not relevant</div></div></div>
      </div></div>

      <div class="card"><div class="card-head"><h2 class="card-title"><span class="section-number">4</span>KẾT LUẬN & ẢNH HƯỞNG TỚI IDEA GỐC</h2></div><div class="card-body"><div class="learning-grid">
        ${learningRow('Điểm nên học / tham khảo','learning.learn',comp.learning.learn)}
        ${learningRow('Điểm không nên copy','learning.avoid',comp.learning.avoid)}
        ${learningRow('Idea gốc nên thay đổi gì','learning.impact',comp.learning.impact)}
        ${learningRow('Rủi ro chính','learning.risk',comp.learning.risk)}
        ${learningRow('Kết luận / đề xuất','learning.conclusion',comp.learning.conclusion)}
        ${learningRow('Nguồn / dữ liệu sử dụng','learning.sources',comp.learning.sources)}
      </div></div></div>`;
  }

  function learningRow(label,path,value){return `<div class="learning-label">${esc(label)}</div><div class="learning-value"><textarea class="cell-textarea" data-bind="${esc(path)}">${esc(value||'')}</textarea></div>`;}

  document.addEventListener('input', onBoundInput);
  document.addEventListener('change', onBoundInput);
  function onBoundInput(e){
    const el=e.target;
    if(!el.matches('[data-bind]')) return;
    let value=el.value;
    if(el.matches('select[data-bind*=".score"]')) value=value===''?null:Number(value);
    const root=route.view==='competitor'?getComp():state;
    setByPath(root,el.dataset.bind,value);
    if(route.view==='competitor' && el.dataset.bind==='name') renderSidebar();
    saveState();
    if(route.view==='competitor' && el.dataset.bind.includes('.score')) renderCompetitor(getComp());
    if(route.view==='idea' && (el.dataset.bind.endsWith('.action') || el.dataset.bind.endsWith('.priority'))) renderIdea();
  }

  document.addEventListener('click', e=>{
    const nav=e.target.closest('[data-route]');
    if(nav){ route=nav.dataset.route==='idea'?{view:'idea',competitorId:null}:{view:'competitor',competitorId:nav.dataset.id}; render(); return; }
    const open=e.target.closest('[data-open-comp]'); if(open){route={view:'competitor',competitorId:open.dataset.openComp};render();return;}
    if(e.target.id==='duplicateCompBtn') duplicateCurrent();
    if(e.target.id==='deleteCompBtn') deleteCurrent();
  });

  $('#projectNameInput').addEventListener('input',e=>{state.projectName=e.target.value;saveState();});
  $('#addCompetitorBtn').addEventListener('click',()=>{ const c=blankCompetitor(state.competitors.length+1); state.competitors.push(c); saveState(); route={view:'competitor',competitorId:c.id}; render(); });
  $('#exportBtn').addEventListener('click',exportJson);
  $('#importBtn').addEventListener('click',()=>$('#importFile').click());
  $('#importFile').addEventListener('change',importJson);
  $('#newProjectBtn').addEventListener('click',newProject);
  $('#printBtn').addEventListener('click',()=>window.print());

  function duplicateCurrent(){
    const c=getComp(); if(!c) return; const n=clone(c); n.id=uid(); n.name=(c.name||'Competitor')+' — Copy'; state.competitors.push(n); saveState(); route={view:'competitor',competitorId:n.id}; render();
  }
  function deleteCurrent(){
    const c=getComp(); if(!c) return; if(!confirm(`Xóa ${c.name}?`)) return; state.competitors=state.competitors.filter(x=>x.id!==c.id); saveState(); route={view:'idea',competitorId:null}; render();
  }
  function exportJson(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(state.projectName||'game-competitor-analysis').replace(/[^a-z0-9-_]+/gi,'_')+'.json'; a.click(); URL.revokeObjectURL(a.href); showToast('Đã export JSON');
  }
  function importJson(e){
    const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{try{const x=JSON.parse(reader.result); if(!x.originalIdea||!Array.isArray(x.competitors)) throw new Error('Sai format'); state=x; localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); route={view:'idea',competitorId:null}; render(); showToast('Import thành công');}catch(err){alert('File JSON không đúng format của template.');}}; reader.readAsText(file); e.target.value='';
  }
  function repoSlug(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().trim().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^[-.]+|[-.]+$/g,'').slice(0,100);
  }
  function newProjectStatus(msg,type=''){
    const el=$('#newProjectStatus'); if(!el) return;
    el.textContent=msg; el.className='github-status'+(type?' '+type:'');
  }
  function openNewProjectModal(){
    const cfg=getGitHubConfig();
    const owner=cfg.owner||inferGitHubDefaults().owner||'';
    const projectName='New Game — Competitor Analysis';
    $('#npProjectName').value=projectName;
    $('#npRepoName').value=repoSlug(projectName.replace(/competitor analysis/ig,'analysis'))||'new-game-analysis';
    $('#npOwner').value=owner;
    $('#npTemplateOwner').value=cfg.owner||owner;
    $('#npTemplateRepo').value=cfg.repo||SITE_SCOPE;
    $('#npDescription').value='Game competitor analysis — SAVA template';
    $('#npVisibility').value='public';
    $('#npEnablePages').checked=true;
    $('#npToken').value=getGitHubToken();
    $('#newProjectResult').hidden=true;
    $('#npOpenRepo').removeAttribute('href');
    $('#npOpenPages').removeAttribute('href');
    newProjectStatus(getGitHubToken()?'Sẵn sàng. Có thể dùng token hiện tại nếu token có đủ quyền tạo repo.':'Cần token có quyền tạo repo mới.','');
    $('#newProjectModal').hidden=false;
  }
  function closeNewProjectModal(){ $('#newProjectModal').hidden=true; }
  function readNewProjectForm(){
    return {
      projectName:$('#npProjectName').value.trim(), repo:$('#npRepoName').value.trim(), owner:$('#npOwner').value.trim(),
      templateOwner:$('#npTemplateOwner').value.trim(), templateRepo:$('#npTemplateRepo').value.trim(),
      description:$('#npDescription').value.trim(), private:$('#npVisibility').value==='private', enablePages:$('#npEnablePages').checked,
      token:$('#npToken').value.trim()
    };
  }
  function validateNewProjectForm(cfg){
    if(!cfg.projectName||!cfg.repo||!cfg.owner||!cfg.templateOwner||!cfg.templateRepo) throw new Error('Thiếu tên project, repo, owner hoặc template repo.');
    if(!/^[A-Za-z0-9._-]{1,100}$/.test(cfg.repo)) throw new Error('Repo name chỉ dùng chữ, số, dấu ., - hoặc _.');
    if(!cfg.token) throw new Error('Cần Fine-grained Personal Access Token để tạo repo mới.');
  }
  async function waitForRepoFile(owner,repo,path,branch,token,attempts=8){
    const url=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${ghEncodePath(path)}`;
    let lastErr=null;
    for(let i=0;i<attempts;i++){
      try{return await githubRequest(url+`?ref=${encodeURIComponent(branch)}`,{headers:githubHeaders(token)});}catch(err){lastErr=err;if(err.status!==404) throw err;}
      await new Promise(r=>setTimeout(r,700+350*i));
    }
    throw lastErr||new Error('Chưa đọc được file từ repo mới.');
  }
  async function enablePagesForRepo(owner,repo,branch,token){
    const url=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pages`;
    for(let i=0;i<5;i++){
      try{
        return await githubRequest(url,{method:'POST',headers:{...githubHeaders(token),'Content-Type':'application/json'},body:JSON.stringify({source:{branch,path:'/'}})});
      }catch(err){
        if(err.status===409){
          try{return await githubRequest(url,{headers:githubHeaders(token)});}catch(e){throw err;}
        }
        if((err.status===404||err.status===422) && i<4){await new Promise(r=>setTimeout(r,900+500*i));continue;}
        throw err;
      }
    }
  }
  async function createNewProjectRepo(){
    if(githubBusy) return;
    const cfg=readNewProjectForm();
    try{
      validateNewProjectForm(cfg); setGitHubToken(cfg.token); githubBusy=true; $('#npCreateBtn').disabled=true;
      newProjectStatus('1/4 — Đang kiểm tra template repo...','working');
      const templateUrl=`https://api.github.com/repos/${encodeURIComponent(cfg.templateOwner)}/${encodeURIComponent(cfg.templateRepo)}`;
      const templateMeta=await githubRequest(templateUrl,{headers:githubHeaders(cfg.token)});
      if(!templateMeta.is_template){
        throw new Error(`Repo ${cfg.templateOwner}/${cfg.templateRepo} chưa được bật “Template repository”. Vào repo → Settings → General → tick “Template repository”, rồi thử lại.`);
      }

      newProjectStatus('2/4 — Đang tạo repo mới từ template...','working');
      const created=await githubRequest(`https://api.github.com/repos/${encodeURIComponent(cfg.templateOwner)}/${encodeURIComponent(cfg.templateRepo)}/generate`,{
        method:'POST', headers:{...githubHeaders(cfg.token),'Content-Type':'application/json'},
        body:JSON.stringify({owner:cfg.owner,name:cfg.repo,description:cfg.description,include_all_branches:false,private:cfg.private})
      });
      const branch=created.default_branch||'main';
      const blank=createBlankProjectState(cfg.projectName);

      newProjectStatus('3/4 — Đang khởi tạo data/project.json trắng...','working');
      const remote=await waitForRepoFile(cfg.owner,cfg.repo,'data/project.json',branch,cfg.token);
      const dataUrl=`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/data/project.json`;
      const initResult=await githubRequest(dataUrl,{
        method:'PUT',headers:{...githubHeaders(cfg.token),'Content-Type':'application/json'},
        body:JSON.stringify({message:`Initialize project: ${cfg.projectName}`,content:utf8ToBase64(JSON.stringify(blank,null,2)),sha:remote.sha,branch})
      });

      let pagesUrl=`https://${cfg.owner}.github.io/${cfg.repo}/`;
      let pagesWarning='';
      if(cfg.enablePages){
        newProjectStatus('4/4 — Đang bật GitHub Pages...','working');
        try{
          const pages=await enablePagesForRepo(cfg.owner,cfg.repo,branch,cfg.token);
          pagesUrl=pages?.html_url||pagesUrl;
        }catch(err){
          pagesWarning=`Repo đã tạo thành công nhưng chưa bật được Pages: ${err.message}. Có thể bật thủ công ở Settings → Pages.`;
        }
      }

      $('#npOpenRepo').href=created.html_url||`https://github.com/${cfg.owner}/${cfg.repo}`;
      $('#npOpenPages').href=pagesUrl;
      $('#npOpenPages').style.display=cfg.enablePages?'inline-flex':'none';
      $('#newProjectResult').hidden=false;
      const status=pagesWarning ? `Đã tạo repo mới. ${pagesWarning}` : 'Hoàn tất. Repo mới đã có project trống và GitHub Pages đang được deploy (có thể mất 1–2 phút).';
      newProjectStatus(status,pagesWarning?'working':'ok');
      showToast('Đã tạo project repo mới');
      return initResult;
    }catch(err){
      let hint='';
      if(err.status===403||err.status===404) hint=' Kiểm tra token: Repository access nên là All repositories; Permissions cần Administration: Read and write, Contents: Read and write, Pages: Read and write.';
      newProjectStatus('Không tạo được project: '+err.message+hint,'error');
    }finally{githubBusy=false;$('#npCreateBtn').disabled=false;}
  }
  function newProject(){ openNewProjectModal(); }


  // ---------- GitHub sync ----------
  function inferGitHubDefaults(){
    const host=location.hostname||'';
    const cfg={owner:'',repo:'',branch:'main',path:'data/project.json',autoLoad:true};
    if(host.endsWith('.github.io')){
      cfg.owner=host.split('.')[0]||'';
      const seg=(location.pathname||'/').split('/').filter(Boolean);
      cfg.repo=seg[0] || (cfg.owner ? cfg.owner+'.github.io' : '');
    }
    return cfg;
  }
  function getGitHubConfig(){
    const defaults=inferGitHubDefaults();
    try{
      let raw=localStorage.getItem(GITHUB_CONFIG_KEY);
      if(!raw && canMigrateLegacyStorage()){
        raw=localStorage.getItem(BASE_GITHUB_CONFIG_KEY);
        if(raw) localStorage.setItem(GITHUB_CONFIG_KEY,raw);
      }
      const saved=JSON.parse(raw||'{}');
      return {...defaults,...saved};
    }catch(e){ return defaults; }
  }
  function getGitHubToken(){ return sessionStorage.getItem(GITHUB_TOKEN_KEY)||''; }
  function setGitHubToken(token){
    if(token) sessionStorage.setItem(GITHUB_TOKEN_KEY,token);
    else sessionStorage.removeItem(GITHUB_TOKEN_KEY);
  }
  function saveGitHubConfig(cfg){
    localStorage.setItem(GITHUB_CONFIG_KEY,JSON.stringify({owner:cfg.owner,repo:cfg.repo,branch:cfg.branch,path:cfg.path,autoLoad:!!cfg.autoLoad}));
  }
  function githubStatus(msg,type=''){
    const el=$('#ghStatus'); if(!el) return;
    el.textContent=msg; el.className='github-status'+(type?' '+type:'');
  }
  function openGitHubModal(){
    const cfg=getGitHubConfig();
    $('#ghOwner').value=cfg.owner||''; $('#ghRepo').value=cfg.repo||''; $('#ghBranch').value=cfg.branch||'main'; $('#ghPath').value=cfg.path||'data/project.json';
    $('#ghToken').value=getGitHubToken(); $('#ghAutoLoad').checked=cfg.autoLoad!==false;
    githubStatus(getGitHubToken()?'Token đang được giữ trong tab này.':'Chưa có token trong phiên hiện tại.');
    $('#githubModal').hidden=false;
  }
  function closeGitHubModal(){ $('#githubModal').hidden=true; }
  function readGitHubForm(){
    return {owner:$('#ghOwner').value.trim(),repo:$('#ghRepo').value.trim(),branch:$('#ghBranch').value.trim()||'main',path:$('#ghPath').value.trim()||'data/project.json',autoLoad:$('#ghAutoLoad').checked,token:$('#ghToken').value.trim()};
  }
  function validateGitHubConfig(cfg,needToken=false){
    if(!cfg.owner||!cfg.repo||!cfg.branch||!cfg.path) throw new Error('Thiếu Owner, Repository, Branch hoặc Data file path.');
    if(needToken && !cfg.token) throw new Error('Cần Fine-grained Personal Access Token để ghi dữ liệu lên GitHub.');
  }
  function githubHeaders(token=''){
    const h={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
    if(token) h.Authorization='Bearer '+token;
    return h;
  }
  function ghEncodePath(path){ return String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/'); }
  function githubContentUrl(cfg){
    return `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${ghEncodePath(cfg.path)}`;
  }
  function utf8ToBase64(text){
    const bytes=new TextEncoder().encode(text); let bin=''; const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk) bin += String.fromCharCode(...bytes.subarray(i,i+chunk));
    return btoa(bin);
  }
  function base64ToUtf8(text){
    const bin=atob(String(text||'').replace(/\n/g,'')); const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  async function githubRequest(url,options={}){
    const res=await fetch(url,options);
    let body=null; try{body=await res.json();}catch(e){}
    if(!res.ok){
      const err=new Error(body?.message || `GitHub API error ${res.status}`); err.status=res.status; err.body=body; throw err;
    }
    return body;
  }
  async function getRemoteFile(cfg,allow404=false){
    const url=githubContentUrl(cfg)+`?ref=${encodeURIComponent(cfg.branch)}`;
    try{
      return await githubRequest(url,{headers:githubHeaders(cfg.token||getGitHubToken())});
    }catch(err){ if(allow404 && err.status===404) return null; throw err; }
  }
  async function testGitHubConnection(){
    const cfg=readGitHubForm();
    try{
      validateGitHubConfig(cfg,false); setGitHubToken(cfg.token); saveGitHubConfig(cfg);
      githubStatus('Đang kiểm tra repo...','working');
      const url=`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`;
      const repo=await githubRequest(url,{headers:githubHeaders(cfg.token)});
      githubStatus(`Kết nối OK: ${repo.full_name}. ${cfg.token?'Có token để ghi dữ liệu.':'Chưa có token: chỉ đọc được repo public.'}`,'ok');
    }catch(err){ githubStatus('Không kết nối được: '+err.message,'error'); }
  }
  async function saveToGitHub(){
    if(githubBusy) return;
    const stored=getGitHubConfig(); const cfg={...stored,token:getGitHubToken()};
    try{
      validateGitHubConfig(cfg,true); githubBusy=true; $('#githubSaveBtn').disabled=true; showToast('Đang lưu GitHub...');
      const remote=await getRemoteFile(cfg,true);
      if(githubLastSha && remote?.sha && remote.sha!==githubLastSha){
        const overwrite=confirm('File trên GitHub đã thay đổi từ lần bạn load gần nhất. Ghi đè bằng dữ liệu hiện tại?');
        if(!overwrite) return;
      }
      const payload={message:`Update analysis: ${state.projectName||'Game Competitor Analysis'}`,content:utf8ToBase64(JSON.stringify(state,null,2)),branch:cfg.branch};
      if(remote?.sha) payload.sha=remote.sha;
      const result=await githubRequest(githubContentUrl(cfg),{method:'PUT',headers:{...githubHeaders(cfg.token),'Content-Type':'application/json'},body:JSON.stringify(payload)});
      githubLastSha=result?.content?.sha || null;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      showToast('Đã lưu lên GitHub');
    }catch(err){ alert('Không lưu được lên GitHub.\n\n'+err.message+'\n\nKiểm tra token có quyền Contents: Read and write và đúng repo/branch.'); }
    finally{ githubBusy=false; $('#githubSaveBtn').disabled=false; }
  }
  async function loadFromGitHub({silent=false}={}){
    if(githubBusy) return false;
    const stored=getGitHubConfig(); const cfg={...stored,token:getGitHubToken()};
    try{
      validateGitHubConfig(cfg,false); githubBusy=true; $('#githubLoadBtn').disabled=true;
      if(!silent) showToast('Đang load GitHub...');
      const remote=await getRemoteFile(cfg,false);
      if(!remote?.content) throw new Error('Không tìm thấy nội dung file dữ liệu.');
      const incoming=JSON.parse(base64ToUtf8(remote.content));
      if(!incoming.originalIdea||!Array.isArray(incoming.competitors)) throw new Error('File GitHub không đúng format của template.');
      state=incoming; githubLastSha=remote.sha||null; localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); route={view:'idea',competitorId:null}; render();
      if(!silent) showToast('Đã load dữ liệu từ GitHub');
      return true;
    }catch(err){
      if(!silent) alert('Không load được từ GitHub.\n\n'+err.message);
      return false;
    }finally{ githubBusy=false; $('#githubLoadBtn').disabled=false; }
  }
  function initGitHubSync(){
    $('#newProjectModalClose')?.addEventListener('click',closeNewProjectModal);
    $('#newProjectCancelBtn')?.addEventListener('click',closeNewProjectModal);
    $('#newProjectModal')?.addEventListener('click',e=>{if(e.target.id==='newProjectModal') closeNewProjectModal();});
    $('#npCreateBtn')?.addEventListener('click',createNewProjectRepo);
    let repoNameTouched=false;
    $('#npRepoName')?.addEventListener('input',()=>{repoNameTouched=true;});
    $('#npProjectName')?.addEventListener('input',e=>{if(!repoNameTouched) $('#npRepoName').value=repoSlug(e.target.value.replace(/competitor analysis/ig,'analysis'));});
    $('#githubConnectBtn')?.addEventListener('click',openGitHubModal);
    $('#githubModalClose')?.addEventListener('click',closeGitHubModal);
    $('#githubModal')?.addEventListener('click',e=>{if(e.target.id==='githubModal') closeGitHubModal();});
    $('#ghSaveConfigBtn')?.addEventListener('click',()=>{try{const cfg=readGitHubForm();validateGitHubConfig(cfg,false);saveGitHubConfig(cfg);setGitHubToken(cfg.token);githubStatus('Đã lưu cấu hình. Token chỉ lưu trong tab hiện tại.','ok');showToast('Đã lưu cấu hình GitHub');}catch(err){githubStatus(err.message,'error');}});
    $('#ghTestBtn')?.addEventListener('click',testGitHubConnection);
    $('#githubSaveBtn')?.addEventListener('click',async()=>{const cfg=getGitHubConfig();if(!cfg.owner||!cfg.repo||!getGitHubToken()){openGitHubModal();githubStatus('Điền cấu hình + token trước, sau đó bấm Save GitHub.','working');return;}await saveToGitHub();});
    $('#githubLoadBtn')?.addEventListener('click',async()=>{const cfg=getGitHubConfig();if(!cfg.owner||!cfg.repo){openGitHubModal();githubStatus('Điền Owner / Repository trước.','working');return;}await loadFromGitHub();});
    const cfg=getGitHubConfig();
    if(cfg.autoLoad && cfg.owner && cfg.repo){ loadFromGitHub({silent:true}); }
  }

  render();
  initGitHubSync();
})();
