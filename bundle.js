function setStatus(text){

    document.querySelector(".footer").innerHTML = text;

}

function runExploit(){

    setStatus("Loading Exploit...");

    setTimeout(() => {

        setStatus("Running WebKit...");

    }, 2000);

    setTimeout(() => {

        setStatus("Escalating Kernel...");

    }, 4000);

    setTimeout(() => {

        setStatus("Loading GoldHEN...");

    }, 6000);

    setTimeout(() => {

        setStatus("GoldHEN Loaded Successfully");

    }, 9000);

}

/* auto start */

window.onload = function(){

    runExploit();

}
