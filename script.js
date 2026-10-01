const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'),ease='cubic-bezier(.22,.8,.26,1)';
function entrance(element,distance=14){if(reducedMotion.matches)return;element.getAnimations().forEach(a=>a.cancel());element.animate([{opacity:0,transform:`translateY(${distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:ease});}
// Portfolio entries: category, YouTube video ID, title, and whether it is a Short.
const collections={
 ugc:{label:'AI UGC',style:0,description:'Creator-style video ads with a focus on relatable delivery and clear product messaging.'},
 music:{label:'AI MUSIC',style:1,description:'AI music and visuals brought together through sound and storytelling.'},
 pixar:{label:'PIXAR 3D',style:2,description:'Pixar-inspired 3D animation with expressive characters and visual storytelling.'},
 clay:{label:'CLAYMATION',style:3,description:'Clay-style animation with tactile visuals and playful movement.'},
 avatar:{label:'AI AVATAR',style:4,description:'AI avatar videos for product stories and brand communication.'},
 film:{label:'SHORT FILM ADS',style:5,description:'A narrative ad concept told through a short film.'}
};
const projectEntries=[
 ['ugc','gT7z7-lv0aI','BACKED UP KIDNEY',true],
 ['ugc','0tCDd1nvirQ','GPL1',true],
 ['ugc','CqwSUPbRGPA','UGC SAMPLE EDIT #2',true],
 ['ugc','mr0Qm90ae9k','UGC SAMPLE EDIT #3',true],
 ['ugc','eqrnIkmQiq8','UGC SAMPLE EDIT 1',true],
 ['music','YsWOVcI8QAY','MY WIFE CHEATED ME',false],
 ['music','Y9lKnJ3lWtQ','EVERWELNESS BLACK',true],
 ['pixar','DtSyOSfgnzI','GYM COACH WORKOUT',true],
 ['pixar','W5gPLdL0H-U','DUX DREAM ENERGY',true],
 ['pixar','qFIv8guC3og','BOSTIK',true],
 ['pixar','ya4n4uusRKg','COLLAGEN',true],
 ['avatar','hDTgNPQ0f_k','DOG TEETH PRODUCT',true],
 ['avatar','hCd4Rt9PAP8','BLUEBIRD',true],
 ['avatar','TB-oLnZ9Ys8','TEA',true],
 ['avatar','96oG0tcf51A','FILLET TREATS',true],
 ['avatar','8KI5LRuIeNQ','LIVER TREATS',true],
 ['film','jym6G9aozyI','REVENGE',false],
 ['clay','fAH0DcauyVI','BOSTIK VULCASEAL',true]
];
const projects=projectEntries.map(([category,youtubeId,title,isShort])=>({...collections[category],category,youtubeId,title,short:title,isShort,sub:`${collections[category].label} · Portfolio video`,format:isShort?'9:16 · YOUTUBE SHORT':'16:9 · VIDEO',thumbnail:`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,youtubeUrl:`https://www.youtube.com/${isShort?'shorts/':'watch?v='}${youtubeId}`}));
let activeFilter='ugc',current=0,displayedFilter=null,cards=[],pointerStart=null,swiped=false;
const filtered=()=>projects.filter(p=>p.category===activeFilter),stage=document.querySelector('#cards'),dialog=document.querySelector('#project-dialog');
function clearProjectMedia(){dialog.querySelector('video')?.pause();dialog.querySelectorAll('video,.youtube-player').forEach(media=>media.remove());}
function openProject(){
  const p=filtered()[current];if(!p)return;
  document.querySelector('#dialog-title').textContent=p.title;
  document.querySelector('#dialog-description').textContent=p.description;
  clearProjectMedia();
  dialog.dataset.orientation=p.isShort?'portrait':'landscape';
  const sourceLink=document.querySelector('#youtube-link');
  sourceLink.hidden=!p.youtubeId;
  if(p.youtubeId){
    sourceLink.href=p.youtubeUrl;
    const frame=document.createElement('iframe'),player=document.createElement('div');
    player.className=`youtube-player ${p.isShort?'portrait':'landscape'}`;
    frame.src=`https://www.youtube-nocookie.com/embed/${p.youtubeId}?playsinline=1&rel=0`;
    frame.title=`Play ${p.title}`;
    frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen=true;
    frame.referrerPolicy='strict-origin-when-cross-origin';
    player.append(frame);
    document.querySelector('#dialog-description').before(player);
  }else if(p.video){
    const video=document.createElement('video');video.src=p.video;video.controls=true;video.playsInline=true;video.preload='metadata';video.className='project-video';document.querySelector('#dialog-description').before(video);
  }
  dialog.showModal();entrance(dialog,20);
}
function buildCards(list){stage.replaceChildren();cards=list.map((p,index)=>{const b=document.createElement('button');b.className=`project-card style-${p.style}${p.isShort?'':' wide-card'}`;b.setAttribute('aria-label',`Select ${p.title}`);for(const[cls,text]of [['card-no',`PROJECT ${String(index+1).padStart(2,'0')}`],['card-circle','▶'],['card-title',p.short],['card-type','WATCH VIDEO']]){const span=document.createElement('span');span.className=cls;span.textContent=text;if(cls==='card-circle')span.setAttribute('aria-hidden','true');b.append(span);}if(p.thumbnail){const image=document.createElement('img');image.className='craft-thumbnail';image.src=p.thumbnail;image.alt='';image.loading=index===0?'eager':'lazy';image.decoding='async';image.addEventListener('error',()=>image.remove(),{once:true});b.prepend(image);}b.addEventListener('click',event=>{if(swiped&&event.detail>0){swiped=false;return;}if(index===current)openProject();else{current=index;render();}});stage.append(b);return b;});}
function carouselSlot(index,selected,count){if(count<=2)return index-selected;let slot=(index-selected+count)%count;return slot>count/2?slot-count:slot;}
function render(animate=true){const list=filtered(),p=list[current],changed=displayedFilter!==activeFilter;stage.dataset.count=list.length;document.querySelector('.gallery-bottom').hidden=list.length<=1;stage.setAttribute('aria-label',list.length===1?'Open the craft to view project details':'Swipe or use arrow keys to browse crafts');if(changed){buildCards(list);displayedFilter=activeFilter;}document.querySelector('.project-detail').hidden=!list.length;if(!list.length){const message=document.createElement('p');message.className='gallery-empty';message.textContent='Crafts coming soon.';stage.replaceChildren(message);return;}cards.forEach((card,index)=>{const slot=carouselSlot(index,current,list.length);const old=Number(card.dataset.slot??slot),teleport=Math.abs(slot-old)>2;if(teleport)card.classList.add('teleport');card.dataset.slot=slot;card.style.setProperty('--slot',slot);card.style.setProperty('--scale',slot===0?1:Math.abs(slot)===1?.82:.66);card.style.setProperty('--shade',slot===0?0:Math.abs(slot)===1?.25:.5);card.style.zIndex=10-Math.abs(slot);card.classList.toggle('current',slot===0);card.classList.toggle('side',slot!==0);card.tabIndex=slot===0?0:-1;card.setAttribute('aria-hidden',String(Math.abs(slot)>2));card.setAttribute('aria-current',String(slot===0));if(teleport){card.getBoundingClientRect();card.classList.remove('teleport');}});document.querySelector('#gallery-count').textContent=`${String(current+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;for(const[id,value]of Object.entries({'project-category':p.label,'project-title':p.title,'project-sub':p.sub,'project-description':p.description,'project-format':p.format}))document.getElementById(id).textContent=value;if(animate){entrance(document.querySelector('.project-detail'),8);if(changed)entrance(stage,16);}}
function move(direction){if(filtered().length<=1)return;current=(current+direction+filtered().length)%filtered().length;render();}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{if(activeFilter===button.dataset.filter)return;activeFilter=button.dataset.filter;current=0;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});render();}));
document.querySelector('#prev').addEventListener('click',()=>move(-1));document.querySelector('#next').addEventListener('click',()=>move(1));
stage.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);cards[current]?.focus({preventScroll:true});}});
stage.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};swiped=false;});stage.addEventListener('pointerup',e=>{if(!pointerStart)return;const x=e.clientX-pointerStart.x,y=e.clientY-pointerStart.y;if(Math.abs(x)>40&&Math.abs(x)>Math.abs(y)){swiped=true;move(x<0?1:-1);}pointerStart=null;});stage.addEventListener('pointercancel',()=>{pointerStart=null;});
const steps=[
 {label:'STUDY',title:'I study the business before I touch the edit.',description:'I get to know your offer, audience, brand, and customer pain points. The goal is to understand what makes people buy — and what your ad needs to communicate.',board:'Know what we’re selling.',items:['Offer and product benefits','Audience and buying objections','Brand voice and positioning']},
 {label:'ANALYZE',title:'I break down the ads already winning.',description:'I study your strongest ads and your competitors’ creatives: their hooks, angles, pacing, proof, and calls to action. Those patterns inform a fresh approach that fits your business.',board:'Find the winning patterns.',items:['Competitor and ad research','Hooks, angles, and structure','What to test in your creative']},
 {label:'BLUEPRINT',title:'Your brief becomes my production blueprint.',description:'I follow the brief, lock in the message, and map the build before creating. Script, scenes, visual references, deliverables, and brand requirements all guide the production.',board:'Turn direction into a plan.',items:['Brief, script, and story beats','Scene plan and visual direction','Formats, deadlines, and requirements']},
 {label:'CREATE',title:'Build the creative around the offer.',description:'I generate the visuals, shape the voice and sound, and assemble the edit. Every scene supports the message — from the opening hook to the product proof and final call to action.',board:'From blueprint to first cut.',items:['AI visuals and character consistency','Voiceover, music, and sound design','Hook, proof, and call to action']},
 {label:'REFINE',title:'Tighten every detail before delivery.',description:'I review the ad for clarity, pacing, captions, visual consistency, and alignment with your brief. Then I use your feedback to sharpen the edit and prepare the approved version.',board:'Make every second earn its place.',items:['Quality control and brief check','Pacing, captions, and audio polish','Feedback and final revisions']},
 {label:'DELIVER',title:'Hand over creative that’s ready to run.',description:'You receive the approved videos in the agreed formats, organized and ready for your campaign. Each export is checked for aspect ratio, resolution, sound, and final presentation.',board:'Ready for your next campaign.',items:['Platform-ready video exports','Agreed versions and formats','Organized files and final checks']}
];
const stepButtons=document.querySelector('.steps');stepButtons.replaceChildren(...steps.map((s,index)=>{const b=document.createElement('button');b.id=`step-${index}`;b.dataset.step=index;b.setAttribute('role','tab');b.setAttribute('aria-controls','step-panel');b.append(`${String(index+1).padStart(2,'0')} `);const name=document.createElement('span');name.textContent=s.label[0]+s.label.slice(1).toLowerCase();b.append(name);return b;}));
let activeStep=0;
function showStep(index,focus=false,animate=true){activeStep=index;const s=steps[index];stepButtons.style.setProperty('--active-step',index);document.querySelectorAll('[data-step]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;if(focus&&i===index)b.focus({preventScroll:true});});document.querySelector('#step-panel').setAttribute('aria-labelledby',`step-${index}`);for(const[id,value]of Object.entries({'step-number':String(index+1).padStart(2,'0'),'step-label':s.label,'step-title':s.title,'step-description':s.description,'board-number':`${String(index+1).padStart(2,'0')} / 06`,'board-title':s.board}))document.getElementById(id).textContent=value;document.querySelector('#board-list').replaceChildren(...s.items.map(item=>{const li=document.createElement('li');li.textContent=item;return li;}));if(animate){entrance(document.querySelector('#step-panel>div'),12);entrance(document.querySelector('.process-board'),20);}}
document.querySelectorAll('[data-step]').forEach(b=>{b.addEventListener('click',()=>{if(activeStep!==Number(b.dataset.step))showStep(Number(b.dataset.step));});b.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const i=Number(b.dataset.step);let next;if(e.key==='ArrowRight')next=(i+1)%steps.length;if(e.key==='ArrowLeft')next=(i+steps.length-1)%steps.length;if(e.key==='Home')next=0;if(e.key==='End')next=steps.length-1;if(next!==undefined){e.preventDefault();showStep(next,true);}});});
document.querySelector('#view-project').addEventListener('click',openProject);document.querySelectorAll('.dialog-close,.dialog-done').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});document.querySelector('#year').textContent=new Date().getFullYear();
const themeToggle=document.querySelector('#theme-toggle');function updateThemeControl(){const dark=document.documentElement.dataset.theme==='dark';themeToggle.setAttribute('aria-pressed',String(dark));document.querySelector('#theme-icon').textContent=dark?'☀':'☾';document.querySelector('#theme-label').textContent=dark?'Light mode':'Dark mode';themeToggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');}
themeToggle.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('portfolio-theme',theme);}catch{}updateThemeControl();});updateThemeControl();render(false);showStep(0,false,false);
// Display each supplied logo through its own viewport, omitting the two unwanted icons.
const toolLogos=[['CapCut',60,119],['Higgsfield',283,100],['AI creation tool',390,116],['ElevenLabs',505,78],['HeyGen',588,110],['Slack',703,99],['Notion',803,102],['Zapier',1010,100],['ChatGPT',1110,114],['Google Flow',0,110,'assets/google-flow-logo.png']];
toolLogos.forEach(([name,x,width,source])=>{const item=document.createElement('div');item.className=source?'tool-logo flow-logo':'tool-logo';item.setAttribute('role','img');item.setAttribute('aria-label',name);item.title=name;item.style.setProperty('--logo-x',x);item.style.setProperty('--logo-width',width);const art=document.createElement('div');art.className=source?'flow-artwork':'logo-artwork';if(source){const image=document.createElement('img');image.src=source;image.alt='';image.width=256;image.height=256;art.append(image);}item.append(art);document.querySelector('.tools-row').append(item);});
if(!reducedMotion.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entrance(entry.target,22);observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.section-heading,.about,.tools,.footer-main').forEach(e=>observer.observe(e));}


dialog.addEventListener('close',clearProjectMedia);



const header=document.querySelector('.header'),menuToggle=document.querySelector('#menu-toggle'),navigation=document.querySelector('#site-navigation'),compactNavigation=matchMedia('(max-width: 980px)');
function setMenu(open,returnFocus=false){header.dataset.menuOpen=String(open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');document.querySelector('#menu-label').textContent=open?'Close':'Menu';if(open)entrance(navigation,8);if(returnFocus)menuToggle.focus({preventScroll:true});}
header.classList.add('menu-ready');setMenu(false);
menuToggle.addEventListener('click',()=>setMenu(header.dataset.menuOpen!=='true'));
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{if(compactNavigation.matches)setMenu(false,true);}));
header.addEventListener('keydown',event=>{if(event.key==='Escape'&&compactNavigation.matches&&header.dataset.menuOpen==='true'){event.preventDefault();setMenu(false,true);}});
compactNavigation.addEventListener('change',()=>{if(compactNavigation.matches&&navigation.contains(document.activeElement))setMenu(false,true);else setMenu(false);});
document.addEventListener('click',event=>{if(compactNavigation.matches&&header.dataset.menuOpen==='true'&&!header.contains(event.target))setMenu(false);});
