console.log("Injecting content script: card.js")

if (!window.INJECTED_FLAG) {
    window.INJECTED_FLAG = true;
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(`Content script receiving message on: ${new Date().toLocaleString()}`);
            if (request.message === "popup" && request.cards && cardDiv.className !== "") {
                let randomQnA = getRandomQuestionAndAnswer(request.cards)
                questionContainer.textContent = randomQnA[0];
                answerContainer.textContent = randomQnA[1]
                showCardDiv();
            }
        }
    );

    let cardDiv = document.createElement("div");
    cardDiv.id = "chrome-ext-pf-card-div";
    cardDiv.className = "chrome-ext-pf-hide";

    let questionContainer = document.createElement("p")
    let answerContainer = document.createElement("p");

    let header = document.createElement("span");
    header.textContent = "Question:";
    header.id = "chrome-ext-pf-header";


    let closeBtn = document.createElement("button");
    closeBtn.id = "chrome-ext-pf-close-btn";
    closeBtn.appendChild(document.createTextNode("\u2716"))

    document.body.appendChild(cardDiv);
    cardDiv.appendChild(header);
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
        cardDiv.className = "chrome-ext-pf-hide";
        chrome.runtime.sendMessage({message: "changeLastUpdated"});
    });

    function setCardOrientation(orientation) {
        if (orientation === "front") {
            questionContainer.className = "";
            answerContainer.className = "chrome-ext-pf-hide";
            header.textContent = "Question:";
        } else if (orientation === "back") {
            questionContainer.className = "chrome-ext-pf-hide";
            answerContainer.className = "";
            header.textContent = "Answer:";
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

