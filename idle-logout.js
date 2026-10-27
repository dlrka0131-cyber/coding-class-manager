// 일정 시간 동안 조작이 없으면 자동 로그아웃 (모든 탭/페이지가 마지막 활동 시각을 공유)
(function () {
    var KEY = 'ccm_last_active';
    var LIMIT_MS = 30 * 60 * 1000; // 30분
    var started = false;

    function read() {
        try { return parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { return 0; }
    }
    function write(v) {
        try { localStorage.setItem(KEY, String(v)); } catch (e) {}
    }

    window.touchIdle = function () { write(Date.now()); };
    window.clearIdle = function () { try { localStorage.removeItem(KEY); } catch (e) {} };

    window.startIdleLogout = function (doSignOut) {
        if (started) return;
        started = true;

        function expire() {
            window.clearIdle();
            doSignOut();
        }
        function check() {
            var last = read();
            if (last && Date.now() - last > LIMIT_MS) expire();
        }

        var last = read();
        if (last && Date.now() - last > LIMIT_MS) { expire(); return; }
        write(Date.now());

        var lastWrite = 0;
        function onActivity() {
            var now = Date.now();
            if (now - lastWrite > 10000) { lastWrite = now; write(now); }
        }
        ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function (ev) {
            window.addEventListener(ev, onActivity, { passive: true, capture: true });
        });
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) check();
        });
        setInterval(check, 30000);
    };
})();
