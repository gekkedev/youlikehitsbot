// ==UserScript==
// @name         Youtube Subscriber Click
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Click the subscribe button
// @author       Developers
// @match        https://www.youtube.com/channel/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Click the subscribe button
    document.getElementsByClassName("style-scope ytd-button-renderer style-destructive size-default")[0].click();
    // Then close the window
    window.close();
})();
