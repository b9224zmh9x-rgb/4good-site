(async function () {
  'use strict';
  const fragment = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const token = fragment.get('access_token');
  const authError = fragment.has('error') || fragment.has('error_code') || query.has('error') || query.has('error_code');
  const recovery = fragment.get('type') === 'recovery' || query.get('type') === 'recovery';
  const isAuth = Boolean(token || authError || recovery || query.has('code'));
  // Never store, log, or forward auth material to other pages.
  if (location.hash || isAuth) history.replaceState(null, '', location.pathname);
  const main = document.querySelector('main');
  if (!isAuth) {
    const note = document.createElement('section');
    note.className = 'card';
    note.style.cssText = 'display:block;margin:24px 0';
    note.innerHTML = '<strong>Just verified your email?</strong><p>Return to the 4GOOD app and sign in with the email and password you registered with. If the app still says your email is unconfirmed, contact support. You do not need another account.</p>';
    main.prepend(note);
    return;
  }
  main.innerHTML = '<p class="eyebrow">Your 4GOOD account</p><div role="status" aria-live="polite" aria-atomic="true"><h1 id="verification-title">Checking your email…</h1><p id="verification-message">Please keep this page open for a moment.</p></div><section class="card" style="display:block;margin:24px 0"><strong>Continue in the 4GOOD app</strong><ol style="line-height:1.8;padding-left:22px"><li>Switch back to 4GOOD on your phone.</li><li>Choose <strong>Sign in</strong> using your registered email and password.</li><li>Start with a grocery receipt photo.</li></ol><p class="muted">This website cannot automatically sign you into the app. You do not need to create another account.</p></section><p>Still stuck? <a href="support.html">Contact support</a>. Never send anyone your password or verification link.</p>';
  document.title = '4GOOD — Email verification';
  const title = document.getElementById('verification-title');
  const message = document.getElementById('verification-message');
  function show(heading, description) { title.textContent = heading; message.textContent = description; }
  if (recovery) {
    show('Password reset needs help', 'This page cannot set a new password. Contact support for help; your password has not been changed here.');
    return;
  }
  if (authError) {
    show('This link could not be confirmed', 'It may have expired or already been used. First try signing in to 4GOOD. If your email is still unconfirmed, request a fresh link or contact support.');
    return;
  }
  if (!token) {
    show('Return to 4GOOD to check', 'We cannot confirm your account status from this link. Open the app and try signing in.');
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://hqrndqqvjgfqgtlzmusn.supabase.co/auth/v1/user', {
      headers: { apikey: 'sb_publishable_te_SncrOEWH9oZc-8QrVjA_f9mVtW1P', Authorization: 'Bearer ' + token },
      signal: controller.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'
    });
    if (!response.ok) throw new Error('Account status unavailable');
    const user = await response.json();
    if (user.email_confirmed_at) {
      show('Email verified. You’re ready.', 'Your email is confirmed. Now return to 4GOOD and sign in with the email and password you registered with.');
    } else {
      show('Your email is not confirmed yet', 'Use the latest confirmation email, then return to 4GOOD and sign in. Contact support if you are stuck.');
    }
  } catch (_) {
    show('We couldn’t check your status', 'Your email may already be verified. Return to 4GOOD and try signing in. If it still says unconfirmed, contact support.');
  } finally { clearTimeout(timeout); }
}());
