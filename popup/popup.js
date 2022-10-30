console.log("This is a popup!");

document.addEventListener("DOMContentLoaded", function() {
    let myCards = document.getElementById("my-cards");
    let help = document.getElementById("help");

    myCards.addEventListener("click", function() {
        chrome.tabs.create({
            url: chrome.runtime.getURL("./cards-page/cards.html")
        });
    });

    help.addEventListener("click", function() {
        chrome.tabs.create({
            url: chrome.runtime.getURL("./help-page/help.html")
        });
    });
});