(async function(){
 'use strict';
 const fragment=new URLSearchParams(location.hash.slice(1));
 let token=fragment.get('access_token');
 const isRecovery=fragment.get('type')==='recovery';
 const failed=fragment.has('error')||fragment.has('error_code');
 history.replaceState(null,'',location.pathname);
 const status=document.getElementById('recovery-status');
 const form=document.getElementById('recovery-form');
 const password=document.getElementById('new-password');
 const confirmation=document.getElementById('confirm-password');
 const button=document.getElementById('reset-submit');
 const base='https://hqrndqqvjgfqgtlzmusn.supabase.co/auth/v1';
 const key='sb_publishable_te_SncrOEWH9oZc-8QrVjA_f9mVtW1P';
 let saving=false;
 async function request(method,body){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{return await fetch(base+'/user',{method,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});}finally{clearTimeout(timer);}
 }
 if(!isRecovery||!token||failed){token=null;status.textContent='Open the latest password reset email from 4GOOD. If the link expired, request another in the app.';return;}
 try{
  const check=await request('GET');if(!check.ok)throw Error();
  const user=await check.json();if(!user.id)throw Error();
 }catch{token=null;status.textContent='This reset link is expired or could not be checked. Request a fresh link in 4GOOD.';return;}
 form.hidden=false;status.textContent='Choose a new password below. Then return to 4GOOD and sign in.';
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(saving||!token)return;
  if(password.value.length<8||password.value.length>128){status.textContent='Use 8–128 characters.';password.focus();return;}
  if(password.value!==confirmation.value){status.textContent='The passwords do not match.';confirmation.focus();return;}
  saving=true;button.disabled=true;button.textContent='Saving…';status.textContent='Saving your new password…';
  try{
   const response=await request('PUT',{password:password.value});
   if(!response.ok){
    const result=await response.json().catch(()=>({}));
    if(response.status===401||response.status===403){token=null;form.hidden=true;status.textContent='This reset session expired. Request a fresh link in 4GOOD.';return;}
    status.textContent=result.code==='same_password'?'Choose a password different from your previous password.':'Could not change your password. Check its length and try again, or request a fresh link.';return;
   }
   password.value='';confirmation.value='';form.hidden=true;token=null;
   status.textContent='Password changed. Return to 4GOOD and sign in with your new password.';
  }catch{status.textContent='The change could not be confirmed. Try signing in with the new password before requesting another link.';}
  finally{saving=false;button.disabled=false;button.textContent='Save new password';}
 });
 window.addEventListener('pagehide',()=>{token=null;password.value='';confirmation.value='';form.hidden=true;});
}());
