chrome.storage.local.get(null, (items) => {
    let cards = items;
    let cardDiv = document.getElementById("card-div");
    let skipBtn = document.getElementById("skip-btn");
    let disableBtn = document.getElementById("disable-btn");
    let enableBtn = document.getElementById("enable-btn");
    let myCards = document.getElementById("my-cards");
    let help = document.getElementById("help");
    let questionContainer = document.getElementById("question-container");
    let answerContainer = document.getElementById("answer-container");
    

    if (cards.enabled) {
        disableBtn.className = "";
        enableBtn.className = "hide";
    } else {
        disableBtn.className = "hide";
        enableBtn.className = "";
    }

    showNewCard(cards);
    
    cardDiv.addEventListener("click", function() {
        if (questionContainer.className === "") {
            questionContainer.className = "hide";
            answerContainer.className = "";
        } else {
            questionContainer.className = "";
            answerContainer.className = "hide";
        }
    });
    
    skipBtn.addEventListener("click", function() {
        showNewCard();
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
    
    enableBtn.addEventListener("click", function() {
        chrome.storage.local.set({enabled: true});
        setEnableDisableBtn("enable");
    });

    disableBtn.addEventListener("click", function() {
        chrome.storage.local.set({enabled: false});
        setEnableDisableBtn("disable");
    });
    
    function setEnableDisableBtn(status) {
        if (status === "enable") {
            enableBtn.className = "hide"; 
            disableBtn.className = "";
        } else {
            enableBtn.className = ""; 
            disableBtn.className = "hide";   
        }
    }    

    function showNewCard() {
        let randomQnA = getRandomQuestionAndAnswer(cards);
        questionContainer.textContent = randomQnA[0];
        answerContainer.textContent = randomQnA[1];
        questionContainer.className = "";
        answerContainer.className = "hide";   
    }
});


function getRandomQuestionAndAnswer(cards) {
    let randInt = Math.floor(Math.random() * Object.getOwnPropertyNames(cards).length);
    let randomQuestion = Object.getOwnPropertyNames(cards)[randInt]
    let randomAnswer = cards[randomQuestion];
    return [randomQuestion, randomAnswer];
}
