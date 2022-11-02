console.log("background");
chrome.alarms.create("alarm", {periodInMinutes: 1})
chrome.alarms.onAlarm.addListener(async () => {
    let date = new Date();
    console.log("Alarm triggered " + date.toLocaleTimeString());
    let tabId = await getCurrentTab();

    if (tabId !== null) {
        chrome.scripting.insertCSS({
            target: {tabId: tabId},
            files: ["./injected-card/card.css"]
        });
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["./injected-card/card.js"]
        });            
    }
});


/*
    As service workers are created/destroyed over the lifetime, check if the key "enabled" exists rather than immediately setting enabled: false (which would reset enabled whenever the service worker is "restarted")
*/
chrome.storage.local.get(null, function(result) {
    if (!Object.hasOwn(result, "enabled")) {
        chrome.storage.local.set({enabled: false});
    }
});

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(`Getting current tab: ${JSON.stringify(tab)}`);
    if (tab == null) {
        return null;
    }
    return tab.id;
}