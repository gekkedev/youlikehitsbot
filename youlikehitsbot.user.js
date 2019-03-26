// ==UserScript==
// @name         YouLikeHits Bot
// @namespace    https://github.com/gekkedev/youlikehitsbot
// @version      0.2
// @description  Clicks links on the YLH website section automatically.
// @author       gekkedev
// @updateURL    https://raw.githubusercontent.com/gekkedev/youlikehitsbot/master/youlikehitsbot.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/youlikehitsbot/master/youlikehitsbot.user.js
// @match        *://*.youlikehits.com/websites.php*
// @match        *://*.youlikehits.com/viewwebsite.php*
// @match        *://*.youlikehits.com/youtubenew2.php*
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://cdn.jsdelivr.net/gh/naptha/tesseract.js/dist/tesseract.min.js
// ==/UserScript==

(() => {
    J = jQuery.noConflict(true);

    setInterval(() => {
        if (J("*:contains('503 Service Unavailable')").length) {
            console.log("Server Error! reloading...");
            location.reload();
        } else if (J("*:contains('There are no Websites currently visitable for Points')").length) {
            alert("All websites were visited.");
        } else {
                switch (document.location.pathname) {
                    case "/youtubenew2.php":
                        if (J('body:contains("failed")').length) alert("What exaxtly failed???");
                        if (J(".followbutton").length) { //if false, there is likely a captcha waiting to be solved
                            if (window.eval("typeof(window.newWin) !== 'undefined'")) {
                                if (newWin.closed) {
                                    console.log("Watching one Video!");
                                    J(".followbutton")[0].click()
                                }
                            } else {
                                console.log("Watching one Video!");
                                J(".followbutton")[0].click()
                            }
                        } else {
                            if (J("img[src*='captchayt']").length) {//captcha? no problemo, amigo.
                                if (window["ylh_yt_traffic_captchasolving"] == undefined) {
                                    window.ylh_yt_traffic_captchasolving = true; //solving takes some time, so we'll lock a duplicate solver instance out
                                    Tesseract.recognize(J("img[src*='captchayt']").attr("src")).then(equation => {
                                        var formula = equation.text;
                                        if (formula.length = 3) {//the exact length of the fomula
                                            if (formula.substr(1, 1) == 7) { //2-1 gets recognized as 271
                                                formula = formula.substr(0, 1) + "-" + formula.substr(2);
                                            }
                                            formula = formula.replace("x", "*") //x is just the human version of *
                                            J("input[name='answer']").val(eval(formula));
                                            //ylh_yt_traffic_captchasolving = false; //likely not necessary. ajax or pure post?
                                            J("input[value='Submit']").first().click();
                                        }
                                    });
                                }
                            }
                        }
                        break;
                }
            GM.getValue("ylh_traffic_tab_open", false).then(state => {
                switch (document.location.pathname) {
                    case "/websites.php":
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
                            } else {
                            }
                        } else {
                            console.log("We ran out of buttons! requesting more...");
                            //GM.getValue("ylh_traffic_reloadlimit", false).then(rlimit => {
                            if (window.eval("typeof(window.childWindow) !== 'undefined'") && childWindow.closed) //without this we would not wait for the last link of the page to be visited successfully
                                J("a[title='Refresh']")[0].click();
                        }
                        break;
                    case "/viewwebsite.php":
                        if (!J("*:contains('been logged out of YouLikeHits')").length) {
                            if (J(".alert:visible:contains('You got'):contains('Points')").length || J('body:contains("We couldn\'t locate the website you\'re attempting to visit.")').length) {
                                console.log("setting the tabstate to false...");
                                GM.setValue('ylh_traffic_tab_open', false).then(() => { //free the way for a new tab
                                    /*window.close(); //might not always work in FF
                                    setTimeout (window.close, 1000);*/
                                });
                            }
                        } else alert("Please reload the website list, and make sure you are still logged in.");
                        break;
                }
            });
        }
    }, 2000);
})();
