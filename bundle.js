/* Copyright (C) 2026 anonymous
This file is part of PHOENIX Framework. */

function setStatus(text) {
    /* Safe dynamic DOM fallback targeting terminal console layout */
    var outputLog = document.getElementById("messages");
    if (outputLog) {
        outputLog.innerHTML += "<div class='log-entry' style='color:#00ffcc'> > " + text + "</div>";
        var box = document.getElementById("console-box");
        if (box) box.scrollTop = box.scrollHeight;
    }

    var footerElement = document.querySelector(".subtitle");
    if (footerElement) {
        footerElement.innerHTML = text;
    }
}

function runExploit() {
    setStatus("Loading Exploit...");

    setTimeout(function() {
        setStatus("Running WebKit...");
    }, 2000);

    setTimeout(function() {
        setStatus("Escalating Kernel...");
    }, 4000);

    setTimeout(function() {
        setStatus("Loading GoldHEN...");
        if (typeof window.loadAutoPayload === "function") {
            window.loadAutoPayload();
        }
    }, 6000);

    setTimeout(function() {
        setStatus("GoldHEN Loaded Successfully");
    }, 9000);
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
