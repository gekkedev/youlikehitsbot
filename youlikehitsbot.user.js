// ==UserScript==
// @name         YouLikeHits Bot
// @namespace    https://github.com/gekkedev/youlikehitsbot
// @version      0.5.1
// @description  Interacts with YLH automatically whereever possible.
// @author       gekkedev
// @updateURL    https://raw.githubusercontent.com/gekkedev/youlikehitsbot/master/youlikehitsbot.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/youlikehitsbot/master/youlikehitsbot.user.js
// @match        *://*.youlikehits.com/login.php
// @match        *://*.youlikehits.com/soundcloudplays.php*
// @match        *://*.youlikehits.com/websites.php*
// @match        *://*.youlikehits.com/viewwebsite.php*
// @match        *://*.youlikehits.com/youtubenew2.php*
// @match        *://*.youlikehits.com/bonuspoints.php*
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/naptha/tesseract.js/dist/tesseract.min.js
// @run-at       document-start
// ==/UserScript==

(() => {
    if (document.location.pathname == "/viewwebsite.php" && window.top == window.self) {
      const frameName = "frame2";
      const targetFrame = [...document.getElementsByTagName("frame")].find(f => f.name === frameName);
    
      if (!targetFrame) {
        console.error(`Frame with name "${frameName}" not found.`);
      }
    
      const src = targetFrame.src;
      const parentFrameset = targetFrame.parentNode;
      // Preserve original frameset row sizes
      const rows = parentFrameset.getAttribute("rows").split(",");
      const firstHeight = rows[0];
    
      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.src = src;
    
      iframe.name = frameName;
      iframe.width = "100%";
      // second iframe takes remaining space
      // calculate height in pixels: window height minus top iframe height
      const winHeight = window.innerHeight;
      iframe.height = winHeight - parseInt(firstHeight, 10) - 25; //minus an additional 10 to hide scrollbars (there's possibly some error in the prior calculation)
    
      // MOST restrictive sandbox (toggle by changing the value here)
      const sandboxLevel = 2; // Change this to 0, 1, or 2, for different levels
    
      const sandboxPresets = [
        "", // Level 0 — max restriction, everything disabled
        "allow-forms allow-same-origin", // Level 1 — allows forms and reading cookies/localStorage
        "allow-forms allow-same-origin allow-scripts allow-popups" // Level 2 — trust this frame almost fully
      ];
    
      iframe.setAttribute("sandbox", sandboxPresets[sandboxLevel]);
    
      // insert converted frame2 iframe
      parentFrameset.parentNode.insertBefore(iframe, parentFrameset);
    
      // convert frame1, insert before frame2
      const frame1 = [...document.getElementsByTagName("frame")].find(f => f.name === "frame1");
      if (frame1) {
        const iframe1 = document.createElement("iframe");
        iframe1.src    = frame1.src;
        iframe1.name   = "frame1";
        iframe1.width  = "100%";
        // use numeric height for top iframe
        iframe1.height = parseInt(firstHeight, 10);
        iframe1.style.border = "none";
        iframe1.setAttribute("sandbox", sandboxPresets[sandboxLevel]);
        parentFrameset.parentNode.insertBefore(iframe1, iframe);
        frame1.remove();
      }
    
      // remove the frameset entirely
      parentFrameset.remove();
    }
    
        const J = jQuery.noConflict(true);
        /** how many miliseconds to wait between launching another loop */
        const globalInterval = 2000;
    
        solveCaptcha = (imageEl, outputEl, captchaIdentifier, callback = () => {}) => {
            if (window[captchaIdentifier] == undefined) {
                window[captchaIdentifier] = true; //solving takes some time, so we'll lock a duplicate solver instance out
                let note = attachNotification("Please wait while your captcha is being solved. Don't worry if the code does not seem to match; that's because a new captcha image has been generated!");
                Tesseract.recognize(J(imageEl).attr("src")).then(equation => {
                    var formula = equation.text;
                    if (formula.length = 3) {//the exact length of the fomula
                        if (formula.substr(1, 1) == 7) { //2-1 gets recognized as 271
                            formula = formula.substr(0, 1) + "-" + formula.substr(2);
                        }
                        formula = formula.replace(/x/g, "*"); //x is just the human version of *
                        formula = formula.replace(/[} ]/g, ""); //a random char being the result of misinterpretation; occasionally happening on the login form
                        //console.log(formula); //re-enable this to debug how the captchasolving is doing so far
                        outputEl.val(eval(formula));
                        window[captchaIdentifier] = false; //not really necessary IF directly triggering a classic non-ajax post request
                        removeNotification(note);
                        callback()
                    }
                });
            }
        }
    
        function attachNotification(message) {
          const notificationEl = document.createElement('div');
          notificationEl.textContent = message;
          Object.assign(notificationEl.style, {
            position:    'fixed',
            top:         '0.5rem',
            left:        '50%',
            transform:   'translateX(-50%)',
            padding:     '0.25rem 0.5rem',
            background:  '#fff',
            color:       'red',
            whiteSpace:  'nowrap',
            zIndex:      '9999',
            cursor:      'pointer'
          });
          // remove on click
          notificationEl.addEventListener('click', () => notificationEl.remove());
          document.body.appendChild(notificationEl);
        }
    
        const removeNotification = (el) => {
            if (el != undefined)
                el.remove()
        }
    
        /** input seconds, receive milliseconds */
        const randomSeconds = (from, to) => {
            return Math.floor(Math.random() * (to - from + 1) + from) * 1000
        }
    
        const alertOnce = (message, identifier) => {
            localIdentifier = (identifier != undefined) ? identifier : message;
            if (shownWarnings.indexOf(localIdentifier) == -1) {
                shownWarnings.push(localIdentifier);
                alert(message)
            }
        }
    
        const queueReload = (loopToCancel) => {
          const reloadDelay = randomSeconds(60, 60 * 5);
          attachNotification("Reloading the website in ~" + Math.round(reloadDelay / 1000 / 60) + " minutes to check again...");
          //IDEA: if we introduce a message param, also run console.log for it.
          setTimeout(() => location.reload(), reloadDelay);
          clearInterval(loopToCancel); //no further checks since we gotta reload anyway
        }
    
        //runtime vars
        let previousVideo = "";
        /** indicates if a warning/message has already been shown. Happens once per window. Use alertOnce() */
        let shownWarnings = [];
    
        //loop over the website to find out which subpage we are on and take the appropriate actions IDEA: refactor the loop into a singleton
        const mainLoop = setInterval(() => {
            if (J("*:contains('503 Service Unavailable')").length) {
                console.log("Server Error! reloading...");
                location.reload();
            } else if (J("*:contains('not logged in!')").length) {
                window.location.href = "login.php"
            } else if (J("*:contains('Failed. You did not successfully solve the problem.')").length) {
                J("a:contains('Try Again')")[0].click()
            } else {
                    switch (document.location.pathname) {
                        case "/login.php":
                            if (!J("#password").val().length) attachNotification("Consider storing your login data in your browser.")
                            const captcha = J("img[alt='Enter The Numbers']");
                            if (captcha.length)
                                solveCaptcha(captcha[0], J("input[name='postcaptcha']"), "ylh_login_captchasolving");
                            break;
                        case "/bonuspoints.php":
                            if (J("body:contains('You have made ')").length && J("body:contains(' Hits out of ')").length) {
                              queueReload(mainLoop)
                            } else if (J(".buybutton").length) J(".buybutton")[0].click()
                            break;
                        case "/soundcloudplays.php":
                             //no timer visible / no song currently playing?
                            if (!J(".maintable span[id*='count']").attr("style").includes("display:none;")) return attachNotification("Music already playing..."); //TODO: detect timers that do not update
                            if (J(".followbutton").length) {
                                J(".followbutton").first().click();
                            } else alert("no followbutton, fix this pls");
                        case "/youtubenew2.php":
                            if (J('body:contains("failed")').length) location.reload(); //captcha failed?
                            if (J(".followbutton").length) { //if false, there is likely a captcha waiting to be solved
                                let vidID = () => { return J(".followbutton").first().parent().children("span[id*='count']").attr("id") };
                                let patienceKiller = (prev) => { setTimeout( () => { if (vidID() == prev) { J(".followbutton").parent().children("a:contains('Skip')").click(); newWin.close(); }}, 1000 * 135)}; //max time: 120s + 15s grace time (max length: http://prntscr.com/q4o75o)
                                //console.log(previousVideo + " " + vidID() + (previousVideo != vidID() ? " true": " false"));
                                if (vidID() != previousVideo) { //has a new video has been provided yet? This will overcome slow network connections causing the same video to be played over and over
                                    previousVideo = vidID();
                                    if (window.eval("typeof(window.newWin) !== 'undefined'")) {
                                        if (newWin.closed) {
                                            console.log("Watching one Video!");
                                            J(".followbutton")[0].click();
                                            patienceKiller(previousVideo)
                                        }
                                    } else {
                                        console.log("Watching one Video!");
                                        J(".followbutton")[0].click();
                                        patienceKiller(previousVideo)
                                    }
                                } //else do nothing and wait (until the video gets replaced or our patience thread tears)
                            } else {
                                captcha = J("img[src*='captchayt']");
                                if (captcha.length) //captcha? no problemo, amigo.
                                    solveCaptcha(captcha[0], J("input[name='answer']"), "ylh_yt_traffic_captchasolving", () => J("input[value='Submit']").first().click());
                            }
                            break;
                    }
                GM.getValue("ylh_traffic_tab_open", false).then(tabState => {
                    switch (document.location.pathname) {
                        case "/websites.php":
                            if (J("*:contains('There are no Websites currently visitable for Points')").length) {
                              console.log("All websites were visited. Revisit/reload the page to start surfing again.")
                              queueReload(mainLoop)
                            } else {
                                if (!tabState && window.eval("typeof(window.childWindow) !== 'undefined'")) {
                                    if (!childWindow.closed)
                                        childWindow.close();
                                } else if (tabState && window.eval("typeof(window.childWindow) == 'undefined'")) {
                                    console.log("no child window is actually open. let's create a new tab as if we came here for the very first time!");
                                    tabState = false;
                                }
                                var buttons = J(".followbutton:visible");
                                if (buttons.length) {
                                    if (!tabState) {
                                        console.log("setting the tabState to true...");
                                        GM.setValue('ylh_traffic_tab_open', true).then(() => {
                                            console.log("Visiting a new page...");
                                            buttons[0].onclick();
                                        });
                                    } else {
                                    }
                                } else {
                                    console.log("We ran out of buttons (=websites to visit)! requesting more...");
                                    //GM.getValue("ylh_traffic_reloadlimit", false).then(rlimit => {
                                    if (window.eval("typeof(window.childWindow) !== 'undefined'") && childWindow.closed) //without this we would not wait for the last link of the page to be visited successfully
                                        location.reload();
                                    //J("a[title='Refresh']")[0].click();
                                }
                            }
                            break;
                        case "/viewwebsite.php":
                          //regardless of framesets (see the guard clause below), the parent is the one responsible for closing open tabs
                          if (!tabState) { // (officially) no tab is open?
                            //then close it
                            // if closing from the parent window doesn't work, try from the child window
                            setTimeout(() => {
                              console.log("Closing this window from the parent took too long!");
                              // remove any frameset that makes the browser think there are unsaved changes (resulting in an unnecessary "unsaved changes" prompt)
                              document.querySelectorAll('frameset').forEach(element => element.remove());
                              document.querySelector("[name='frame2']").remove();
                              window.close();
                            }, globalInterval * 1.5); // give the parent a chance to be the first one to close it
                          }
    
                            // this page uses framesets and then embeds itself, so we should avoid running the script multiple times
                            /*if (location.search.includes("step=top")) //run in the top bar only
                              return //clearInterval(mainLoop);
                              */
    
    
                            if (!J("*:contains('been logged out of YouLikeHits')").length) {
                                if (
                                  J(".alert:visible:contains('You got'):contains('Points')").length
                                  || J('body:contains("We couldn\'t locate the website you\'re attempting to visit.")').length
                                  || J('body:contains("You have successfully reported")').length
                                ) {
                                    console.log("setting the tabState to false...");
                                    GM.setValue('ylh_traffic_tab_open', false).then(() => {
                                      console.log("tab state has been reset.")
                                    }); //free the way for a new tab
                                } else if (J("body:contains('viewing websites too quickly!')").length) location.reload();
                            } else alert("Please reload the website list, and make sure you are still logged in.");
                            break;
                    }
                });
            }
        }, globalInterval);
    })();
    