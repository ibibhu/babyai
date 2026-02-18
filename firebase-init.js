/**
 * firebase-init.js
 * ─────────────────────────────────────────────────────────────────
 * Shared Firebase + Firestore + Google Auth setup.
 * Include AFTER the three Firebase CDN scripts in every HTML file.
 *
 * What this does:
 *  1. Initialises Firebase (once, guarded against double-init)
 *  2. Exports window.fireDb  — same as your Vue plugin
 *  3. Exports window.docRef  — shortcut to babyNames/state
 *  4. Handles Google Sign-In on every page automatically
 *     - Shows a full-screen login overlay if not signed in
 *     - Hides it once auth succeeds
 *     - Shows the signed-in user's name + avatar in a top-right chip
 * ─────────────────────────────────────────────────────────────────
 */

(function () {

  // ── 1. Firebase config ─────────────────────────────────────────
  const firebaseConfig = {
    apiKey:            'AIzaSyAUh7dLZOQUZP31o6ZJXBIhcM-dMeWnV4k',
    authDomain:        'bikycaughtitli.firebaseapp.com',
    projectId:         'bikycaughtitli',
    storageBucket:     'bikycaughtitli.appspot.com',
    messagingSenderId: '1050640892741',
    appId:             '1:1050640892741:web:85ff9850063045a6e6f42c',
  };

  // ── 2. Init (guarded against double-init) ─────────────────────
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Globals used by every page's own script
  window.fireDb = firebase.firestore();
  window.docRef = window.fireDb.collection('babyNames').doc('state');

  // ── 3. Inject overlay + chip styles ───────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #fb-auth-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: #0c0a18;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 20px; padding: 32px;
      font-family: 'Nunito', system-ui, sans-serif;
    }
    #fb-auth-overlay h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 28px; font-weight: 700;
      text-align: center; line-height: 1.3;
      background: linear-gradient(140deg, #fff 10%, #ffb7c5 55%, #bfb0f8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    #fb-auth-overlay p {
      font-size: 13px; color: rgba(210,200,255,0.5);
      text-align: center; max-width: 300px; line-height: 1.6;
    }
    #fb-sign-in-btn {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 24px; border-radius: 14px; border: none;
      background: #fff; color: #1a1a2e;
      font-family: 'Nunito', system-ui, sans-serif;
      font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      transition: transform 0.15s, box-shadow 0.2s;
    }
    #fb-sign-in-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
    #fb-sign-in-btn:active { transform: scale(0.97); }
    #fb-sign-in-btn img    { width: 20px; height: 20px; }
    #fb-auth-error {
      font-size: 12px; color: #ff8fa3;
      text-align: center; min-height: 16px;
    }

    /* Signed-in user chip — top right corner */
    #fb-user-chip {
      position: fixed; top: 14px; right: 14px; z-index: 1000;
      display: none; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 99px; padding: 5px 14px 5px 5px;
      font-family: 'Nunito', system-ui, sans-serif;
      font-size: 12px; font-weight: 600;
      color: rgba(210,200,255,0.7);
      cursor: pointer;
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      transition: background 0.15s;
    }
    #fb-user-chip:hover { background: rgba(255,255,255,0.12); }
    #fb-user-chip img {
      width: 26px; height: 26px; border-radius: 50%;
      border: 1px solid rgba(255,183,197,0.4);
    }
    #fb-user-chip .sign-out-label {
      margin-left: 4px; font-size: 10px;
      color: rgba(255,143,163,0.7); letter-spacing: 0.3px;
    }
  `;
  document.head.appendChild(style);

  // ── 4. Inject DOM elements once page is ready ─────────────────
  document.addEventListener('DOMContentLoaded', () => {

    // Full-screen login overlay
    const overlay = document.createElement('div');
    overlay.id = 'fb-auth-overlay';
    overlay.innerHTML = `
      <span style="font-size:54px;filter:drop-shadow(0 0 22px rgba(255,183,197,0.65));">👶</span>
      <h2>Amrita &amp; Bikram's<br>Baby Boy</h2>
      <p>Sign in with your Google account to vote on names.</p>
      <button id="fb-sign-in-btn">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
        Sign in with Google
      </button>
      <div id="fb-auth-error"></div>
    `;
    document.body.appendChild(overlay);

    // Signed-in user chip (top-right)
    const chip = document.createElement('div');
    chip.id = 'fb-user-chip';
    chip.innerHTML = `
      <img id="fb-avatar" src="" alt="avatar" />
      <span id="fb-display-name"></span>
      <span class="sign-out-label">sign out</span>
    `;
    document.body.appendChild(chip);

    // ── 5. Auth flow ───────────────────────────────────────────
    const auth     = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // Sign in button
    document.getElementById('fb-sign-in-btn').addEventListener('click', async () => {
      document.getElementById('fb-auth-error').textContent = '';
      try {
        await auth.signInWithPopup(provider);
      } catch (e) {
        document.getElementById('fb-auth-error').textContent = '⚠ ' + e.message;
      }
    });

    // Click chip to sign out
    chip.addEventListener('click', () => {
      if (confirm('Sign out?')) auth.signOut();
    });

    // React to auth state changes
    auth.onAuthStateChanged((user) => {
      if (user) {
        overlay.style.display = 'none';
        chip.style.display    = 'flex';
        document.getElementById('fb-avatar').src              = user.photoURL || '';
        document.getElementById('fb-display-name').textContent = user.displayName || user.email;
      } else {
        overlay.style.display = 'flex';
        chip.style.display    = 'none';
      }
    });
  });

})();