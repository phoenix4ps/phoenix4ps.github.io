const loaderProgress =
document.getElementById(
"loaderProgress"
);

const loaderText =
document.getElementById(
"loaderText"
);

const payloadMenu =
document.getElementById(
"payloadMenu"
);

const statusText =
document.getElementById(
"statusText"
);

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
        "> Exploit Loaded Successfully";

        loadGoldHEN();
    }

}, 120);

function loadGoldHEN(){

    statusText.innerHTML =
    "> Loading GoldHEN...";

    fetch("900/goldhen.bin")

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
