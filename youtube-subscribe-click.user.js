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

    // Your code here...
    try
    {
        var btnelem=document.getElementsByClassName('style-scope ytd-subscribe-button-renderer')[0];
        var subscribed = (btnelem.innerText.search("UNSUB")==-1)?false:true;
    }catch(Exception){window.close()}
    if(!subscribed){
        document.getElementsByClassName('style-scope ytd-subscribe-button-renderer')[0].click();
    }
    window.close();
})();
