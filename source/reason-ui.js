/* Accessible reasoning popup that preserves the existing study engine and content. */
(() => {
  const root=document.getElementById('app');
  if(!root)return;
  let active=null;
  function closeReason(){
    if(!active)return;
    const {overlay,origin,onKey}=active;
    document.removeEventListener('keydown',onKey);
    overlay.remove();
    document.documentElement.classList.remove('reason-popup-active');
    active=null;
    if(origin && origin.isConnected)origin.focus();
  }
  function showReason(origin,title,reason){
    closeReason();
    const overlay=document.createElement('div');
    overlay.className='reason-popup-backdrop';
    const dialog=document.createElement('section');
    dialog.className='reason-popup';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','reason-popup-title');
    dialog.tabIndex=-1;
    const header=document.createElement('div');
    header.className='reason-popup-header';
    const heading=document.createElement('div');
    const eyebrow=document.createElement('span');
    eyebrow.className='reason-popup-eyebrow';
    eyebrow.textContent='STEP-BY-STEP UNDERSTANDING';
    const h2=document.createElement('h2');
    h2.id='reason-popup-title';
    h2.textContent='Why this method?';
    heading.append(eyebrow,h2);
    const close=document.createElement('button');
    close.type='button';
    close.className='reason-popup-close';
    close.textContent='×';
    close.setAttribute('aria-label','Close explanation');
    close.addEventListener('click',closeReason);
    header.append(heading,close);
    const topic=document.createElement('div');
    topic.className='reason-popup-topic';
    topic.textContent=title;
    const body=document.createElement('p');
    body.className='reason-popup-body';
    body.lang='my';
    body.textContent=reason;
    const footer=document.createElement('div');
    footer.className='reason-popup-footer';
    const back=document.createElement('button');
    back.type='button';
    back.className='btn btn-primary';
    back.textContent='Back to calculation';
    back.addEventListener('click',closeReason);
    footer.append(back);
    dialog.append(header,topic,body,footer);
    overlay.append(dialog);
    overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)closeReason()});
    const onKey=event=>{
      if(event.key==='Escape'){event.preventDefault();closeReason();return;}
      if(event.key==='Tab'){
        const controls=[close,back];
        const idx=controls.indexOf(document.activeElement);
        if(event.shiftKey && (idx===0 || idx===-1)){event.preventDefault();back.focus();}
        else if(!event.shiftKey && idx===1){event.preventDefault();close.focus();}
      }
    };
    document.body.append(overlay);
    document.documentElement.classList.add('reason-popup-active');
    active={overlay,origin,onKey};
    document.addEventListener('keydown',onKey);
    close.focus();
  }
  function enhance(){
    for(const card of root.querySelectorAll('.reason:not([data-reason-enhanced])')){
      const description=card.querySelector('p');
      if(!description)continue;
      const value=description.textContent.trim();
      const title=card.closest('.paper')?.querySelector('h2')?.textContent?.trim() || 'Worked solution';
      card.dataset.reasonEnhanced='true';
      const button=document.createElement('button');
      button.type='button';
      button.className='reason-popup-trigger';
      button.setAttribute('aria-haspopup','dialog');
      button.setAttribute('aria-label','Why this method? Open the Myanmar explanation for '+title);
      const left=document.createElement('span');
      left.className='reason-popup-trigger-text';
      const strong=document.createElement('strong');
      strong.textContent='Why this method?';
      const subtitle=document.createElement('span');
      subtitle.textContent='မြန်မာဘာသာဖြင့် ရှင်းလင်းချက် ကြည့်ရန်';
      left.append(strong,subtitle);
      const arrow=document.createElement('span');
      arrow.className='reason-popup-trigger-arrow';
      arrow.textContent='›';
      arrow.setAttribute('aria-hidden','true');
      button.append(left,arrow);
      button.addEventListener('click',()=>showReason(button,title,value));
      card.replaceChildren(button);
    }
  }
  const observer=new MutationObserver(enhance);
  observer.observe(root,{childList:true,subtree:true});
  window.addEventListener('hashchange',closeReason);
  enhance();
})();
