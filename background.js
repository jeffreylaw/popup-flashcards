console.log("background service worker loaded");
chrome.alarms.getAll((alarms) => {
    console.log(alarms);
})

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.get("popupAlarm", alarm => {
        if (!alarm) {
            chrome.alarms.create("popupAlarm", { periodInMinutes: 1 });
        }
    })
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "popupAlarm") {
        console.log(alarm);
        console.log(new Date().toLocaleString());
        chrome.storage.local.get(null, function (items) {
            let extSettingEnabled = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
            let cards = Object.keys(items)
            .filter(prop => !prop.startsWith("EXTENSION_SETTING") && !prop.endsWith(chrome.runtime.id))
            .reduce((obj, key) => {
                return Object.assign(obj, {
                    [key]: items[key]
                });
            }, {});    
            if (items[extSettingEnabled]) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { message: "popup", cards: cards });
                });
            }
        });
    }
})

/*
    As service workers are created/destroyed over the lifetime, check if the key "enabled" exists rather than immediately setting enabled: false (which would reset enabled whenever the service worker is "restarted")
*/
chrome.storage.local.get(null, function (result) {
    let extSettingProp = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
    let propObject = {
        [extSettingProp]: false
    };

    if (!Object.hasOwn(result, extSettingProp)) {
        chrome.storage.local.set(propObject);
    }
});
