/* Statistics lab: scale builder, sharing links and the respondent page (#lab/build, #take). Loaded on demand by index.html (see CHUNK_SRC and chunksFor there); shares the page's global scope. */
"use strict";

/* ========== SCALE BUILDER ========== */
const METHODS=[
 {id:"thurstone",t:"طريقة ثرستون — الفترات المتساوية ظاهريًا",en:"Thurstone Equal-Appearing Intervals",yr:1928,era:"كلاسيكية",d:"يكتب الباحث عبارات كثيرة تتدرج من الرفض الشديد للقبول الشديد، ويحكم عليها محكمون على متصل من 1 إلى 11، وتُختار العبارات ذات الاتفاق العالي بقيم موزعة. المفحوص يختار «أوافق» على ما ينطبق، ودرجته = وسيط قيم العبارات التي وافق عليها.",resp:["أوافق","لا أوافق"],bin:true,n:k=>[100,"50–100 محكم لتقدير قيم العبارات + 100 مفحوص على الأقل"]},
 {id:"likert",t:"طريقة ليكرت — التقديرات التجميعية",en:"Likert Summated Rating",yr:1932,era:"كلاسيكية (الأكثر استخدامًا)",d:"عبارات موجبة وسالبة يستجيب لها المفحوص على تدريج خماسي، وتجمع الدرجات (مع عكس العبارات السالبة) في درجة كلية. سهلة البناء والتصحيح، وتحلل بألفا كرونباخ والتحليل العاملي.",resp:["موافق بشدة","موافق","محايد","غير موافق","غير موافق بشدة"],n:k=>[Math.max(200,10*k),"5–10 أفراد لكل بند وبحد أدنى 200 للتحليل العاملي، و30–50 للتجربة الاستطلاعية"]},
 {id:"guttman",t:"طريقة جتمان — التدرج التراكمي",en:"Guttman Cumulative Scaling",yr:1944,era:"كلاسيكية",d:"عبارات مرتبة تصاعديًا في الشدة؛ من يوافق على عبارة قوية يوافق بالضرورة على ما قبلها. يُتحقق منها بمعامل إعادة الإنتاج (≥ 0.90).",resp:["نعم","لا"],bin:true,n:k=>[100,"100 فرد على الأقل لحساب معامل إعادة الإنتاج"]},
 {id:"osgood",t:"التمايز الدلالي — أوسجود",en:"Osgood Semantic Differential",yr:1957,era:"كلاسيكية",d:"يُقيَّم مفهوم واحد على أزواج من الصفات المتضادة (جيد–سيئ، قوي–ضعيف…) بتدريج سباعي، وتمثل ثلاثة أبعاد: التقييم، القوة، النشاط.",resp:["1","2","3","4","5","6","7"],n:k=>[100,"100 فرد على الأقل، ويزيد للتحليل العاملي"]},
 {id:"rasch",t:"نموذج راش / نظرية الاستجابة للمفردة",en:"Rasch Model / Item Response Theory",yr:1960,era:"حديثة",d:"تُبنى البنود بحيث تغطي مستويات مختلفة من شدة السمة (سهلة وصعبة التأييد)، ويقدَّر موقع الفرد والبند على متصل واحد بالـ logit مستقلًا عن العينة. يتيح الأداء التفاضلي للمفردة DIF وفحص المطابقة.",resp:["لا تنطبق أبدًا","تنطبق نادرًا","تنطبق أحيانًا","تنطبق دائمًا"],n:k=>[250,"150–250 فردًا لتقديرات مستقرة (Linacre)، و500 لنماذج IRT متعددة المعالم"]},
 {id:"sjt",t:"اختبارات الحكم الموقفي",en:"Situational Judgment Tests (SJT)",yr:1990,era:"حديثة",d:"يُعرض موقف واقعي وعدة تصرفات، ويختار المفحوص الأفضل (والأسوأ). تقيس المهارات والكفايات السلوكية وتقل فيها المرغوبية الاجتماعية، وتحتاج مفتاحًا من الخبراء.",resp:[],n:k=>[200,"200 فرد على الأقل + 5–10 خبراء لبناء مفتاح التصحيح"]},
 {id:"forced",t:"الاختيار القسري",en:"Forced-Choice / Thurstonian IRT",yr:2011,era:"حديثة",d:"عبارتان (أو أكثر) متساويتان في المرغوبية من أبعاد مختلفة، ويختار المفحوص الأكثر انطباقًا. تقلل التزييف والمرغوبية الاجتماعية، وتُحلل حديثًا بنموذج Thurstonian IRT (Brown & Maydeu-Olivares, 2011).",resp:[],n:k=>[300,"300 فرد على الأقل لنموذج Thurstonian IRT"]},
 {id:"cat",t:"الاختبار التكيفي المحوسب",en:"Computerized Adaptive Testing (CAT)",yr:1980,era:"حديثة",d:"بنك بنود معايَر بنظرية الاستجابة للمفردة؛ يختار الحاسوب البند التالي حسب إجابات الفرد، فيقيس بدقة بعدد بنود أقل. يتوقف عند وصول الخطأ المعياري لحد معين (مثلًا 0.30).",resp:["لا تنطبق أبدًا","تنطبق نادرًا","تنطبق أحيانًا","تنطبق دائمًا"],n:k=>[500,"500 فرد على الأقل لمعايرة بنك البنود"]},
 {id:"aig",t:"توليد البنود بالذكاء الاصطناعي",en:"AI-assisted Automatic Item Generation",yr:2020,era:"الأحدث",d:"تُستخدم النماذج اللغوية لتوليد بنود كثيرة من تعريف السمة، ثم يراجعها الخبراء ويحكمونها، وتُفحص إحصائيًا (التحليل العاملي، راش). يوفر الوقت لكنه لا يغني عن التحكيم والتجريب.",resp:["موافق بشدة","موافق","محايد","غير موافق","غير موافق بشدة"],n:k=>[Math.max(200,10*k),"مثل ليكرت: 10 أفراد لكل بند وبحد أدنى 200، بعد التحكيم"]}
];
const B={m:null,res:null,aud:null};
const respOf=m=>B.aud&&typeof AUD!=="undefined"&&m.resp&&m.resp.length?AUD.labels(m.resp,B.aud.p,B.aud.r):m.resp;
const q=c=>`«${c}»`;
function tplItems(m,c,dims,k){
 const pos=[`أشعر بـ${q(c)} في كثير من المواقف اليومية.`,`يلاحظ المحيطون بي ${q(c)} في تصرفاتي.`,`أفكر في الأمور المرتبطة بـ${q(c)} أكثر من غيري.`,`يظهر ${q(c)} لدي بوضوح عند التعامل مع الآخرين.`,`يصعب عليّ التحكم في ${q(c)} عندما أكون تحت ضغط.`,`يؤثر ${q(c)} في أدائي الدراسي أو المهني.`,`أشعر بـ${q(c)} عند مواجهة مواقف جديدة.`,`أتصرف بطريقة تعكس ${q(c)} حتى في المواقف البسيطة.`,`تتكرر لدي مواقف يظهر فيها ${q(c)}.`,`أجد نفسي مدفوعًا بـ${q(c)} في قراراتي.`,`يستمر ${q(c)} معي لفترات طويلة.`,`أتذكر مواقف كثيرة شعرت فيها بـ${q(c)}.`];
 const neg=[`نادرًا ما أشعر بـ${q(c)}.`,`لا يؤثر ${q(c)} في علاقاتي بالآخرين.`,`أستطيع أن أمضي يومي دون أن أفكر في ${q(c)}.`,`لا يلاحظ أحد ${q(c)} في سلوكي.`];
 const D=dims.length?dims:["عام"];const out=[];
 if(m==="osgood"){const P=[["جيد","سيئ","التقييم"],["مفيد","ضار","التقييم"],["ممتع","ممل","التقييم"],["مهم","تافه","التقييم"],["مريح","مزعج","التقييم"],["إيجابي","سلبي","التقييم"],["قوي","ضعيف","القوة"],["كبير","صغير","القوة"],["صعب","سهل","القوة"],["عميق","سطحي","القوة"],["نشط","خامل","النشاط"],["سريع","بطيء","النشاط"],["متغير","ثابت","النشاط"],["حاد","هادئ","النشاط"]];for(let i=0;i<k;i++){const p=P[i%P.length];out.push({text:`${p[0]} ـــ ـــ ـــ ـــ ـــ ـــ ـــ ${p[1]}`,dim:p[2],reverse:i%3===2})}return out}
 if(m==="guttman"){const L=["أحيانًا","مرة في الأسبوع على الأقل","عدة مرات في الأسبوع","يوميًا تقريبًا","لدرجة أنه يؤثر على بعض مهامي","لدرجة أنه يمنعني من بعض الأنشطة","لدرجة أنه يمنعني من معظم الأنشطة","لدرجة أنني أحتاج مساعدة متخصصة"];for(let i=0;i<k;i++)out.push({text:`أشعر بـ${q(c)} ${L[Math.min(i,L.length-1)]}${i>=L.length?` (مستوى ${i+1})`:""}.`,dim:"تراكمي",value:i+1});return out}
 if(m==="thurstone"){const V=[[11,`${q(c)} أمر ضروري ولا يمكن الاستغناء عنه.`],[10,`${q(c)} من أهم ما يميز الإنسان الناجح.`],[9,`أرى أن ${q(c)} له فوائد كثيرة.`],[8,`${q(c)} مفيد في أغلب المواقف.`],[7,`${q(c)} مقبول بشكل عام.`],[6,`لا أمانع وجود ${q(c)} في حياتي.`],[5,`ليس لدي رأي واضح حول ${q(c)}.`],[4,`أتحفظ أحيانًا على ${q(c)}.`],[3,`${q(c)} يسبب مشكلات أكثر مما يفيد.`],[2,`أرفض ${q(c)} في معظم المواقف.`],[1,`${q(c)} أمر ضار تمامًا ولا فائدة منه.`]];for(let i=0;i<k;i++){const j=Math.round(i*(V.length-1)/Math.max(1,k-1));out.push({text:V[j][1],dim:"الاتجاه",value:V[j][0]})}return out}
 if(m==="sjt"){const C=["في قاعة المحاضرات","أثناء العمل في مجموعة","مع أحد أفراد الأسرة","في مقابلة مهمة","مع صديق مقرب","أثناء امتحان","في موقف عام أمام الناس","عند تلقي نقد من شخص آخر"];for(let i=0;i<k;i++)out.push({text:`${C[i%C.length]}، واجهت موقفًا يتطلب ${q(c)}. ماذا تفعل؟`,dim:D[i%D.length],options:["أتعامل مع الموقف مباشرة وبهدوء","أطلب المساعدة أو المشورة من شخص أثق به","أؤجل التعامل مع الموقف لوقت لاحق","أنسحب من الموقف تمامًا"],key:"الأفضل: أ — الأسوأ: د (يُراجع المفتاح مع الخبراء)"});return out}
 if(m==="forced"){for(let i=0;i<k;i++){const a=pos[i%pos.length],b=pos[(i+5)%pos.length];out.push({text:"أي العبارتين تنطبق عليك أكثر؟",dim:`${D[i%D.length]} / ${D[(i+1)%D.length]}`,options:[a,b]})}return out}
 const lv=["سهل التأييد","متوسط","صعب التأييد"];
 for(let i=0;i<k;i++){const rev=(m==="likert"||m==="aig")&&(i%4===3);const t=rev?neg[Math.floor(i/4)%neg.length]:pos[(i-Math.floor(i/4))%pos.length];const it={text:t,dim:D[i%D.length],reverse:rev};if(m==="rasch"||m==="cat"){it.level=lv[i%3];it.value=+(-1.5+3*(i%3)/2+((i*37)%10-5)/20).toFixed(2)}out.push(it)}
 return out;
}
function simulate(items,n,binary,steps){
 const k=items.length,lam=items.map((_,i)=>.55+((i*13)%7)/20),thr=items.map(it=>it.value!=null&&Math.abs(it.value)<4?it.value/2:0);
 const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const rows=[];for(let p=0;p<n;p++){const th=gauss();rows.push(items.map((it,j)=>{const z=lam[j]*th+Math.sqrt(1-lam[j]**2)*gauss()-thr[j];if(binary)return z>0?1:0;const cut=[-1.3,-.45,.35,1.15,1.9].slice(0,steps-1);return 1+cut.filter(c=>z>c).length}))}
 return rows;
}
function labBuild(){
 const step=()=>{if(!B.m){view.innerHTML=labHead("بناء مقياس نفسي")+`<div class="panel"><h3>1) اختر طريقة البناء</h3><p class="muted" style="margin-top:0">مرتبة من الأقدم إلى الأحدث.</p><div class="meth">${METHODS.map(m=>`<button class="opt" data-m="${m.id}"><b>${m.t}</b><span class="yr">${m.yr}</span> <span class="chip ${m.era.startsWith("كلاس")?"":"gold"}">${m.era}</span><span class="en" style="display:block;text-align:start">${m.en}</span><small>${m.d}</small></button>`).join("")}</div></div><div class="panel" id="collect0"></div>`;renderCollect($("#collect0"));$$("[data-m]").forEach(b=>b.onclick=()=>{B.m=METHODS.find(x=>x.id===b.dataset.m);B.res=null;step();window.scrollTo(0,0)});return}
  const m=B.m;
  view.innerHTML=labHead("بناء مقياس نفسي")+`<div class="panel"><div class="row" style="justify-content:space-between"><span class="chip">${m.t} · ${m.yr}</span><button class="btn sm ghost" id="chg">تغيير الطريقة</button></div><p class="muted">${m.d}</p>
  <h3>2) بيانات المقياس</h3><div class="g2"><div><label class="fl" for="bLib">المفهوم المراد قياسه</label><select id="bLib">${typeof CLIB!=="undefined"?CLIB.list.map(c=>`<option value="${c.id}" ${(B.lib||"social_anx")===c.id?"selected":""}>${esc(c.n)}${c.dev?" (مقياس أصيل قيد التطوير)":""}${c.type==="attitude"?" (اتجاه)":""}</option>`).join(""):""}<option value="" ${B.lib===""?"selected":""}>مفهوم آخر (أكتبه بنفسي)</option></select><input type="text" id="bC" value="${esc(B.c||"")}" placeholder="اكتب اسم المفهوم" ${B.lib===""?"":"hidden"} style="margin-top:6px"></div><div><label class="fl" for="bP">الفئة المستهدفة</label><input type="text" id="bP" value="${esc(B.p||"طلاب الجامعة")}"></div></div>
  <div class="g2"><div><label class="fl" for="bK">عدد البنود (الأسئلة)</label><input type="number" id="bK" min="3" max="60" value="${B.k||12}"></div><div><label class="fl" for="bN">حجم العينة المخطط</label><input type="number" id="bN" min="10" max="2000" value="${B.n||200}"></div></div>
  <label class="fl" for="bPath">مسار القياس</label><select id="bPath"><option value="direct" ${B.path==="direct"?"selected":""}>مباشر: عبارات سلوكية صريحة لا تذكر اسم المفهوم</option><option value="indirect" ${B.path==="indirect"?"selected":""}>غير مباشر: مواقف غامضة، ومواقف سلوكية، وتقدير عن الآخرين، واختيار قسري</option><option value="both" ${!B.path||B.path==="both"?"selected":""}>الاثنان معًا (موصى به): 3 درجات ومؤشر الفجوة</option></select><div id="bLibInfo"></div><label class="fl" for="bD">الأبعاد (افصل بينها بفاصلة — اختياري)</label><input type="text" id="bD" value="${esc(B.d!=null?B.d:"المعرفي، الوجداني، السلوكي")}">${typeof AUD!=="undefined"?`<details class="aud-q" ${B.aud?"open":""}><summary><b>الفئة العمرية ولغة الصياغة</b> <span class="muted">(${B.aud?esc(AUD.prof(B.aud.p).t)+" · "+esc((AUD.REGISTERS.find(x=>x.id===B.aud.r)||{}).t||""):"اختياري: الافتراضي فصحى للشباب"})</span></summary>${AUD.selectorsHTML(B.aud||{p:"youth",r:"fusha"},"qa")}<div id="qaTips"></div><p class="muted" style="font-size:13.5px;margin:4px 0 0">تتغير ألفاظ العبارات والبدائل فقط؛ المعنى واتجاه العبارة وعدد البدائل ثابتة حتى لا يختل القياس. وللمقارنة بين نسخ لفئات مختلفة ابنِ نسخًا من المقياس نفسه في المعالج الكامل (خطوة جودة الصياغة) ليفحص تكافؤها تلقائيًا.</p></details>`:""}<div id="bRec"></div>
  <div class="row" style="margin-top:12px"><button class="btn" id="bTpl">ابنِ المقياس من مخطط المفهوم</button><button class="btn gold" id="bAI" hidden>ابنِ الأسئلة بالذكاء الاصطناعي</button></div><div id="bExt"></div></div><div id="bOut"></div>`;
  $("#chg").onclick=()=>{B.m=null;step()};
  const vals=()=>{B.lib=$("#bLib")?$("#bLib").value:"";B.path=$("#bPath")?$("#bPath").value:"direct";const LC=B.lib&&typeof CLIB!=="undefined"?CLIB.get(B.lib):null;if(LC){B.c=LC.n;$("#bD").value=LC.facets.map(f=>f[1]).join("، ")}else B.c=$("#bC").value.trim()||"السمة";B.p=$("#bP").value.trim();B.k=Math.max(3,Math.min(60,+$("#bK").value||12));B.n=Math.max(10,Math.min(2000,+$("#bN").value||100));B.d=$("#bD").value;return{c:B.c,p:B.p,k:B.k,n:B.n,dims:B.d.split(/[،,]/).map(s=>s.trim()).filter(Boolean)}};
  const aiPrompt=()=>{const v=vals();return `أنت خبير في بناء المقاييس النفسية باللغة العربية. ابنِ ${v.k} بندًا لقياس «${v.c}» لدى ${v.p||"الفئة المستهدفة"} باستخدام ${m.t} (${m.en}).${v.dims.length?` الأبعاد: ${v.dims.join("، ")} — وزّع البنود عليها بالتساوي.`:""}
قواعد إلزامية: ابدأ بتعريف إجرائي للمفهوم من نظرية منشورة واذكر جوانبه. لا تذكر اسم المفهوم أو مرادفًا صريحًا له داخل أي عبارة؛ اكتب مؤشرات محددة (فكرة أو شعور أو سلوك أو عرض جسدي) في موقف محدد. فكرة واحدة لكل عبارة، بلا نفي مزدوج ولا كلمات مطلقة ولا مصطلحات إكلينيكية، ومناسبة للفئة المستهدفة. العبارات العكسية تصف الطرف المقابل للسمة وليست نفيًا.${B.path!=="direct"?" أضف عبارات غير مباشرة: مواقف غامضة لها تفسير مهدد وتفسيران محايدان، ومواقف سلوكية ببدائل موزونة 0–2، وسؤال تقدير عن الآخرين؛ وضع أوزان البدائل في w.":""}${m.id==="likert"||m.id==="aig"?" اجعل نحو 25% من البنود سالبة (معكوسة).":""}${m.id==="thurstone"?" أعطِ كل عبارة قيمة مقترحة من 1 إلى 11 في value، موزعة على المتصل.":""}${m.id==="guttman"?" رتّب العبارات تصاعديًا في الشدة وضع ترتيبها في value.":""}${m.id==="rasch"||m.id==="cat"?" نوّع صعوبة التأييد وضع صعوبة مقترحة بالـ logit من -2 إلى 2 في value.":""}${m.id==="osgood"?" كل بند زوج صفات متضادة بالشكل: صفة ـــ صفة، وdim أحد: التقييم، القوة، النشاط.":""}${m.id==="sjt"?" كل بند موقف واقعي قصير مع 4 تصرفات في options ومفتاح الأفضل والأسوأ في key.":""}${m.id==="forced"?" كل بند: text = «أي العبارتين تنطبق عليك أكثر؟» وoptions عبارتان متقاربتان في المرغوبية الاجتماعية من بعدين مختلفين.":""}
أعد JSON فقط بهذا الشكل:
{"instructions":"تعليمات للمفحوص","items":[{"text":"...","dim":"...","reverse":false,"value":null,"options":[],"w":[],"key":""}],"notes":"ملاحظات للباحث عن التحكيم والتحليل"}`};
  const rec=()=>{const v=vals();const r=m.n(v.k);$("#bRec").innerHTML=`<div class="verdict ${v.n>=r[0]?"ok":"mid"}">العينة المقترحة لهذه الطريقة: ${r[1]} ← الحد الأدنى المقترح ≈ ${r[0]}. عينتك (${v.n}) ${v.n>=r[0]?"كافية ✔":"أقل من المقترح"}.</div>`;aiExternal(aiPrompt(),$("#bExt"))};
  ["bC","bP","bK","bN","bD"].forEach(i=>$("#"+i).oninput=rec);const libInfo=()=>{const sel=$("#bLib");if(!sel)return;const LC=sel.value&&typeof CLIB!=="undefined"?CLIB.get(sel.value):null;$("#bC").hidden=!!LC;$("#bD").disabled=!!LC;if(LC)$("#bD").value=LC.facets.map(f=>f[1]).join("، ");const F=LC?CLIB.fit(m.id,LC):null;$("#bLibInfo").innerHTML=LC?`<p class="muted" style="font-size:13.5px;margin:6px 0">${esc(LC.def)}</p>${F?`<div class="verdict ${F.block?"no":"mid"}">${esc(F.msg)}</div>`:""}`:`<p class="muted" style="font-size:13.5px;margin:6px 0">لمفهوم غير موجود في المكتبة استخدم زرار الذكاء الاصطناعي (أو انسخ الطلب لمساعد الذكاء الاصطناعي)، وهو ملتزم بنفس قواعد البناء.</p>`;B.res=null;const o=$("#bOut");if(o)o.innerHTML="";rec()};if($("#bLib")){$("#bLib").onchange=libInfo;$("#bPath").onchange=()=>{B.res=null;rec()};libInfo()}if($("#qaP")){const au=()=>{B.aud={p:$("#qaP").value,r:$("#qaR").value};$("#qaTips").innerHTML=AUD.tipsHTML(B.aud.p);B.res=null;const o=$("#bOut");if(o)o.innerHTML=""};$("#qaP").onchange=au;$("#qaR").onchange=au;$("#qaTips").innerHTML=AUD.tipsHTML((B.aud||{p:"youth"}).p)}rec();
  $("#bTpl").onclick=()=>{const v=vals();const au=B.aud;if(!B.lib||typeof CLIB==="undefined"){toast("المفهوم ده مش في المكتبة: استخدم زرار الذكاء الاصطناعي أو انسخ الطلب لمساعد الذكاء الاصطناعي");return}const L=CLIB.build(m.id,B.lib,B.path,v.k);if(!L.items.length){$("#bOut").innerHTML=`<div class="panel"><div class="verdict no">${esc(L.warn||"لا توجد عبارات لهذه الطريقة")}</div></div>`;return}let its=L.items;if(au&&typeof AUD!=="undefined"&&(au.r!=="fusha"))its=its.map(it=>Object.assign({},it,{text:AUD.adapt(it.text,au.p,au.r).text,options:(it.options||[]).map(o=>AUD.adapt(o,au.p,au.r).text)}));B.res={instructions:(au&&typeof AUD!=="undefined"&&AUD.instructions(au.p,au.r))||L.instructions,items:its,notes:L.notes+(au&&typeof AUD!=="undefined"?" مُكيّف لفئة: "+AUD.prof(au.p).t+"، راجع كل عبارة فالتحويل الآلي مسودة.":""),src:"lib",lib:B.lib};show()};
  aiGet().then(s=>{const btn=$("#bAI");if(!s||!btn)return;btn.hidden=false;btn.onclick=async()=>{btn.disabled=true;const old=btn.textContent;btn.textContent="جارٍ البناء… (قد يستغرق دقيقة)";
   try{const r=await s.json(aiPrompt(),{cache:false});if(!r||!Array.isArray(r.items)||!r.items.length)throw{code:"invalid_json"};B.res={instructions:String(r.instructions||""),items:r.items.map(x=>({text:String(x.text||""),dim:String(x.dim||""),reverse:!!x.reverse,value:x.value==null||x.value===""?null:+x.value,options:Array.isArray(x.options)?x.options.map(String):[],w:Array.isArray(x.w)&&x.w.length?x.w.map(Number):null,kind:Array.isArray(x.options)&&x.options.length?"sjt":"d",key:String(x.key||"")})).filter(x=>x.text),notes:String(r.notes||""),src:"ai"};show()}
   catch(e){toast(AI_ERR[e&&e.code]||"تعذر البناء الآن، استخدم القوالب الجاهزة أو انسخ الطلب لمساعد الذكاء الاصطناعي.")}
   btn.disabled=false;btn.textContent=old}});
  if(B.res)show();
 };
 function show(){const m=B.m,r=B.res,o=$("#bOut");if(!o)return;const v={c:B.c,n:B.n};
  const resp=respOf(m);const its=r.items;
  let h=`<div class="panel"><div class="row" style="justify-content:space-between"><h3 style="margin:0">3) مقياس ${esc(v.c)}</h3><span class="chip ${r.src==="ai"?"gold":""}">${r.src==="ai"?"مولّد بالذكاء الاصطناعي":"من مخطط المفهوم: مسودة علمية للتحكيم"}</span></div>
  <p><b>التعليمات:</b> ${esc(r.instructions||defInstr(m))}</p>`;
  const LC=(r.lib||B.lib)&&typeof CLIB!=="undefined"?CLIB.get(r.lib||B.lib):null;its.forEach((it,i)=>{const QF=typeof CLIB!=="undefined"?CLIB.quality(it,LC||{n:v.c,leak:[],type:"trait"}):[];h+=`<div class="qitem"><b>${i+1}.</b> ${esc(it.text)} ${it.reverse?'<span class="rev">(معكوس)</span>':""}${it.kind&&it.kind!=="d"&&typeof CLIB!=="undefined"?` <span class="chip">${CLIB.KIND[it.kind]||""}</span>`:""}${QF.map(q=>` <span class="chip ${q[0]==="bad"?"bad":"warn"}">${esc(q[1])}</span>`).join("")}<div class="muted" style="font-size:13.5px">${it.dim?"البعد: "+esc(it.dim):""}${it.value!=null&&isFinite(it.value)?` · ${m.id==="thurstone"?"القيمة المقترحة":m.id==="guttman"?"الترتيب":"الصعوبة (logit)"}: ${it.value}`:""}${it.level?" · "+it.level:""}</div>${it.options&&it.options.length?`<div class="sc">${it.options.map((op,j)=>`<span>${"أبجدهوز"[j]||j+1}) ${esc(op)}</span>`).join("")}</div>${it.key?`<div class="muted" style="font-size:13.5px">المفتاح: ${esc(it.key)}</div>`:""}`:resp.length?`<div class="sc">${resp.map(x=>`<span>${x}</span>`).join("")}</div>`:""}</div>`});
  h+=`<p class="muted" style="font-size:14px">${esc(r.notes||"")}</p><div class="box warn"><b>قبل التطبيق</b>هذه مسودة: اعرضها على 5–10 محكمين (صدق المحتوى CVR/CVI)، وجرّبها على عينة استطلاعية 30–50 فردًا، وعدّل الصياغة.</div>
  ${LC?(()=>{const cv=CLIB.coverage(its,LC);return `<details class="box" open><summary><b>مخطط المفهوم (Blueprint)</b></summary><p><b>التعريف الإجرائي:</b> ${esc(LC.def)}</p><p><b>الإطار النظري:</b> ${esc(LC.theory)}</p><p><b>الجوانب:</b> ${LC.facets.map(f=>esc(f[1])).join("، ")}</p><p><b>خطة الصدق مقدمًا:</b> يُتوقع ارتباط موجب مع: ${LC.nomo.pos.map(esc).join("، ")}${LC.nomo.neg.length?"؛ وسالب مع: "+LC.nomo.neg.map(esc).join("، "):""}${LC.nomo.none&&LC.nomo.none.length?"؛ وارتباط ضعيف أو منعدم مع: "+LC.nomo.none.map(esc).join("، "):""}. سجّل هذه التوقعات قبل جمع البيانات.</p>${cv.n?`<p><b>مصفوفة التغطية (العبارات المباشرة):</b></p><table class="otbl"><thead><tr>${cv.head.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${cv.rows.map(rw=>`<tr>${rw.map(x=>`<td>${typeof x==="number"?x:esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="muted" style="font-size:13.5px">العبارات العكسية ${cv.rev} من ${cv.n} (${Math.round(cv.pr*100)}%)${cv.pr<.15?": أقل من المقترح (15% إلى 40%)":cv.pr>.5?": أكثر من المقترح":""}${cv.empty.length?". جوانب بلا عبارات: "+cv.empty.map(esc).join("، "):""}</p>`:""}</details><details class="box"><summary><b>مفتاح التصحيح (لا يظهر للمفحوص)</b></summary><table class="otbl"><thead><tr><th>#</th><th>النوع</th><th>الجانب</th><th>التصحيح</th></tr></thead><tbody>${CLIB.keyRows(its).map(rw=>`<tr>${rw.map(x=>`<td>${esc(String(x))}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="muted" style="font-size:13.5px">${its.some(x=>x.w)&&its.some(x=>x.kind==="d")?"تُحسب 3 درجات: المباشرة (نسبة من الحد الأقصى)، وغير المباشرة (مجموع الأوزان)، والمجمّعة. والفرق بين المباشرة وغير المباشرة مؤشر للتجميل أو ضعف الاستبصار، ويُحلل كمتغير بحثي.":""}</p></details>`})():""}<div class="row"><button class="btn sm" id="bCopy">نسخ المقياس</button><button class="btn sm ghost" onclick="window.print()">طباعة / PDF</button></div></div>`;
  const sim=["sjt","forced"].includes(m.id)?null:true;
  if(sim)h+=`<div class="panel"><h3>4) جرّب التحليل على عينة افتراضية (${v.n} فردًا)</h3><p class="muted" style="margin-top:0">نولّد استجابات افتراضية لـ ${v.n} فردًا على بنودك (بعد عكس البنود السالبة) لتتدرب على حساب الثبات.</p><button class="btn sm gold" id="bSim">ولّد البيانات واحسب الثبات</button><div id="bSimOut"></div></div>`;
  o.innerHTML=h;o.scrollIntoView({behavior:"smooth",block:"start"});
  $("#bCopy").onclick=()=>{const t=`مقياس ${v.c}\n${r.instructions||defInstr(m)}\n\n`+its.map((it,i)=>`${i+1}. ${it.text}${it.reverse?" (معكوس)":""}${it.options&&it.options.length?"\n   "+it.options.map((x,j)=>("أبجدهوز"[j]||j+1)+") "+x).join("\n   "):""}`).join("\n")+(resp.length&&!(its[0].options&&its[0].options.length)?`\n\nالبدائل: ${resp.join(" / ")}`:"");const done=()=>toast("تم نسخ المقياس");navigator.clipboard?navigator.clipboard.writeText(t).then(done,()=>fallbackCopy(t,done)):fallbackCopy(t,done)};
  sharePanel(o);
  const sb=$("#bSim");if(sb)sb.onclick=()=>{const bin=!!m.bin,steps=Math.max(2,resp.length||5);if(its.some(x=>x.options&&x.options.length)&&its.some(x=>!(x.options&&x.options.length))){toast("المحاكاة للعبارات المباشرة فقط؛ اختر المسار المباشر للتجربة");return}const rows=simulate(its,Math.min(v.n,2000),bin,steps);const cols=its.map((_,j)=>rows.map(rw=>rw[j]));const a=alphaOf(cols);
   window._relPreset=rows.map(rw=>rw.join(" ")).join("\n");
   $("#bSimOut").innerHTML=`<div class="kpis" style="margin-top:10px"><div class="kpi hl"><small>${bin?"KR-20 / ألفا":"ألفا كرونباخ"}</small><b>${f2(a,3)}</b></div><div class="kpi"><small>عدد الأفراد</small><b>${rows.length}</b></div><div class="kpi"><small>عدد البنود</small><b>${its.length}</b></div></div><div class="verdict ${relLbl(a)[1]}">الثبات ${relLbl(a)[0]} (بيانات افتراضية للتدريب فقط — النتيجة الحقيقية تأتي من تطبيقك الفعلي)</div><div class="row"><button class="btn sm" onclick="go('lab/rel')">حلّل البنود في معمل الثبات</button></div>`};
 }
 step();
}
/* ========== SHARE SCALE: direct link + Google Forms + collect responses ========== */
const PUBLIC_URL="https://mohamedothman17.github.io/psych-stats-lab/";
const QKEY="statlab-lastQ";
const b64e=u8=>{let bin="";for(let i=0;i<u8.length;i+=8192)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
const b64d=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const bin=atob(s);return Uint8Array.from(bin,c=>c.charCodeAt(0))};
async function packQ(obj){const u=new TextEncoder().encode(JSON.stringify(obj));if(window.CompressionStream){try{const buf=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer());return"z"+b64e(buf)}catch(e){}}return"j"+b64e(u)}
async function unpackQ(s){const k=s[0],u=b64d(s.slice(1));if(k==="j")return JSON.parse(new TextDecoder().decode(u));if(k==="z"){if(!window.DecompressionStream)throw new Error("old browser");return JSON.parse(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text())}throw new Error("bad")}
const hashStr=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36)};
function buildQ(){const m=B.m,r=B.res,dirs={likert:"d",aig:"d",thurstone:"b",guttman:"b",osgood:"a",rasch:"a",cat:"a",sjt:"o",forced:"o"};
 const nm=$("#shName")?$("#shName").checked:true,dm=$$("#shDemo input:checked").map(i=>i.value);
 const Q={v:1,t:"مقياس "+(B.c||""),ins:r.instructions||defInstr(m),sc:respOf(m),s:dirs[m.id]||"a",m:m.id,nm,dm,items:r.items.map(it=>{const o={x:it.text};if(it.options&&it.options.length)o.o=it.options;if(it.w)o.w=it.w;if(it.reverse)o.r=1;return o})};
 Q.id=hashStr(JSON.stringify([Q.t,Q.sc,Q.items]));const g=gsCfg();if(g&&$("#shGS")&&$("#shGS").checked)Q.ep=g.url;return Q}
/* --- Google Sheets as the responses server (Apps Script web app) --- */
const GSKEY="statlab-gs";
function gsCfg(){try{const g=JSON.parse(localStorage.getItem(GSKEY)||"null");return g&&g.url&&g.key?g:null}catch(e){return null}}
function gsScript(key){return String.raw`// خادم ردود «مختبر الإحصاء النفسي» — Google Apps Script
// 1) اضغط Run على الدالة setup ووافق على الصلاحيات
// 2) Deploy ← New deployment ← Web app ← Execute as: Me ← Who has access: Anyone ← Deploy
// 3) انسخ Web app URL والصقه في الموقع
var SECRET = "__KEY__";

function setup() {
  var ss = getSS_();
  Logger.log("تم إنشاء شيت الردود: " + ss.getUrl());
  Logger.log("الخطوة التالية: Deploy ← New deployment ← Web app ← Who has access: Anyone");
}
function getSS_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty("SSID");
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  var ss = SpreadsheetApp.create("ردود مقاييس مختبر الإحصاء النفسي");
  p.setProperty("SSID", ss.getId());
  return ss;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function sheetFor_(ss, qid, title, create) {
  var tag = " - " + qid;
  var sh = ss.getSheets().filter(function (s) { var n = s.getName(); return n.slice(-tag.length) === tag; })[0];
  if (!sh && create) sh = ss.insertSheet(String(title || "مقياس").replace(/[:\\\/?*\[\]]/g, "").slice(0, 60) + tag);
  return sh;
}
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var qid = String(d.qid || "").replace(/[^a-z0-9]/g, "").slice(0, 20);
    if (!qid) return json_({ ok: false });
    var sh = sheetFor_(getSS_(), qid, d.t, true);
    if (sh.getLastRow() === 0) sh.appendRow(["التاريخ"].concat(d.h || []).concat(["raw"]));
    var row = [new Date()];
    if (d.nm) row.push(String(d.n || "").slice(0, 100));
    (d.d || []).forEach(function (x) { row.push(String(x).slice(0, 100)); });
    (d.s || []).forEach(function (x) { row.push(x); });
    row.push(JSON.stringify({ n: d.n || "", d: d.d || [], a: d.a || [] }));
    sh.appendRow(row);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.key !== SECRET) return json_({ ok: false, error: "key" });
  if (p.ping) return json_({ ok: true, sheet: getSS_().getUrl() });
  var sh = sheetFor_(getSS_(), String(p.qid || ""), "", false);
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, rows: [] });
  var v = sh.getRange(2, sh.getLastColumn(), sh.getLastRow() - 1, 1).getValues();
  var rows = [];
  v.forEach(function (r) { try { rows.push(JSON.parse(r[0])); } catch (x) {} });
  return json_({ ok: true, rows: rows });
}`.replace("__KEY__",key)}
function renderGS(el,onChange){const g=gsCfg();
 if(g){el.innerHTML=`<div class="verdict ok" style="margin:8px 0">✔ مربوط بـ Google Sheets — الردود هتتحفظ تلقائيًا في الشيت بتاعك.</div><div class="row"><button class="btn sm ghost" id="gsTest">اختبر الربط</button>${g.sheet?`<a class="btn sm ghost" style="text-decoration:none" target="_blank" rel="noopener" href="${esc(g.sheet)}">افتح شيت الردود</a>`:""}<button class="btn sm ghost" id="gsOff">فصل الربط</button></div>`;
  $("#gsOff",el).onclick=()=>{if(!confirm("فصل الربط؟ (الردود المحفوظة في الشيت لن تُمسح)"))return;try{localStorage.removeItem(GSKEY)}catch(e){}renderGS(el,onChange);onChange&&onChange()};
  $("#gsTest",el).onclick=async()=>{const r=await gsPing(g.url,g.key);toast(r?"✔ الربط شغال":"تعذر الاتصال؛ تأكد من النشر بـ Anyone")};return}
 let key="";try{const u=new Uint8Array(16);crypto.getRandomValues(u);key=b64e(u)}catch(e){key=Math.random().toString(36).slice(2)+Date.now().toString(36)}
 const code=gsScript(key);
 el.innerHTML=`<div class="box note" style="margin-top:8px"><b>الإعداد مرة واحدة فقط (دقيقتين) — بحسابك في جوجل</b><ol style="margin:4px 0"><li>اضغط «نسخ كود السيرفر».</li><li>افتح <a href="https://script.google.com/home/projects/create" target="_blank" rel="noopener">script.google.com</a> (مشروع جديد)، امسح الموجود والصق الكود، واحفظ (Ctrl+S).</li><li>اختر الدالة <b>setup</b> من الأعلى واضغط <b>Run ▶</b>، ووافق على الصلاحيات (لو ظهر «Google hasn't verified this app»: Advanced ← Go to project ← Allow).</li><li>اضغط <b>Deploy ← New deployment</b> ← اختر النوع <b>Web app</b> ← Execute as: <b>Me</b> ← Who has access: <b>Anyone</b> ← <b>Deploy</b>.</li><li>انسخ <b>Web app URL</b> (ينتهي بـ /exec) والصقه تحت واضغط «اربط».</li></ol>الكود فيه <b>مفتاح سري</b> خاص بك: بيه بس تقدر تسحب الردود، وهو محفوظ على جهازك ومش موجود في لينك المفحوصين.</div>
 <div class="codebox">${esc(code)}</div><div class="row" style="margin-top:8px"><button class="btn sm gold" id="gsCp">نسخ كود السيرفر</button><a class="btn sm ghost" style="text-decoration:none" target="_blank" rel="noopener" href="https://script.google.com/home/projects/create">افتح Google Apps Script</a></div>
 <label class="fl" for="gsUrl">Web app URL</label><input type="text" id="gsUrl" style="direction:ltr" placeholder="https://script.google.com/macros/s/.../exec"><div class="row" style="margin-top:8px"><button class="btn sm" id="gsSave">اربط</button></div>`;
 $("#gsCp",el).onclick=()=>{const d=()=>toast("تم نسخ كود السيرفر");navigator.clipboard?navigator.clipboard.writeText(code).then(d,()=>fallbackCopy(code,d)):fallbackCopy(code,d)};
 $("#gsSave",el).onclick=async()=>{const url=$("#gsUrl",el).value.trim();if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)){toast("اللينك لازم يبدأ بـ https://script.google.com/macros/s/ وينتهي بـ /exec");return}
  const b=$("#gsSave",el);b.disabled=true;b.textContent="جارٍ الاختبار…";const r=await gsPing(url,key);b.disabled=false;b.textContent="اربط";
  if(!r){toast("الاتصال فشل: تأكد إنك نشرت بـ Who has access: Anyone وإنك لزقت نفس الكود");return}
  try{localStorage.setItem(GSKEY,JSON.stringify({url,key,sheet:r.sheet||""}))}catch(e){}toast("✔ تم الربط بـ Google Sheets");renderGS(el,onChange);onChange&&onChange()};
}
async function gsPing(url,key){try{const r=await fetch(url+"?ping=1&key="+encodeURIComponent(key));const j=await r.json();return j&&j.ok?j:null}catch(e){return null}}
async function gsPost(ep,payload){try{const r=await fetch(ep,{method:"POST",body:JSON.stringify(payload)});const j=await r.json();return j&&j.ok?"ok":"fail"}catch(e){try{await fetch(ep,{method:"POST",mode:"no-cors",body:JSON.stringify(payload)});return"maybe"}catch(e2){return"fail"}}}
function sharePanel(o){const p=document.createElement("div");p.className="panel";
 p.innerHTML=`<h3>5) أرسل المقياس للمفحوصين</h3>
 <label class="row" style="gap:8px"><input type="checkbox" id="shName" checked> <b>إلزام المفحوص بكتابة اسمه</b></label>
 <p class="muted" style="margin:6px 0 2px">بيانات إضافية تطلبها (اختياري):</p><div class="row" id="shDemo">${["النوع","العمر","الكلية / التخصص","الفرقة الدراسية"].map(d=>`<label class="row" style="gap:6px"><input type="checkbox" value="${d}"> ${d}</label>`).join("")}</div>
 <div class="panel" style="background:var(--good-soft);border-color:var(--good);margin:12px 0 0"><h3 style="margin-bottom:4px">📊 حفظ الردود تلقائيًا في Google Sheets (موصى به)</h3><p class="muted" style="margin:0">لما المفحوص يدوس «إرسال» إجاباته تتسجل مباشرة في شيت على حسابك، من غير أكواد.</p><label class="row" style="gap:8px;margin-top:8px" id="shGSw"><input type="checkbox" id="shGS" checked> احفظ ردود هذا المقياس في Google Sheet</label><div id="gsBox"></div></div>
 <div class="row" style="margin-top:12px"><button class="btn" id="shLink">🔗 أنشئ لينك مباشر للمقياس</button><button class="btn ghost" id="shGF">📝 أنشئ نموذج Google Forms</button></div><div id="shOut"></div>`;
 o.appendChild(p);
 const gsUpd=()=>{$("#shGSw").hidden=!gsCfg()};renderGS($("#gsBox"),gsUpd);gsUpd();
 const c=document.createElement("div");c.className="panel";c.id="collect";o.appendChild(c);renderCollect(c);
 $("#shLink").onclick=async()=>{const Q=buildQ();try{localStorage.setItem(QKEY,JSON.stringify(Q))}catch(e){}const code=await packQ(Q);const url=PUBLIC_URL+"#take/"+code;
  $("#shOut").innerHTML=`<div class="box tip" style="margin-top:12px"><b>اللينك جاهز ✔</b>ابعته لأي حد؛ بيفتح من غير أي تسجيل، ويجاوب على الأسئلة${Q.nm?" بعد كتابة اسمه (إلزامي)":""}. ${Q.ep?"إجاباته هتتسجل تلقائيًا في Google Sheet بتاعك، وتسحبها تحت بزرار واحد.":"بعد ما يخلّص هيظهر له «كود ردّ» يبعته لك على واتساب، وأنت تجمع الأكواد تحت. (اربط Google Sheets فوق عشان الردود توصل تلقائيًا.)"}</div><input type="text" readonly value="${esc(url)}" style="direction:ltr" onclick="this.select()"><div class="row" style="margin-top:8px"><button class="btn sm gold" id="cpL">نسخ اللينك</button><a class="btn sm ghost" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent("برجاء الإجابة على "+Q.t+":\n"+url)}">إرسال على واتساب</a><a class="btn sm ghost" style="text-decoration:none" target="_blank" rel="noopener" href="${esc(url)}">جرّبه بنفسك</a></div>${url.length>6000?`<p class="muted" style="font-size:14px">⚠ اللينك طويل (${url.length} حرف) لكثرة البنود؛ يعمل في المتصفحات وواتساب، وإذا قُطع فقلل عدد البنود أو استخدم Google Forms.</p>`:""}`;
  $("#cpL").onclick=()=>{const d=()=>toast("تم نسخ اللينك");navigator.clipboard?navigator.clipboard.writeText(url).then(d,()=>fallbackCopy(url,d)):fallbackCopy(url,d)};renderCollect(c)};
 $("#shGF").onclick=()=>{const Q=buildQ();const code=gfScript(Q);
  $("#shOut").innerHTML=`<div class="box note" style="margin-top:12px"><b>إنشاء النموذج على Google Forms تلقائيًا (دقيقة واحدة)</b><ol style="margin:4px 0"><li>اضغط «نسخ الكود».</li><li>افتح <a href="https://script.google.com/home/projects/create" target="_blank" rel="noopener">script.google.com</a> بحسابك في جوجل (مشروع جديد).</li><li>امسح الموجود والصق الكود (Ctrl+V) ثم اضغط <b>Run ▶</b>.</li><li>وافق على الصلاحيات (Review permissions ← اختر حسابك ← Allow). لو ظهر «Google hasn't verified this app» اضغط Advanced ثم Go to project.</li><li>في <b>Execution log</b> هيظهر لك <b>لينك النموذج للمشاركين</b> ولينك التعديل، ونموذجك هيكون في Google Forms ومعاه Google Sheet للردود.</li></ol>${Q.nm?"الاسم مضاف كسؤال إلزامي.":""} بعد جمع الردود: من Google Sheets اعمل File ← Download ← Excel، وافتحه في تبويب SPSS هنا.</div><div class="codebox">${esc(code)}</div><div class="row" style="margin-top:8px"><button class="btn sm gold" id="cpG">نسخ الكود</button><a class="btn sm ghost" style="text-decoration:none" target="_blank" rel="noopener" href="https://script.google.com/home/projects/create">افتح Google Apps Script</a></div>`;
  $("#cpG").onclick=()=>{const d=()=>toast("تم نسخ كود Google Forms");navigator.clipboard?navigator.clipboard.writeText(code).then(d,()=>fallbackCopy(code,d)):fallbackCopy(code,d)}};
}
function gfScript(Q){const opts=Q.sc&&Q.sc.length?Q.sc:null;const items=Q.items.map(it=>({text:it.x,options:it.o||opts||["نعم","لا"]}));
 return `// كود إنشاء نموذج Google Forms — مختبر الإحصاء النفسي
function createScaleForm() {
  var TITLE = ${JSON.stringify(Q.t)};
  var INSTRUCTIONS = ${JSON.stringify(Q.ins)};
  var REQUIRE_NAME = ${Q.nm?"true":"false"};
  var DEMOGRAPHICS = ${JSON.stringify(Q.dm)};
  var ITEMS = ${JSON.stringify(items,null,1)};

  var form = FormApp.create(TITLE);
  form.setDescription(INSTRUCTIONS);
  form.setProgressBar(true);
  if (REQUIRE_NAME) form.addTextItem().setTitle('الاسم').setRequired(true);
  DEMOGRAPHICS.forEach(function (d) { form.addTextItem().setTitle(d).setRequired(true); });
  ITEMS.forEach(function (it, i) {
    form.addMultipleChoiceItem().setTitle((i + 1) + '. ' + it.text).setChoiceValues(it.options).setRequired(true);
  });
  var sheet = SpreadsheetApp.create(TITLE + ' - الردود');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  Logger.log('لينك النموذج للمشاركين: ' + form.getPublishedUrl());
  Logger.log('لينك تعديل النموذج: ' + form.getEditUrl());
  Logger.log('شيت الردود: ' + sheet.getUrl());
}`}
function scoreOf(Q,i,idx){if(Q.items[i]&&Q.items[i].w)return Q.items[i].w[idx];const it=Q.items[i],n=(it.o&&it.o.length)||(Q.sc&&Q.sc.length)||2;if(Q.s==="b")return idx===0?1:0;if(Q.s==="d")return n-idx;return idx+1}
function renderCollect(c){let Q=null;try{Q=JSON.parse(localStorage.getItem(QKEY)||"null")}catch(e){}
 if(!Q){c.innerHTML=`<h3>6) جمّع الردود وحللها</h3><p class="muted" style="margin:0">أنشئ اللينك المباشر أولًا، ثم الصق هنا أكواد الردود اللي توصلك.</p>`;return}
 const g=gsCfg();
 c.innerHTML=`<h3>6) جمّع ردود «${esc(Q.t)}» وحللها</h3>${Q.ep&&g&&g.url===Q.ep?`<div class="row" style="margin-bottom:10px"><button class="btn gold" id="rcPull">📥 اسحب الردود من Google Sheet</button>${g.sheet?`<a class="btn sm ghost" style="text-decoration:none" target="_blank" rel="noopener" href="${esc(g.sheet)}">افتح الشيت</a>`:""}</div><p class="muted" style="margin-top:0">أو لو حد بعتلك كود رد يدوي (لو النت كان ضعيف عنده) الصقه هنا:</p>`:`<p class="muted" style="margin-top:0">الصق رسائل الواتساب أو أكواد الردود كما هي (كل كود يبدأ بـ RSP1)، حتى لو كانت كلها في رسالة واحدة.</p>`}<textarea id="rcIn" style="min-height:110px" placeholder="RSP1:..."></textarea><div class="row" style="margin-top:8px"><button class="btn" id="rcGo">حوّل الأكواد إلى بيانات SPSS وحللها</button></div><div id="rcOut"></div>`;
 const pull=$("#rcPull",c);if(pull)pull.onclick=async()=>{pull.disabled=true;pull.textContent="جارٍ السحب…";let j=null;try{const r=await fetch(g.url+"?key="+encodeURIComponent(g.key)+"&qid="+encodeURIComponent(Q.id));j=await r.json()}catch(e){}pull.disabled=false;pull.textContent="📥 اسحب الردود من Google Sheet";
  if(!j||!j.ok){$("#rcOut",c).innerHTML=`<div class="verdict no">تعذر الاتصال بالشيت${j&&j.error==="key"?" (المفتاح غير مطابق — هل غيّرت الكود؟)":""}. جرّب من نسخة GitHub للموقع، وتأكد من النشر بـ Anyone.</div>`;return}
  if(!j.rows.length){$("#rcOut",c).innerHTML=`<div class="verdict mid">لا توجد ردود بعد على هذا المقياس.</div>`;return}respToDS(Q,j.rows,0,0)};
 $("#rcGo",c).onclick=()=>{const txt=$("#rcIn",c).value,re=/RSP1:([a-z0-9]+):([A-Za-z0-9_-]+)/g;let mm,rows=[],bad=0,other=0;while((mm=re.exec(txt))){if(mm[1]!==Q.id){other++;continue}try{rows.push(JSON.parse(new TextDecoder().decode(b64d(mm[2]))))}catch(e){bad++}}
  if(!rows.length){$("#rcOut",c).innerHTML=`<div class="verdict no">لم أجد أكواد صالحة لهذا المقياس${other?` (${other} كود تخص مقياسًا آخر)`:""}.</div>`;return}
  respToDS(Q,rows,bad)};
}
function respToDS(Q,rows,bad){
  if(!CHUNK_OK.spss){needChunks(["spss"]).then(()=>respToDS(Q,rows,bad),()=>toast("تعذر التحميل. تحقق من الاتصال وحدّث الصفحة."));return}
  if(DS&&DS.rows&&DS.rows.length&&!confirm("سيتم استبدال البيانات الحالية في تبويب SPSS بردود المقياس. متأكد؟"))return;
  DS={name:Q.t.replace(/\s+/g,"_"),vars:[],rows:[]};
  if(Q.nm){const v=newVar("name","s");v.label="الاسم";DS.vars.push(v)}
  Q.dm.forEach((d,i)=>{const v=newVar("demo"+(i+1),"s");v.label=d;DS.vars.push(v)});
  const base=DS.vars.length;Q.items.forEach((it,i)=>{const v=newVar("q"+(i+1));v.label=it.x.slice(0,120)+(it.r?" (معكوس)":"");v.dec=0;v.measure=Q.s==="b"?"nominal":"ordinal";const ops=it.o||Q.sc||[];const vals={};ops.forEach((op,k)=>{vals[scoreOf(Q,i,k)]=op});v.values=vals;DS.vars.push(v)});
  const seen=new Set;let dup=0;rows.forEach(rw=>{const key=JSON.stringify(rw);if(seen.has(key)){dup++;return}seen.add(key);const row=[];if(Q.nm)row.push(String(rw.n||""));Q.dm.forEach((_,i)=>row.push(rw.d&&rw.d[i]!=null?String(rw.d[i]):null));Q.items.forEach((_,i)=>{const a=rw.a&&rw.a[i];row.push(a==null||a<0?null:scoreOf(Q,i,a))});DS.rows.push(row)});
  dsSave();SA.tab="data";SA.page=0;SA.out=[];toast(`تم تحويل ${DS.rows.length} رد${dup?` (حُذف ${dup} مكرر)`:""}${bad?` — ${bad} كود تالف`:""}`);go("spss");
}
async function renderTake(code){let Q;try{Q=await unpackQ(code)}catch(e){view.innerHTML=`<div class="panel verdict no">الرابط غير صالح أو ناقص. اطلب من الباحث إرسال الرابط كاملًا.</div>`;return}
 const opts=it=>it.o||Q.sc||[];
 view.innerHTML=`<div class="lhead"><h2>${esc(Q.t)}</h2><p style="margin:6px 0 0">${esc(Q.ins)}</p></div>
 ${Q.nm||Q.dm.length?`<div class="panel">${Q.nm?`<label class="fl" for="tkN">الاسم <span style="color:var(--bad)">*</span></label><input type="text" id="tkN" autocomplete="name">`:""}${Q.dm.map((d,i)=>`<label class="fl" for="tkD${i}">${esc(d)} <span style="color:var(--bad)">*</span></label><input type="text" id="tkD${i}">`).join("")}</div>`:""}
 ${Q.items.map((it,i)=>`<div class="tk-item" id="tk${i}"><b>${i+1}.</b> ${esc(it.x)}<div class="tk-opts ${it.o?"col":""}">${opts(it).map((op,k)=>`<label><input type="radio" name="tq${i}" value="${k}"> ${esc(op)}</label>`).join("")}</div></div>`).join("")}
 <div class="row"><button class="btn" id="tkGo">إرسال الإجابات</button></div><div id="tkOut"></div><p class="muted" style="font-size:13.5px;margin-top:16px">لا يتم حفظ إجاباتك على أي خادم؛ تُرسل فقط للباحث عن طريق الكود.</p>`;
 $("#tkGo").onclick=async()=>{let miss=0;const a=Q.items.map((_,i)=>{const s=$(`input[name="tq${i}"]:checked`);$("#tk"+i).classList.toggle("miss",!s);if(!s)miss++;return s?+s.value:-1});
  const n=Q.nm?$("#tkN").value.trim():"";const d=Q.dm.map((_,i)=>$("#tkD"+i).value.trim());
  if(Q.nm&&!n){toast("اكتب اسمك أولًا");$("#tkN").focus();return}if(d.some(x=>!x)){toast("أكمل البيانات المطلوبة");return}if(miss){toast(`باقي ${miss} سؤال بدون إجابة`);const f=$(".tk-item.miss");f&&f.scrollIntoView({behavior:"smooth",block:"center"});return}
  const rc=`RSP1:${Q.id}:${b64e(new TextEncoder().encode(JSON.stringify({n,d,a})))}`;
  $("#tkGo").disabled=true;
  if(Q.ep&&/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(Q.ep)){$("#tkGo").textContent="جارٍ الإرسال…";
   const h=[...(Q.nm?["الاسم"]:[]),...Q.dm,...Q.items.map((it,i)=>"q"+(i+1)+": "+it.x.slice(0,40))];
   const st=await gsPost(Q.ep,{qid:Q.id,t:Q.t,h,nm:Q.nm,n,d,a,s:a.map((x,i)=>scoreOf(Q,i,x))});
   if(st!=="fail"){$("#tkGo").textContent="تم الإرسال";$("#tkOut").innerHTML=`<div class="panel" style="margin-top:12px;text-align:center"><div style="font-size:48px">✅</div><h3 style="justify-content:center">تم إرسال إجاباتك بنجاح${n?" يا "+esc(n):""}. شكرًا لمشاركتك!</h3><p class="muted">يمكنك إغلاق الصفحة الآن.</p><details class="steps" style="text-align:start"><summary>لو طلب منك الباحث كود الرد</summary><div class="codebox">${esc(rc)}</div></details></div>`;$("#tkOut").scrollIntoView({behavior:"smooth"});return}
   toast("تعذر الإرسال التلقائي — ابعت الكود للباحث")}
  $("#tkGo").textContent="إرسال الإجابات";$("#tkOut").innerHTML=`<div class="panel" style="margin-top:12px"><h3>✔ شكرًا${n?" يا "+esc(n):""}! خطوة أخيرة</h3><p>ابعت كود الرد ده للباحث (الأسهل بزر الواتساب):</p><div class="codebox">${esc(rc)}</div><div class="row" style="margin-top:10px"><a class="btn gold" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent("ردي على "+Q.t+":\n"+rc)}">إرسال على واتساب</a><button class="btn ghost" id="tkCp">نسخ الكود</button><a class="btn ghost" style="text-decoration:none" href="mailto:?subject=${encodeURIComponent("رد "+Q.t)}&body=${encodeURIComponent(rc)}">إرسال بالإيميل</a></div></div>`;
  $("#tkCp").onclick=()=>{const dn=()=>toast("تم نسخ الكود");navigator.clipboard?navigator.clipboard.writeText(rc).then(dn,()=>fallbackCopy(rc,dn)):fallbackCopy(rc,dn)};$("#tkOut").scrollIntoView({behavior:"smooth"})};
}
function defInstr(m){return m.id==="thurstone"?"ضع علامة أمام العبارات التي توافق عليها فقط.":m.id==="guttman"?"أجب بنعم أو لا على كل عبارة.":m.id==="osgood"?"قيّم المفهوم على كل زوج من الصفات بوضع علامة في الخانة الأقرب لرأيك (1 = الصفة اليمنى، 7 = الصفة اليسرى).":m.id==="sjt"?"اقرأ كل موقف واختر التصرف الذي ستقوم به فعلًا.":m.id==="forced"?"اختر من كل زوج العبارة التي تنطبق عليك أكثر، حتى لو انطبقت الاثنتان.":"اقرأ كل عبارة واختر البديل الذي يعبر عنك بصدق، لا توجد إجابات صحيحة أو خاطئة."}
