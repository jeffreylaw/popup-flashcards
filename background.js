console.log("background service worker loaded");
chrome.runtime.onMessage.addListener(function (request, sender, sendresponse) {
    console.log(request);
    switch (request.message) {
        case "enablePopup":
            chrome.storage.local.set(request.propObject);
            break;
        case "disablePopup":
            chrome.storage.local.set(request.propObject);
            break;
        case "changeFrequency":
            let extSettingFrequencyProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;
            chrome.alarms.create("popupAlarm", { periodInMinutes: request.propObject[extSettingFrequencyProp]});
            chrome.storage.local.set(request.propObject);
            break;
    }
})

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.get("popupAlarm", alarm => {
        if (!alarm) {
            chrome.alarms.create("popupAlarm", { periodInMinutes: 5 });
        }
    })
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "popupAlarm") {
        console.log(`Popup alarm triggered on: ${new Date().toLocaleString()}`);
        chrome.storage.local.get(null, function (items) {
            let extSettingEnabled = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
            if (items[extSettingEnabled]) {
                let cards = Object.keys(items)
                .filter(prop => !prop.startsWith("EXTENSION_SETTING") && !prop.endsWith(chrome.runtime.id))
                .reduce((obj, key) => {
                    return Object.assign(obj, {
                        [key]: items[key]
                    });
                }, {});
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    if (tabs[0].url.startsWith("http") || tabs[0].url.startsWith("https")) {
                        chrome.tabs.sendMessage(tabs[0].id, { message: "popup", cards: cards });
                    }
                });
            }
        });
    }
})

/*
    As service workers are created/destroyed over the lifetime, check if the key "enabled" exists rather than immediately setting enabled: false (which would reset enabled whenever the service worker is "restarted")
*/
chrome.storage.local.get(null, function (result) {
    let extSettingEnabledProp = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
    let extSettingFrequencyProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;
    let propObject = {
        [extSettingEnabledProp]: false,
        [extSettingFrequencyProp]: 5
    };
    if (!Object.hasOwn(result, extSettingEnabledProp) || !Object.hasOwn(result, extSettingFrequencyProp)) {
        chrome.storage.local.set(propObject);
    }
});
