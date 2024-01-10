// ==UserScript==
// @name        LossDL Captcha
// @namespace   Violentmonkey Scripts
// @match       https://free-mp3-download.net/*
// @grant       GM.xmlHttpRequest
// @version     2
// @author      Xtendera
// @description 12/30/2023, 12:27:12 AM
// @downloadURL https://github.com/Xtendera/LossDL/raw/master/lossdl-captcha.user.js
// ==/UserScript==

var isCaptchaReset = false;
const version = "2";

function replacePage(siteKey) {
  document.documentElement.innerHTML = `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>All Good</title>
      <style>
        #captcha {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            vertical-align: middle;
            visibility: hidden;
        }

        body {
            background-color: green;
        }

        h1 {
            text-align: center;
        }
      </style>
    </head>

    <body>
      <h1>
        LossDL Captcha
      </h1>
      <div id="captcha">
        <div class="g-recaptcha" data-callback="successfulCaptcha" data-sitekey="${siteKey}"></div>
      </div>
    </body>
  </html>
  `;
  GM.xmlHttpRequest({
  method : "GET",
  url : "https://www.google.com/recaptcha/api.js",
  onload : (ev) =>
  {
    let e = document.createElement('script');
    e.innerText = ev.responseText;
    document.head.appendChild(e);
  }
  });
    let e = document.createElement('script');
    window.setInterval(function (){
        GM.xmlHttpRequest({
      method: "GET",
      url: "http://localhost:8072/api/needToken",
      onload: function (response) {
        if (response.readyState == 4 && response.status == 200) {
          let splitText = response.responseText.split(';');
          console.log(splitText);
          if (splitText[0] == 'true' && !isCaptchaReset) {
            if (!location.href.includes(splitText[1])) {
              console.log('Redirecting');
              location.href = 'https://free-mp3-download.net/download.php?id=' + splitText[1];
            } else {
              isCaptchaReset = true;
              document.body.style.backgroundColor = 'red';
              document.title = 'CAPTCHA REQUIRED!'
              var captchaElement = document.getElementById('captcha');
              if (window.getComputedStyle(captchaElement).visibility === "hidden") {
                captchaElement.style.visibility = "visible";
              }
              location.href = "javascript:void(grecaptcha.reset());";
            }
          }
        } else {
          location.reload();
        }
      }
      });
    }, 1000);
    unsafeWindow.successfulCaptcha = function (token) {
      isCaptchaReset = false;
      GM.xmlHttpRequest({
      method: "POST",
      url: "http://localhost:8072/api/token",
      data: token,
      onload: function (response) {
        if (response.readyState == 4 && response.status == 200) {
          document.body.style.backgroundColor = 'green';
          document.title = 'All Good';
          var captchaElement = document.getElementById('captcha');
          if (window.getComputedStyle(captchaElement).visibility === "visible") {
              captchaElement.style.visibility = "hidden";
            }
          console.log("Successfully uploaded token!");
        }
      }
      });
    }
}

(function () {
  GM.xmlHttpRequest({
  method: "GET",
  url: "http://localhost:8072/api/olState",
  onload: function(response) {
    if (response.readyState == 4 && response.status == 200 && response.responseText.startsWith('lossDL')) {
      if (response.responseText.split(" ")[1] != version) {
        document.documentElement.innerHTML = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <title>Version Mismatch!</title>
              <style>
                #captcha {
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    vertical-align: middle;
                    visibility: hidden;
                }

                body {
                    background-color: red;
                }

                h1 {
                    text-align: center;
                }
              </style>
            </head>
            <body>
              <h1>
                LossDL Version ID mismatch! Please update userscript/server!
              </h1>
              <br />
              <div>
                Server Version: ${response.responseText.split(" ")[1]}
                UserScript Version: ${version}
              </div>
            </body>
          </html>
            `;
        return;
      }
      console.log('LossDL Server detected, getting captcha siteKey!');
      GM.xmlHttpRequest({
      method: "GET",
      url: "http://localhost:8072/api/siteKey",
      onload: function(response) {
        if (response.readyState == 4 && response.status == 200) {
          console.log('Found captcha siteKey: ' + response.responseText);
          replacePage(response.responseText);
        }
      }
      });
    }
  }
  });
 })();
