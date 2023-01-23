console.log("Cards page");
chrome.storage.local.get(null, (items) => {
    let cards = Object.keys(items)
        .filter(prop => !prop.startsWith("EXTENSION_SETTING") && !prop.endsWith(chrome.runtime.id))
        .reduce((obj, key) => {
            return Object.assign(obj, {
                [key]: items[key]
            });
        }, {});

    for (const question in cards) {
        addCardToDOM(question, cards[question]);
    }

    let addCardBtn = document.getElementById("add-card-btn");
    let exportCardsBtn = document.getElementById("export-cards-btn");
    let importCardsBtn = document.getElementById("import-cards-btn");
    let importCards = document.getElementById("import-cards");

    addCardBtn.addEventListener("click", function () {
        let questionElement = document.getElementById("question");
        let answerElement = document.getElementById("answer");
        let questionValue = questionElement.value.trim();
        let answerValue = answerElement.value.trim()

        if (questionValue.length === 0 || answerValue.length === 0) {
            console.log(`Question and answer cannot be blank`);
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

    importCardsBtn.addEventListener("click", function() {
        importCards.click();
    });

    importCards.addEventListener("change", (event) => {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = function (event) {
            let contents = event.target.result;
            let numOfAddedCards = 0;
            contents = cleanCSVFile(contents);
            console.log(contents)
            for (let i = 0; i < contents.length; i++) {
                let line = contents[i];
                let question, answer = "";
                if (!line.startsWith("\"")) {
                    question = line.split(",")[0];
                    answer = line.split(",").slice(1);

                    if (answer.startsWith("\"") && answer.endsWith("\"") && answer.contains(",")) {
                        answer = answer.slice(1,answer.length-1);
                    }

                    question = question.replace("\"\"", "\"");
                    answer = answer.replace("\"\"", "\"");
                } else {
                    line = line.replace("\"\"", "\"");
                    question = line.split(",")[0];
                    answer = line.split(",").slice(1);
                }

                if (!(question in cards)) {
                    numOfAddedCards += 1;
                    cards[question] = answer;
                    addCardToDOM(question, answer);
                    chrome.storage.local.set({ [question]: answer }, function () {
                        console.log(`Added ${question}: ${answer} to storage`);
                    })
                }
            }
            setTimeout(() => {
                alert(`Imported ${numOfAddedCards} cards`);
            }, 100)
        }
        event.target.value = "";
    })

    function cleanCSVFile(contents) {
        contents = contents.trim()
        contents = contents.split("\n");
        for (let i = 0; i < contents.length; i++) {
            contents[i] = contents[i].trim();
        }
        return contents;
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
});


