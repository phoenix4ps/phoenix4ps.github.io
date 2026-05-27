const statusText = document.getElementById("status");

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

"> Welcome To Phoenix Host"

];

let current = 0;

function updateStatus(){

    statusText.innerHTML = messages[current];

    current++;

    if(current < messages.length){

        setTimeout(updateStatus, 2200);

    }

}

/* auto exploit */

window.onload = function(){

    setTimeout(updateStatus, 1500);

};
