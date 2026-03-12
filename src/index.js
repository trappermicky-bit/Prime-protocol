<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

    <!-- PWA Core -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Levlr" />
    <meta name="application-name" content="Levlr" />
    <meta name="theme-color" content="#160A22" />
    <meta name="background-color" content="#160A22" />

    <!-- SEO -->
    <meta name="description" content="Level up your real life. Track habits, earn XP, become your best self." />
    <meta property="og:title" content="Levlr — Your Life. Gamified." />
    <meta property="og:description" content="Level up your real life. Track habits, earn XP, become your best self." />
    <meta property="og:type" content="website" />

    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json" />

    <!-- Moon palette icon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23160A22'/%3E%3Crect x='6' y='6' width='88' height='88' rx='18' fill='%231C0E2E'/%3E%3Ccircle cx='50' cy='50' r='28' fill='none' stroke='%237B337E' stroke-width='2.5' opacity='0.6'/%3E%3Ctext x='50' y='64' font-family='Arial Black' font-weight='900' font-size='40' fill='%23B06BB3' text-anchor='middle'%3EL%3C/text%3E%3C/svg%3E" />
    <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23160A22'/%3E%3Crect x='6' y='6' width='88' height='88' rx='18' fill='%231C0E2E'/%3E%3Ccircle cx='50' cy='50' r='28' fill='none' stroke='%237B337E' stroke-width='2.5' opacity='0.6'/%3E%3Ctext x='50' y='64' font-family='Arial Black' font-weight='900' font-size='40' fill='%23B06BB3' text-anchor='middle'%3EL%3C/text%3E%3C/svg%3E" />

    <title>Levlr</title>

    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        height: 100%; background: #160A22;
        overscroll-behavior: none;
        -webkit-tap-highlight-color: transparent;
        font-family: -apple-system, sans-serif;
      }
      body { overflow: hidden; }

      /* SPLASH */
      #splash {
        position: fixed; inset: 0; background: #160A22;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        z-index: 99999; transition: opacity 0.6s ease;
      }
      #splash.hidden { opacity: 0; pointer-events: none; }

      .s-orb {
        position: absolute; border-radius: 50%; pointer-events: none;
      }
      .s-orb1 {
        width: 300px; height: 300px; top: -80px; right: -60px;
        background: radial-gradient(circle, rgba(123,51,126,0.2) 0%, transparent 65%);
        animation: orbf 8s ease-in-out infinite;
      }
      .s-orb2 {
        width: 260px; height: 260px; bottom: -60px; left: -50px;
        background: radial-gradient(circle, rgba(102,103,171,0.15) 0%, transparent 65%);
        animation: orbf 10s ease-in-out infinite reverse;
      }
      @keyframes orbf {
        0%,100% { transform: translate(0,0); }
        50%      { transform: translate(14px,-12px); }
      }

      #s-icon {
        width: 86px; height: 86px; border-radius: 24px;
        background: #1C0E2E;
        border: 1px solid rgba(102,103,171,0.2);
        box-shadow: -4px -4px 12px rgba(255,255,255,0.03), 6px 6px 22px rgba(0,0,0,0.75), 0 0 30px rgba(123,51,126,0.25);
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 24px;
        animation: iconGlow 2.5s ease-in-out infinite;
      }
      @keyframes iconGlow {
        0%,100% { box-shadow: -4px -4px 12px rgba(255,255,255,0.03), 6px 6px 22px rgba(0,0,0,0.75), 0 0 20px rgba(123,51,126,0.15); }
        50%      { box-shadow: -4px -4px 12px rgba(255,255,255,0.04), 6px 6px 22px rgba(0,0,0,0.75), 0 0 50px rgba(176,107,179,0.4); }
      }

      #s-title {
        font-family: 'Arial Black', Arial; font-weight: 900;
        font-size: 52px; letter-spacing: -2px; color: #F5D5E0;
        margin-bottom: 8px;
      }
      #s-sub {
        font-size: 11px; color: rgba(245,213,224,0.3);
        letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 40px;
      }
      #s-bar {
        width: 110px; height: 3px; border-radius: 3px;
        background: rgba(0,0,0,0.5);
        box-shadow: inset 1px 1px 3px rgba(0,0,0,0.6);
        overflow: hidden;
      }
      #s-fill {
        height: 100%; border-radius: 3px;
        background: linear-gradient(90deg, #420D4B, #7B337E, #B06BB3);
        box-shadow: 0 0 10px rgba(176,107,179,0.6);
        width: 0%; animation: loadBar 1.5s cubic-bezier(.4,0,.2,1) forwards;
      }
      @keyframes loadBar {
        0%  { width: 0% }
        55% { width: 65% }
        100%{ width: 100% }
      }

      /* INSTALL BANNER */
      #install-banner {
        position: fixed; bottom: 104px; left: 16px; right: 16px;
        background: #1C0E2E;
        border: 1px solid rgba(102,103,171,0.22);
        border-top: 1px solid rgba(255,255,255,0.06);
        border-radius: 20px; padding: 16px 18px;
        display: none; align-items: center; gap: 14px;
        z-index: 8000;
        box-shadow: -3px -3px 10px rgba(255,255,255,0.02), 6px 6px 24px rgba(0,0,0,0.7), 0 0 24px rgba(123,51,126,0.18);
        animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2);
      }
      #install-banner.show { display: flex; }
      @keyframes slideUp {
        from { opacity:0; transform:translateY(24px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .ib-icon {
        width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
        background: linear-gradient(145deg, #2C1A50, #1C0E2E);
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.55), 0 0 12px rgba(123,51,126,0.2);
        display: flex; align-items: center; justify-content: center; font-size: 22px;
      }
      .ib-text { flex: 1; }
      .ib-text strong { display:block; font-size:14px; font-weight:700; color:#F5D5E0; margin-bottom:3px; }
      .ib-text span { font-size:11px; color:rgba(245,213,224,0.4); }
      #ib-btn {
        background: linear-gradient(135deg, #420D4B, #7B337E);
        border: none; border-radius: 11px; padding: 9px 18px;
        color: #F5D5E0; font-size: 13px; font-weight: 700;
        cursor: pointer; letter-spacing: 0.05em; flex-shrink: 0;
        box-shadow: 0 0 16px rgba(123,51,126,0.45);
      }
      #ib-close {
        background: none; border: none; color: rgba(245,213,224,0.25);
        font-size: 18px; cursor: pointer; padding: 4px; line-height: 1; flex-shrink: 0;
      }
    </style>
  </head>
  <body>

    <div id="splash">
      <div class="s-orb s-orb1"></div>
      <div class="s-orb s-orb2"></div>
      <div id="s-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="#7B337E" stroke-width="1.5" opacity="0.5"/>
          <circle cx="24" cy="24" r="14" stroke="#6667AB" stroke-width="1" opacity="0.3"/>
          <text x="24" y="32" font-family="Arial Black,Arial" font-weight="900" font-size="22" fill="#B06BB3" text-anchor="middle">L</text>
        </svg>
      </div>
      <div id="s-title">Levlr</div>
      <div id="s-sub">Your Life. Gamified.</div>
      <div id="s-bar"><div id="s-fill"></div></div>
    </div>

    <!-- Install Banner — shows automatically on Android Chrome -->
    <div id="install-banner">
      <div class="ib-icon">⚡</div>
      <div class="ib-text">
        <strong>Install Levlr</strong>
        <span>Add to home screen · works offline</span>
      </div>
      <button id="ib-btn">Install</button>
      <button id="ib-close">✕</button>
    </div>

    <noscript>Enable JavaScript to run Levlr.</noscript>
    <div id="root"></div>

    <script>
      // Splash dismiss
      window.addEventListener('load', function() {
        setTimeout(function() {
          var s = document.getElementById('splash');
          if (s) { s.classList.add('hidden'); setTimeout(function(){ s.remove(); }, 700); }
        }, 1700);
      });

      // Service Worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/service-worker.js')
            .then(function(){ console.log('Levlr SW active'); })
            .catch(function(e){ console.warn('SW:', e); });
        });
      }

      // Android Chrome install prompt
      var deferredPrompt = null;
      window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(function() {
          var b = document.getElementById('install-banner');
          if (b && !window.matchMedia('(display-mode: standalone)').matches) {
            b.classList.add('show');
          }
        }, 3500);
      });

      document.getElementById('ib-btn').addEventListener('click', function() {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function() {
            deferredPrompt = null;
            document.getElementById('install-banner').classList.remove('show');
          });
        }
      });

      document.getElementById('ib-close').addEventListener('click', function() {
        document.getElementById('install-banner').classList.remove('show');
      });

      // Prevent double-tap zoom
      var lt = 0;
      document.addEventListener('touchend', function(e) {
        var n = Date.now();
        if (n - lt <= 300) e.preventDefault();
        lt = n;
      }, false);

      // No context menu
      document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    </script>
  </body>
</html>
