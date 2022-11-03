chrome.storage.local.get(null, (items) => {
    let cards = Object.keys(items)
        .filter(prop => !prop.startsWith("EXTENSION_SETTING") && !prop.endsWith(chrome.runtime.id))
        .reduce((obj, key) => {
            return Object.assign(obj, {
                [key]: items[key]
            });
        }, {});

    let cardDiv = document.getElementById("card-div");
    let nextBtn = document.getElementById("next-btn");
    let disableBtn = document.getElementById("disable-btn");
    let enableBtn = document.getElementById("enable-btn");
    let myCards = document.getElementById("cards-btn");
    let questionContainer = document.getElementById("question-container");
    let answerContainer = document.getElementById("answer-container");
    let frequencyInput = document.getElementById("frequency-slider-input")
    let frequencyInputDisplay = document.getElementById("frequency-value-display");
    let helpBtn = document.getElementById("help-btn");
    let extFrequencyProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;

    if (items.extFrequencyProp) {
        frequencyInputDisplay.textContent = "Every " + items[extFrequencyProp] + " min";
    } else {
        frequencyInputDisplay.textContent = "Every " + items[extFrequencyProp] + " mins";
    }
    frequencyInput.value = items[extFrequencyProp];


    if (items["EXTENSION_SETTING_ENABLED_" + chrome.runtime.id]) {
        disableBtn.className = "";
        enableBtn.className = "hide";
    } else {
        disableBtn.className = "hide";
        enableBtn.className = "";
    }

    showNewCard(cards);

    cardDiv.addEventListener("click", function () {
        let cardDivInner = document.getElementById("card-div-inner");
        cardDivInner.classList.toggle("is-flipped");
    });

    nextBtn.addEventListener("click", function () {
        let cardDivInner = document.getElementById("card-div-inner");
        if (cardDivInner.className === "is-flipped") {
            cardDivInner.classList.toggle("is-flipped");
        }
        showNewCard();
    });

    myCards.addEventListener("click", function () {
        chrome.tabs.create({
            url: chrome.runtime.getURL("cards-page/cards.html")
        });
    });

    enableBtn.addEventListener("click", function () {
        let extSettingEnabledProp = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
        let extSettingFrequencyProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;
        let propObject = {
            [extSettingEnabledProp]: true,
            [extSettingFrequencyProp]: frequencyInput.value
        };
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (!tabs[i].url.startsWith("http") || !tabs[i].url.startsWith("https")) {
                    continue;
                }
                chrome.tabs.sendMessage(tabs[i].id, propObject);
            }
        });

        chrome.storage.local.set(propObject);
        setEnableDisableBtn("enable");
    });

    disableBtn.addEventListener("click", function () {
        let extSettingProp = "EXTENSION_SETTING_ENABLED_" + chrome.runtime.id;
        let propObject = {
            [extSettingProp]: false
        };
        chrome.storage.local.set(propObject);
        setEnableDisableBtn("disable");
    });

    frequencyInput.addEventListener("change", function(e) {
        let extSettingProp = "EXTENSION_SETTING_FREQUENCY_" + chrome.runtime.id;
        let propObject = {
            [extSettingProp]: parseInt(e.target.value)
        };
        if (e.target.value === "1") {
            frequencyInputDisplay.textContent = "Every " + e.target.value + " min";
        } else {
            frequencyInputDisplay.textContent = "Every " + e.target.value + " mins";
        }
        chrome.storage.local.set(propObject);
    });

    function setEnableDisableBtn(status) {
        if (status === "enable") {
            enableBtn.className = "hide";
            disableBtn.className = "";
        } else if (status === "disable") {
            enableBtn.className = "";
            disableBtn.className = "hide";
        }
    }

    function showNewCard() {
        let randomQnA = getRandomQuestionAndAnswer(cards);
        if (questionContainer.textContent) {
            while (questionContainer.textContent === randomQnA[0]) {
                randomQnA = getRandomQuestionAndAnswer(cards);
            }
        }
        questionContainer.textContent = randomQnA[0];
        answerContainer.textContent = randomQnA[1];
    }
});

function updateFrequencyValue(value) {
    document.getElementById("frequency-value-display").textContent = value;
}

function getRandomQuestionAndAnswer(cards) {
    let randInt = Math.floor(Math.random() * Object.getOwnPropertyNames(cards).length);
    let randomQuestion = Object.getOwnPropertyNames(cards)[randInt]
    let randomAnswer = cards[randomQuestion];
    return [randomQuestion, randomAnswer];
}
