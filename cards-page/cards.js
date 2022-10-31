const cards = {};
const initCards = getCards().then(items => {
    Object.assign(cards, items);
})

window.onload = async (e) => {
    try {
        await initCards;
        for (const question in cards) {
            addCardToDOM(question, cards[question]);
        }
    } catch (e) {

    }
}

let addCardBtn = document.getElementById("add-card-btn");
let newCardDiv = document.getElementById("new-card-div");
let toggleNewCardsBtn = document.getElementById("toggle-new-cards-btn");
let saveCardsBtn = document.getElementById("save-cards-btn");

addCardBtn.addEventListener("click", function () {
    let questionElement = document.getElementById("question");
    let answerElement = document.getElementById("answer");
    let questionValue = questionElement.value.trim();
    let answerValue = answerElement.value.trim()

    if (questionValue.length === 0 || answerValue.length === 0) {
        console.log(`Question and answer cannot be blank`);
        alert("Question and answer cannot be blank");
        return;
    }

    for (const question in cards) {
        if (question.toLowerCase() === questionValue.toLowerCase()) {
            console.log(`Question "${question}" already exists`);
            alert("Question already exists");
            return;
        }
    }

    chrome.storage.local.set({ [questionValue]: answerValue }, function () {
        console.log(`Added ${questionValue}: ${answerValue}`);
        cards[questionValue] = answerValue;
        questionElement.value = "";
        answerElement.value = "";
        addCardToDOM(questionValue, answerValue);
    })
})

toggleNewCardsBtn.addEventListener("click", function () {
    if (newCardDiv.className === "hide") {
        newCardDiv.className = "show";
    } else {
        newCardDiv.className = "hide";
    }
});

saveCardsBtn.addEventListener("click", function() {
    console.log(`Downloading ${Object.keys(cards).length} cards`);
    console.log(cards);
    if (Object.keys(cards).length === 0) {
        return;
    }
    let link = document.createElement("a");
    let textFile = null;
    let csvContent = "";
    for (let question in cards) {
        let escapedQuestion = question;
        let escapedAnswer = cards[question];

        if (question.includes(",")) {
            escapedQuestion = `"${question}"`
        }

        if (cards[question].includes(",")) {
            escapedAnswer = `"${cards[question]}"`
        }

        csvContent += `${escapedQuestion},${escapedAnswer} \n`
    }
    let makeTextFile = function(contents) {
        let data = new Blob([contents], {type: "text/csv"});

        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);
        // URL for href
        return textFile;
    }
    link.setAttribute("download", "cards.txt");
    link.href = makeTextFile(csvContent);
    link.click();
    // window.requestAnimationFrame(function () {
    //     let event = new MouseEvent("click");
    //     link.dispatchEvent(event);
    // })
});


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

function addCardToDOM(question, answer) {
    let cardsDiv = document.getElementById("cards-div");

    let cardParagraphElement = document.createElement("p");
    let text = document.createTextNode(`Q: ${question} A: ${answer}`);
    let deleteBtn = document.createElement("button");
    deleteBtn.appendChild(document.createTextNode("Delete"))

    cardParagraphElement.appendChild(text);
    cardParagraphElement.appendChild(deleteBtn);
    cardsDiv.appendChild(cardParagraphElement);

    deleteBtn.addEventListener("click", function (e) {
        cardParagraphElement.remove();
        chrome.storage.local.remove(question, function(result) {
            console.log(`Question: "${question}" removed`);
            delete cards[question];
        });
    });
}
