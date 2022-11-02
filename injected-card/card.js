console.log("Injecting content script: card.js")
if (!window.INJECTED_FLAG) {
    console.log("Modifying DOM");
    let interval = null;
    let frequency = 5000;
    let cardDiv = document.createElement("div");
    cardDiv.id = ("card-div");
    cardDiv.className = "hide";
    
    let questionContainer = document.createElement("p")
    let answerContainer = document.createElement("p");

    let closeBtn = document.createElement("button");
    closeBtn.id = "close-btn";
    closeBtn.textContent = "X"
    
    document.body.appendChild(cardDiv);
    cardDiv.appendChild(questionContainer);
    cardDiv.appendChild(answerContainer);
    cardDiv.appendChild(closeBtn);

    interval = setInterval(intervalFunction, frequency);

    window.INJECTED_FLAG = true;

    questionContainer.addEventListener("click", function() {
        flipCard();
    });

    answerContainer.addEventListener("click", function() {
        flipCard();
    });

    closeBtn.addEventListener("click", function() {
        cardDiv.className = "hide";

        if (interval !== null) {
            clearInterval(interval);
        }
        interval = setInterval(intervalFunction, frequency);
    });

    function intervalFunction() {
        if (cardDiv.className === "hide") {
            chrome.storage.local.get(null, function(result) {
                console.log(result);
                if (result.enabled) {
                    let randomQnA = getRandomQuestionAndAnswer(result);
                    questionContainer.textContent = randomQnA[0];
                    answerContainer.textContent = randomQnA[1];
                    showCardDiv();
                }
            });
        }
    }

    function flipCard() {
        if (questionContainer.className === "") {
            questionContainer.className = "hide";
            answerContainer.className = "";
        } else {
            questionContainer.className = "";
            answerContainer.className = "hide";
        }
    }

    function showCardDiv() {
        cardDiv.className = "";
        questionContainer.className = "";
        answerContainer.className = "hide";
    }

    function getRandomQuestionAndAnswer(cards) {
        let randInt = Math.floor(Math.random() * Object.getOwnPropertyNames(cards).length);
        let randomQuestion = Object.getOwnPropertyNames(cards)[randInt]
        let randomAnswer = cards[randomQuestion];
        return [randomQuestion, randomAnswer];
    }
}


