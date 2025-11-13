// Note: answers, sentenceOptions, and TEST_CODE are defined in each individual HTML file
// This allows each test (PET001, PET002, etc.) to have different answers

// Track current section
let currentSection = 1;
let userAnswers = {};

// Carousel state
const carouselState = {
    q6: 0,
    q7: 0,
    q8: 0,
    q9: 0,
    q10: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateProgressBar();
    initializeCarousels();
});

// Initialize all carousels
function initializeCarousels() {
    const questions = ['q6', 'q7', 'q8', 'q9', 'q10'];
    questions.forEach(q => {
        createIndicators(q);
        updateCarousel(q);
    });
}

// Create indicator dots for a carousel
function createIndicators(questionId) {
    const indicatorsContainer = document.getElementById('indicators-' + questionId);
    if (!indicatorsContainer) return;
    
    const totalSlides = 8; // A through H
    indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(questionId, i);
        indicatorsContainer.appendChild(dot);
    }
}

// Change slide (prev/next)
function changeSlide(questionId, direction) {
    const currentIndex = carouselState[questionId];
    const newIndex = currentIndex + direction;
    
    // Wrap around
    if (newIndex < 0) {
        carouselState[questionId] = 7;
    } else if (newIndex > 7) {
        carouselState[questionId] = 0;
    } else {
        carouselState[questionId] = newIndex;
    }
    
    updateCarousel(questionId);
}

// Go to specific slide
function goToSlide(questionId, index) {
    carouselState[questionId] = index;
    updateCarousel(questionId);
}

// Update carousel display
function updateCarousel(questionId) {
    const currentIndex = carouselState[questionId];
    const carousel = document.getElementById('carousel-' + questionId);
    
    if (!carousel) return;
    
    // Hide all slides
    const slides = carousel.querySelectorAll('.cafe-slide');
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Show current slide
    if (slides[currentIndex]) {
        slides[currentIndex].classList.add('active');
        
        // Update the hidden input with the selected answer
        const selectedValue = slides[currentIndex].getAttribute('data-value');
        const hiddenInput = document.getElementById('answer-' + questionId);
        if (hiddenInput) {
            hiddenInput.value = selectedValue;
            userAnswers[questionId] = selectedValue;
        }
    }
    
    // Update indicators
    const indicators = document.querySelectorAll('#indicators-' + questionId + ' .indicator-dot');
    indicators.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Update gap text when answer is selected (Part 4)
function updateGap(questionNum, letter) {
    const gapElement = document.getElementById('gap-' + questionNum);
    if (gapElement && sentenceOptions[letter]) {
        gapElement.textContent = sentenceOptions[letter];
        gapElement.classList.add('filled');
    }
}

// Save dropdown answer (Part 5)
function saveDropdownAnswer(questionNum, value) {
    const questionName = 'q' + questionNum;
    userAnswers[questionName] = value;
}

// Save text answer (Part 6)
function saveTextAnswer(questionNum, value) {
    const questionName = 'q' + questionNum;
    userAnswers[questionName] = value.trim().toUpperCase();
}

// Navigation functions
function goToNextSection() {
    // Save answers from current section
    if (currentSection === 1) {
        savePartAnswers('part1', 5);
    } else if (currentSection === 2) {
        savePartAnswers('part2', 10);
    } else if (currentSection === 3) {
        savePartAnswers('part3', 15);
    } else if (currentSection === 4) {
        savePartAnswers('part4', 20);
    } else if (currentSection === 5) {
        savePartAnswers('part5', 26);
    }
    
    currentSection++;
    showSection(currentSection);
    updateProgressBar();
    window.scrollTo(0, 0);
}

function goToPreviousSection() {
    currentSection--;
    showSection(currentSection);
    updateProgressBar();
    window.scrollTo(0, 0);
}

function showSection(sectionNumber) {
    // Hide all sections
    const sections = document.querySelectorAll('.test-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show current section
    let currentSectionElement;
    if (sectionNumber === 7) {
        currentSectionElement = document.getElementById('results');
    } else {
        currentSectionElement = document.getElementById('part' + sectionNumber);
    }
    
    if (currentSectionElement) {
        currentSectionElement.style.display = 'block';
    }
}

function savePartAnswers(partName, questionCount) {
    for (let i = 1; i <= questionCount; i++) {
        const questionName = 'q' + i;
        
        // For Part 1 (radio buttons)
        const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
        if (selectedOption) {
            userAnswers[questionName] = selectedOption.value;
        }
        
        // For Part 2 (carousel hidden inputs)
        const hiddenInput = document.getElementById('answer-' + questionName);
        if (hiddenInput) {
            userAnswers[questionName] = hiddenInput.value;
        }
    }
}

function updateProgressBar() {
    const totalSections = 6; // We have 6 parts total
    const progress = (currentSection / totalSections) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Finish test and show results
function finishTest() {
    // Save Part 6 answers
    savePartAnswers('part6', 32);
    
    // Calculate scores for each part
    let totalScore = 0;
    let totalQuestions = 0;
    let resultsHTML = '<div class="results-container">';
    
    // Part 1 (5 questions)
    let part1Score = calculateScore('part1', 1, 5);
    resultsHTML += createPartResult('Part 1 - Reading Signs', part1Score, 5, 'part1', 1, 5);
    totalScore += part1Score;
    totalQuestions += 5;
    
    // Part 2 (5 questions)
    let part2Score = calculateScore('part2', 6, 10);
    resultsHTML += createPartResult('Part 2 - Matching', part2Score, 5, 'part2', 6, 10);
    totalScore += part2Score;
    totalQuestions += 5;
    
    // Part 3 (5 questions)
    let part3Score = calculateScore('part3', 11, 15);
    resultsHTML += createPartResult('Part 3 - Reading Comprehension', part3Score, 5, 'part3', 11, 15);
    totalScore += part3Score;
    totalQuestions += 5;
    
    // Part 4 (5 questions)
    let part4Score = calculateScore('part4', 16, 20);
    resultsHTML += createPartResult('Part 4 - Sentence Completion', part4Score, 5, 'part4', 16, 20);
    totalScore += part4Score;
    totalQuestions += 5;
    
    // Part 5 (6 questions)
    let part5Score = calculateScore('part5', 21, 26);
    resultsHTML += createPartResult('Part 5 - Multiple Choice Cloze', part5Score, 6, 'part5', 21, 26);
    totalScore += part5Score;
    totalQuestions += 6;
    
    // Part 6 (6 questions) - case insensitive comparison
    let part6Score = calculateScoreCaseInsensitive('part6', 27, 32);
    resultsHTML += createPartResult('Part 6 - Open Cloze', part6Score, 6, 'part6', 27, 32);
    totalScore += part6Score;
    totalQuestions += 6;
    
    // Calculate overall score
    const percentage = Math.round((totalScore / totalQuestions) * 100);
    const passStatus = percentage >= 70 ? 'PASS' : 'FAIL';
    const passClass = percentage >= 70 ? 'pass' : 'fail';
    
    // Create overall score section at the top
    let finalHTML = `
        <div class="overall-score">
            <h3>Test Results</h3>
            <div class="score-circle">
                <div class="score-number">${totalScore}/${totalQuestions}</div>
                <div class="score-percentage">${percentage}%</div>
            </div>
            <div class="pass-badge ${passClass}">${passStatus}</div>
            <p class="pass-message">Pass mark: 70% or above</p>
        </div>
        ${resultsHTML}
    </div>`;
    
    document.getElementById('resultsContent').innerHTML = finalHTML;
    currentSection = 7;
    showSection(7);
    window.scrollTo(0, 0);
}

function calculateScore(partName, startQ, endQ) {
    let score = 0;
    for (let i = startQ; i <= endQ; i++) {
        const questionName = 'q' + i;
        if (userAnswers[questionName] === answers[partName][questionName]) {
            score++;
        }
    }
    return score;
}

function calculateScoreCaseInsensitive(partName, startQ, endQ) {
    let score = 0;
    for (let i = startQ; i <= endQ; i++) {
        const questionName = 'q' + i;
        const userAnswer = (userAnswers[questionName] || '').toUpperCase().trim();
        const correctAnswer = answers[partName][questionName];
        
        // Handle array answers (multiple acceptable answers)
        if (Array.isArray(correctAnswer)) {
            const correctAnswersUpper = correctAnswer.map(a => a.toUpperCase().trim());
            if (correctAnswersUpper.includes(userAnswer)) {
                score++;
            }
        } else {
            const correctAnswerUpper = (correctAnswer || '').toUpperCase().trim();
            if (userAnswer === correctAnswerUpper) {
                score++;
            }
        }
    }
    return score;
}

function createPartResult(partName, score, total, partKey, startQ, endQ) {
    const percentage = Math.round((score / total) * 100);
    const isGood = percentage >= 70;
    const colorClass = isGood ? 'good-score' : 'needs-work';
    
    let detailsHTML = '';
    for (let i = startQ; i <= endQ; i++) {
        const questionName = 'q' + i;
        const userAnswer = userAnswers[questionName] || 'No answer';
        const correctAnswer = answers[partKey][questionName];
        
        // Check if answer is correct, handling arrays and case-insensitive comparison
        let isCorrect;
        if (partKey === 'part6') {
            const userAnswerUpper = userAnswer.toUpperCase().trim();
            if (Array.isArray(correctAnswer)) {
                isCorrect = correctAnswer.map(a => a.toUpperCase().trim()).includes(userAnswerUpper);
            } else {
                isCorrect = userAnswerUpper === correctAnswer.toUpperCase().trim();
            }
        } else {
            isCorrect = userAnswer === correctAnswer;
        }
        
        const statusIcon = isCorrect ? '✓' : '✗';
        const statusClass = isCorrect ? 'correct' : 'incorrect';
        
        // For Part 4, show the sentence text instead of letter
        let displayUserAnswer = userAnswer;
        let displayCorrectAnswer = Array.isArray(correctAnswer) ? correctAnswer.join(' or ') : correctAnswer;
        if (partKey === 'part4' && sentenceOptions[userAnswer]) {
            displayUserAnswer = `${userAnswer}: ${sentenceOptions[userAnswer]}`;
            displayCorrectAnswer = `${correctAnswer}: ${sentenceOptions[correctAnswer]}`;
        }
        
        detailsHTML += `
            <div class="question-detail ${statusClass}">
                <span class="status-icon">${statusIcon}</span>
                <span class="question-num">Q${i}:</span>
                <span class="answer-info">
                    Your answer: <strong>${displayUserAnswer}</strong>
                    ${!isCorrect ? ` | Correct answer: <strong>${displayCorrectAnswer}</strong>` : ''}
                </span>
            </div>
        `;
    }
    
    return `
        <div class="part-result ${colorClass}">
            <div class="part-header">
                <div class="part-name">${partName}</div>
                <div class="part-score">${score}/${total} (${percentage}%)</div>
            </div>
            <div class="part-details">
                ${detailsHTML}
            </div>
        </div>
    `;
}

// Check answers for Part 1
function checkPart1Answers() {
    savePartAnswers('part1', 5);
    
    let score = 0;
    const totalQuestions = 5;
    
    for (let i = 1; i <= totalQuestions; i++) {
        const questionName = 'q' + i;
        const questionDiv = document.querySelector(`input[name="${questionName}"]`).closest('.question');
        
        // Remove previous feedback
        const existingFeedback = questionDiv.querySelector('.feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Remove previous answer classes
        questionDiv.classList.remove('answered-correct', 'answered-incorrect');
        
        const userAnswer = userAnswers[questionName];
        const correctAnswer = answers.part1[questionName];
        
        if (userAnswer === correctAnswer) {
            score++;
            questionDiv.classList.add('answered-correct');
            
            const feedback = document.createElement('div');
            feedback.className = 'feedback correct';
            feedback.innerHTML = '✓ Correct!';
            questionDiv.appendChild(feedback);
        } else {
            questionDiv.classList.add('answered-incorrect');
            
            const feedback = document.createElement('div');
            feedback.className = 'feedback incorrect';
            feedback.innerHTML = `✗ Incorrect. The correct answer is ${correctAnswer}.`;
            questionDiv.appendChild(feedback);
        }
    }
    
    // Show overall score
    alert(`You scored ${score} out of ${totalQuestions} in Part 1!`);
}

// Add event listeners to all radio buttons to save answers in real-time
document.addEventListener('change', function(e) {
    if (e.target.type === 'radio') {
        const questionName = e.target.name;
        userAnswers[questionName] = e.target.value;
    }
});

// PDF Generation Function
function downloadPDF() {
    // Prompt for student name
    const studentName = prompt("Please enter your full name for the certificate:");
    
    if (!studentName || studentName.trim() === '') {
        alert("Name is required to generate the PDF.");
        return;
    }
    
    // Calculate total score
    const totalScore = calculateTotalScore();
    const percentage = Math.round((totalScore.score / totalScore.total) * 100);
    const passStatus = percentage >= 70 ? 'PASS' : 'FAIL';
    
    // Get jsPDF from window
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get current date
    const currentDate = new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Set colors
    const purpleColor = [102, 126, 234];
    const darkColor = [31, 41, 55];
    const passColor = percentage >= 70 ? [16, 185, 129] : [239, 68, 68];
    
    // Header
    doc.setFillColor(purpleColor[0], purpleColor[1], purpleColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('B1 PET Cambridge English Test', 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`Practice Test Results - ${TEST_CODE}`, 105, 25, { align: 'center' });
    
    // Student Info Box
    doc.setFillColor(240, 244, 255);
    doc.roundedRect(20, 45, 170, 25, 3, 3, 'F');
    
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(studentName, 105, 55, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Test Date: ${currentDate}`, 105, 63, { align: 'center' });
    
    // Score Box
    doc.setFillColor(purpleColor[0], purpleColor[1], purpleColor[2]);
    doc.roundedRect(20, 80, 170, 50, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('Overall Score', 105, 90, { align: 'center' });
    
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text(`${totalScore.score} / ${totalScore.total}`, 105, 105, { align: 'center' });
    
    doc.setFontSize(20);
    doc.text(`${percentage}%`, 105, 118, { align: 'center' });
    
    // Pass/Fail Badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(75, 138, 60, 15, 7, 7, 'F');
    
    doc.setDrawColor(passColor[0], passColor[1], passColor[2]);
    doc.setLineWidth(1);
    doc.roundedRect(75, 138, 60, 15, 7, 7, 'S');
    
    doc.setTextColor(passColor[0], passColor[1], passColor[2]);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(passStatus, 105, 147, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Pass mark: 70% or above', 105, 125, { align: 'center' });
    
    // Table Header
    let yPos = 170;
    doc.setFillColor(purpleColor[0], purpleColor[1], purpleColor[2]);
    doc.rect(20, yPos, 170, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Test Section', 25, yPos + 7);
    doc.text('Score', 115, yPos + 7);
    doc.text('Percentage', 155, yPos + 7);
    
    // Table Rows
    const partNames = [
        'Part 1 - Reading Signs',
        'Part 2 - Matching',
        'Part 3 - Reading Comprehension',
        'Part 4 - Sentence Completion',
        'Part 5 - Multiple Choice Cloze',
        'Part 6 - Open Cloze'
    ];
    
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    yPos += 10;
    totalScore.parts.forEach((part, index) => {
        // Alternating row colors
        if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(20, yPos, 170, 10, 'F');
        }
        
        doc.text(partNames[index], 25, yPos + 7);
        doc.text(`${part.score} / ${part.total}`, 115, yPos + 7);
        doc.text(`${part.percentage}%`, 155, yPos + 7);
        
        yPos += 10;
    });
    
    // Footer
    yPos += 15;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 10;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.text('This is a practice test certificate generated for learning purposes.', 105, yPos, { align: 'center' });
    doc.text('B1 Preliminary English Test (PET) - Reading Section', 105, yPos + 5, { align: 'center' });
    
    // Save the PDF
    const fileName = `${TEST_CODE}_Results_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

// Calculate total score across all parts
function calculateTotalScore() {
    const parts = [
        { name: 'part1', start: 1, end: 5 },
        { name: 'part2', start: 6, end: 10 },
        { name: 'part3', start: 11, end: 15 },
        { name: 'part4', start: 16, end: 20 },
        { name: 'part5', start: 21, end: 26 },
        { name: 'part6', start: 27, end: 32 }
    ];
    
    let totalScore = 0;
    let totalQuestions = 0;
    const partResults = [];
    
    parts.forEach((part, index) => {
        let score;
        if (index === 5) { // Part 6 is case insensitive
            score = calculateScoreCaseInsensitive(part.name, part.start, part.end);
        } else {
            score = calculateScore(part.name, part.start, part.end);
        }
        
        const total = part.end - part.start + 1;
        const percentage = Math.round((score / total) * 100);
        
        partResults.push({ score, total, percentage });
        totalScore += score;
        totalQuestions += total;
    });
    
    return {
        score: totalScore,
        total: totalQuestions,
        percentage: Math.round((totalScore / totalQuestions) * 100),
        parts: partResults
    };
}
