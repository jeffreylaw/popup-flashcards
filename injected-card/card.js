console.log("Injecting content script: card.js")

if (!window.INJECTED_FLAG) {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(`Content script receiving message on: ${new Date().toLocaleString()}`);
            console.log(request);
            if (request.message === "popup" && request.cards && cardDiv.className !== "") {
                let randomQnA = getRandomQuestionAndAnswer(request.cards)
                questionContainer.textContent = "Q: " + randomQnA[0];
                answerContainer.textContent = "A: " + randomQnA[1]
                showCardDiv();
            }
        }
    );

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

    questionContainer.addEventListener("click", function () {
        setCardOrientation("back");
    });

    answerContainer.addEventListener("click", function () {
        setCardOrientation("front");
    });

    closeBtn.addEventListener("click", function () {
        cardDiv.className = "hide";
        chrome.runtime.sendMessage({message: "changeLastUpdated"});
    });

    window.INJECTED_FLAG = true;

    function setCardOrientation(orientation) {
        if (orientation === "front") {
            questionContainer.className = "";
            answerContainer.className = "hide";
        } else if (orientation === "back") {
            questionContainer.className = "hide";
            answerContainer.className = "";
        }
    }

    function showCardDiv() {
        cardDiv.className = "";
        setCardOrientation("front");
    }

    function getRandomQuestionAndAnswer(cards) {
        let randInt = Math.floor(Math.random() * Object.getOwnPropertyNames(cards).length);
        let randomQuestion = Object.getOwnPropertyNames(cards)[randInt]
        let randomAnswer = cards[randomQuestion];
        return [randomQuestion, randomAnswer];
    }
}

