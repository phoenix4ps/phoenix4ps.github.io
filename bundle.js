const loaderProgress =
document.getElementById("loaderProgress");

const loaderText =
document.getElementById("loaderText");

const payloadMenu =
document.getElementById("payloadMenu");

const statusText =
document.getElementById("statusText");

let progress = 0;

const interval = setInterval(() => {

    progress += 2;

    loaderProgress.style.width =
    progress + "%";

    loaderText.innerHTML =
    "Loading Phoenix Exploit... "
    + progress + "%";

    if(progress >= 100){

        clearInterval(interval);

        loaderText.innerHTML =
        "Phoenix Host Ready";

        payloadMenu.style.display =
        "flex";

        statusText.innerHTML =
        "> Detecting Firmware...";

        autoDetectFW();
    }

}, 120);

function autoDetectFW(){

    let ua = navigator.userAgent;

    if (ua.includes("9.00")) {

        statusText.innerHTML =
        "> Firmware 9.00 Detected";

        loadGoldHEN("900/goldhen.bin");

    }

    else if (ua.includes("7.55")) {

        statusText.innerHTML =
        "> Firmware 7.55 Detected";

        loadGoldHEN(
        "755/goldhen2b755.bin.bz2"
        );

    }

    else if (ua.includes("7.02")) {

        statusText.innerHTML =
        "> Firmware 7.02 Detected";

        loadGoldHEN(
        "702/goldhen_2.3_702.bin"
        );

    }

    else {

        statusText.innerHTML =
        "> Firmware Not Supported";

    }

}

function loadGoldHEN(payloadPath){

    statusText.innerHTML =
    "> Loading GoldHEN...";

    fetch(payloadPath)

    .then(response =>
    response.arrayBuffer())

    .then(data => {

        statusText.innerHTML =
        "> GoldHEN Loaded Successfully";

    })

    .catch(() => {

        statusText.innerHTML =
        "> Failed To Load GoldHEN";

    });

}
