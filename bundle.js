<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>PHOENIX HOST Jailbreak</title>
    <script src="./bundle.js"></script>
    <style>
      body {
        background: url('icon0.png');
        background-color: #252526;
        color: #cccccc;
        font-family: "Segoe UI", Tahoma, sans-serif;
        text-align: center;
      }
      h2 {
        margin-bottom: 20px;
        color: #ff8c00;
        text-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
      }
      #console {
        font-family: monospace;
        background-color: #1e1e1e;
        color: #00ffcc;
        border: 1px solid #3c3c3c;
        padding: 12px;
        border-radius: 6px;
        margin-top: 20px;
        text-align: left;
        height: 150px;
        overflow-y: auto;
      }
      #jailbreakBtn {
        margin-top: 20px;
        padding: 12px 24px;
        font-size: 18px;
        font-weight: bold;
        background: #ff8c00;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 0 15px rgba(255, 140, 0, 0.4);
        transition: 0.3s;
      }
      #jailbreakBtn:disabled {
        background: #555555;
        color: #aaaaaa;
        cursor: not-allowed;
        box-shadow: none;
      }
      #jailbreakBtn:not(:disabled):hover {
        background: #e07b00;
      }
      footer {
        margin-top: 30px;
        font-size: 14px;
        color: #888;
      }
    </style>
    <script>
      if ((window.applicationCache.status == '0') || (window.applicationCache.status == '3')) { 
        window.location.replace("cache.html");
      }
    </script>
  </head>
  <body>
    <h2> PHOENIX HOST 7.00 - 9.60 </h2>
    <div>
      <button id="jailbreakBtn">Start Jailbreak</button>
    </div>
    <pre id="console"></pre>
    <footer>
       <h1>THIS HOST FROM PHOENIX</h1>
    </footer>
  </body>
  <script>
    const outputConsole = document.getElementById("console");
    window.log = (msg, color="#cccccc") => { 
        outputConsole.innerHTML += `<span style="color:${color}">> ${msg}</span><br>`; 
        outputConsole.scrollTop = outputConsole.scrollHeight;
    };

    addEventListener('unhandledrejection', event => {
      const reason = event.reason;
      alert(
        'Unhandled rejection\n'
        + `${reason}\n`
        + `${reason.sourceURL}:${reason.line}:${reason.column}\n`
        + `${reason.stack}`
      );
    });
    addEventListener('error', event => {
      const reason = event.error;
      alert(
        'Unhandled error\n'
        + `${reason}\n`
        + `${reason.sourceURL}:${reason.line}:${reason.column}\n`
        + `${reason.stack}`
      );
      return true; 
    });

    document.getElementById("jailbreakBtn").addEventListener("click", () => {
      document.getElementById("jailbreakBtn").disabled = true;
      outputConsole.textContent = ""; 
      window.log("Initializing PHOENIX Core Execution...", "#00ffcc");
      
      try {
        doJBwithPSFreeLapseExploit();
      } catch (error) {
        window.log("An error occurred during exploit: " + error, "red");
        document.getElementById("jailbreakBtn").disabled = false;
      }
    });
  </script>
</html>
