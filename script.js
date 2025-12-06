
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const selectionContainer = document.getElementById('selection-container');
    const mainContainer = document.getElementById('main-container');
    const quizSelect = document.getElementById('quiz-select');
    const startButton = document.getElementById('start-button');
    const quitButton = document.getElementById('quit-button');
    const nextButton = document.getElementById('next-button');
    const questionSidebar = document.getElementById('question-sidebar');
    const questionIdElement = document.getElementById('question-id');
    const questionTextElement = document.getElementById('question-text');
    const choicesContainer = document.getElementById('choices-container');
    const feedbackTextElement = document.getElementById('feedback-text');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationTextElement = document.getElementById('explanation-text');

    // --- State ---
    let currentQuizData = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let answeredQuestions = []; // To track answered state for sidebar

    // --- Initialization ---
    function initialize() {
        // Populate select options
        const quizNames = Object.keys(fpQuizData);
        if (quizNames.length === 0) {
            selectionContainer.innerHTML = '<p>利用できる試験データがありません。</p>';
            return;
        }
        quizNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            quizSelect.appendChild(option);
        });

        // Add event listeners
        startButton.addEventListener('click', startQuiz);
        quitButton.addEventListener('click', quitQuiz);
        nextButton.addEventListener('click', handleNextButton);
    }

    // --- Quiz Flow ---
    function startQuiz() {
        const selectedQuizName = quizSelect.value;
        currentQuizData = fpQuizData[selectedQuizName];
        if (!currentQuizData || currentQuizData.length === 0) {
            alert('選択された試験の問題データが見つかりません。');
            return;
        }

        currentQuestionIndex = 0;
        score = 0;
        answeredQuestions = new Array(currentQuizData.length).fill(false);

        selectionContainer.style.display = 'none';
        mainContainer.style.display = 'flex';

        populateSidebar();
        displayQuestion();
    }

    function quitQuiz() {
        if (confirm('本当に試験を中断して選択画面に戻りますか？進捗はリセットされます。')) {
            mainContainer.style.display = 'none';
            selectionContainer.style.display = 'block';
            resetQuizState();
        }
    }
    
    function resetQuizState() {
        questionSidebar.innerHTML = '';
        questionIdElement.textContent = '';
        questionTextElement.textContent = '';
        choicesContainer.innerHTML = '';
        feedbackTextElement.textContent = '';
        explanationContainer.style.display = 'none';
    }

    function displayQuestion() {
        resetStateForNextQuestion();
        const question = currentQuizData[currentQuestionIndex];

        updateSidebarHighlight();

        questionIdElement.textContent = `問 ${question.id}`;
        questionTextElement.innerHTML = question.question;
        
        // Handle both ['①', '②'] and ['text1', 'text2'] formats for choices
        const isOldFormat = question.choices.every(c => c === '①' || c === '②');

        question.choices.forEach((choiceText, index) => {
            const button = document.createElement('button');
            if (isOldFormat) {
                // For old format, the choices were ① and ②, but answer is still 0 or 1
                 button.innerHTML = choiceText;
            } else {
                 button.innerHTML = choiceText;
            }
            button.classList.add('choice-button');
            button.addEventListener('click', () => selectAnswer(index, button));
            choicesContainer.appendChild(button);
        });
    }

    function selectAnswer(selectedIndex, selectedButton) {
        const question = currentQuizData[currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;

        Array.from(choicesContainer.children).forEach(btn => btn.disabled = true);
        
        answeredQuestions[currentQuestionIndex] = true;

        if (isCorrect) {
            selectedButton.classList.add('correct');
            feedbackTextElement.textContent = '正解！';
            feedbackTextElement.className = 'correct';
            score++;
            updateSidebarItem(currentQuestionIndex, 'correct-answered');
        } else {
            selectedButton.classList.add('incorrect');
            feedbackTextElement.textContent = '不正解...';
            feedbackTextElement.className = 'incorrect';
            updateSidebarItem(currentQuestionIndex, 'incorrect-answered');

            // Highlight the correct answer
            const correctButton = choicesContainer.children[question.correctAnswer];
            if (correctButton) {
                correctButton.classList.add('correct');
            }
        }
        
        explanationTextElement.innerHTML = `<b>解説:</b><br>${question.explanation || '解説はありません。'}`;
        explanationContainer.style.display = 'block';
        nextButton.style.display = 'inline-block';
    }

    function handleNextButton() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuizData.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        resetStateForNextQuestion();
        questionSidebar.innerHTML = '';
        
        const accuracy = currentQuizData.length > 0 ? (score / currentQuizData.length) * 100 : 0;
        questionIdElement.textContent = '試験終了！';
        questionTextElement.innerHTML = `全 ${currentQuizData.length} 問中、${score} 問正解しました。<br>正答率: ${accuracy.toFixed(1)}%`;

        nextButton.textContent = '同じ試験をもう一度';
        nextButton.onclick = startQuiz;
        nextButton.style.display = 'inline-block';
    }


    // --- UI Update Functions ---
    function populateSidebar() {
        questionSidebar.innerHTML = '';
        currentQuizData.forEach((_, index) => {
            const sidebarNum = document.createElement('div');
            sidebarNum.textContent = index + 1;
            sidebarNum.id = `q-num-${index}`;
            sidebarNum.classList.add('sidebar-question-number');
            sidebarNum.addEventListener('click', () => {
                // Allow jumping only to answered questions or the current one
                if (answeredQuestions[index] || index === currentQuestionIndex) {
                    jumpToQuestion(index);
                }
            });
            questionSidebar.appendChild(sidebarNum);
        });
    }
    
    function jumpToQuestion(index) {
        currentQuestionIndex = index;
        displayQuestion();
    }


    function updateSidebarHighlight() {
        const currentActive = document.querySelector('.sidebar-question-number.current-question');
        if (currentActive) {
            currentActive.classList.remove('current-question');
        }
        const newActive = document.getElementById(`q-num-${currentQuestionIndex}`);
        if (newActive) {
            newActive.classList.add('current-question');
        }
    }
    
    function updateSidebarItem(index, className) {
        const sidebarItem = document.getElementById(`q-num-${index}`);
        if (sidebarItem) {
            sidebarItem.classList.add(className);
        }
    }

    function resetStateForNextQuestion() {
        choicesContainer.innerHTML = '';
        feedbackTextElement.textContent = '';
        feedbackTextElement.className = '';
        explanationContainer.style.display = 'none';
        nextButton.style.display = 'none';
        nextButton.textContent = '次の問題へ';
        nextButton.onclick = handleNextButton; // Reset onclick to default
    }

    // --- Start ---
    initialize();
});
