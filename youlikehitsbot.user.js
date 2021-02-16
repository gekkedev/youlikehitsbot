// ==UserScript==
// @name         YouLikeHits Youtube Bot
// @namespace    https://github.com/gekkedev/youlikehitsbot
// @version      0.4.1
// @description  Get YouLikeHits Points by doing nothing
// @author       Ashwin Paudel
// @updateURL    https://raw.githubusercontent.com/gekkedev/youlikehitsbot/master/youlikehitsbot.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/youlikehitsbot/master/youlikehitsbot.user.js
// @match        *://*.youlikehits.com/login.php
// @match        *://*.youlikehits.com/websites.php*
// @match        *://*.youlikehits.com/viewwebsite.php*
// @match        *://*.youlikehits.com/youtubenew2.php*
// @match        *://*.youlikehits.com/bonuspoints.php*
// @match        *://*.youlikehits.com/youtube2.php*
// @match        https://www.youtube.com/channel/*
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://cdn.jsdelivr.net/gh/naptha/tesseract.js/dist/tesseract.min.js
// ==/UserScript==
(() => {

    //We could not verify the action. Please make sure you are Subscribed and try waiting at least 10 seconds before closing the PopUp.
    //var elmnt1 = document.querySelector('[title="Table of Contents"]');

    const J = jQuery.noConflict(true);
    const globalInterval = 2000;

    solveCaptcha = (imageEl, outputEl, captchaIdentifier, callback = () => {}) => {
        if (window[captchaIdentifier] == undefined) {
            window[captchaIdentifier] = true; //solving takes some time, so we'll lock a duplicate solver instance out
            let note = attachNotification(imageEl, "Please wait while your captcha is being solved. Don't worry if the code does not seem to match; that's because a new captcha image has been generated!");
            Tesseract.recognize(J(imageEl).attr("src")).then(equation => {
                var formula = equation.text;
                if (formula.length = 3) { //the exact length of the fomula
                    if (formula.substr(1, 1) == 7) { //2-1 gets recognized as 271
                        formula = formula.substr(0, 1) + "-" + formula.substr(2);
                    }
                    formula = formula.replace(/x/g, "*"); //x is just the human version of *
                    formula = formula.replace(/[} ]/g, ""); //a random char being the result of misinterpretation; occasionally happening on the login form
                    //console.log(formula); //re-enable this to debug how the captchasolving is doing so far
                    outputEl.val(eval(formula));
                    window[captchaIdentifier] = false; //not really necessary IF directly triggering a classic non-ajax post request
                    removeNotification(note);
                    callback();
                }
            });
        }
    };

    attachNotification = (identifier, notification) => {
        el = "<p style='color: red;'>" + notification + "</p>";
        prevEl = J(identifier).prev()[0];
        if (prevEl == undefined || prevEl.innerText != notification)
            return J(el).insertBefore(identifier);
    };

    removeNotification = (el) => {
        if (el != undefined)
            el.remove();
    };

    alertOnce = (message, identifier) => {
        localIdentifier = (identifier != undefined) ? identifier : message;
        if (shownWarnings.indexOf(localIdentifier) == -1) {
            shownWarnings.push(localIdentifier);

        }
    };

    //runtime vars
    let previousVideo = "";
    /** indicates if a warning/message has already been shown. Happens once per window. Use alertOnce() */
    let shownWarnings = [];

    function clickYoutubeSubscriberButton() {
        switch (document.location.pathname) {
            case "/youtube2.php":

                console.log("Youtube Subscribers")
                //followbutton

                var buttons = J(".followbutton");
                buttons[0].click();
                console.log("Youtube Subscribers 1")
                var button = J(".likebutton");
                if (button.length) {
                    button[0].click();
                    console.log("Button Clicked");
                }

                //likebutton
                break;
        }
    }

    function runYoutubeSubscriberWindow() {
        var button = J(".likebutton");
        if (button.length) {
            button[0].click();
            console.log("Button Clicked");
        }
        //J(".followbutton")[0].click();
    }
    var button = J(".likebutton");
    if (button.length) {
        button[0].click();
        console.log("Button Clicked");
    }

    //YouTube Limit
    clickYoutubeSubscriberButton();
    var count = 12.5;


    var p2 = "<h3 id='timerTag'>" + count + "</h3> \n <br>";


    function timer(time, update, complete) {
        var start = new Date().getTime();
        var interval = setInterval(function() {
            var now = time - (new Date().getTime() - start);
            if (now <= 0) {
                clearInterval(interval);
                complete();
            } else update(Math.floor(now / 1000));
        }, 100); // the smaller this number, the more accurate the timer will be
    }



    function subscribeToYoutubeChannel() {
        document.getElementsByClassName('style-scope ytd-subscribe-button-renderer')[0].click();
        window.close();
    };

    setInterval(subscribeToYoutubeChannel, 0005);

    var didClickSubscriberButton = false;

    function setTimerIntervalJS() {
        timer(
            12500, // milliseconds
            function(timeleft) { // called every step to update the visible countdown
                count = timeleft;
                switch (document.location.pathname) {
                    case "/youtube2.php":
                        document.getElementById('timerTag').innerHTML = count + " second(s)";
                        break;
                }
            },
            function() { // what to do after
                if (didClickSubscriberButton == true) {
                    setTimerIntervalJS();
                    didClickSubscriberButton = false;
                } else if (didClickSubscriberButton == false) {
                    runYoutubeSubscriberWindow();
                    didClickSubscriberButton = true;
                }
                setTimerIntervalJS();
            }
        );
    }
    setTimerIntervalJS();
    switch (document.location.pathname) {
        case "/youtube2.php":
            document.getElementsByClassName("maintableheader")[0].insertAdjacentHTML('afterbegin', p2);

            break;
    }
    setInterval(() => {
        if (J("*:contains('503 Service Unavailable')").length) {
            console.log("Server Error! reloading...");
            location.reload(true);
        } else if (J("*:contains('not logged in!')").length) {
            window.location.href = "login.php";
        } else if (J("*:contains('Failed. You did not successfully solve the problem.')").length) {
            J("a:contains('Try Again')")[0].click();
        } else {

            console.log(document.location.pathname);


            switch (document.location.pathname) {
                case "/youtube2.php":

                    if (J("*:contains('Subscriber Limit Reached')").length) location.reload();
                    if (J("*:contains('YouTube Limit')").length) location.reload();
                    if (J("*:contains('We could not verify the action. Please make sure you are Subscribed and try waiting at least 10 seconds before closing the PopUp.')").length) location.reload();
                    if (J("*:contains('This YouTube account no longer exists.')").length) location.reload();
                    if (J("*:contains('Something is wrong with the account you\'re trying to subscribe to.')").length) location.reload();
                    if (J("*:contains('You took longer than 90 seconds to finish Subscribing to the account and confirming it.')").length) location.reload();
                    //                      if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('Subscriber Limit Reached') > -1) {
                    //             location.reload(true);
                    // } else if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('YouTube Limit') > -1) {
                    //                    location.reload(true);
                    // } else if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('We could not verify the action. Please make sure you are Subscribed and try waiting at least 10 seconds before closing the PopUp.') > -1) {
                    //                    location.reload(true);
                    // } else if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('You took longer than 90 seconds to finish Subscribing to the account and confirming it.') >-1) {
                    //                    location.reload(true);
                    // } else if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('Something is wrong with the account you\'re trying to subscribe to.') > -1) {
                    //                    location.reload(true);
                    // } else if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('This YouTube account no longer exists.') > -1) {
                    //                    location.reload(true);
                    // }

                    break;
                case "/login.php":
                    if (!J("#password").val().length) attachNotification("#username", "Consider storing your login data in your browser.");
                    captcha = J("img[alt='Enter The Numbers']");
                    if (captcha.length)
                        solveCaptcha(captcha[0], J("input[name='postcaptcha']"), "ylh_login_captchasolving");
                    break;
                case "/bonuspoints.php":
                    if (J("body:contains('You have made ')").length && J("body:contains(' Hits out of ')").length) {
                        attachNotification(".maintable", "Not enough points. Reloading the website in 2 minutes to check again...");
                        setTimeout(() => location.reload(true), 1000 * 120);
                    } else if (J(".buybutton").length) J(".buybutton")[0].click();
                    break;
                case "/youtubenew2.php":
                    if (J('body:contains("failed")').length) location.reload(true); //captcha failed?
                    if (J(".followbutton").length) { //if false, there is likely a captcha waiting to be solved
                        let vidID = () => {
                            return J(".followbutton").first().parent().children("span[id*='count']").attr("id");
                        };
                        let patienceKiller = (prev) => {
                            setTimeout(() => {
                                if (vidID() == prev) {
                                    J(".followbutton").parent().children("a:contains('Skip')").click();
                                    newWin.close();
                                }
                            }, 1000 * 135);
                        }; //max time: 120s + 15s grace time (max length: http://prntscr.com/q4o75o)
                        //console.log(previousVideo + " " + vidID() + (previousVideo != vidID() ? " true": " false"));
                        if (vidID() != previousVideo) { //has a new video has been provided yet? This will overcome slow network connections causing the same video to be played over and over
                            previousVideo = vidID();
                            if (window.eval("typeof(window.newWin) !== 'undefined'")) {
                                if (newWin.closed) {
                                    console.log("Watching one Video!");
                                    J(".followbutton")[0].click();
                                    patienceKiller(previousVideo);
                                }
                            } else {
                                console.log("Watching one Video!");
                                J(".followbutton")[0].click();
                                patienceKiller(previousVideo);
                            }
                        } //else do nothing and wait (until the video gets replaced or our patience thread tears)
                    } else {
                        captcha = J("img[src*='captchayt']");
                        if (captcha.length) //captcha? no problemo, amigo.
                            solveCaptcha(captcha[0], J("input[name='answer']"), "ylh_yt_traffic_captchasolving", () => J("input[value='Submit']").first().click());
                    }
                    break;
            }
            GM.getValue("ylh_traffic_tab_open", false).then(state => {
                switch (document.location.pathname) {
                    case "/websites.php":
                        if (J("*:contains('There are no Websites currently visitable for Points')").length) {
                            alertOnce("All websites were visited. Revisit/reload the page to start surfing again.")
                        } else {
                            if (!state && window.eval("typeof(window.childWindow) !== 'undefined'")) {
                                if (!childWindow.closed)
                                    childWindow.close();
                            } else if (state && window.eval("typeof(window.childWindow) == 'undefined'")) {
                                console.log("no child window is actually open. let's create a new tab as if we came here for the very first time!");
                                state = false;
                            }
                            var buttons = J(".followbutton:visible");
                            if (buttons.length) {
                                if (!state) {
                                    console.log("setting the tabstate to true...");
                                    GM.setValue('ylh_traffic_tab_open', true).then(() => {
                                        console.log("Visiting a new page...");
                                        buttons[0].onclick();
                                    });
                                } else {}
                            } else {
                                console.log("We ran out of buttons! requesting more...");
                                //GM.getValue("ylh_traffic_reloadlimit", false).then(rlimit => {
                                if (window.eval("typeof(window.childWindow) !== 'undefined'") && childWindow.closed) //without this we would not wait for the last link of the page to be visited successfully
                                    location.reload();
                                //J("a[title='Refresh']")[0].click();
                            }
                        }
                        break;
                    case "/viewwebsite.php":
                        if (!J("*:contains('been logged out of YouLikeHits')").length) {
                            if (J(".alert:visible:contains('You got'):contains('Points')").length || J('body:contains("We couldn\'t locate the website you\'re attempting to visit.")').length) {
                                console.log("setting the tabstate to false...");
                                GM.setValue('ylh_traffic_tab_open', false).then(() => { //free the way for a new tab
                                    /*window.close(); //might not always work in FF
                                    setTimeout (window.close, 1000);*/
                                    setTimeout(window.close, 1000);
                                });
                            } else if (J("*:contains('viewing websites too quickly!  Please wait')").length) location.reload();
                        } else alert("Please reload the website list, and make sure you are still logged in.");
                        break;
                }
            });
        }
    }, globalInterval);
})();
