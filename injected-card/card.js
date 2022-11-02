console.log("Running card.js")
if (!window.INJECTED_FLAG) {
    window.INJECTED_FLAG = true;
    let cards = {};
    let interval = null;
    let frequency = 5000;
    console.log("Modifying DOM");
    let cardDiv = document.createElement("div");
    cardDiv.id = ("card-div");
    
    let questionContainer = document.createElement("p")
    let answerContainer = document.createElement("p");
    answerContainer.className = "hide";

    let closeBtn = document.createElement("button");
    closeBtn.id = "close-btn";
    closeBtn.textContent = "X"
    
    document.body.appendChild(cardDiv);
    cardDiv.appendChild(questionContainer);
    cardDiv.appendChild(answerContainer);
    cardDiv.appendChild(closeBtn);


    chrome.storage.local.get(null, function(result) {
        cards = result;
        console.log(cards)
        
        let randomQnA = getRandomQuestionAndAnswer(cards);
        questionContainer.textContent = randomQnA[0];
        answerContainer.textContent = randomQnA[1];
    });
    


    questionContainer.addEventListener("click", function() {
        questionContainer.className = "hide";
        answerContainer.classList.toggle("hide");
    });

    answerContainer.addEventListener("click", function() {
        questionContainer.classList.remove("hide");
        answerContainer.classList.toggle("hide");
    });

    closeBtn.addEventListener("click", function() {
        cardDiv.className = "hide";

        if (interval !== null) {
            clearInterval(interval);
        }
        interval = setInterval(intervalFunction, frequency);
    });

    function intervalFunction() {
        // If the cardDiv is already showing, don't continue
        if (cardDiv.className !== "hide") {
            return;
        }
        chrome.storage.local.get(['enabled'], function(result) {
            console.log(result);
            if (result.enabled) {
                let randomQnA = getRandomQuestionAndAnswer(cards);
                questionContainer.textContent = randomQnA[0];
                answerContainer.textContent = randomQnA[1];
                cardDiv.className = "";
                questionContainer.className = "";
                answerContainer.className = "hide";
            }
        });
    }

    function getRandomQuestionAndAnswer(cards) {
        let randInt = Math.floor(Math.random() * Object.getOwnPropertyNames(cards).length);
        let randomQuestion = Object.getOwnPropertyNames(cards)[randInt]
        let randomAnswer = cards[randomQuestion];
        return [randomQuestion, randomAnswer];
    }
}


