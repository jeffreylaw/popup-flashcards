console.log("LOG: Background service worker loaded");
chrome.runtime.onMessage.addListener(function (request, sender, sendresponse) {
    console.log(`LOG: Receiving message in background at ${new Date().toLocaleString()}`);
    console.log("Message type: " + request.message);
    switch (request.message) {
        case "enablePopup":
            chrome.storage.local.set(request.propObject);
            break;
        case "disablePopup":
            chrome.storage.local.set(request.propObject);
            break;
        case "changeFrequency":
            let extSettingFrequencyProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;
            chrome.alarms.create("popupAlarm", { periodInMinutes: request.propObject[extSettingFrequencyProp] });
            chrome.storage.local.set(request.propObject);
            break;
        case "changeLastUpdated":
            chrome.storage.local.get(null, function (items) {
                let extLastUpdatedProp = "EXTENSION_PROP_LAST_UPDATED_" + chrome.runtime.id;
                let timeInMinutes = Math.round(Date.now() / 1000 / 60);
                let propObject = {
                    [extLastUpdatedProp]: timeInMinutes,
                };
                chrome.storage.local.set(propObject);
                let extSettingFrequencyProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;
                chrome.alarms.create("popupAlarm", { periodInMinutes: items[extSettingFrequencyProp] });
            })
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
            let extSettingEnabledProp = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
            let extSettingFrequencyProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;
            let extLastUpdatedProp = "EXTENSION_PROP_LAST_UPDATED_" + chrome.runtime.id;

            extSettingEnabledProp = items[extSettingEnabledProp];
            extSettingFrequencyProp = items[extSettingFrequencyProp];
            extLastUpdatedProp = items[extLastUpdatedProp];

            if (extSettingEnabledProp) {
                let cards = Object.keys(items)
                    .filter(prop => !prop.startsWith("EXTENSION_SETTING") && !prop.endsWith(chrome.runtime.id))
                    .reduce((obj, key) => {
                        return Object.assign(obj, {
                            [key]: items[key]
                        });
                    }, {});
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    if (tabs && tabs[0] && (tabs[0].url.startsWith("http") || tabs[0].url.startsWith("https"))) {
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
    let extLastUpdatedProp = "EXTENSION_PROP_LAST_UPDATED_" + chrome.runtime.id;

    let propObject = {
        [extSettingEnabledProp]: false,
        [extSettingFrequencyProp]: 5,
        [extLastUpdatedProp]: Math.round(Date.now() / 1000 / 60)
    };
    if (!Object.hasOwn(result, extSettingEnabledProp) || !Object.hasOwn(result, extSettingFrequencyProp || !Object.hasOwn(result, extSettingLastRunProp))) {
        chrome.storage.local.set(propObject);
    }
});
