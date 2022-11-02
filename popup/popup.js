const cards = {};
const initCards = getCards().then(items => {
    Object.assign(cards, items);
})

window.onload = async (e) => {
    try {
        await initCards;
        let randomQnA = getRandomQuestionAndAnswer(cards);

        let flipBtn = document.getElementById("flip-btn");
        let skipBtn = document.getElementById("skip-btn");
        let disableBtn = document.getElementById("disable-btn");
        let enableBtn = document.getElementById("enable-btn");
        let myCards = document.getElementById("my-cards");
        let help = document.getElementById("help");
        let questionContainer = document.getElementById("question-container");
        let answerContainer = document.getElementById("answer-container");

        chrome.storage.local.get(["enabled"], function(result) {
            if (result.enabled) {
                disableBtn.className = "";
                enableBtn.className = "hide";
            } else {
                disableBtn.className = "hide";
                enableBtn.className = "";
            }
        });


        questionContainer.textContent = randomQnA[0];
        answerContainer.textContent = randomQnA[1];

        flipBtn.addEventListener("click", function() {
            if (questionContainer.className === "show") {
                questionContainer.className = "hide";
                answerContainer.className = "show";
            } else {
                questionContainer.className = "show";
                answerContainer.className = "hide";   
            }
        });

        skipBtn.addEventListener("click", function() {
            let randomQnA = getRandomQuestionAndAnswer(cards);
            questionContainer.textContent = randomQnA[0];
            answerContainer.textContent = randomQnA[1];
            questionContainer.className = "show";
            answerContainer.className = "hide";   
        });

        myCards.addEventListener("click", function() {
            chrome.tabs.create({
                url: chrome.runtime.getURL("cards-page/cards.html")
            });
        });
    
        help.addEventListener("click", function() {
            chrome.tabs.create({
                url: chrome.runtime.getURL("help-page/help.html")
            });
        });

        disableBtn.addEventListener("click", function() {
            chrome.storage.local.set({enabled: false});
            disableBtn.className = "hide";
            enableBtn.className = "";
        });

        enableBtn.addEventListener("click", function() {
            chrome.storage.local.set({enabled: true});
            disableBtn.className = "";
            enableBtn.className = "hide";

            chrome.tabs.query({}, function(tabs) {
                console.log(tabs);
                for (let i=0; i<tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, {greeting: "Hello"}, function(response) {
                        console.log(response.farewell);
                    })
                }
            });
        });

    } catch (e) {
        console.log(e);
    }
}

function getCards() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (items) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(items);
        });
    });
}

function getRandomQuestionAndAnswer(cards) {
    let randInt = Math.floor(Math.random() * Object.getOwnPropertyNames(cards).length);
    let randomQuestion = Object.getOwnPropertyNames(cards)[randInt]
    let randomAnswer = cards[randomQuestion];
    return [randomQuestion, randomAnswer];
}