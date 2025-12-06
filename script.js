document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.querySelector('.main-title');
    const sidebar = document.getElementById('sidebar');
    const quizSelectionScreen = document.getElementById('quiz-selection');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');

    const selectQuizButtons = document.querySelectorAll('.select-quiz-btn');
    const quizTitle = document.getElementById('quiz-title');
    const questionCounter = document.getElementById('question-counter');
    const questionText = document.getElementById('question-text');
    const questionImage = document.getElementById('question-image');
    const choicesContainer = document.getElementById('choices-container');
    
    const answerBtn = document.getElementById('answer-btn');
    const nextBtn = document.getElementById('next-btn');
    const endQuizBtn = document.getElementById('end-quiz-btn');
    
    const explanationContainer = document.getElementById('explanation-container');

    const resultTitle = document.getElementById('result-title');
    const correctCountSpan = document.getElementById('correct-count');
    const incorrectCountSpan = document.getElementById('incorrect-count');
    const accuracyRateSpan = document.getElementById('accuracy-rate');
    const retryBtn = document.getElementById('retry-btn');
    const retryIncorrectBtn = document.getElementById('retry-incorrect-btn'); // 追加
    const backToSelectionBtn = document.getElementById('back-to-selection-btn');

    let originalQuizData = []; // 元のクイズデータを保持
    let currentQuizData = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let selectedChoice = null;
    let questionsAnswered = [];
    let incorrectQuestionIndexes = []; // 不正解だった問題のインデックスを保持

    // --- Sidebar Functions ---
    const generateSidebar = (quizData) => {
        sidebar.innerHTML = '<h3>問題一覧</h3>';
        const ul = document.createElement('ul');
        quizData.forEach((question, i) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = `問題 ${i + 1}`; // IDではなく連番を使用
            a.dataset.index = i;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (!quizScreen.classList.contains('active')) return;
                currentQuestionIndex = parseInt(e.target.dataset.index);
                loadQuestion();
            });
            li.appendChild(a);
            ul.appendChild(li);
        });
        sidebar.appendChild(ul);
    };

    const updateSidebarActiveState = () => {
        if (!sidebar.hasChildNodes()) return;
        const links = sidebar.querySelectorAll('a');
        links.forEach((link, index) => {
            link.classList.remove('active-question');
            if (index === currentQuestionIndex) {
                link.classList.add('active-question');
            }
        });
    };

    // --- Screen Management ---
    const showScreen = (screenToShow) => {
        [quizSelectionScreen, quizScreen, resultScreen].forEach(screen => {
            screen.classList.remove('active');
        });
        screenToShow.classList.add('active');
        
        if (screenToShow === quizScreen) {
            sidebar.style.display = 'block';
            mainTitle.classList.add('hidden');
        } else {
            sidebar.style.display = 'none';
            mainTitle.classList.remove('hidden');
        }
    };
    
    // Helper function to get circled numbers
    const getCircledNumber = (num) => {
        const circledNumbers = ['①', '②', '③', '④'];
        if (num >= 1 && num <= circledNumbers.length) {
            return circledNumbers[num - 1];
        }
        return num; // Fallback if number is out of range
    };

    // --- Quiz Logic ---
    const startQuiz = (quizData, title, isRetryIncorrect = false) => {
        currentQuizData = quizData;
        quizTitle.textContent = title;
        
        if (!isRetryIncorrect) {
            originalQuizData = quizData;
        }

        currentQuestionIndex = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        questionsAnswered = new Array(currentQuizData.length).fill(null);
        incorrectQuestionIndexes = [];

        generateSidebar(currentQuizData);
        showScreen(quizScreen);
        loadQuestion();
    };

    const loadQuestion = () => {
        updateSidebarActiveState();
        selectedChoice = null;
        const question = currentQuizData[currentQuestionIndex];
        questionCounter.textContent = `問題 ${currentQuestionIndex + 1} / ${currentQuizData.length}`;
        questionText.textContent = question.question;

        if (question.questionImage) {
            questionImage.src = question.questionImage;
            questionImage.style.display = 'block';
        } else {
            questionImage.style.display = 'none';
        }

        choicesContainer.innerHTML = '';
        
        // 元のインデックスと選択肢のテキストをペアにした配列を作成
        let indexedChoices = question.choices.map((choice, index) => {
            return {
                text: choice,
                originalIndex: index,
                image: (question.imageChoices && question.imageChoices[index]) ? question.imageChoices[index] : null
            };
        });

        // 配列をシャッフル (Fisher-Yates shuffle)
        for (let i = indexedChoices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexedChoices[i], indexedChoices[j]] = [indexedChoices[j], indexedChoices[i]];
        }

        indexedChoices.forEach((choiceData, displayIndex) => {
            const choiceItem = document.createElement('label');
            choiceItem.className = 'choice-item';
            
            // 既存の丸付き数字を削除
            const cleanedChoiceText = choiceData.text.replace(/^[①②③④]\s*/, '');
            // 新しい連番の丸付き数字を付与
            const displayedChoiceText = `${getCircledNumber(displayIndex + 1)} ${cleanedChoiceText}`;

            let choiceContent = `<input type="radio" name="choice" value="${choiceData.originalIndex}"><span>${displayedChoiceText}</span>`;
            if (choiceData.image) {
                choiceContent += `<img src="${choiceData.image}" alt="選択肢 ${displayIndex + 1} の画像">`;
            }
            choiceItem.innerHTML = choiceContent;

            choiceItem.addEventListener('click', () => {
                if (answerBtn.style.display === 'none') return;
                selectedChoice = choiceData.originalIndex;
                answerBtn.disabled = false;
            });
            choicesContainer.appendChild(choiceItem);
        });

        answerBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        endQuizBtn.style.display = 'none';
        answerBtn.disabled = true;
        explanationContainer.style.display = 'none';
    };

    const handleAnswer = () => {
        if (selectedChoice === null) return;
        
        const question = currentQuizData[currentQuestionIndex];
        const isCorrect = selectedChoice === question.answer;
        
        // サイドバーの状態を更新
        const link = sidebar.querySelector(`a[data-index='${currentQuestionIndex}']`);
        if(link) {
            link.classList.remove('answered-correct', 'answered-incorrect');
            link.classList.add(isCorrect ? 'answered-correct' : 'answered-incorrect');
        }

        if (questionsAnswered[currentQuestionIndex] === null) {
            questionsAnswered[currentQuestionIndex] = isCorrect;
            if (isCorrect) correctAnswers++;
            else incorrectAnswers++;
        }

        const choiceItems = choicesContainer.querySelectorAll('.choice-item');
        choiceItems.forEach(item => {
            const radio = item.querySelector('input[type="radio"]');
            const choiceOriginalIndex = parseInt(radio.value, 10);

            if (choiceOriginalIndex === question.answer) {
                item.classList.add('correct');
            }

            if (choiceOriginalIndex === selectedChoice) {
                const feedbackSpan = document.createElement('span');
                feedbackSpan.classList.add('answer-feedback');
                if (isCorrect) {
                    feedbackSpan.textContent = '正解';
                    feedbackSpan.classList.add('correct');
                } else {
                    item.classList.add('incorrect');
                    feedbackSpan.textContent = '不正解';
                    feedbackSpan.classList.add('incorrect');
                }
                item.appendChild(feedbackSpan);
            }
            radio.disabled = true;
            item.style.cursor = 'default';
        });

        explanationContainer.textContent = `【解説】\n${question.explanation || '解説はありません。'}`;
        explanationContainer.style.display = 'block';

        answerBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        endQuizBtn.style.display = 'inline-block';
    };

    const showResults = (finishedEarly = false) => {
        incorrectQuestionIndexes = [];
        questionsAnswered.forEach((isCorrect, index) => {
            if (isCorrect === false) {
                incorrectQuestionIndexes.push(index);
            }
        });

        if (incorrectQuestionIndexes.length > 0) {
            retryIncorrectBtn.style.display = 'inline-block';
        } else {
            retryIncorrectBtn.style.display = 'none';
        }

        const answeredCount = questionsAnswered.filter(q => q !== null).length;
        const totalQuestions = finishedEarly ? answeredCount : currentQuizData.length;
        
        resultTitle.textContent = finishedEarly ? `途中結果 (${answeredCount}問中)` : '最終結果';
        correctCountSpan.textContent = correctAnswers;
        incorrectCountSpan.textContent = incorrectAnswers;
        
        const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
        accuracyRateSpan.textContent = accuracy;
        
        showScreen(resultScreen);
    };

    // --- Event Listeners ---
    selectQuizButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const quizId = e.target.dataset.quiz;
            let quizData;
            let title;

            if (quizId === '20250601') {
                quizData = quizData20250601;
                title = '2025年6月1日 食品安全試験';
            } else if (quizId === '20240521') {
                quizData = quizData20240521;
                title = '2024年5月21日 食品安全試験';
            } else if (quizId === 'fp3_202401') {
                quizData = quizDatafp3_202401;
                title = 'FP3級 2024年1月';
            } else if (quizId === 'fp3_202305') {
                quizData = quizDatafp3_202305;
                title = 'FP3級 2023年5月';
            } else if (quizId === 'fp3_202309') {
                quizData = quizDatafp3_202309;
                title = 'FP3級 2023年9月';
            } else if (quizId === 'fp3_202405') {
                quizData = quizDatafp3_202405;
                title = 'FP3級 2024年5月';
            } else if (quizId === 'fp3_202505') {
                quizData = quizDatafp3_202505;
                title = 'FP3級 2025年5月';
            }
            
            if (quizData) {
                startQuiz(quizData, title);
            }
        });
    });

    answerBtn.addEventListener('click', handleAnswer);
    
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuizData.length) {
            loadQuestion();
        } else {
            showResults();
        }
    });

    endQuizBtn.addEventListener('click', () => showResults(true));
    
    retryBtn.addEventListener('click', () => {
        startQuiz(originalQuizData, quizTitle.textContent);
    });

    retryIncorrectBtn.addEventListener('click', () => {
        const incorrectQuestions = incorrectQuestionIndexes.map(index => originalQuizData[index]);
        startQuiz(incorrectQuestions, '不正解だった問題', true);
    });

    backToSelectionBtn.addEventListener('click', () => {
        showScreen(quizSelectionScreen);
    });

    // --- Initial State ---
    showScreen(quizSelectionScreen);
});
