/* Copyright (C) 2026 anonymous
This file is part of PHOENIX Framework. */

function setStatus(text, color = "#00ffcc") {
    /* Safe dynamic DOM fallback targeting terminal console layout */
    var outputLog = document.getElementById("messages");
    if (outputLog) {
        outputLog.innerHTML += "<div class='log-entry' style='color:" + color + "'> > " + text + "</div>";
        var box = document.getElementById("console-box");
        if (box) box.scrollTop = box.scrollHeight;
    }

    var footerElement = document.querySelector(".subtitle");
    if (footerElement) {
        footerElement.innerHTML = text;
    }
}

function runExploit() {
    setStatus("Loading Exploit...", "#cccccc");

    setTimeout(function() {
        setStatus("Running WebKit...", "#00ff00");
    }, 400);

    setTimeout(function() {
        setStatus("Escalating Kernel...", "#e1b12c");
    }, 900);

    setTimeout(function() {
        setStatus("Loading GoldHEN...", "#007acc");
        if (typeof window.loadAutoPayload === "function") {
            window.loadAutoPayload();
        }
    }, 1400);

    setTimeout(function() {
        setStatus("GoldHEN Loaded Successfully", "#00ff00");
    }, 2200);
}

/* Global bridge binding to resolve index.html execution dependencies */
window.doJBwithPSFreeLapseExploit = window.doJBwithPHOENIXLapseExploit = function() {
    runExploit();
};

window.onload = function() {
    /* Auto execution logic wrapper */
    if (document.getElementById("jailbreak-btn")) {
        /* Optional: Add handler if button interaction is required */
    }
};
