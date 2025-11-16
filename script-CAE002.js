// Note: answers and TEST_CODE are defined in the HTML file
// This allows each test (CAE001, CAE002, etc.) to have different answers

// Track current section
let currentSection = 1;
let userAnswers = {};
let currentReviewNumber = null;

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
    const totalSections = 8; // We have 8 parts total for C1
    const progress = (currentSection / totalSections) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Finish test and show results
function finishTest() {
    // Calculate scores
    let totalScore = 0;
    let totalQuestions = 78; // 8 + 8 + 8 + 12 + 12 + 8 + 12 + 10
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
    
    // Part 6 (4 questions, 8 points) - double points
    let part6Score = calculateScoreDouble('part6', 37, 40);
    resultsHTML += createPartResult('Part 6 - Cross-text Multiple Matching', part6Score, 8, 'part6', 37, 40);
    totalScore += part6Score;
    
    // Part 7 (6 questions, 12 points) - double points
    let part7Score = calculateScoreDouble('part7', 41, 46);
    resultsHTML += createPartResult('Part 7 - Gapped Text', part7Score, 12, 'part7', 41, 46);
    totalScore += part7Score;
    
    // Part 8 (10 questions, 10 points)
    let part8Score = calculateScore('part8', 47, 56);
    resultsHTML += createPartResult('Part 8 - Multiple Matching', part8Score, 10, 'part8', 47, 56);
    totalScore += part8Score;
    
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
    currentSection = 9;
    showSection(9);
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
    if (sectionNumber === 9) {
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
        const correctAnswer = (answers[partName][questionName] || '').toUpperCase().trim();
        if (userAnswer === correctAnswer) {
            score++;
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
        
        // Handle arrays for alternative answers
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
            
            // Handle arrays for alternative answers
            const fullAnswers = Array.isArray(correctAnswerObj.full)
                ? correctAnswerObj.full.map(a => a.toUpperCase().trim())
                : [correctAnswerObj.full.toUpperCase().trim()];
            
            const part1Answers = Array.isArray(correctAnswerObj.part1)
                ? correctAnswerObj.part1.map(a => a.toUpperCase().trim())
                : [correctAnswerObj.part1.toUpperCase().trim()];
            
            const part2Answers = Array.isArray(correctAnswerObj.part2)
                ? correctAnswerObj.part2.map(a => a.toUpperCase().trim())
                : [correctAnswerObj.part2.toUpperCase().trim()];
            
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
            
            // Display correct answer(s)
            const fullAnswerDisplay = Array.isArray(correctAnswerObj.full)
                ? correctAnswerObj.full.join(' / ')
                : correctAnswerObj.full;
            
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
            const correctAnswer = answers[partKey][questionName];
            const isCorrect = (partKey === 'part2' || partKey === 'part3') ? 
                (userAnswer.toUpperCase().trim() === correctAnswer.toUpperCase().trim()) :
                (userAnswer === correctAnswer);
            
            const statusIcon = isCorrect ? '✓' : '✗';
            const statusClass = isCorrect ? 'correct' : 'incorrect';
            
            detailsHTML += `
                <div class="question-detail ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="question-num">Q${i}:</span>
                    <span class="answer-info">
                        Your answer: <strong>${userAnswer}</strong>
                        ${!isCorrect ? ` | Correct answer: <strong>${correctAnswer}</strong>` : ''}
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
    doc.text('C1 Advanced (CAE) Cambridge English Test', 105, 15, { align: 'center' });
    
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
        'Part 6 - Cross-text Multiple Matching',
        'Part 7 - Gapped Text',
        'Part 8 - Multiple Matching'
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
    doc.text('C1 Advanced (CAE) - Reading and Use of English Section', 105, yPos + 5, { align: 'center' });
    
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
    let part6Score = calculateScoreDouble('part6', 37, 40);
    let part7Score = calculateScoreDouble('part7', 41, 46);
    let part8Score = calculateScore('part8', 47, 56);
    
    let score = part1Score + part2Score + part3Score + part4Score + part5Score + part6Score + part7Score + part8Score;
    let total = 78; // 8 + 8 + 8 + 12 + 12 + 8 + 12 + 10
    
    const parts = [
        { score: part1Score, total: 8, percentage: Math.round((part1Score / 8) * 100) },
        { score: part2Score, total: 8, percentage: Math.round((part2Score / 8) * 100) },
        { score: part3Score, total: 8, percentage: Math.round((part3Score / 8) * 100) },
        { score: part4Score, total: 12, percentage: Math.round((part4Score / 12) * 100) },
        { score: part5Score, total: 12, percentage: Math.round((part5Score / 12) * 100) },
        { score: part6Score, total: 8, percentage: Math.round((part6Score / 8) * 100) },
        { score: part7Score, total: 12, percentage: Math.round((part7Score / 12) * 100) },
        { score: part8Score, total: 10, percentage: Math.round((part8Score / 10) * 100) }
    ];
    
    return {
        score: score,
        total: total,
        percentage: Math.round((score / total) * 100),
        parts: parts
    };
}

// Part 6 & Part 8 Modal Functions for Cross-text Matching and Multiple Matching
function openReviewModal(questionNumber) {
    currentReviewNumber = questionNumber;
    document.getElementById('modalReviewNumber').textContent = questionNumber;
    
    const modalBody = document.getElementById('reviewModalBody');
    const modalTitle = document.getElementById('reviewModalTitle');
    
    // Determine which part we're in based on question number
    if (questionNumber >= 37 && questionNumber <= 40) {
        // Part 6 - Museum funding contributors
        modalTitle.innerHTML = 'Select a contributor for question <span id="modalReviewNumber">' + questionNumber + '</span>';
        modalBody.innerHTML = `
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'A')">
                <strong>A</strong>
            </div>
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'B')">
                <strong>B</strong>
            </div>
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'C')">
                <strong>C</strong>
            </div>
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'D')">
                <strong>D</strong>
            </div>
        `;
    } else if (questionNumber >= 47 && questionNumber <= 56) {
        // Part 8 - Architecture books
        modalTitle.innerHTML = 'Select a book for question <span id="modalReviewNumber">' + questionNumber + '</span>';
        modalBody.innerHTML = `
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'A')">
                <strong>A</strong> The Meaning of Home
            </div>
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'B')">
                <strong>B</strong> Why We Build
            </div>
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'C')">
                <strong>C</strong> The Architect's Home
            </div>
            <div class="student-choice" onclick="selectReview(${questionNumber}, 'D')">
                <strong>D</strong> 20th Century World Architecture
            </div>
        `;
    }
    
    document.getElementById('reviewModal').style.display = 'flex';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    currentReviewNumber = null;
}

function selectReview(questionNumber, letter) {
    // Save the answer
    const questionName = 'q' + questionNumber;
    userAnswers[questionName] = letter;
    saveDropdownAnswer(questionNumber, letter);
    
    // Update the display with appropriate text
    const matchElement = document.getElementById('match' + questionNumber);
    
    if (questionNumber >= 37 && questionNumber <= 40) {
        // Part 6 - Just show letter
        matchElement.innerHTML = letter;
    } else if (questionNumber >= 47 && questionNumber <= 56) {
        // Part 8 - Show letter with book title
        const names = {
            'A': 'The Meaning of Home',
            'B': 'Why We Build',
            'C': 'The Architect\'s Home',
            'D': '20th Century World Architecture'
        };
        matchElement.innerHTML = '<strong>' + letter + '</strong> ' + names[letter];
    }
    
    matchElement.classList.add('selected');
    
    // Close the modal
    closeReviewModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const reviewModal = document.getElementById('reviewModal');
    const sentenceModal = document.getElementById('sentenceModal');
    if (event.target === reviewModal) {
        closeReviewModal();
    }
    if (event.target === sentenceModal) {
        closeSentenceModal();
    }
}

// Part 7 Modal Functions for Gapped Text (Sentence Selection)
let currentSentenceNumber = null;

function openSentenceModal(sentenceNumber) {
    currentSentenceNumber = sentenceNumber;
    document.getElementById('modalSentenceNumber').textContent = sentenceNumber;
    document.getElementById('sentenceModal').style.display = 'flex';
}

function closeSentenceModal() {
    document.getElementById('sentenceModal').style.display = 'none';
    currentSentenceNumber = null;
}

function selectSentence(letter) {
    if (currentSentenceNumber === null) return;
    
    // Save the answer
    const questionName = 'q' + currentSentenceNumber;
    userAnswers[questionName] = letter;
    saveDropdownAnswer(currentSentenceNumber, letter);
    
    // Get the full paragraph text - CAE002 care farms article
    const paragraphs = {
        'A': 'A classmate, Hasan, describes a similar sense of tranquillity. \'I expected to be really annoyed and bored here, but as soon as we arrived it was fantastic. There\'s so much space. You don\'t get stressed out. There\'s time to think.\' Like his peers, he has a complicated home life and needs support.',
        'B': 'Along with this, the teachers accompanying them are encouraged to form closer bonds with their charges and to observe the way that farm staff interact with the young people, and the methods they use to get the behaviour they want.',
        'C': 'This expansion of the sector is evident, but there are differing explanations as to why care farming makes a difference, ranging from those pointing to the therapeutic aspect of the physical labour and the contact with plants and animals, to others claiming it is all to do with taking people away from their problems at home.',
        'D': 'Before coming here he was sceptical, but no longer. \'There\'s something about coming here, from very chaotic environments, as most of these young people do, that does them good. You have to work hard, take responsibility, and you\'re a valued member of the community.\'',
        'E': 'Sofia, however, who is a good head shorter than her fellow pupil, moves forward, methodically pouring out a dozen small heaps under the trees. \'She\'s a natural,\' says her supervisor admiringly. Sofia does not look up, but a little smile flickers across her young face.',
        'F': 'An impressive figure, but isn\'t it an expensive option for schools? Fielden believes the results justify the cost. Eight out of ten children who stay at the farm show a persistent improvement in behaviour. \'Head teachers tell me they\'re rebooking because they\'re no longer seeing those children in trouble. That\'s what we want.\'',
        'G': 'Most of them, they soon tell me, have never been to the countryside before. For five days, they get up early, eat wholesome food and do various chores dependent on the season. It is summer and they are pulling up coriander from the vegetable beds, feeding animals and helping with the harvest.'
    };
    
    // Update the display
    const displayElement = document.getElementById('display' + currentSentenceNumber);
    displayElement.innerHTML = '<strong>' + letter + '</strong> ' + paragraphs[letter];
    displayElement.parentElement.classList.add('selected');
    
    // Close the modal
    closeSentenceModal();
}
