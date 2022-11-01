console.log("background");
chrome.storage.local.set({enabled: false}, function() {
    console.log("Extension enabled: false");
    chrome.storage.local.get(null, function(result) {
        console.log(result);
    });
});

chrome.alarms.create("demo", {periodInMinutes: 1})
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