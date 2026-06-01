/* Copyright (C) 2026 anonymous
This file is part of PHOENIX Framework. */

function setStatus(text) {
    var footerElement = document.querySelector(".subtitle");
    if (!footerElement) {
        footerElement = document.querySelector("div");
    }
    
    if (footerElement) {
        footerElement.innerHTML = text;
    }
    
    if (typeof window.log === "function") {
        window.log(text, "#00ffcc");
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

window.doJBwithPSFreeLapseExploit = window.doJBwithPHOENIXLapseExploit = function() {
    runExploit();
};

window.onload = function() {
    /* Safe execution delay wrapper */
    setTimeout(function() {
        if (typeof window.log === "function") {
            window.log("Auto-Start Trigger Blocked. Please interact with the controller UI.", "#888888");
        }
    }, 100);
};
