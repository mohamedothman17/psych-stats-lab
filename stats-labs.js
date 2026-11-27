/* Statistics lab: calculation labs (#lab). Loaded on demand by index.html (see CHUNK_SRC and chunksFor there); shares the page's global scope. */
"use strict";

/* ========== LABS ========== */
const LABS=[
 ["desc","معمل الإحصاء الوصفي","أدخل بياناتك: جدول تكراري، متوسط، وسيط، منوال، ربيعيات، تباين وانحراف معياري — مع خطوات الحل والرسوم.",ICON.calc,"var(--teal)","var(--teal-soft)"],
 ["ttest","معمل اختبارات ت","عينة واحدة، مستقلتان (مع ليفين)، مترابطتان: قيمة t ودرجات الحرية والدلالة وحجم الأثر وصياغة النتيجة جاهزة.",ICON.tt,"var(--orange)","var(--orange-soft)"],
 ["normal","معمل التوزيع الطبيعي","حوّل الدرجة إلى z ومئين، وافحص الاعتدالية بقسمة الالتواء والتفلطح على الخطأ المعياري.",ICON.bell,"var(--good)","var(--good-soft)"],
 ["chooser","مُرشد اختيار الاختبار","أجب عن 3 أسئلة بسيطة لتعرف الاختبار الإحصائي المناسب لبحثك ومساره في SPSS.",ICON.tree,"var(--violet)","var(--violet-soft)"],
 ["rel","معمل معاملات الثبات","ألفا كرونباخ، KR-20، KR-21، سبيرمان-براون، جتمان، كابا كوهين، وأوميجا — مع تحليل البنود وخطوات الحل.",ICON.check.replace('stroke-width="3"','stroke-width="2"'),"var(--gold)","var(--gold-soft)"],
 ["scalechart","رسوم المقاييس والتقارير","حوّل استجابات مقياسك لرسوم: توزيع ليكرت، بروفايل الأبعاد، المعايير (مئينيات و T)، وتقرير فردي لكل مفحوص.",ICON.tt,"var(--teal)","var(--teal-soft)"],
 ["build","بناء مقياس نفسي","اختر طريقة البناء (من ثرستون 1928 حتى توليد البنود بالذكاء الاصطناعي)، وحدد عدد البنود والعينة، وابنِ أسئلة مقياسك وجرّب تحليلها.",ICON.book,"var(--violet)","var(--violet-soft)"],
 ["fit","فاحص مؤشرات المطابقة (AMOS)","أدخل مؤشرات نموذجك (CFI، TLI، RMSEA…) واعرف هل المطابقة جيدة، مع صياغة النتيجة.",ICON.tree,"var(--bad)","var(--bad-soft)"]
];
function renderLabs(){view.innerHTML=`<div class="panel"><h3>المعامل التفاعلية</h3><p class="muted" style="margin:0">كل معمل يحسب لك النتيجة ويشرح كيف وصل إليها، بنفس طريقة المحاضرات وبنفس قوانين SPSS.</p></div><div class="pgrid">${LABS.map(l=>`<button class="pcard" style="--c:${l[4]};--s:${l[5]}" onclick="go('lab/${l[0]}')"><div class="ic">${l[3]}</div><b>${l[1]}</b><span>${l[2]}</span></button>`).join("")}</div>`}
function labHead(t){return `<button class="back" onclick="go('lab')">${ICON.back} المعامل</button><h2 style="margin:0 0 12px">${t}</h2>`}
function renderLab(k,sub){labUse(k);({desc:labDesc,ttest:labT,normal:labNormal,chooser:labChooser,rel:labRel,fit:labFit,build:s=>labBuild(s),scalechart:()=>{go("spss");setTimeout(()=>{if(!DS.rows.length)toast("افتح بيانات مقياسك أولًا (File › Open) أو حمّل بيانات التدريب");else APX.scalerep()},350)}}[k]||renderLabs)(sub)}

/* --- descriptive lab --- */
const DESC_PRESETS=[["محاضرة: 20 درجة","3 5 1 4 2 3 5 1 4 2 3 5 1 4 2 3 5 1 4 2"],["محاضرة: الوسيط","27 12 15 300 22 18 14 24 17"],["محاضرة: الربيعيات","100 150 200 50 160 300 250"],["محاضرة: التباين","2 4 5 8 1"],["أوزان 7 أشخاص","25 30 40 45 35 55 50"],["منوالان","2 3 4 4 4 5 5 7 7 7 9"]];
function labDesc(){
 view.innerHTML=labHead("معمل الإحصاء الوصفي")+`<div class="panel"><label class="fl" for="dIn">البيانات (افصل بين القيم بمسافة أو فاصلة — تقبل الأرقام العربية)</label><textarea id="dIn">3 5 1 4 2 3 5 1 4 2 3 5 1 4 2 3 5 1 4 2</textarea><div class="row" style="margin-top:8px">${DESC_PRESETS.map((p,i)=>`<button class="btn sm ghost" data-p="${i}">${p[0]}</button>`).join("")}</div></div><div id="dOut"></div>`;
 const inp=$("#dIn");$$("[data-p]").forEach(b=>b.onclick=()=>{inp.value=DESC_PRESETS[b.dataset.p][1];run()});inp.oninput=run;run();
 function run(){const a=ST.parse(inp.value),o=$("#dOut");if(a.length<2){o.innerHTML=`<div class="panel muted">أدخل قيمتين على الأقل.</div>`;return}
  const n=a.length,s=ST.sorted(a),sum=ST.sum(a),m=sum/n,med=ST.median(a),mo=ST.modes(a),q1=ST.pos(a,.25),q2=ST.pos(a,.5),q3=ST.pos(a,.75),rg=s[n-1]-s[0],v=ST.variance(a),sd=Math.sqrt(v),cv=sd/m*100,sk=ST.skew(a),ku=ST.kurt(a),ses=n>2?ST.seSkew(n):NaN,sek=n>3?ST.seKurt(n):NaN,se=sd/Math.sqrt(n);
  const K=(l,v,hl)=>`<div class="kpi ${hl?"hl":""}"><small>${l}</small><b>${v}</b></div>`;
  let h=`<div class="panel"><h3>النتائج</h3><div class="kpis">${K("العدد n",n)}${K("المجموع Σx",fmt(sum,3))}${K("المتوسط x̄",fmt(m,3),1)}${K("الوسيط",fmt(med,3),1)}${K("المنوال",mo.vals.length?mo.vals.join("، "):"لا يوجد",1)}${K("أصغر قيمة",fmt(s[0],3))}${K("أكبر قيمة",fmt(s[n-1],3))}${K("المدى",fmt(rg,3))}${K("Q1",fmt(q1.v,3))}${K("Q3",fmt(q3.v,3))}${K("نصف المدى الربيعي",fmt((q3.v-q1.v)/2,3))}${K("التباين s²",fmt(v,3),1)}${K("الانحراف المعياري s",fmt(sd,3),1)}${K("الخطأ المعياري",fmt(se,3))}${K("معامل الاختلاف",isFinite(cv)?fmt(cv,1)+"%":"—")}${K("الالتواء",fmt(sk,3))}${K("التفلطح",fmt(ku,3))}</div>`;
  if(n>=4&&isFinite(sk)){const zs=sk/ses,zk=ku/sek;const ok=Math.abs(zs)<1.96&&Math.abs(zk)<1.96;h+=`<div class="verdict ${ok?"ok":"mid"}">فحص الاعتدالية: الالتواء ÷ خطئه = ${fmt(sk,3)} ÷ ${fmt(ses,3)} = <span class="ltr">${fmt(zs,2)}</span> — التفلطح ÷ خطئه = ${fmt(ku,3)} ÷ ${fmt(sek,3)} = <span class="ltr">${fmt(zk,2)}</span> ← ${ok?"كلاهما بين ±1.96: التوزيع قريب من الطبيعي ✔":"قيمة خارج ±1.96: راجع الاعتدالية (وقارن بحد ±2.58)"}</div>`}
  h+=`</div>`;
  // steps
  const medPos=(n+1)/2;
  h+=`<div class="panel"><h3>خطوات الحل</h3><p><b>1) ترتيب البيانات</b> (الرقم الصغير = الرتبة):</p><div class="sorted">${s.map((x,i)=>{const r=i+1;const isM=n%2?r===medPos:(r===n/2||r===n/2+1);const isQ=[q1.pos,q3.pos].some(p=>Math.floor(p)===r||Math.ceil(p)===r);return `<span class="${isM?"m":isQ?"q":""}">${fmt(x,3)}<i>${r}</i></span>`}).join("")}</div>
  <p><b>2) المتوسط:</b> <span class="ltr">x̄ = ${fmt(sum,3)} / ${n} = ${fmt(m,3)}</span></p>
  <p><b>3) الوسيط:</b> n = ${n} (${n%2?"فردي":"زوجي"}) ← ${n%2?`رتبة الوسيط = (${n} + 1) ÷ 2 = ${medPos} ← الوسيط = <b>${fmt(med,3)}</b>`:`الرتبتان ${n/2} و${n/2+1} ← الوسيط = (${fmt(s[n/2-1],3)} + ${fmt(s[n/2],3)}) ÷ 2 = <b>${fmt(med,3)}</b>`}</p>
  <p><b>4) المنوال:</b> ${mo.vals.length?`${mo.vals.join(" و ")} (تكرر ${mo.f} مرات)${mo.vals.length>1?" — "+(mo.vals.length===2?"ثنائية المنوال":"متعددة المنوال"):""}`:"لا توجد قيمة تكررت أكثر من غيرها ← لا يوجد منوال"}</p>
  <p><b>5) الربيعيات:</b> رتبة Q1 = (${n}+1)×¼ = ${fmt(q1.pos,2)} ← <b>${fmt(q1.v,3)}</b> · رتبة Q2 = ${fmt(q2.pos,2)} ← <b>${fmt(q2.v,3)}</b> · رتبة Q3 = (${n}+1)×¾ = ${fmt(q3.pos,2)} ← <b>${fmt(q3.v,3)}</b></p>
  <p><b>6) المدى:</b> ${fmt(s[n-1],3)} − ${fmt(s[0],3)} = ${fmt(rg,3)}</p>
  <details class="steps" ${n<=12?"open":""}><summary>7) جدول التباين والانحراف المعياري</summary>${T(["x","x − x̄","(x − x̄)²"],a.map(x=>[fmt(x,3),fmt(x-m,3),fmt((x-m)**2,3)]),["Σ = "+fmt(sum,3),"0",fmt(ST.ss(a),3)]).replace(/<td>/g,'<td class="n">')}<div class="f">s² = ${fmt(ST.ss(a),3)} / (${n} − 1) = ${fmt(v,3)} &nbsp;&nbsp; s = √${fmt(v,3)} = ${fmt(sd,3)}</div></details></div>`;
  // freq table
  const uniq=[...new Set(s)];
  if(uniq.length<=20){let cum=0;const rows=uniq.map(u=>{const f=s.filter(x=>x===u).length;cum+=f;return[fmt(u,3),f,fmt(f/n*100,1)+"%",cum,fmt(cum/n*100,1)+"%"]});h+=`<div class="panel"><h3>الجدول التكراري</h3>${T(["القيمة","التكرار f","النسبة %","المتجمع الصاعد","% المتجمع"],rows,["المجموع",n,"100%","",""]).replace(/<td>/g,'<td class="n">')}</div>`}
  else{const k=Math.ceil(1+3.322*Math.log10(n)),w=Math.ceil(rg/k*100)/100||1;let cum=0;const rows=[];for(let i=0;i<k;i++){const lo=s[0]+i*w,hi=lo+w;const f=s.filter(x=>x>=lo&&(i===k-1?x<=hi:x<hi)).length;cum+=f;rows.push([`${fmt(lo,2)} – ${fmt(hi,2)}`,fmt((lo+hi)/2,2),f,fmt(f/n*100,1)+"%",cum])}h+=`<div class="panel"><h3>جدول تكراري بفئات</h3><p class="muted">عدد الفئات حسب قاعدة ستيرجس: k = 1 + 3.322 log(n) = ${k}، طول الفئة ≈ المدى ÷ k = ${fmt(w,2)}</p>${T(["الفئة","مركز الفئة","f","%","المتجمع الصاعد"],rows).replace(/<td>/g,'<td class="n">')}</div>`}
  h+=`<div class="panel"><h3>المدرج والمضلع التكراري</h3><div class="chart">${histSVG(a,{poly:true})}</div><h3 style="margin-top:12px">مخطط الصندوق Box plot</h3><div class="chart">${boxSVG(a)}</div><p class="muted" style="font-size:14px;margin:0">الصندوق من Q1 إلى Q3، والخط البرتقالي الوسيط، والدوائر الحمراء قيم متطرفة (أبعد من 1.5 × المدى الربيعي).</p></div>`;
  o.innerHTML=h;
 }
}

/* --- t-test lab --- */
const TP={
 one:[["مثال: أطوال (µ = 66.5)","64 70 68 72 66 69 71 67 73 65 70 68 74 69 66","66.5"],["درجات قلق (µ = 50)","55 48 61 52 57 49 63 58 54 60","50"]],
 ind:[["طرق التدريس (توضيحي)","78 85 82 90 76 88 84 91 79 86","70 74 68 80 72 77 69 75 73 71"],["ذكور وإناث (توضيحي)","12 11 13 10 12 14 11 13 12 11","14 13 15 13 14 12 14 15 13 14"]],
 paired:[["محاضرة: ضغط الدم قبل/بعد النوم","135 125 130 120 120 125 140 150 140 135 145 130","120 105 110 110 100 115 115 115 120 135 140 115"],["قلق قبل/بعد برنامج إرشادي (توضيحي)","32 28 35 30 27 33 36 29 31 34","25 26 28 24 25 27 30 26 24 28"]]
};
function labT(mode){
 mode=["one","ind","paired"].includes(mode)?mode:"one";
 const M={one:["عينة واحدة","البيانات","قيمة المجتمع µ"],ind:["عينتان مستقلتان","المجموعة الأولى","المجموعة الثانية"],paired:["عينتان مترابطتان","القياس القبلي","القياس البعدي"]};
 const P=TP[mode];
 view.innerHTML=labHead("معمل اختبارات ت")+`<div class="seg">${Object.keys(M).map(k=>`<button aria-pressed="${k===mode}" onclick="go('lab/ttest/${k}')">${M[k][0]}</button>`).join("")}</div>
 <div class="panel"><div class="g2"><div><label class="fl" for="tA">${M[mode][1]}</label><textarea id="tA">${P[0][1]}</textarea></div><div><label class="fl" for="tB">${M[mode][2]}</label>${mode==="one"?`<input type="number" id="tB" step="any" value="${P[0][2]}">`:`<textarea id="tB">${P[0][2]}</textarea>`}</div></div>
 ${mode!=="one"?`<div class="g2"><div><label class="fl" for="nA">اسم ${mode==="ind"?"المجموعة الأولى":"القياس الأول"}</label><input type="text" id="nA" value="${mode==="ind"?"المجموعة 1":"القبلي"}"></div><div><label class="fl" for="nB">اسم ${mode==="ind"?"المجموعة الثانية":"القياس الثاني"}</label><input type="text" id="nB" value="${mode==="ind"?"المجموعة 2":"البعدي"}"></div></div>`:""}
 <div class="row" style="margin-top:10px">${P.map((p,i)=>`<button class="btn sm ghost" data-p="${i}">${p[0]}</button>`).join("")}<label class="row" style="gap:6px;margin-inline-start:auto">α <select id="al" style="width:auto"><option>0.05</option><option>0.01</option></select></label></div></div><div id="tOut"></div>`;
 $$("[data-p]").forEach(b=>b.onclick=()=>{$("#tA").value=P[b.dataset.p][1];$("#tB").value=P[b.dataset.p][2];run()});
 ["tA","tB","nA","nB","al"].forEach(id=>{const e=$("#"+id);if(e)e.oninput=e.onchange=run});run();
 function grpStats(a){const n=a.length,m=ST.mean(a),sd=ST.sd(a);return{n,m,sd,se:sd/Math.sqrt(n)}}
 function normRow(a,lab){if(a.length<4)return `<li>${lab}: عدد القيم قليل جدًا لفحص الاعتدالية.</li>`;const n=a.length,zs=ST.skew(a)/ST.seSkew(n),zk=ST.kurt(a)/ST.seKurt(n);const ok=Math.abs(zs)<1.96&&Math.abs(zk)<1.96;return `<li>${lab}: الالتواء/خطئه = <span class="ltr">${fmt(zs,2)}</span>، التفلطح/خطئه = <span class="ltr">${fmt(zk,2)}</span> ${ok?"✔ طبيعي تقريبًا":"⚠ قد لا يكون طبيعيًا"}</li>`}
 function run(){const o=$("#tOut");const al=+$("#al").value;const A=ST.parse($("#tA").value);let res,h="";
  const nA=$("#nA")?.value||"",nB=$("#nB")?.value||"";
  if(mode==="one"){const mu=parseFloat($("#tB").value);if(A.length<2||!isFinite(mu)){o.innerHTML=`<div class="panel muted">أدخل قيمتين على الأقل وقيمة µ.</div>`;return}
   const g=grpStats(A),t=(g.m-mu)/g.se,df=g.n-1,p=ST.tP2(t,df),tc=ST.tcrit(df,al),d=(g.m-mu)/g.sd;res={t,df,p,tc,d};
   h+=`<div class="panel"><h3>One-Sample Statistics</h3><div class="otwrap"><table class="otbl"><thead><tr><th></th><th>N</th><th>Mean</th><th>Std. Deviation</th><th>Std. Error Mean</th></tr></thead><tbody><tr><th>Var</th><td>${g.n}</td><td>${f2(g.m,4)}</td><td>${f2(g.sd,4)}</td><td>${f2(g.se,4)}</td></tr></tbody></table>
   <table class="otbl"><caption>One-Sample Test (Test Value = ${mu})</caption><thead><tr><th>t</th><th>df</th><th>Sig. (2-tailed)</th><th>Mean Difference</th><th>95% CI Lower</th><th>Upper</th></tr></thead><tbody><tr><td>${f2(t,3)}</td><td>${df}</td><td>${f2(p,3)}</td><td>${f2(g.m-mu,4)}</td><td>${f2(g.m-mu-ST.tcrit(df,.05)*g.se,4)}</td><td>${f2(g.m-mu+ST.tcrit(df,.05)*g.se,4)}</td></tr></tbody></table></div>
   <details class="steps" open><summary>خطوات الحساب</summary><div class="f">SE = s / √n = ${f2(g.sd,3)} / √${g.n} = ${f2(g.se,3)}<br>t = (x̄ − µ) / SE = (${f2(g.m,3)} − ${mu}) / ${f2(g.se,3)} = ${f2(t,3)}<br>df = n − 1 = ${df} &nbsp;&nbsp; d = (x̄ − µ) / s = ${f2(d,2)}</div></details>
   <h3>فحص الشروط</h3><ul>${normRow(A,"المتغير")}</ul></div>`;
   res.apa=`${p<=al?"توجد":"لا توجد"} فروق ذات دلالة إحصائية بين متوسط العينة <span class="ltr">(M = ${f2(g.m)}, SD = ${f2(g.sd)})</span> والقيمة المفترضة للمجتمع (${mu}) <span class="ltr">(t(${df}) = ${f2(t,3)}, ${pTxt(p)}, d = ${f2(d,2).replace(/^(-?)0\./,"$1.")})</span>${p<=al?`، وبحجم تأثير ${effLbl(d)}، لذلك تم رفض الفرضية الصفرية`:"، لذلك لا نرفض الفرضية الصفرية"}.`;
  }else{const B=ST.parse($("#tB").value);if(A.length<2||B.length<2){o.innerHTML=`<div class="panel muted">أدخل قيمتين على الأقل في كل خانة.</div>`;return}
   if(mode==="ind"){const a=grpStats(A),b=grpStats(B);const lv=ST.levene(A,B);const sp2=((a.n-1)*a.sd**2+(b.n-1)*b.sd**2)/(a.n+b.n-2);const seP=Math.sqrt(sp2*(1/a.n+1/b.n));const tP=(a.m-b.m)/seP,dfP=a.n+b.n-2;const seW=Math.sqrt(a.sd**2/a.n+b.sd**2/b.n),tW=(a.m-b.m)/seW,dfW=seW**4/((a.sd**2/a.n)**2/(a.n-1)+(b.sd**2/b.n)**2/(b.n-1));
    const eq=lv.p>.05;const t=eq?tP:tW,df=eq?dfP:dfW,p=ST.tP2(t,df),tc=ST.tcrit(df,al),d=(a.m-b.m)/Math.sqrt(sp2);res={t,df,p,tc,d};const pPv=ST.tP2(tP,dfP),pWv=ST.tP2(tW,dfW);const md=a.m-b.m;
    h+=`<div class="panel"><h3>Group Statistics</h3><div class="otwrap"><table class="otbl"><thead><tr><th>Group</th><th>N</th><th>Mean</th><th>Std. Deviation</th><th>Std. Error Mean</th></tr></thead><tbody><tr><th>${esc(nA)}</th><td>${a.n}</td><td>${f2(a.m,4)}</td><td>${f2(a.sd,4)}</td><td>${f2(a.se,4)}</td></tr><tr><th>${esc(nB)}</th><td>${b.n}</td><td>${f2(b.m,4)}</td><td>${f2(b.sd,4)}</td><td>${f2(b.se,4)}</td></tr></tbody></table>
    <table class="otbl"><caption>Independent Samples Test</caption><thead><tr><th></th><th>Levene F</th><th>Sig.</th><th>t</th><th>df</th><th>Sig. (2-tailed)</th><th>Mean Diff.</th></tr></thead><tbody><tr style="${eq?"background:#fff3cf":""}"><th>Equal variances assumed</th><td>${f2(lv.F,3)}</td><td>${f2(lv.p,3)}</td><td>${f2(tP,3)}</td><td>${dfP}</td><td>${f2(pPv,3)}</td><td>${f2(md,4)}</td></tr><tr style="${!eq?"background:#fff3cf":""}"><th>Equal variances not assumed</th><td></td><td></td><td>${f2(tW,3)}</td><td>${f2(dfW,3)}</td><td>${f2(pWv,3)}</td><td>${f2(md,4)}</td></tr></tbody></table></div>
    <div class="verdict ${eq?"ok":"mid"}">اختبار ليفين: <span class="ltr">F = ${f2(lv.F,3)}, ${pTxt(lv.p)}</span> ← ${eq?"غير دال، التباين متجانس ✔ نقرأ الصف الأول (المظلل)":"دال، التباين غير متجانس ✘ نقرأ الصف الثاني (المظلل)"}</div>
    <details class="steps"><summary>خطوات الحساب</summary><div class="f">s²p = [(${a.n}−1)(${f2(a.sd,3)})² + (${b.n}−1)(${f2(b.sd,3)})²] / (${a.n}+${b.n}−2) = ${f2(sp2,3)}<br>SE = √[s²p(1/${a.n} + 1/${b.n})] = ${f2(seP,3)}<br>t = (${f2(a.m,3)} − ${f2(b.m,3)}) / ${f2(seP,3)} = ${f2(tP,3)} &nbsp; df = ${dfP}<br>d = (x̄1 − x̄2) / sp = ${f2(d,2)}</div></details>
    <h3>فحص الشروط</h3><ul>${normRow(A,esc(nA))}${normRow(B,esc(nB))}<li>تجانس التباين (ليفين): ${eq?"✔ متحقق":"✘ غير متحقق — استُخدم تصحيح ويلش"}</li>${a.n<30||b.n<30?`<li>⚠ حجم إحدى المجموعتين أقل من 30.</li>`:""}</ul></div>`;
    const hi=a.m>b.m?nA:nB;res.apa=`يوضح اختبار ت لعينتين مستقلتين أنه ${p<=al?"توجد":"لا توجد"} فروق ذات دلالة إحصائية <span class="ltr">(t(${eq?df:f2(df,2)}) = ${f2(t,3)}, ${pTxt(p)}, d = ${f2(d,2).replace(/^(-?)0\./,"$1.")})</span> عند مستوى α = ${al} بين ${esc(nA)} <span class="ltr">(M = ${f2(a.m)}, SD = ${f2(a.sd)})</span> و${esc(nB)} <span class="ltr">(M = ${f2(b.m)}, SD = ${f2(b.sd)})</span>${p<=al?` لصالح ${esc(hi)}، وبحجم تأثير ${effLbl(d)}`:""}.`;
   }else{if(A.length!==B.length){o.innerHTML=`<div class="panel verdict no">في العينات المترابطة يجب أن يتساوى عدد القيم (${A.length} ≠ ${B.length}).</div>`;return}
    const D=A.map((x,i)=>x-B[i]);const g=grpStats(D),a=grpStats(A),b=grpStats(B);const t=g.m/g.se,df=g.n-1,p=ST.tP2(t,df),tc=ST.tcrit(df,al),d=g.m/g.sd;res={t,df,p,tc,d};
    h+=`<div class="panel"><h3>Paired Samples Statistics</h3><div class="otwrap"><table class="otbl"><thead><tr><th></th><th>Mean</th><th>N</th><th>Std. Deviation</th><th>Std. Error Mean</th></tr></thead><tbody><tr><th>${esc(nA)}</th><td>${f2(a.m,4)}</td><td>${a.n}</td><td>${f2(a.sd,4)}</td><td>${f2(a.se,4)}</td></tr><tr><th>${esc(nB)}</th><td>${f2(b.m,4)}</td><td>${b.n}</td><td>${f2(b.sd,4)}</td><td>${f2(b.se,4)}</td></tr></tbody></table>
    <table class="otbl"><caption>Paired Samples Test</caption><thead><tr><th>Mean</th><th>Std. Deviation</th><th>Std. Error Mean</th><th>t</th><th>df</th><th>Sig. (2-tailed)</th></tr></thead><tbody><tr><td>${f2(g.m,4)}</td><td>${f2(g.sd,4)}</td><td>${f2(g.se,4)}</td><td>${f2(t,3)}</td><td>${df}</td><td>${f2(p,3)}</td></tr></tbody></table></div>
    <details class="steps" open><summary>خطوات الحساب (الفروق D)</summary>${T(["#",esc(nA),esc(nB),"D"],A.map((x,i)=>[i+1,x,B[i],fmt(D[i],3)]),["","","","D̄ = "+f2(g.m,3)]).replace(/<td>/g,'<td class="n">')}<div class="f">s<sub>D</sub> = ${f2(g.sd,3)} &nbsp; SE = ${f2(g.sd,3)} / √${g.n} = ${f2(g.se,3)}<br>t = D̄ / SE = ${f2(g.m,3)} / ${f2(g.se,3)} = ${f2(t,3)} &nbsp; df = ${df} &nbsp; d = ${f2(d,2)}</div></details>
    <h3>فحص الشروط</h3><ul>${normRow(D,"توزيع الفروق D")}</ul></div>`;
    const hi=a.m>b.m?nA:nB;res.apa=`يوضح اختبار ت للعينات المترابطة أنه ${p<=al?"توجد":"لا توجد"} فروق ذات دلالة إحصائية بين ${esc(nA)} <span class="ltr">(M = ${f2(a.m)}, SD = ${f2(a.sd)})</span> و${esc(nB)} <span class="ltr">(M = ${f2(b.m)}, SD = ${f2(b.sd)})</span> <span class="ltr">(t(${df}) = ${f2(t,3)}, ${pTxt(p)}, d = ${f2(d,2).replace(/^(-?)0\./,"$1.")})</span>${p<=al?`، وبحجم تأثير ${effLbl(d)}، حيث كان ${esc(hi)} أعلى بمقدار ${f2(Math.abs(g.m),2)} درجة`:""}.`;
   }
  }
  const sig=res.p<=al;
  h=`<div class="panel"><h3>القرار</h3><div class="kpis"><div class="kpi hl"><small>قيمة t</small><b>${f2(res.t,3)}</b></div><div class="kpi"><small>درجات الحرية df</small><b>${Number.isInteger(res.df)?res.df:f2(res.df,2)}</b></div><div class="kpi hl"><small>الدلالة Sig.</small><b>${f2(res.p,4)}</b></div><div class="kpi"><small>t الحرجة (α=${al})</small><b>±${f2(res.tc,3)}</b></div><div class="kpi"><small>حجم الأثر d</small><b>${f2(res.d,2)}</b></div><div class="kpi"><small>تفسير الأثر</small><b style="font-family:var(--f-body);font-size:17px">${effLbl(res.d)}</b></div></div>
  <div class="verdict ${sig?"ok":"no"}">${sig?`Sig. = ${f2(res.p,3)} ≤ ${al} ← نرفض الفرض الصفري: توجد فروق دالة إحصائيًا`:`Sig. = ${f2(res.p,3)} > ${al} ← لا نرفض الفرض الصفري: لا توجد فروق دالة`}</div>
  <div class="chart">${tCurveSVG(res.t,res.df,res.tc)}</div>
  <div class="apa"><b>صياغة النتيجة جاهزة:</b> ${res.apa} <button class="btn sm ghost" id="cp" style="margin-top:8px">نسخ الصياغة</button></div></div>`+h;
  o.innerHTML=h;
  $("#cp").onclick=()=>{const t=$(".apa").innerText.replace("صياغة النتيجة جاهزة:","").replace("نسخ الصياغة","").trim();navigator.clipboard?.writeText(t).then(()=>toast("تم نسخ الصياغة"),()=>toast("تعذر النسخ"))};
 }
}

/* --- normal lab --- */
function labNormal(){
 view.innerHTML=labHead("معمل التوزيع الطبيعي")+`<div class="panel"><h3>1) تحويل الدرجة الخام إلى درجة معيارية z</h3><div class="g2"><div><label class="fl" for="zx">الدرجة الخام x</label><input type="number" id="zx" value="85" step="any"></div><div class="g2"><div><label class="fl" for="zm">المتوسط</label><input type="number" id="zm" value="70" step="any"></div><div><label class="fl" for="zs">الانحراف المعياري</label><input type="number" id="zs" value="10" step="any"></div></div></div><div id="zOut"></div></div>
 <div class="panel"><h3>2) فحص الاعتدالية من مخرجات SPSS</h3><p class="muted" style="margin-top:0">انقل قيم Skewness و Kurtosis وأخطاءها المعيارية من جدول Descriptives.</p><div class="g2"><div class="g2"><div><label class="fl" for="sk">Skewness</label><input type="number" id="sk" value="0.394" step="any"></div><div><label class="fl" for="ssk">Std. Error</label><input type="number" id="ssk" value="0.241" step="any"></div></div><div class="g2"><div><label class="fl" for="ku">Kurtosis</label><input type="number" id="ku" value="-0.128" step="any"></div><div><label class="fl" for="sku">Std. Error</label><input type="number" id="sku" value="0.478" step="any"></div></div></div><div id="nOut"></div></div>
 <div class="panel"><h3>3) قاعدة 68 – 95 – 99.7</h3><div class="seg" id="rule">${[1,2,3].map(k=>`<button aria-pressed="${k===1}" data-k="${k}">± ${k} انحراف معياري</button>`).join("")}</div><div class="chart" id="rOut"></div></div>`;
 const z=()=>{const x=+$("#zx").value,m=+$("#zm").value,s=+$("#zs").value;if(!(s>0)){$("#zOut").innerHTML=`<p class="muted">الانحراف المعياري يجب أن يكون أكبر من صفر.</p>`;return}const zz=(x-m)/s,pc=ST.ncdf(zz)*100,T=50+10*zz;
  $("#zOut").innerHTML=`<div class="f">z = (x − x̄) / s = (${x} − ${m}) / ${s} = ${f2(zz,2)}</div><div class="kpis"><div class="kpi hl"><small>الدرجة المعيارية z</small><b>${f2(zz,2)}</b></div><div class="kpi hl"><small>المئين (تقريبًا)</small><b>${f2(pc,1)}</b></div><div class="kpi"><small>الدرجة التائية T = 50 + 10z</small><b>${f2(T,1)}</b></div></div><p>حوالي <b>${f2(pc,1)}%</b> من الأفراد درجاتهم أقل من ${x}${zz>0?"، أي أن الدرجة فوق المتوسط بـ "+f2(zz,2)+" انحراف معياري":zz<0?"، أي أن الدرجة تحت المتوسط بـ "+f2(-zz,2)+" انحراف معياري":" (عند المتوسط تمامًا)"}.</p><div class="chart">${normSVG(-4,zz,f2(pc,1)+"%")}</div>`};
 const nchk=()=>{const zs=+$("#sk").value/ +$("#ssk").value,zk=+$("#ku").value/ +$("#sku").value;const ok1=Math.abs(zs)<1.96&&Math.abs(zk)<1.96,ok2=Math.abs(zs)<2.58&&Math.abs(zk)<2.58;
  $("#nOut").innerHTML=`${T(["الحساب","النتيجة","±1.96 (α=.05)","±2.58 (α=.01)"],[["الالتواء: "+$("#sk").value+" ÷ "+$("#ssk").value,f2(zs,2),Math.abs(zs)<1.96?"✔":"✘",Math.abs(zs)<2.58?"✔":"✘"],["التفلطح: "+$("#ku").value+" ÷ "+$("#sku").value,f2(zk,2),Math.abs(zk)<1.96?"✔":"✘",Math.abs(zk)<2.58?"✔":"✘"]])}<div class="verdict ${ok1?"ok":ok2?"mid":"no"}">${ok1?"التوزيع قريب من الطبيعي ← يصلح للاختبارات المعلمية (Parametric tests)":ok2?"مقبول عند حد ±2.58 (Hair et al., 2014) فقط":"التوزيع غير طبيعي ← فكّر في البديل اللامعلمي"}</div>`};
 ["zx","zm","zs"].forEach(i=>$("#"+i).oninput=z);["sk","ssk","ku","sku"].forEach(i=>$("#"+i).oninput=nchk);z();nchk();
 const rl=k=>{$("#rOut").innerHTML=normSVG(-k,k,["","68.27%","95.45%","99.73%"][k]);$$("#rule button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.k===k))};$$("#rule button").forEach(b=>b.onclick=()=>rl(+b.dataset.k));rl(1);
}

/* --- chooser --- */
function labChooser(){
 const tree={q:"ما هدف تحليلك؟",o:[
  ["وصف البيانات (متوسط، نسب، تكرارات)",{r:"الإحصاء الوصفي",p:"Analyze › Descriptive Statistics › Frequencies / Descriptives",w:"للمتغيرات الاسمية: التكرارات والنسب. للكمية: المتوسط والانحراف المعياري، مع فحص الاعتدالية عبر Explore.",lab:"desc"}],
  ["مقارنة متوسطات (فروق)",{q:"كم مجموعة/قياس تقارن؟",o:[
   ["متوسط عينة مقابل قيمة معلومة للمجتمع",{q:"هل المتغير التابع موزع طبيعيًا؟",o:[["نعم",{r:"اختبار ت لعينة واحدة",p:"Analyze › Compare Means › One-Sample T Test",w:"اكتب قيمة المجتمع في Test Value.",lab:"ttest/one"}],["لا",{r:"Wilcoxon Signed Rank test",p:"Analyze › Nonparametric Tests › One Sample",w:"البديل اللامعلمي لـ ت لعينة واحدة."}]]}],
   ["مجموعتان",{q:"هل هما نفس الأفراد (قبلي/بعدي) أم أفراد مختلفون؟",o:[
    ["أفراد مختلفون (مستقلتان)",{q:"هل البيانات طبيعية في المجموعتين؟",o:[["نعم",{r:"اختبار ت لعينتين مستقلتين",p:"Analyze › Compare Means › Independent-Samples T Test",w:"لا تنسَ قراءة اختبار ليفين لتحديد الصف المناسب.",lab:"ttest/ind"}],["لا",{r:"Mann–Whitney U test",p:"Analyze › Nonparametric Tests › Legacy Dialogs › 2 Independent Samples",w:"البديل اللامعلمي لـ ت المستقلتين."}]]}],
    ["نفس الأفراد أو أزواج مرتبطة (مترابطتان)",{q:"هل توزيع الفروق بين القياسين طبيعي؟",o:[["نعم",{r:"اختبار ت لعينتين مترابطتين",p:"Analyze › Compare Means › Paired-Samples T Test",w:"شرط الاعتدالية على الفروق وليس على كل قياس.",lab:"ttest/paired"}],["لا",{r:"Wilcoxon Signed-Rank test",p:"Analyze › Nonparametric Tests › Legacy Dialogs › 2 Related Samples",w:"البديل اللامعلمي لـ ت المترابطتين."}]]}]]}],
   ["ثلاث مجموعات مستقلة فأكثر",{q:"هل البيانات طبيعية والتباين متجانس؟",o:[["نعم",{r:"تحليل التباين الأحادي One-Way ANOVA",p:"Analyze › Compare Means › One-Way ANOVA",w:"إذا كانت F دالة، استخدم Post Hoc (مثل Tukey) لمعرفة أي المجموعات تختلف."}],["لا",{r:"Kruskal–Wallis H test",p:"Analyze › Nonparametric Tests › Legacy Dialogs › K Independent Samples",w:"البديل اللامعلمي لتحليل التباين."}]]}]]}],
  ["علاقة بين متغيرين",{q:"ما طبيعة المتغيرين؟",o:[["كميان وموزعان طبيعيًا",{r:"معامل ارتباط بيرسون",p:"Analyze › Correlate › Bivariate › Pearson",w:"r بين −1 و+1: الإشارة للاتجاه والقيمة للقوة."}],["رتبيان أو غير طبيعيين",{r:"معامل ارتباط سبيرمان",p:"Analyze › Correlate › Bivariate › Spearman",w:"يعتمد على الرتب بدل القيم."}]]}]]};
 let stack=[tree];
 const draw=()=>{const cur=stack[stack.length-1];let h=labHead("مُرشد اختيار الاختبار")+`<div class="panel wiz">`;
  if(stack.length>1)h+=`<p class="muted" style="margin-top:0">الخطوة ${stack.length}</p>`;
  if(cur.r){h+=`<span class="chip good">الاختبار المناسب</span><h2 style="margin:8px 0">${cur.r}</h2><div class="path-crumb">${cur.p.split(" › ").map(x=>`<span>${x}</span>`).join("<em>›</em>")}</div><p>${cur.w}</p><div class="row">${cur.lab?`<button class="btn" onclick="go('lab/${cur.lab}')">افتح المعمل</button>`:""}<button class="btn ghost" id="rs">ابدأ من جديد</button></div>`}
  else{h+=`<h3>${cur.q}</h3><div class="opts">${cur.o.map((o,i)=>`<button class="opt" data-i="${i}"><span class="k">${"أبجد"[i]}</span><span>${o[0]}</span></button>`).join("")}</div>`}
  if(stack.length>1)h+=`<p><button class="btn sm ghost" id="bk">→ رجوع</button></p>`;
  view.innerHTML=h+"</div>";
  $$(".wiz .opt").forEach(b=>b.onclick=()=>{stack.push(cur.o[+b.dataset.i][1]);draw()});
  $("#bk")&&($("#bk").onclick=()=>{stack.pop();draw()});$("#rs")&&($("#rs").onclick=()=>{stack=[tree];draw()});
 };draw();
}

/* --- reliability lab --- */
const pear=(x,y)=>{const mx=ST.mean(x),my=ST.mean(y);let a=0,b=0,c=0;x.forEach((v,i)=>{a+=(v-mx)*(y[i]-my);b+=(v-mx)**2;c+=(y[i]-my)**2});return a/Math.sqrt(b*c)};
const REL_PRE=[["ليكرت: 10 أفراد × 5 بنود","4 5 4 3 5\n3 4 3 3 4\n5 5 4 4 5\n2 3 2 2 3\n4 4 5 4 4\n3 3 3 2 3\n5 4 5 5 5\n2 2 3 2 2\n4 5 4 4 4\n3 4 3 3 3"],["صح/خطأ: 10 طلاب × 6 أسئلة","1 1 1 1 0 1\n1 0 1 0 0 0\n1 1 1 1 1 1\n0 0 1 0 0 0\n1 1 0 1 1 0\n1 1 1 0 0 1\n0 1 0 0 0 0\n1 1 1 1 1 1\n1 0 1 1 0 0\n1 1 1 1 0 1"]];
function labRel(mode){
 mode=["mat","kappa","sb","omega"].includes(mode)?mode:"mat";
 const M={mat:"درجات البنود (ألفا، KR، التجزئة)",kappa:"كابا كوهين",sb:"سبيرمان-براون",omega:"أوميجا و AVE و CR"};
 let h=labHead("معمل معاملات الثبات")+`<div class="seg">${Object.keys(M).map(k=>`<button aria-pressed="${k===mode}" onclick="go('lab/rel/${k}')">${M[k]}</button>`).join("")}</div>`;
 if(mode==="mat"){
  view.innerHTML=h+`<div class="panel"><label class="fl" for="rIn">مصفوفة الدرجات: كل سطر = فرد، وكل عمود = بند (افصل بمسافة)</label><textarea id="rIn" style="min-height:190px">${window._relPreset||REL_PRE[0][1]}</textarea><div class="row" style="margin-top:8px">${REL_PRE.map((p,i)=>`<button class="btn sm ghost" data-p="${i}">${p[0]}</button>`).join("")}</div></div><div id="rOut"></div>`;
  const inp=$("#rIn");$$("[data-p]").forEach(b=>b.onclick=()=>{inp.value=REL_PRE[b.dataset.p][1];run()});inp.oninput=run;run();
  function run(){const o=$("#rOut");const rows=inp.value.trim().split(/\n+/).map(l=>ST.parse(l)).filter(r=>r.length);
   if(rows.length<3){o.innerHTML=`<div class="panel muted">أدخل 3 أفراد على الأقل.</div>`;return}
   const k=rows[0].length;if(k<2||rows.some(r=>r.length!==k)){o.innerHTML=`<div class="panel verdict no">كل الأسطر يجب أن تحتوي على نفس عدد البنود (2 على الأقل).</div>`;return}
   const n=rows.length,cols=Array.from({length:k},(_,j)=>rows.map(r=>r[j])),tot=rows.map(r=>ST.sum(r)),vt=ST.variance(tot);
   if(!vt){o.innerHTML=`<div class="panel verdict no">تباين الدرجة الكلية = صفر؛ لا يمكن حساب الثبات.</div>`;return}
   const iv=cols.map(c=>ST.variance(c)),siv=ST.sum(iv),al=k/(k-1)*(1-siv/vt);
   const bin=rows.every(r=>r.every(v=>v===0||v===1));
   const odd=cols.filter((_,j)=>j%2===0),even=cols.filter((_,j)=>j%2===1);const h1=rows.map((_,i)=>odd.reduce((s,c)=>s+c[i],0)),h2=rows.map((_,i)=>even.reduce((s,c)=>s+c[i],0));
   const r=pear(h1,h2),sb=2*r/(1+r),gt=2*(1-(ST.variance(h1)+ST.variance(h2))/vt);
   let kr20,kr21,spq,vp,Mt;if(bin){const p=cols.map(c=>ST.mean(c));spq=ST.sum(p.map(x=>x*(1-x)));vp=ST.ss(tot)/n;Mt=ST.mean(tot);kr20=k/(k-1)*(1-spq/vp);kr21=k/(k-1)*(1-Mt*(k-Mt)/(k*vp))}
   const K=(l,v,hl)=>`<div class="kpi ${hl?"hl":""}"><small>${l}</small><b>${v}</b></div>`;
   let s=`<div class="panel"><h3>النتائج (${n} فردًا، ${k} بنود)</h3><div class="kpis">${K("ألفا كرونباخ α",f2(al,3),1)}${bin?K("KR-20",f2(kr20,3),1)+K("KR-21",f2(kr21,3)):""}${K("الارتباط بين النصفين r",f2(r,3))}${K("سبيرمان-براون",f2(sb,3),1)}${K("جتمان",f2(gt,3))}</div>
   <div class="verdict ${relLbl(al)[1]}">ألفا كرونباخ = ${f2(al,3)} ← ثبات ${relLbl(al)[0]}${bin?` · KR-20 = ${f2(kr20,3)} ← ${relLbl(kr20)[0]}`:""}</div>
   <details class="steps" open><summary>خطوات الحل</summary><div class="f">α = [${k}/(${k}−1)] × [1 − (${f2(siv,3)} / ${f2(vt,3)})] = ${f2(k/(k-1),3)} × ${f2(1-siv/vt,3)} = ${f2(al,3)}<small>مجموع تباينات البنود = ${f2(siv,3)} — تباين الدرجة الكلية = ${f2(vt,3)}</small></div>
   ${bin?`<div class="f">KR-20 = [${k}/${k-1}] × [1 − (${f2(spq,3)} / ${f2(vp,3)})] = ${f2(kr20,3)}<br>KR-21 = [${k}/${k-1}] × [1 − ${f2(Mt,2)}(${k} − ${f2(Mt,2)}) / (${k} × ${f2(vp,3)})] = ${f2(kr21,3)}<small>في KR يستخدم تباين المجتمع للدرجة الكلية (القسمة على n)</small></div>`:""}
   <div class="f">النصف الأول = البنود الفردية، والثاني = الزوجية ← r = ${f2(r,3)}<br>r<sub>sb</sub> = 2(${f2(r,3)}) / (1 + ${f2(r,3)}) = ${f2(sb,3)}<br>r<sub>G</sub> = 2 × [1 − (${f2(ST.variance(h1),3)} + ${f2(ST.variance(h2),3)}) / ${f2(vt,3)}] = ${f2(gt,3)}</div></details></div>`;
   const rowsT=cols.map((c,j)=>{const rest=rows.map((rw,i)=>tot[i]-c[i]);const ri=pear(c,rest);const ad=alphaOf(cols.filter((_,x)=>x!==j));const bad=ri<.3||ad>al+.005;return `<tr class="${bad?"hl":""}"><td class="n">${j+1}</td><td class="n">${f2(ST.mean(c),2)}</td><td class="n">${f2(iv[j],3)}</td><td class="n">${f2(ri,3)}</td><td class="n">${f2(ad,3)}</td><td>${ri<.3?"ارتباط ضعيف بالدرجة الكلية":ad>al+.005?"حذفه يرفع ألفا":"جيد ✔"}</td></tr>`}).join("");
   s+=`<div class="panel"><h3>تحليل البنود (مثل Item-Total Statistics في SPSS)</h3><div class="tw"><table><thead><tr><th>البند</th><th>المتوسط</th><th>التباين</th><th>الارتباط المصحح بالكلية</th><th>ألفا إذا حُذف البند</th><th>الحكم</th></tr></thead><tbody>${rowsT}</tbody></table></div><p class="muted" style="font-size:14px;margin:0">البند المظلل يحتاج مراجعة: ارتباطه بالدرجة الكلية أقل من 0.30، أو حذفه يرفع ألفا.</p></div>`;
   o.innerHTML=s;
  }
 }else if(mode==="kappa"){
  view.innerHTML=h+`<div class="panel"><h3>1) من تقديرات المصححين</h3><p class="muted" style="margin-top:0">اكتب تقدير كل مصحح لنفس الحالات بنفس الترتيب (أرقام أو كلمات).</p><div class="g2"><div><label class="fl" for="kA">المصحح الأول</label><textarea id="kA">ناجح ناجح راسب ناجح راسب ناجح ناجح راسب ناجح ناجح راسب ناجح راسب ناجح ناجح ناجح راسب ناجح ناجح راسب</textarea></div><div><label class="fl" for="kB">المصحح الثاني</label><textarea id="kB">ناجح ناجح راسب ناجح ناجح ناجح ناجح راسب ناجح راسب راسب ناجح راسب ناجح ناجح ناجح راسب ناجح راسب راسب</textarea></div></div><div id="kOut"></div></div>
  <div class="panel"><h3>2) أو أدخل Po و Pe مباشرة</h3><div class="g2"><div><label class="fl" for="po">Po (الاتفاق الملاحظ)</label><input type="number" id="po" step="any" value="0.80"></div><div><label class="fl" for="pe">Pe (الاتفاق بالصدفة)</label><input type="number" id="pe" step="any" value="0.50"></div></div><div id="k2Out"></div></div>`;
  const tok=s=>s.split(/[\s,،]+/).filter(Boolean);
  const run=()=>{const A=tok($("#kA").value),B=tok($("#kB").value),o=$("#kOut");if(A.length<2||A.length!==B.length){o.innerHTML=`<div class="verdict no">يجب أن يتساوى عدد التقديرات عند المصححين (${A.length} ≠ ${B.length}).</div>`;return}
   const n=A.length,cats=[...new Set(A.concat(B))];const cnt=(a,b)=>A.filter((x,i)=>x===a&&B[i]===b).length;const ra=cats.map(c=>A.filter(x=>x===c).length),rb=cats.map(c=>B.filter(x=>x===c).length);
   const po=cats.reduce((s,c)=>s+cnt(c,c),0)/n,pe=cats.reduce((s,c,i)=>s+ra[i]*rb[i],0)/(n*n),kp=pe<1?(po-pe)/(1-pe):NaN;
   o.innerHTML=`<div class="tw"><table><thead><tr><th>الأول \\ الثاني</th>${cats.map(c=>`<th>${esc(c)}</th>`).join("")}<th>المجموع</th></tr></thead><tbody>${cats.map((a,i)=>`<tr><td><b>${esc(a)}</b></td>${cats.map(b=>`<td class="n" style="${a===b?"font-weight:700;background:var(--good-soft)":""}">${cnt(a,b)}</td>`).join("")}<td class="n">${ra[i]}</td></tr>`).join("")}</tbody><tfoot><tr><td>المجموع</td>${rb.map(x=>`<td class="n">${x}</td>`).join("")}<td class="n">${n}</td></tr></tfoot></table></div>
   <div class="f">Po = ${cats.map(c=>cnt(c,c)).join(" + ")} / ${n} = ${f2(po,3)}<br>Pe = (${cats.map((c,i)=>ra[i]+"×"+rb[i]).join(" + ")}) / ${n}² = ${f2(pe,3)}<br>κ = (${f2(po,3)} − ${f2(pe,3)}) / (1 − ${f2(pe,3)}) = ${f2(kp,3)}</div><div class="verdict ${kapLbl(kp)[1]}">κ = ${f2(kp,3)} ← اتفاق ${kapLbl(kp)[0]}</div>`};
  const run2=()=>{const po=+$("#po").value,pe=+$("#pe").value;const kp=(po-pe)/(1-pe);$("#k2Out").innerHTML=pe>=1||!isFinite(kp)?`<p class="muted">Pe يجب أن تكون أقل من 1.</p>`:`<div class="f">κ = (${po} − ${pe}) / (1 − ${pe}) = ${f2(po-pe,3)} / ${f2(1-pe,3)} = ${f2(kp,3)}</div><div class="verdict ${kapLbl(kp)[1]}">اتفاق ${kapLbl(kp)[0]}</div>`};
  ["kA","kB"].forEach(i=>$("#"+i).oninput=run);["po","pe"].forEach(i=>$("#"+i).oninput=run2);run();run2();
 }else if(mode==="sb"){
  view.innerHTML=h+`<div class="panel"><div class="g2"><div><label class="fl" for="sr">معامل الارتباط r (بين النصفين أو ثبات الاختبار الحالي)</label><input type="number" id="sr" step="any" value="0.70"></div><div><label class="fl" for="sn">مضاعفة طول الاختبار n مرة (2 = التجزئة النصفية)</label><input type="number" id="sn" step="any" value="2"></div></div><div id="sOut2"></div></div>`;
  const run=()=>{const r=+$("#sr").value,n=+$("#sn").value;const v=n*r/(1+(n-1)*r);$("#sOut2").innerHTML=`<div class="f">r<sub>new</sub> = ${n} × ${r} / [1 + (${n} − 1) × ${r}] = ${f2(n*r,3)} / ${f2(1+(n-1)*r,3)} = ${f2(v,3)}</div><div class="verdict ${relLbl(v)[1]}">الثبات بعد التصحيح = ${f2(v,3)} ← ${relLbl(v)[0]}</div>`};["sr","sn"].forEach(i=>$("#"+i).oninput=run);run();
 }else{
  view.innerHTML=h+`<div class="panel"><label class="fl" for="ld">التشبعات المعيارية λ للبنود (من AMOS أو التحليل العاملي)</label><textarea id="ld">0.70 0.80 0.60 0.75</textarea><div id="oOut"></div></div>`;
  const run=()=>{const L=ST.parse($("#ld").value),o=$("#oOut");if(L.length<2||L.some(x=>Math.abs(x)>1)){o.innerHTML=`<p class="muted">أدخل تشبعين على الأقل بين −1 و 1.</p>`;return}
   const sl=ST.sum(L),th=L.map(x=>1-x*x),sth=ST.sum(th),om=sl*sl/(sl*sl+sth),ave=ST.sum(L.map(x=>x*x))/L.length;
   o.innerHTML=`${T(["البند","λ","λ²","θ = 1 − λ²"],L.map((x,i)=>[i+1,f2(x,3),f2(x*x,3),f2(th[i],3)]),["Σ",f2(sl,3),f2(ST.sum(L.map(x=>x*x)),3),f2(sth,3)]).replace(/<td>/g,'<td class="n">')}
   <div class="f">ω = CR = (${f2(sl,3)})² / [(${f2(sl,3)})² + ${f2(sth,3)}] = ${f2(sl*sl,3)} / ${f2(sl*sl+sth,3)} = ${f2(om,3)}<br>AVE = Σλ² / k = ${f2(ST.sum(L.map(x=>x*x)),3)} / ${L.length} = ${f2(ave,3)}</div>
   <div class="kpis"><div class="kpi hl"><small>أوميجا ω (= الثبات المركب CR)</small><b>${f2(om,3)}</b></div><div class="kpi hl"><small>AVE</small><b>${f2(ave,3)}</b></div><div class="kpi"><small>√AVE (لفورنل ولاركر)</small><b>${f2(Math.sqrt(ave),3)}</b></div></div>
   <div class="verdict ${relLbl(om)[1]}">ω = ${f2(om,3)} ← ثبات ${relLbl(om)[0]}</div><div class="verdict ${ave>=.5?"ok":"no"}">AVE = ${f2(ave,3)} ← ${ave>=.5?"الصدق التقاربي متحقق (≥ 0.50) ✔":"الصدق التقاربي غير متحقق (أقل من 0.50)"}</div>${L.some(x=>x<.5)?`<p class="muted">⚠ يوجد بند تشبعه أقل من 0.50.</p>`:""}`};
  $("#ld").oninput=run;run();
 }
}

/* --- model fit lab --- */
function labFit(){
 const IDX=[["cmin","χ² (CMIN)",""],["df","df",""],["cfi","CFI",".96"],["tli","TLI",".95"],["rmsea","RMSEA",".048"],["srmr","SRMR",".041"],["gfi","GFI (اختياري)",""],["nfi","NFI (اختياري)",""]];
 view.innerHTML=labHead("فاحص مؤشرات جودة المطابقة")+`<div class="panel"><p class="muted" style="margin-top:0">انقل القيم من جدول Model Fit في مخرجات AMOS. اترك أي خانة فارغة إذا لم تكن متاحة.</p><div class="g2">${IDX.map(x=>`<div><label class="fl" for="f_${x[0]}"><span class="ltr">${x[1]}</span></label><input type="number" step="any" id="f_${x[0]}" value="${x[0]==="cmin"?"171.2":x[0]==="df"?"80":x[2]}"></div>`).join("")}</div><div class="row" style="margin-top:10px"><button class="btn sm ghost" id="fg">مثال: نموذج جيد</button><button class="btn sm ghost" id="fb">مثال: نموذج ضعيف</button></div></div><div id="fOut"></div>`;
 const set=v=>{Object.entries(v).forEach(([k,x])=>$("#f_"+k).value=x);run()};
 $("#fg").onclick=()=>set({cmin:171.2,df:80,cfi:.96,tli:.95,rmsea:.048,srmr:.041,gfi:.93,nfi:.92});
 $("#fb").onclick=()=>set({cmin:612.5,df:120,cfi:.84,tli:.81,rmsea:.102,srmr:.095,gfi:.80,nfi:.79});
 IDX.forEach(x=>$("#f_"+x[0]).oninput=run);run();
 function run(){const g=k=>{const v=$("#f_"+k).value;return v===""?null:+v};const rows=[];let ok=0,tot=0;
  const add=(name,val,good,acc,crit)=>{if(val==null||!isFinite(val))return;tot++;const st=good(val)?"good":acc(val)?"acc":"bad";if(st!=="bad")ok++;rows.push([`<span class="ltr"><b>${name}</b></span>`,`<span class="ltr num">${f2(val,3)}</span>`,crit,st==="good"?'<span class="chip good">جيد</span>':st==="acc"?'<span class="chip gold">مقبول</span>':'<span class="chip bad">غير مقبول</span>'])};
  const c=g("cmin"),d=g("df");if(c!=null&&d)add("CMIN/DF",c/d,v=>v<3,v=>v<5,"&lt; 3 جيد، &lt; 5 مقبول");
  add("CFI",g("cfi"),v=>v>=.95,v=>v>=.9,"≥ .95 جيد، ≥ .90 مقبول");add("TLI",g("tli"),v=>v>=.95,v=>v>=.9,"≥ .95 جيد، ≥ .90 مقبول");
  add("RMSEA",g("rmsea"),v=>v<=.05,v=>v<=.08,"≤ .05 جيد، ≤ .08 مقبول");add("SRMR",g("srmr"),v=>v<=.05,v=>v<=.08,"≤ .05 جيد، ≤ .08 مقبول");
  add("GFI",g("gfi"),v=>v>=.95,v=>v>=.9,"≥ .90");add("NFI",g("nfi"),v=>v>=.95,v=>v>=.9,"≥ .90");
  if(!tot){$("#fOut").innerHTML="";return}
  const pc=ok/tot,good=pc>=.8;const fm=k=>{const v=g(k);return v==null?null:f2(v,3).replace(/^0\./,".")};
  const parts=[c!=null&&d?`χ²/df = ${f2(c/d,2)}`:null,fm("cfi")&&`CFI = ${fm("cfi")}`,fm("tli")&&`TLI = ${fm("tli")}`,fm("rmsea")&&`RMSEA = ${fm("rmsea")}`,fm("srmr")&&`SRMR = ${fm("srmr")}`].filter(Boolean).join(", ");
  $("#fOut").innerHTML=`<div class="panel"><h3>النتيجة</h3>${T(["المؤشر","قيمتك","المعيار","الحكم"],rows)}<div class="verdict ${good?"ok":pc>=.5?"mid":"no"}">${ok} من ${tot} مؤشرات ضمن الحدود المقبولة ← ${good?"مطابقة النموذج للبيانات جيدة ✔":pc>=.5?"مطابقة مقبولة جزئيًا — راجع مؤشرات التعديل والتشبعات الضعيفة":"مطابقة ضعيفة — النموذج يحتاج تعديلًا"}</div>
  <div class="apa"><b>صياغة النتيجة:</b> أظهرت نتائج التحليل العاملي التوكيدي ${good?"مطابقة جيدة":pc>=.5?"مطابقة مقبولة":"مطابقة ضعيفة"} للنموذج المقترح مع بيانات العينة <span class="ltr">(${parts})</span>.</div></div>`}
}
