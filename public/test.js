const startBtn = document.querySelector('.start-btn')
const popupInfo = document.querySelector('.popup-info')
const exitBtn = document.querySelector('.exit-btn')
const main = document.querySelector('.main')
const continueBtn = document.querySelector('.continue-bin')
const quizSection = document.querySelector('.quiz-section')
const quizBox = document.querySelector('.quiz-box')
const resultBox = document.querySelector('.result-box')
const tryAgainBtn = document.querySelector('.tryAgain-btn')
const learnMoreBtn = document.querySelector('.learnMore-btn');
const prevBtn = document.querySelector('.prev-btn');


let userAnswers = {};
let touristSpots = [
    {
        name: "Nagsasa Cove",
        image: "images/resultImg_Cove.png",
        matches: {
            1: ["A", "B"],
            2: ["A"], //Similar famous tourist spot
            3: ["A", "B"], //Food
            4: ["C"], //Place to stay
            5: ["A"],  //Months  
            6: ["A"],     // Days plan to stay
            7: ["A"],    //Region: Mindanao      
            8: ["A"]     //Experience  
        }
    },
    {
        name: "Pacific View Deck",
        image: "images/resultImg_View.png",
        matches: {
            1: ["A", "B"],
            2: ["B"],   //Similar famous tourist spot
            3: ["A", "B"], //Food
            4: ["C"],  //Place to stay 
            5: ["A"],  //Months  
            6: ["A"],   // Days plan to stay
            7: ["A"],    //Region: Luzon       
            8: ["C"]     //Experience  
        }
    },
    {
        name: "Guisi Lighthouse",
        image: "images/resultImg_Lighthouse.png",
        matches: {
            1: ["B", "C"],
            2: ["C"], //Similar famous tourist spot
            3: ["A", "D"], //Food
            4: ["A"], //Place to stay
            5: ["B", "A"], //Months 
            6: ["A"],   // Days plan to stay
            7: ["B"],   //Region: Visayas     
            8: ["E"]      //Experience 
        }
    },
    {
        name: "Linao Cave",
        image: "images/resultImg_Cave.png",
        matches: {
            1: ["C", "D"],
            2: ["B"], //Similar famous tourist spot
            3: ["A", "B"], //Food
            4: ["D"], //Place to stay
            5: ["A","B", "D"], //Months 
            6: ["B"],   // Days plan to stay
            7: ["B"],   //Region: Visayas     
            8: ["B"]       //Experience
        }
    },
    {
        name: "Philippine Eagle Center",
        image: "images/resultImg_Eagle.png",
        matches: {
            1: ["C", "D"],
            2: ["E"], //Similar famous tourist spot
            3: ["A", "C"], //Food
            4: ["C"], //Place to stay 
            5: ["A", "B", "D"],  //Months
            6: ["A"],   // Days plan to stay
            7: ["C"],    //Region: Mindanao  
            8: ["D"]       //Experience 
        }
    },
    {
        name: "Tinago Falls",
        image: "images/resultImg_Falls.png",
        matches: {
            1: ["C", "D"],
            2: ["D"], //Similar famous tourist spot
            3: ["C", "A"],   //Food
            4: ["B"], //Place to stay
            5: ["A", "B"],  //Months
            6: ["B"],   // Days plan to stay
            7: ["C"],       //Region: Mindanao  
            8: ["C"]       //Experience
        }
    },
    {
        name: "Masungi Georeserve",
        image: "ExploreMorePH/images/resultImg_Georeserve.png",
        matches: {
            1: ["A"],
            2: ["B", "D"], //Similar famous tourist spot
            3: ["A"],   //Food
            4: ["A", "C"], //Place to stay
            5: ["A"],  //Months
            6: ["A"],   // Days plan to stay
            7: ["A"],       //Region: Luzon  
            8: ["D"]       //Experience
        }
    },
    {
        name: "Nova Shell Museum",
        image: "ExploreMorePH/images/resultImg_Museum.png",
        matches: {
            1: ["C"],
            2: ["A", "C"], //Similar famous tourist spot
            3: ["A", "D"],   //Food
            4: ["A", "B"], //Place to stay
            5: ["A", "C"],  //Months
            6: ["A", "B"],   // Days plan to stay
            7: ["B"],       //Region: Visayas  
            8: ["C"]       //Experience
        }
    },
    {
        name: "Mount Hamiguitan Range Wildlife Sanctuary",
        image: "ExploreMorePH/images/resultImg_ Sanctuary.png",
        matches: {
            1: ["C"],
            2: ["B", "D"], //Similar famous tourist spot
            3: ["A", "B"],   //Food
            4: ["B", "C"], //Place to stay
            5: ["A", "B"],  //Months
            6: ["A", "B"],   // Days plan to stay
            7: ["C"],       //Region: Mindanao  
            8: ["B"]       //Experience
        }
    }
    
    

];






startBtn.onclick = () => {
    popupInfo.classList.add('active');
    main.classList.add('active');
}

exitBtn.onclick = () => {
    popupInfo.classList.remove('active');
    main.classList.remove('active');

}

continueBtn.onclick = () => {
    quizSection.classList.add('active');
    popupInfo.classList.remove('active');
    main.classList.remove('active');
    quizBox.classList.add('active');
    showQuestions(0);

    quizSection.scrollIntoView({ behavior: 'smooth' });
};

tryAgainBtn.onclick = () => {
    userAnswers = {};
    questionCount = 0;

    showQuestions(questionCount);

    quizBox.classList.add('active');
    resultBox.classList.remove('active');
    nextBtn.classList.remove('active');

    quizSection.scrollIntoView({ behavior: 'smooth' });
};


prevBtn.onclick = () => {
    if (questionCount > 0) {
        questionCount--;
        showQuestions(questionCount);
    }
};





let questionCount = 0;


const nextBtn = document.querySelector('.next-btn');


nextBtn.onclick = () => {
    const currentQuestion = questions[questionCount];
    const currentAnswers = userAnswers[currentQuestion.numb] || [];
    const questionText = document.querySelector('.question-text'); 

    
    if (currentAnswers.length === 0) {
        alert('Please select at least one answer before proceeding.');
        questionText.classList.add('unanswered-warning');
        setTimeout(() => questionText.classList.remove('unanswered-warning'), 1000);
        return;
    }

    if (questionCount < questions.length - 1) {
        questionCount++;
        showQuestions(questionCount);
    } else {
        showResultBox();
    }
};


const optionList = document.querySelector('.option-list');



function showQuestions(index) {
    const currentQuestion = questions[index];
    const questionText = document.querySelector('.question-text');
    questionText.textContent = `${currentQuestion.numb}. ${currentQuestion.question}`;

    optionList.innerHTML = '';

   
    const prevAnswers = userAnswers[currentQuestion.numb] || [];

   
    currentQuestion.options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('options');
        
       
        if (prevAnswers.includes(option.trim())) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `<span>${option}</span>`;
        optionElement.setAttribute('onclick', 'optionSelected(this)');
        optionList.appendChild(optionElement);
    });
}


function optionSelected(answer) {
    const currentQuestion = questions[questionCount];
    const optionText = answer.textContent.trim();
    
    answer.classList.toggle('selected');
    
    if (!userAnswers[currentQuestion.numb]) {
        userAnswers[currentQuestion.numb] = [];
    }
    
    const index = userAnswers[currentQuestion.numb].indexOf(optionText);
    if (index === -1) {
        userAnswers[currentQuestion.numb].push(optionText);
    } else {
        userAnswers[currentQuestion.numb].splice(index, 1);
    }
    
    if (!currentQuestion.multiple) {
        const options = document.querySelectorAll('.options');
        options.forEach(opt => {
            if (opt !== answer) {
                opt.classList.remove('selected');
                const optText = opt.textContent.trim();
                const optIndex = userAnswers[currentQuestion.numb].indexOf(optText);
                if (optIndex !== -1) {
                    userAnswers[currentQuestion.numb].splice(optIndex, 1);
                }
            }
        });
    }
}

function questionCounter(index) {
    const questionTotal = document.querySelector('.question-total');
    questionTotal.textContent = `${index} of ${questions.length} Questions`;
}

function showResultBox() {
    quizBox.classList.remove('active');
    resultBox.classList.add('active');
    
    const scores = touristSpots.map(spot => {
        let score = 0;
        Object.entries(spot.matches).forEach(([questionId, validAnswers]) => {
            const userAnswer = userAnswers[questionId] || [];
            if (userAnswer.some(ans => validAnswers.includes(ans.charAt(0)))) {
                score++;
            }
        });
        return { ...spot, score };
    });
    
    const topSpot = scores.reduce((max, curr) => 
        curr.score > max.score ? curr : max, 
        { score: -1 }
    );

    // Set result info
    document.querySelector('.recommend-Spot').textContent = topSpot.name;
    document.querySelector('.spot-image-container').innerHTML = `
        <img src="${topSpot.image}" alt="${topSpot.name}" class="spot-image">
    `;

    let targetHref = "#";
    switch (topSpot.name) {
        case "Nagsasa Cove":
            targetHref = "luzon.html#TouristSpot1";
            break;
        case "Pacific View Deck":
            targetHref = "luzon.html#TouristSpot2";
            break;
        case "Guisi Lighthouse":
            targetHref = "visayas.html#TouristSpot3";
            break;
        case "Linao Cave":
            targetHref = "visayas.html#TouristSpot4";
            break;
        case "Philippine Eagle Center":
            targetHref = "mindanao.html#TouristSpot5";
            break;
        case "Tinago Falls":
            targetHref = "mindanao.html#TouristSpot6";
            break;
        case "Masungi Georeserve":
            targetHref = "luzon.html#TouristSpot7";
            break;
        case "Nova Shell Museum":
            targetHref = "visayas.html#TouristSpot8";
            break;
        case "Mount Hamiguitan Range Wildlife Sanctuary":
            targetHref = "mindanao.html#TouristSpot9";
            break;
    }
    learnMoreBtn.setAttribute("href", targetHref);
}  



const closePopup = document.getElementById('close-btn');

closePopup.addEventListener('click', () => {
     userAnswers = {}; 
    questionCount = 0;

    showQuestions(questionCount);

    quizBox.classList.add('active');
    resultBox.classList.remove('active');
    nextBtn.classList.remove('active');

    document.querySelector('.quiz-section').classList.remove('active');
    
    quizSection.scrollIntoView({ behavior: 'smooth' });
});
