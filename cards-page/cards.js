console.log("Cards page");
chrome.storage.local.get(null, (items) => {
    let cards = Object.keys(items)
        .filter(prop => !prop.startsWith("EXTENSION_SETTING") && !prop.endsWith(chrome.runtime.id))
        .reduce((obj, key) => {
            return Object.assign(obj, {
                [key]: items[key]
            });
        }, {});

    let recentCards = {};

    for (const question in cards) {
        addCardToDOM(question, cards[question]);
    }

    let addCardBtn = document.getElementById("add-card-btn");
    let exportCardsBtn = document.getElementById("export-cards-btn");
    let importCardsBtn = document.getElementById("import-cards-btn");
    let importCards = document.getElementById("import-cards");
    let deleteCardsBtn = document.getElementById("delete-all-cards-btn");
    let importCardsAnkiBtn = document.getElementById("import-cards-anki-btn");
    let importCardsAnki = document.getElementById("import-cards-anki");
    let undoImportBtn = document.getElementById("undo-import-btn");

    addCardBtn.addEventListener("click", function () {
        let questionElement = document.getElementById("question");
        let answerElement = document.getElementById("answer");
        let questionValue = questionElement.value.trim();
        let answerValue = answerElement.value.trim()

        if (questionValue.length === 0 || answerValue.length === 0) {
            console.log(`Question and answer cannot be blank`);
            return;
        }

        chrome.storage.local.set({ [questionValue]: answerValue }, function () {
            console.log(`Added ${questionValue}: ${answerValue}`);
            cards[questionValue] = answerValue;
            questionElement.value = "";
            answerElement.value = "";
            addCardToDOM(questionValue, answerValue);
        })
    })

    exportCardsBtn.addEventListener("click", function () {
        console.log(`Downloading ${Object.keys(cards).length} cards`);
        console.log(cards);
        if (Object.keys(cards).length === 0) {
            return;
        }
        let link = document.createElement("a");
        let textFile = null;
        let csvContent = "";
        for (let question in cards) {
            let answer = cards[question];

            let escapedQuestion = question;
            let escapedAnswer = answer;

            if (question.includes("\"")) {
                escapedQuestion = question.replace("\"", "\"\"");
            }
            if (question.includes(",")) {
                escapedQuestion = `"${escapedQuestion}"`
            }

            if (answer.includes("\"")) {
                escapedAnswer = answer.replace("\"", "\"\"");
            }
            if (answer.includes(",")) {
                escapedAnswer = `"${escapedAnswer}"`
            }

            csvContent += `${escapedQuestion},${escapedAnswer}\n`
        }
        let makeTextFile = function (contents) {
            let data = new Blob([contents], { type: "text/csv" });

            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);
            return textFile;
        }
        link.setAttribute("download", "cards.csv");
        link.href = makeTextFile(csvContent);
        link.click();
    });

    importCardsBtn.addEventListener("click", function () {
        importCards.click();
    });

    importCardsAnkiBtn.addEventListener("click", function () {
        importCardsAnki.click();
    });

    importCards.addEventListener("change", (event) => {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0], "UTF-8");
        reader.onload = function (event) {
            let contents = event.target.result;

            let listOfCards = csvFileToListOfCards(contents);
            let updatedCards = 0;
            recentCards = {};

            for (let i = 0; i < listOfCards.length; i++) {

                if (listOfCards[i].question in cards) {
                    updateCardInDom(listOfCards[i].question, listOfCards[i].answer);
                    updatedCards++;
                } else {
                    addCardToDOM(listOfCards[i].question, listOfCards[i].answer);
                }

                cards[listOfCards[i].question] = listOfCards[i].answer;
                chrome.storage.local.set({
                    [listOfCards[i].question]: listOfCards[i].answer
                }, function () {
                    console.log(`Sent ${listOfCards[i].question}: ${listOfCards[i].answer} to storage`);
                })
                recentCards[listOfCards[i].question] = listOfCards[i].answer;
            }
            if (Object.keys(recentCards).length > 0) {
                let undoImportBtn = document.getElementById("undo-import-btn");
                undoImportBtn.style.display = "block";
            }
            setTimeout(() => {
                alert(`Imported ${listOfCards.length - updatedCards} new cards, updated ${updatedCards}`);
            }, 100)
        }
        event.target.value = "";
    });

    importCardsAnki.addEventListener("change", (event) => {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0], "UTF-8");
        reader.onload = function (event) {
            let contents = event.target.result;

            let listOfCards = ankiFileToListOfCards(contents);
            let updatedCards = 0;
            recentCards = {};

            for (let i = 0; i < listOfCards.length; i++) {

                if (listOfCards[i].question in cards) {
                    updateCardInDom(listOfCards[i].question, listOfCards[i].answer);
                    updatedCards++;
                } else {
                    addCardToDOM(listOfCards[i].question, listOfCards[i].answer);
                }

                cards[listOfCards[i].question] = listOfCards[i].answer;
                chrome.storage.local.set({
                    [listOfCards[i].question]: listOfCards[i].answer
                }, function () {
                    console.log(`Sent ${listOfCards[i].question}: ${listOfCards[i].answer} to storage`);
                })
                recentCards[listOfCards[i].question] = listOfCards[i].answer;
            }
            console.log(Object.keys(recentCards).length)
            if (Object.keys(recentCards).length > 0) {
                let undoImportBtn = document.getElementById("undo-import-btn");
                console.log(undoImportBtn)
                undoImportBtn.style.display = "block";
            }
            setTimeout(() => {
                alert(`Imported ${listOfCards.length - updatedCards} new cards, updated ${updatedCards}`);
            }, 100)
        }
        event.target.value = "";
    });

    undoImportBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to undo the last imported/updated set of cards?")) {
            console.log("LOG: Deleting last imported cards");
            for (question in recentCards) {
                console.log(`Question: "${question}" removed`);
                delete cards[question];
                chrome.storage.local.remove(question);
            }
            let cardsElements = document.querySelectorAll(".card-element");
            console.log(recentCards)
            cardsElements.forEach((card) => {
                let question = card.innerText.split("\nA:")[0].slice(3);
                if (question in recentCards) {
                    card.parentElement.removeChild(card);
                }
            });
            recentCards = {};
            let undoImportBtn = document.getElementById("undo-import-btn");
            undoImportBtn.style.display = "none";
        }
    });

    deleteCardsBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete all cards?")) {
            console.log("LOG: Deleting all cards");
            for (question in cards) {
                console.log(`Question: "${question}" removed`);
                delete cards[question];
                chrome.storage.local.remove(question);
            }
            let cardsDiv = document.getElementById("cards-div");
            cardsDiv.replaceChildren("");
        }
    });

    function ankiFileToListOfCards(contents) {
        let listOfCards = [];
        contents = contents.trim().split("\n").splice(2);
        console.log(contents);
        for (let i = 0; i < contents.length; i++) {
            let line = contents[i].trim();
            let card = {
                question: line.split("\t")[0],
                answer: line.split("\t")[1],
            }
            if (card["question"].includes('<img src=""') || card["answer"].includes('<img src=""')) {
                continue;
            }

            listOfCards.push(card)
        }
        return listOfCards;
    }

    function csvFileToListOfCards(contents) {
        let listOfCards = [];
        contents = contents.trim().split("\n");
        for (let i = 0; i < contents.length; i++) {
            let line = contents[i].trim();
            let card = {
                question: line.split(",")[0],
                answer: line.split(",").slice(1).join()
            }

            if (!line.startsWith("\"")) {
                if (card["answer"].startsWith("\"") && card["answer"].endsWith("\"") && card["answer"].includes(",")) {
                    card["answer"] = card["answer"].slice(1, card["answer"].length - 1);
                }

                card["question"] = card["question"].replace("\"\"", "\"");
                card["answer"] = card["answer"].replace("\"\"", "\"");
            } else {
                line = line.replace("\"\"", "\"");
                card["question"] = line.split(",")[0];
                card["answer"] = line.split(",").slice(1).join();
            }

            listOfCards.push(card);
        }
        return listOfCards;
    }

    function addCardToDOM(question, answer) {
        let cardsDiv = document.getElementById("cards-div");

        let cardParagraphElement = document.createElement("p");
        let deleteBtn = document.createElement("button");
        deleteBtn.appendChild(document.createTextNode("Delete"))
        cardParagraphElement.classList.add("card-element");
        cardParagraphElement.appendChild(document.createTextNode(`Q: ${question}`));
        cardParagraphElement.appendChild(document.createElement("br"));
        cardParagraphElement.appendChild(document.createTextNode(`A: ${answer} `));
        cardParagraphElement.appendChild(document.createElement("br"));
        cardParagraphElement.appendChild(deleteBtn);
        cardsDiv.appendChild(cardParagraphElement);

        deleteBtn.addEventListener("click", function (e) {
            cardParagraphElement.remove();
            chrome.storage.local.remove(question, function (result) {
                console.log(`Question: "${question}" removed`);
                delete cards[question];
            });
        });
    }

    function updateCardInDom(question, answer) {
        let paragraphElements = document.querySelectorAll(".card-element");
        for (let i = 0; i < paragraphElements.length; i++) {
            let existingQuestion = paragraphElements[i].innerHTML.split("<br>A: ")[0].slice(3);
            if (question == existingQuestion) {
                paragraphElements[i].remove();
                addCardToDOM(question, answer);
            }
        }
    }
});


