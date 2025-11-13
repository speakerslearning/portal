// Note: answers, sentenceTexts, and TEST_CODE are defined in the HTML file
// This allows each test (FCE001, FCE002, etc.) to have different answers

// Track current section
let currentSection = 1;
let userAnswers = {};
let currentGapNumber = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateProgressBar();
});

// Save dropdown answer (Part 1)
function saveDropdownAnswer(questionNum, value) {
    const questionName = 'q' + questionNum;
    userAnswers[questionName] = value;
}

// Save text answer (Part 2)
function saveTextAnswer(questionNum, value) {
    const questionName = 'q' + questionNum;
    userAnswers[questionName] = value.trim().toUpperCase();
}

// Navigation functions
function goToNextSection() {
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

function updateProgressBar() {
    const totalSections = 7; // We have 7 parts total
    const progress = (currentSection / totalSections) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Finish test and show results
function finishTest() {
    try {
    // Calculate scores
    let totalScore = 0;
    let totalQuestions = 70; // 8 + 8 + 8 + 12 + 12 + 12 + 10
    let resultsHTML = '<div class="results-container">';
    
    // Part 1 (8 questions, 8 points)
    let part1Score = calculateScore('part1', 1, 8);
    resultsHTML += createPartResult('Part 1 - Multiple Choice Cloze', part1Score, 8, 'part1', 1, 8);
    totalScore += part1Score;
    
    // Part 2 (8 questions, 8 points) - case insensitive comparison
    let part2Score = calculateScoreCaseInsensitive('part2', 9, 16);
    resultsHTML += createPartResult('Part 2 - Open Cloze', part2Score, 8, 'part2', 9, 16);
    totalScore += part2Score;
    
    // Part 3 (8 questions, 8 points) - case insensitive comparison
    let part3Score = calculateScoreCaseInsensitive('part3', 17, 24);
    resultsHTML += createPartResult('Part 3 - Word Formation', part3Score, 8, 'part3', 17, 24);
    totalScore += part3Score;
    
    // Part 4 (6 questions, 12 points) - split marking (0, 1, or 2 points each)
    let part4Score = calculateScorePart4(25, 30);
    resultsHTML += createPartResult('Part 4 - Key Word Transformations', part4Score, 12, 'part4', 25, 30);
    totalScore += part4Score;
    
    // Part 5 (6 questions, 12 points) - double points
    let part5Score = calculateScoreDouble('part5', 31, 36);
    resultsHTML += createPartResult('Part 5 - Multiple Choice Reading', part5Score, 12, 'part5', 31, 36);
    totalScore += part5Score;
    
    // Part 6 (6 questions, 12 points) - double points
    let part6Score = calculateScoreDouble('part6', 37, 42);
    resultsHTML += createPartResult('Part 6 - Gapped Text', part6Score, 12, 'part6', 37, 42);
    totalScore += part6Score;
    
    // Part 7 (10 questions, 10 points)
    let part7Score = calculateScore('part7', 43, 52);
    resultsHTML += createPartResult('Part 7 - Multiple Matching', part7Score, 10, 'part7', 43, 52);
    totalScore += part7Score;
    
    // Calculate overall score
    const percentage = Math.round((totalScore / totalQuestions) * 100);
    const passStatus = percentage >= 60 ? 'PASS' : 'FAIL';
    const passClass = percentage >= 60 ? 'pass' : 'fail';
    
    // Create overall score section at the top
    let finalHTML = `
        <div class="overall-score">
            <h3>Test Results</h3>
            <div class="score-circle">
                <div class="score-number">${totalScore}/${totalQuestions}</div>
                <div class="score-percentage">${percentage}%</div>
            </div>
            <div class="pass-badge ${passClass}">${passStatus}</div>
            <p class="pass-message">Pass mark: 60% or above</p>
        </div>
        ${resultsHTML}
    </div>`;
    
    document.getElementById('resultsContent').innerHTML = finalHTML;
    currentSection = 8;
    showSection(8);
    window.scrollTo(0, 0);
    } catch(error) {
        alert('Error in finishTest: ' + error.message);
        console.error('Full error:', error);
    }
}

function showSection(sectionNumber) {
    // Hide all sections
    const sections = document.querySelectorAll('.test-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show current section
    let currentSectionElement;
    if (sectionNumber === 8) {
        currentSectionElement = document.getElementById('results');
    } else {
        currentSectionElement = document.getElementById('part' + sectionNumber);
    }
    
    if (currentSectionElement) {
        currentSectionElement.style.display = 'block';
    }
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
        const correctAnswerValue = answers[partName][questionName];
        
        // Handle both string and array answers (for alternative correct answers)
        if (Array.isArray(correctAnswerValue)) {
            // Check if user answer matches any of the correct answers
            const correctAnswers = correctAnswerValue.map(ans => ans.toUpperCase().trim());
            if (correctAnswers.includes(userAnswer)) {
                score++;
            }
        } else {
            // Single correct answer
            const correctAnswer = (correctAnswerValue || '').toUpperCase().trim();
            if (userAnswer === correctAnswer) {
                score++;
            }
        }
    }
    return score;
}

// Calculate score for Part 4 with split marking (0, 1, or 2 points per question)
function calculateScorePart4(startQ, endQ) {
    let score = 0;
    for (let i = startQ; i <= endQ; i++) {
        const questionName = 'q' + i;
        const userAnswer = (userAnswers[questionName] || '').toUpperCase().trim();
        const correctAnswerObj = answers.part4[questionName];
        
        if (!correctAnswerObj) continue;
        
        // Handle arrays for full, part1, and part2
        const fullAnswers = Array.isArray(correctAnswerObj.full) 
            ? correctAnswerObj.full.map(a => a.toUpperCase().trim())
            : [correctAnswerObj.full.toUpperCase().trim()];
        
        const part1Answers = Array.isArray(correctAnswerObj.part1)
            ? correctAnswerObj.part1.map(a => a.toUpperCase().trim())
            : [correctAnswerObj.part1.toUpperCase().trim()];
        
        const part2Answers = Array.isArray(correctAnswerObj.part2)
            ? correctAnswerObj.part2.map(a => a.toUpperCase().trim())
            : [correctAnswerObj.part2.toUpperCase().trim()];
        
        // Check if full answer is correct (2 points)
        if (fullAnswers.includes(userAnswer)) {
            score += 2;
        } else {
            // Check for partial credit (1 point each for part1 and part2)
            if (part1Answers.some(ans => userAnswer.includes(ans))) {
                score += 1;
            }
            if (part2Answers.some(ans => userAnswer.includes(ans))) {
                score += 1;
            }
        }
    }
    return score;
}

// Calculate score with double points (2 points per correct answer)
function calculateScoreDouble(partName, startQ, endQ) {
    let score = 0;
    for (let i = startQ; i <= endQ; i++) {
        const questionName = 'q' + i;
        if (userAnswers[questionName] === answers[partName][questionName]) {
            score += 2; // Double points for Parts 5 and 6
        }
    }
    return score;
}

function createPartResult(partName, score, total, partKey, startQ, endQ) {
    const percentage = Math.round((score / total) * 100);
    const isGood = percentage >= 60;
    const colorClass = isGood ? 'good-score' : 'needs-work';
    
    let detailsHTML = '';
    
    // Special handling for Part 4 (split marking)
    if (partKey === 'part4') {
        for (let i = startQ; i <= endQ; i++) {
            const questionName = 'q' + i;
            const userAnswer = (userAnswers[questionName] || 'No answer').toUpperCase().trim();
            const correctAnswerObj = answers[partKey][questionName];
            
            // Handle arrays for display
            const fullAnswers = Array.isArray(correctAnswerObj.full)
                ? correctAnswerObj.full.map(a => a.toUpperCase().trim())
                : [correctAnswerObj.full.toUpperCase().trim()];
            
            const part1Answers = Array.isArray(correctAnswerObj.part1)
                ? correctAnswerObj.part1.map(a => a.toUpperCase().trim())
                : [correctAnswerObj.part1.toUpperCase().trim()];
            
            const part2Answers = Array.isArray(correctAnswerObj.part2)
                ? correctAnswerObj.part2.map(a => a.toUpperCase().trim())
                : [correctAnswerObj.part2.toUpperCase().trim()];
            
            const fullAnswerDisplay = Array.isArray(correctAnswerObj.full)
                ? correctAnswerObj.full.join(' / ')
                : correctAnswerObj.full;
            
            let pointsEarned = 0;
            let statusIcon = '';
            let statusClass = '';
            
            // Check scoring
            if (fullAnswers.includes(userAnswer)) {
                pointsEarned = 2;
                statusIcon = '✓✓';
                statusClass = 'correct';
            } else {
                let hasPart1 = part1Answers.some(ans => userAnswer.includes(ans));
                let hasPart2 = part2Answers.some(ans => userAnswer.includes(ans));
                pointsEarned = (hasPart1 ? 1 : 0) + (hasPart2 ? 1 : 0);
                
                if (pointsEarned === 0) {
                    statusIcon = '✗';
                    statusClass = 'incorrect';
                } else if (pointsEarned === 1) {
                    statusIcon = '◐';
                    statusClass = 'partial';
                } else {
                    statusIcon = '✓';
                    statusClass = 'correct';
                }
            }
            
            detailsHTML += `
                <div class="question-detail ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="question-num">Q${i} (${pointsEarned}/2):</span>
                    <span class="answer-info">
                        Your answer: <strong>${userAnswer || 'No answer'}</strong>
                        ${pointsEarned < 2 ? ` | Correct answer: <strong>${fullAnswerDisplay}</strong>` : ''}
                    </span>
                </div>
            `;
        }
    } else if (partKey === 'part5' || partKey === 'part6') {
        // Special handling for Parts 5 and 6 (double points)
        for (let i = startQ; i <= endQ; i++) {
            const questionName = 'q' + i;
            const userAnswer = userAnswers[questionName] || 'No answer';
            const correctAnswer = answers[partKey][questionName];
            const isCorrect = (userAnswer === correctAnswer);
            
            const pointsEarned = isCorrect ? 2 : 0;
            const statusIcon = isCorrect ? '✓' : '✗';
            const statusClass = isCorrect ? 'correct' : 'incorrect';
            
            detailsHTML += `
                <div class="question-detail ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="question-num">Q${i} (${pointsEarned}/2):</span>
                    <span class="answer-info">
                        Your answer: <strong>${userAnswer}</strong>
                        ${!isCorrect ? ` | Correct answer: <strong>${correctAnswer}</strong>` : ''}
                    </span>
                </div>
            `;
        }
    } else {
        // Standard handling for other parts (1 point each)
        for (let i = startQ; i <= endQ; i++) {
            const questionName = 'q' + i;
            const userAnswer = userAnswers[questionName] || 'No answer';
            const correctAnswerValue = answers[partKey][questionName];
            
            let isCorrect;
            let correctAnswerDisplay;
            
            if (partKey === 'part2' || partKey === 'part3') {
                // Case-insensitive comparison, handle arrays
                if (Array.isArray(correctAnswerValue)) {
                    const correctAnswers = correctAnswerValue.map(ans => ans.toUpperCase().trim());
                    isCorrect = correctAnswers.includes(userAnswer.toUpperCase().trim());
                    correctAnswerDisplay = correctAnswerValue.join(' / ');
                } else {
                    isCorrect = userAnswer.toUpperCase().trim() === correctAnswerValue.toUpperCase().trim();
                    correctAnswerDisplay = correctAnswerValue;
                }
            } else {
                // Exact match for other parts
                isCorrect = userAnswer === correctAnswerValue;
                correctAnswerDisplay = correctAnswerValue;
            }
            
            const statusIcon = isCorrect ? '✓' : '✗';
            const statusClass = isCorrect ? 'correct' : 'incorrect';
            
            detailsHTML += `
                <div class="question-detail ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="question-num">Q${i}:</span>
                    <span class="answer-info">
                        Your answer: <strong>${userAnswer}</strong>
                        ${!isCorrect ? ` | Correct answer: <strong>${correctAnswerDisplay}</strong>` : ''}
                    </span>
                </div>
            `;
        }
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
    const passStatus = percentage >= 60 ? 'PASS' : 'FAIL';
    
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
    const blueColor = [59, 130, 246];
    const darkColor = [31, 41, 55];
    const passColor = percentage >= 60 ? [16, 185, 129] : [239, 68, 68];
    
    // Header
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('B2 First (FCE) Cambridge English Test', 105, 15, { align: 'center' });
    
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
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
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
    doc.text('Pass mark: 60% or above', 105, 125, { align: 'center' });
    
    // Table Header
    let yPos = 170;
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(20, yPos, 170, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Test Section', 25, yPos + 7);
    doc.text('Score', 115, yPos + 7);
    doc.text('Percentage', 155, yPos + 7);
    
    // Table Rows
    const partNames = [
        'Part 1 - Multiple Choice Cloze',
        'Part 2 - Open Cloze',
        'Part 3 - Word Formation',
        'Part 4 - Key Word Transformations',
        'Part 5 - Multiple Choice Reading',
        'Part 6 - Gapped Text',
        'Part 7 - Multiple Matching'
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
    doc.text('B2 First (FCE) - Reading and Use of English Section', 105, yPos + 5, { align: 'center' });
    
    // Save the PDF
    const fileName = `${TEST_CODE}_Results_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

// Calculate total score
function calculateTotalScore() {
    let part1Score = calculateScore('part1', 1, 8);
    let part2Score = calculateScoreCaseInsensitive('part2', 9, 16);
    let part3Score = calculateScoreCaseInsensitive('part3', 17, 24);
    let part4Score = calculateScorePart4(25, 30);
    let part5Score = calculateScoreDouble('part5', 31, 36);
    let part6Score = calculateScoreDouble('part6', 37, 42);
    let part7Score = calculateScore('part7', 43, 52);
    
    let score = part1Score + part2Score + part3Score + part4Score + part5Score + part6Score + part7Score;
    let total = 70; // 8 + 8 + 8 + 12 + 12 + 12 + 10
    
    const parts = [
        { score: part1Score, total: 8, percentage: Math.round((part1Score / 8) * 100) },
        { score: part2Score, total: 8, percentage: Math.round((part2Score / 8) * 100) },
        { score: part3Score, total: 8, percentage: Math.round((part3Score / 8) * 100) },
        { score: part4Score, total: 12, percentage: Math.round((part4Score / 12) * 100) },
        { score: part5Score, total: 12, percentage: Math.round((part5Score / 12) * 100) },
        { score: part6Score, total: 12, percentage: Math.round((part6Score / 12) * 100) },
        { score: part7Score, total: 10, percentage: Math.round((part7Score / 10) * 100) }
    ];
    
    return {
        score: score,
        total: total,
        percentage: Math.round((score / total) * 100),
        parts: parts
    };
}

// Part 6 Modal Functions
function openSentenceModal(gapNumber) {
    currentGapNumber = gapNumber;
    document.getElementById('modalGapNumber').textContent = gapNumber;
    document.getElementById('sentenceModal').style.display = 'flex';
    
    // Update onclick handlers for all sentence choices
    const choices = document.querySelectorAll('.sentence-choice');
    choices.forEach(choice => {
        const letter = choice.querySelector('strong').textContent;
        choice.onclick = function() {
            selectSentence(gapNumber, letter);
        };
    });
}

function closeSentenceModal() {
    document.getElementById('sentenceModal').style.display = 'none';
    currentGapNumber = null;
}

function selectSentence(gapNumber, letter) {
    // Save the answer
    const questionName = 'q' + gapNumber;
    userAnswers[questionName] = letter;
    saveDropdownAnswer(gapNumber, letter);
    
    // Update the display
    const displayElement = document.getElementById('display' + gapNumber);
    displayElement.innerHTML = `<strong>${letter}</strong> ${sentenceTexts[letter]}`;
    
    // Close the modal
    closeSentenceModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const sentenceModal = document.getElementById('sentenceModal');
    const matchModal = document.getElementById('matchModal');
    if (event.target === sentenceModal) {
        closeSentenceModal();
    }
    if (event.target === matchModal) {
        closeMatchModal();
    }
}

// Part 7 Modal Functions
let currentMatchNumber = null;

function openMatchModal(questionNumber) {
    currentMatchNumber = questionNumber;
    document.getElementById('modalMatchNumber').textContent = questionNumber;
    document.getElementById('matchModal').style.display = 'flex';
    
    // Update onclick handlers for all student choices
    const choices = document.querySelectorAll('.student-choice');
    choices.forEach(choice => {
        const letter = choice.querySelector('strong').textContent;
        choice.onclick = function() {
            selectMatch(questionNumber, letter);
        };
    });
}

function closeMatchModal() {
    document.getElementById('matchModal').style.display = 'none';
    currentMatchNumber = null;
}

function selectMatch(questionNumber, letter) {
    // Save the answer
    const questionName = 'q' + questionNumber;
    userAnswers[questionName] = letter;
    saveDropdownAnswer(questionNumber, letter);
    
    // Update the display
    const matchElement = document.getElementById('match' + questionNumber);
    matchElement.innerHTML = letter;
    matchElement.classList.add('selected');
    
    // Close the modal
    closeMatchModal();
}
