// ==UserScript==
// @name          בני ברק & מתמחים - אימוג'י בהקלדה
// @namespace    https://github.com/tsoolgee/IMOGI2
// @version      0.1.1
// @description  מחליף מילים לאימוג'ים בזמן הקלדה (עם נקודתיים בתחילה) - תומך בכל סוגי תיבות הטקסט
// @author       You
// @match        https://bnebrak.com/*
// @match        http://mitmachim.top/*
// @match        https://mitmachim.top/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // מערך מסודר מהארוך לקצר למניעת באגים בהחלפה
    const map = [
        ['אני כועס', '😠'],
        ['מחיאות כפיים', '👏'],
        ['כפיים', '👏'],
        ['מזל טוב', '🎉'],
        ['אני עייף', '🥱'],
        ['אני ישן', '😴'],
        ['שים לב', '📢'],
        ['דיסלייק', '👎'],
        ['קריצה', '😉'],
        ['מתלבט', '🤔'],
        ['מגניב', '😎'],
        ['אונק', '😛'],
        ['עודכן', '🔄'],
        ['אזהרה', '⚠️'],
        ['פתרון', '✅'],
        ['מחשב', '💻'],
        ['הודעה', '✉️'],
        ['חיפוש', '🔍'],
        ['שעון', '🕒'],
        ['חחחח', '😂'],
        ['חחח', '😄'],
        ['נחש', '🐍'],
        ['חח', '😊'],
        ['עצוב', '😞'],
        ['שמח', '🙂'],
        ['גרר', '😡'],
        ['חושב', '🤔'],
        ['שוקל', '⚖️'],
        ['חדש', '🆕'],
        ['לייק', '👍'],
        ['דחוף', '🚨'],
        ['שאלה', '❓'],
        ['עסוק', '💼'],
        ['ספר', '📖'],
        ['עט', '✍️'],
        ['ששש', '🤫'],
        ['תודה', '👍'],
        ['כוכב', '⭐'],
        ['לב', '❤️'],
        ['רעיון', '💡'],
        ['אש', '🔥'],
        ['חריף', '🌶️']
    ];

    // פונקציית עזר להחלפה בתיבות טקסט רגילות (input / textarea)
    function handleStandardInput(el, key) {
        if (key !== ' ' && key !== 'Enter') return;

        const val = el.value;
        const cursor = el.selectionStart;
        const textBefore = val.slice(0, cursor);
        const triggerChar = textBefore.slice(-1);

        if (triggerChar !== ' ' && triggerChar !== '\n') return;

        for (const [from, to] of map) {
            const target = ':' + from + triggerChar;
            if (!textBefore.endsWith(target)) continue;

            const wordStart = cursor - target.length;
            const charBefore = val[wordStart - 1];
            if (charBefore !== undefined && charBefore !== ' ' && charBefore !== '\n') continue;

            const newVal = val.slice(0, wordStart) + to + triggerChar + val.slice(cursor);
            el.value = newVal;

            const newCursor = wordStart + to.length + triggerChar.length;
            el.setSelectionRange(newCursor, newCursor);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
    }

    // פונקציית עזר להחלפה בעורכי טקסט מבוססי HTML (contenteditable)
    function handleEditableInput(el, key) {
        if (key !== ' ' && key !== 'Enter') return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.nodeValue;
        const cursor = range.startOffset;
        const textBefore = text.slice(0, cursor);
        const triggerChar = textBefore.slice(-1);

        if (triggerChar !== ' ' && triggerChar !== '\n' && triggerChar !== '\u00A0') return; // \u00A0 הוא רווח HTML נפוץ

        for (const [from, to] of map) {
            const target = ':' + from + triggerChar;
            if (!textBefore.endsWith(target)) continue;

            const wordStart = cursor - target.length;
            const charBefore = text[wordStart - 1];
            if (charBefore !== undefined && charBefore !== ' ' && charBefore !== '\n' && charBefore !== '\u00A0') continue;

            // החלפת הטקסט בתוך ה-Node הקיים כדי לשמור על מיקום הסמן באופן טבעי
            const newVal = text.slice(0, wordStart) + to + triggerChar + text.slice(cursor);
            textNode.nodeValue = newVal;

            // עדכון מיקום הסמן של המשתמש בדיוק אחרי האימוג'י והרווח
            const newRange = document.createRange();
            const newOffset = wordStart + to.length + triggerChar.length;
            newRange.setStart(textNode, newOffset);
            newRange.setEnd(textNode, newOffset);
            selection.removeAllRanges();
            selection.addRange(newRange);

            el.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
    }

    // האזנה גלובלית לאירועי הקלדה - חוסך את הצורך בלולאות ו-MutationObserver מורכבים
    let lastKey = '';
    
    document.addEventListener('keydown', function (e) {
        lastKey = e.key;
    }, true);

    document.addEventListener('input', function (e) {
        const target = e.target;
        if (!target) return;

        // בדיקה האם מדובר בתיבת טקסט רגילה
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            handleStandardInput(target, lastKey);
        } 
        // בדיקה האם מדובר באלמנט עריכה עשיר (contenteditable)
        else if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            handleEditableInput(target, lastKey);
        }
    }, true);

})();
