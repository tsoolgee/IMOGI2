// ==UserScript==
// @name         בני ברק - אימוג'י בהקלדה
// @namespace    https://github.com/tsoolgee/IMOGI2
// @version      0.0.0
// @description  מחליף מילים לאימוג'ים בזמן הקלדה בכל תיבות הטקסט באתר
// @author       You
// @match        https://bnebrak.com/*
// @match        http://mitmachim.top/*
// @match        https://mitmachim.top/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/tsoolgee/IMOGI2/main/script.user.js
// @downloadURL  https://raw.githubusercontent.com/tsoolgee/IMOGI2/main/script.user.js
// ==/UserScript==

(function () {
    'use strict';

    const map = [
        ['חחחח',     '😂'],
        ['חחח',      '😄'],
        ['חח',       '😊'],
        ['קריצה',    '😉'],
        ['עצוב',     '😞'],
        ['שמח',      '🙂'],
        ['מגניב',    '😎'],
        ['גרר',      '😡'],
        ['אני כועס', '😠'],
        ['חושב',     '🤔'],
        ['מתלבט',    '🤔'],
        ['שוקל',     '⚖️'],
        ['אני ישן',  '😴'],
        ['אני עייף', '🥱'],
        ['ששש',      '🤫'],
        ['תודה',     '👍'],
        ['כוכב',     '⭐'],
        ['לב',       '❤️'],
        ['רעיון',    '💡'],
        ['אש',       '🔥'],
        ['חריף',     '🌶️'],
    ];

    let lastKey = '';

    function replaceInTextarea(textarea) {
        if (lastKey !== ' ' && lastKey !== 'Enter') return;

        const val = textarea.value;
        const cursor = textarea.selectionStart;
        const textBefore = val.slice(0, cursor);

        for (const [from, to] of map) {
            const triggerChar = textBefore.slice(-1);
            
            if (triggerChar !== ' ' && triggerChar !== '\n') continue;

            const target = from + triggerChar;
            
            if (!textBefore.endsWith(target)) continue;

            const matchEnd = cursor - 1;
            const wordStart = matchEnd - from.length;

            const charBefore = val[wordStart - 1];
            if (charBefore !== undefined && charBefore !== ' ' && charBefore !== '\n') continue;

            const newVal = val.slice(0, wordStart) + to + triggerChar + val.slice(cursor);
            textarea.value = newVal;

            const newCursor = wordStart + to.length + triggerChar.length;
            textarea.setSelectionRange(newCursor, newCursor);
            
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
    }

    function attachToTextarea(textarea) {
        if (textarea.dataset.emojiAttached) return;
        textarea.dataset.emojiAttached = 'true';

        textarea.addEventListener('keydown', function (e) {
            lastKey = e.key;
        }, true);

        textarea.addEventListener('input', function () {
            replaceInTextarea(this);
        });
    }

    function findAndAttach() {
        document.querySelectorAll('textarea').forEach(attachToTextarea);
    }

    findAndAttach();

    new MutationObserver(findAndAttach).observe(document.body, {
        childList: true,
        subtree: true
    });

})();
