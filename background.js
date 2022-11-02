console.log("background");

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!tab || changeInfo.status !== "complete") {
        return;
    }

    if (!tab.url.startsWith("http") || !tab.url.startsWith("https")) {
        return;
    }
    console.log(`Inserting CSS and executing script on ${tabId}, ${tab.url}`);
    chrome.scripting.insertCSS({
        target: {tabId: tabId},
        files: ["./injected-card/card.css"]
    }, function() {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["./injected-card/card.js"]
        });  
    });
});

/*
    As service workers are created/destroyed over the lifetime, check if the key "enabled" exists rather than immediately setting enabled: false (which would reset enabled whenever the service worker is "restarted")
*/
chrome.storage.local.get(null, function(result) {
    let extSettingProp = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
    let propObject = {
        [extSettingProp]: false
    };
    
    if (!Object.hasOwn(result, extSettingProp)) {
        chrome.storage.local.set(propObject);
    }
});
