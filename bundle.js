const statusText = document.getElementById("status");

const loaderBar = document.getElementById("loader-bar");

const loaderText = document.getElementById("loader-text");

const payloadMenu = document.getElementById("payload-menu");

const messages = [

"> Initializing Phoenix Core Execution...",

"> Loading WebKit Exploit...",

"> WebKit Loaded Successfully",

"> Escalating Kernel Privileges...",

"> Kernel Exploit Activated",

"> Loading GoldHEN Payload...",

"> Injecting Payload Into Memory...",

"> Waiting For Console Response...",

"> GoldHEN Loaded Successfully!",

"> Phoenix Host Ready"

];

const loaderMessages = [

"Initializing Phoenix Core...",

"Loading WebKit Exploit...",

"Escalating Kernel Privileges...",

"Loading GoldHEN Payload...",

"Injecting Payload...",

"Finishing Execution..."

];

let current = 0;

let progress = 0;

function updateStatus(){

    statusText.innerHTML = messages[current];

    current++;

    if(current < messages.length){

        setTimeout(updateStatus, 2200);

    }

}

function updateLoader(){

    progress += 2;

    loaderBar.style.width = progress + "%";

    if(progress <= 15){

        loaderText.innerHTML = loaderMessages[0];

    }

    else if(progress <= 35){

        loaderText.innerHTML = loaderMessages[1];

    }

    else if(progress <= 55){

        loaderText.innerHTML = loaderMessages[2];

    }

    else if(progress <= 75){

        loaderText.innerHTML = loaderMessages[3];

    }

    else if(progress <= 90){

        loaderText.innerHTML = loaderMessages[4];

    }

    else{

        loaderText.innerHTML = loaderMessages[5];

    }

    if(progress < 100){

        setTimeout(updateLoader, 120);

    }

    else{

        loaderText.innerHTML = "Phoenix Host Ready!";

        payloadMenu.style.display = "flex";

    }

}

function loadPayload(name){

    statusText.innerHTML =
    "> Loading " + name + " Payload...";

    setTimeout(() => {

        statusText.innerHTML =
        "> " + name + " Loaded Successfully!";

    }, 2500);

}

window.onload = function(){

    setTimeout(updateStatus, 1000);

    setTimeout(updateLoader, 500);

};
