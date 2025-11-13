document.addEventListener('DOMContentLoaded', () => {
  // Load JSON data from the transformercat-questions.json file
  fetch('transformercat-questions.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); // Get as text first
    })
    .then(text => {
      // Parse JSON manually to catch any parsing errors
      let questionData;
      try {
        questionData = JSON.parse(text);
      } catch (e) {
        throw new Error(`JSON parsing error: ${e.message}`);
      }
      
      // Validate the JSON structure
      if (!questionData || typeof questionData !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      
      console.log(`Loaded questions with topics from JSON`);
      
      // Listen for the startGame event from transformercat.html
      document.addEventListener('startGame', () => {
        console.log('Start Game event received. Showing topic selection screen');
        showTopicSelection(questionData);
      });
    })
    .catch(error => {
      console.error('Error loading JSON data:', error);
      const firstSentence = document.getElementById('firstSentence');
      if (firstSentence) {
        firstSentence.textContent = 'Error loading questions. Please refresh the page.';
      }
    });
});

function showTopicSelection(questionData) {
  const startScreen = document.getElementById('startScreen');
  const topicSelection = document.getElementById('topicSelection');
  const startGameBtn = document.getElementById('startGameBtn');
  const questionCountInput = document.getElementById('questionCountInput');
  const allTopicsToggle = document.getElementById('allTopicsToggle');
  const topicCheckboxes = document.querySelectorAll('.topicToggle');
  
  if (startScreen) startScreen.style.display = 'none';
  if (topicSelection) topicSelection.style.display = 'block';
  
  // Animate the cup (frames 1-4)
  const cupImg = document.getElementById('cupAnimationImg');
  const cupFrames = ['cup1.png', 'cup2.png', 'cup3.png', 'cup4.png'];
  let cupFrameIndex = 0;
  
  const cupInterval = setInterval(() => {
    cupFrameIndex = (cupFrameIndex + 1) % cupFrames.length;
    if (cupImg) cupImg.src = cupFrames[cupFrameIndex];
  }, 200);
  
  // Handle "All topics" toggle
  allTopicsToggle.addEventListener('change', () => {
    topicCheckboxes.forEach(checkbox => {
      checkbox.checked = allTopicsToggle.checked;
    });
  });
  
  // Update "All topics" checkbox if individual boxes change
  topicCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(topicCheckboxes).every(cb => cb.checked);
      allTopicsToggle.checked = allChecked;
    });
  });
  
  // Start game button
  startGameBtn.addEventListener('click', () => {
    clearInterval(cupInterval);
    
    // Get selected topics
    const selectedTopics = Array.from(topicCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic!');
      return;
    }
    
    // Get question count
    let questionCount = parseInt(questionCountInput.value);
    if (isNaN(questionCount) || questionCount < 1) {
      questionCount = 1;
    } else if (questionCount > 100) {
      questionCount = 100;
    }
    
    // Gather questions from selected topics
    const selectedQuestions = [];
    selectedTopics.forEach(topic => {
      if (questionData[topic]) {
        selectedQuestions.push(...questionData[topic]);
      }
    });
    
    if (selectedQuestions.length === 0) {
      alert('No questions available for the selected topics!');
      return;
    }
    
    // Adjust question count if not enough questions available
    const actualQuestionCount = Math.min(questionCount, selectedQuestions.length);
    
    if (actualQuestionCount < questionCount) {
      alert(`Only ${selectedQuestions.length} questions available for selected topics. Using ${actualQuestionCount} questions.`);
    }
    
    console.log(`Starting game with ${selectedTopics.length} topic(s), ${actualQuestionCount} questions from ${selectedQuestions.length} available`);
    
    topicSelection.style.display = 'none';
    const topicLabel = selectedTopics.length === Object.keys(questionData).length ? 'All Topics' : selectedTopics.join(', ');
    initializeGame(selectedQuestions, actualQuestionCount, topicLabel);
  });
}

function initializeGame(allQuestions, questionCount, selectedTopic) {
  // Get screen elements
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBar = document.getElementById('loadingBar');
  const loadingText = document.getElementById('loadingText');
  const startScreen = document.getElementById('startScreen');
  const questionSelection = document.getElementById('questionSelection');
  const topicSelection = document.getElementById('topicSelection');
  
  // Hide all other screens FIRST (including app)
  const appElement = document.getElementById('app');
  if (startScreen) startScreen.style.display = 'none';
  if (questionSelection) questionSelection.style.display = 'none';
  if (topicSelection) topicSelection.style.display = 'none';
  if (appElement) appElement.style.display = 'none';
  
  // Force a reflow to ensure the hide happens before showing loading screen
  if (loadingScreen) {
    loadingScreen.offsetHeight; // Force reflow
  }
  
  // Now show loading screen
  if (loadingScreen) {
    loadingScreen.style.display = 'block';
    loadingBar.style.width = '20%';
    loadingText.textContent = 'Loading audio files...';
  }
  
  // Reset counters explicitly when starting a new game
  window.totalScore = 0;
  window.correctCount = 0;
  window.halfCorrectCount = 0;
  window.incorrectCount = 0;
  
  console.log(`Starting game with topic: ${selectedTopic}, ${questionCount} questions from ${allQuestions.length} available`);
  
  // Load audio files with progress tracking
  let loadedAudio = 0;
  const totalAudio = 6;
  
  const updateAudioProgress = () => {
    loadedAudio++;
    if (loadingBar) {
      const progress = 20 + (loadedAudio / totalAudio) * 60; // 20% to 80%
      loadingBar.style.width = `${progress}%`;
    }
  };
  
  const hintSound = new Audio('meow.mp3'); 
  hintSound.volume = 0.08;
  hintSound.addEventListener('canplaythrough', updateAudioProgress, { once: true });
  
  const correctSound = new Audio('correct.wav'); 
  correctSound.volume = 0.8;
  correctSound.addEventListener('canplaythrough', updateAudioProgress, { once: true });
  
  const harpSound = new Audio('harp.wav'); 
  harpSound.volume = 0.9;
  harpSound.addEventListener('canplaythrough', updateAudioProgress, { once: true });
  
  const incorrectSound = new Audio('incorrect.wav'); 
  incorrectSound.volume = 0.3;
  incorrectSound.addEventListener('canplaythrough', updateAudioProgress, { once: true });
  
  const wrongSound = new Audio('wrong.wav'); 
  wrongSound.volume = 0.3;
  wrongSound.addEventListener('canplaythrough', updateAudioProgress, { once: true });
  
  const typeSound = new Audio('type.wav'); 
  typeSound.volume = 0.25;
  typeSound.addEventListener('canplaythrough', updateAudioProgress, { once: true });
  
  let typeSoundIsPlaying = false;
  typeSound.addEventListener('timeupdate', function() {
    if (this.currentTime > this.duration - 0.2 && typeSoundIsPlaying) {
      this.currentTime = 0;
      this.play().catch(e => console.log("Couldn't restart typing sound: ", e));
    }
  });
  
  // Frame-based animation parameters and variables
  const typingFrames = ['type2.png', 'type3.png', 'type4.png'];
  let frameIndex = 0;
  let animationInterval;
  const frameDelay = 150;
  
  const chatFrames = ['chat1.png', 'chat2.png', 'chat3.png'];
  let chatFrameIndex = 0;
  let chatAnimationInterval;
  const chatFrameDelay = 150;
  
  function animateCatTalking(imgElement, duration = 800) {
    if (chatAnimationInterval) {
      clearInterval(chatAnimationInterval);
      chatAnimationInterval = null;
    }
    
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    
    chatFrameIndex = 0;
    imgElement.src = chatFrames[chatFrameIndex];
    
    chatAnimationInterval = setInterval(() => {
      chatFrameIndex = (chatFrameIndex + 1) % chatFrames.length;
      imgElement.src = chatFrames[chatFrameIndex];
    }, chatFrameDelay);
    
    if (duration > 0) {
      setTimeout(() => {
        if (chatAnimationInterval) {
          clearInterval(chatAnimationInterval);
          chatAnimationInterval = null;
          imgElement.src = 'catstill.png';
        }
      }, duration);
    }
    
    return chatAnimationInterval;
  }
  
  function stopChatAnimation() {
    if (chatAnimationInterval) {
      clearInterval(chatAnimationInterval);
      chatAnimationInterval = null;
    }
  }
  
  function animateCatTyping(imgElement, isPlaying = true) {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    
    if (!isPlaying) return;
    
    frameIndex = 0;
    imgElement.src = typingFrames[frameIndex];
    
    animationInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % typingFrames.length;
      imgElement.src = typingFrames[frameIndex];
    }, frameDelay);
    
    return animationInterval;
  }
  
  function stopCatAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }
  
  let soundEnabled = true;
  let hintUsed = false;
  const positiveMessages = ["Correct!","Yes!","Exactly!","Great!","Well done!","You've got this!","Nice one!","That's it!","Good one!","You are doing great!","Superb!","Excellent!","Absolutely!","Getting the hang of it!","Purrr-fect!","Keep up the great work!"];

  function shuffle(arr){return arr.slice().sort(()=>Math.random()-0.5);}
  
  // Use the selected question count
  console.log(`Using ${questionCount} questions for this game session.`);
  
  // Validate allQuestions before using
  if (!allQuestions || !Array.isArray(allQuestions) || allQuestions.length === 0) {
    console.error('Invalid questions array:', allQuestions);
    alert('Error: Questions not loaded properly. Please refresh the page.');
    return;
  }
  
  let questions = shuffle(allQuestions).slice(0, questionCount);
  
  // Validate that questions were properly shuffled and sliced
  if (!questions || questions.length === 0) {
    console.error('Failed to create questions array');
    alert('Error: Could not prepare questions. Please refresh the page.');
    return;
  }
  
  console.log(`Successfully prepared ${questions.length} questions`);
  
  let idx = 0, totalScore = 0, correctCount = 0, halfCorrectCount = 0, incorrectCount = 0, attempts = 0;
  let consecutiveCorrect = 0;
  
  // DOM elements
  const charImg = document.getElementById('charImg');
  const firstSentence = document.getElementById('firstSentence');
  const keywordDisplay = document.getElementById('keywordDisplay');
  const secondSentence = document.getElementById('secondSentence');
  const form = document.getElementById('answerForm');
  const input = document.getElementById('answerInput');
  const submitBtn = document.getElementById('submitBtn');
  const continueBtn = document.getElementById('continueBtn');
  const hintBtn = document.getElementById('hintBtn');
  const restartBtn = document.getElementById('restartBtn');
  const toggleBtn = document.getElementById('toggleSoundBtn');
  const speechBubble = document.getElementById('speechBubble');
  const thoughtBubble = document.getElementById('thoughtBubble');
  const progress = document.getElementById('progress');
  const progressFill = document.getElementById('progressFill');
  const app = document.getElementById('app');
  const exclamation = document.getElementById('exclamation');
  const totalScoreDisplay = document.getElementById('totalScore');
  const correctCountDisplay = document.getElementById('correctCount');
  const halfCorrectCountDisplay = document.getElementById('halfCorrectCount');
  const incorrectCountDisplay = document.getElementById('incorrectCount');
  const scoreCounter = document.getElementById('scoreCounter');
  
  // Function to complete loading and start game
  function startGameAfterLoading() {
    if (loadingBar) loadingBar.style.width = '100%';
    if (loadingText) loadingText.textContent = 'Ready!';
    
    // Brief pause to show 100% before starting
    setTimeout(() => {
      if (loadingScreen) loadingScreen.style.display = 'none';
      if (app) app.style.display = 'block';
      if (scoreCounter) scoreCounter.style.display = 'block';
      updateFooter();
      
      // Force reflow to ensure layout is stable
      if (app) app.offsetHeight;
      
      // Wait for layout to settle before loading first question
      setTimeout(() => {
        if (questions && questions.length > 0 && questions[0]) {
          load(); // Start the first question
        } else {
          console.error('Questions array not properly initialized');
          firstSentence.textContent = 'Error: Questions not loaded properly. Please refresh.';
        }
      }, 200);
    }, 300);
  }
  
  // Wait for all audio to be ready, then show the game
  const checkAudioReady = setInterval(() => {
    if (loadedAudio >= totalAudio) {
      clearInterval(checkAudioReady);
      
      // Update loading screen
      if (loadingBar) loadingBar.style.width = '90%';
      if (loadingText) loadingText.textContent = 'Setting up game...';
      
      // Short delay for final setup
      setTimeout(() => {
        startGameAfterLoading();
      }, 200);
    }
  }, 100);
  
  // Fallback: start game after 3 seconds even if audio not fully loaded
  setTimeout(() => {
    if (app && app.style.display !== 'block') {
      clearInterval(checkAudioReady);
      startGameAfterLoading();
    }
  }, 3000);

  function updateFooter() {
    if (totalScoreDisplay) totalScoreDisplay.textContent = Math.round(totalScore);
    if (correctCountDisplay) correctCountDisplay.textContent = correctCount;
    if (halfCorrectCountDisplay) halfCorrectCountDisplay.textContent = halfCorrectCount;
    if (incorrectCountDisplay) incorrectCountDisplay.textContent = incorrectCount;
    window.totalScore = totalScore;
    window.correctCount = correctCount;
    window.halfCorrectCount = halfCorrectCount;
    window.incorrectCount = incorrectCount;
  }

  function showExclamation() {
    if (!exclamation) return;
    
    exclamation.style.animation = 'none';
    exclamation.offsetHeight;
    
    exclamation.style.opacity = '0';
    exclamation.style.animation = 'popIn 0.4s forwards';
  }

  function animateSpeechBubble(bubble, text, callback, keepCatState = false) {
    if (!bubble || !charImg) return;
    
    bubble.innerHTML = '';
    const textSpan = document.createElement('span');
    textSpan.className = 'typing-effect';
    textSpan.textContent = text;
    bubble.appendChild(textSpan);
    
    bubble.style.display = 'block';
    bubble.classList.add('show');
    
    const isHappyCat = charImg.src.includes('cathappy.png');
    if (!keepCatState && !isHappyCat) {
      animateCatTalking(charImg);
    }
    
    const animationDuration = 600;
    setTimeout(() => {
      if (!keepCatState && !isHappyCat) {
        charImg.src = 'catstill.png';
      }
      
      if (callback && typeof callback === 'function') {
        callback();
      }
    }, animationDuration);
  }

  function typeText(element, text, cb) {
    // Create an immutable copy of the text to prevent any reference issues
    const textCopy = String(text);
    element.textContent = "";
    
    animateCatTyping(charImg, true);
    
    if (soundEnabled) {
      typeSound.currentTime = 0;
      typeSound.play().then(() => {
        typeSoundIsPlaying = true;
      }).catch(e => console.log("Couldn't play typing sound: ", e));
    }
    
    let i = 0;
    let t = setInterval(() => {
      if (i < textCopy.length) {
        // Build string character by character safely using substring
        element.textContent = textCopy.substring(0, i + 1);
        i++;
      } else {
        clearInterval(t);
        typeSoundIsPlaying = false;
        typeSound.pause();
        stopCatAnimation();
        charImg.src = 'catstill.png';
        cb();
      }
    }, 40);
  }

  function load(){
    attempts = 0;
    hintUsed = false;
    hintBtn.disabled = false;
    hintBtn.textContent = '🐾 Hint';
    speechBubble.style.display = thoughtBubble.style.display = 'none';
    continueBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    form.style.display = 'flex';
    input.disabled = true;
    submitBtn.disabled = true;
    input.value = "";
    if (exclamation) {
      exclamation.style.opacity = '0';
      exclamation.style.animation = 'none';
    }

    if(idx < questions.length && questions[idx]){
      const currentQuestion = questions[idx];
      
      // Validate question data
      if (!currentQuestion.firstSentence || !currentQuestion.keyword || !currentQuestion.secondSentence) {
        console.error('Invalid question data:', currentQuestion);
        firstSentence.textContent = 'Error loading question. Please restart.';
        return;
      }
      
      // Create immutable copies of strings to prevent reference issues
      const firstSentenceText = String(currentQuestion.firstSentence);
      const keywordText = String(currentQuestion.keyword);
      const secondSentenceText = String(currentQuestion.secondSentence);
      
      progress.textContent = `Question ${idx+1} of ${questions.length}`;
      progressFill.style.width = `${(idx/questions.length)*100}%`;
      
      // Hide keyword and second sentence initially
      keywordDisplay.style.display = 'none';
      secondSentence.textContent = '';
      
      // Display the first sentence with typing effect
      typeText(firstSentence, firstSentenceText, () => {
        // After first sentence, type the keyword
        keywordDisplay.style.display = 'inline-block';
        keywordDisplay.textContent = '';
        typeText(keywordDisplay, keywordText.toUpperCase(), () => {
          // After keyword, display the second sentence immediately (no typing)
          secondSentence.innerHTML = secondSentenceText.replace(/___+/g, 
            '<span class="blank-line"></span>');
          
          // Stop cat animation and show still cat
          stopCatAnimation();
          charImg.src = 'catstill.png';
          
          input.disabled = false;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.cursor = 'pointer';
          input.focus();
        });
      });
    } else {
      form.style.display = 'none';
      
      // Calculate maximum possible score (2 points per question)
      const maxScore = questions.length * 2;
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      firstSentence.innerHTML =
        `Game Over! 🎉<br><br>`+
        `📊 Final Score: ${Math.round(totalScore)} / ${maxScore}<br>`+
        `✅ Fully Correct: ${correctCount}<br>`+
        `🟡 Half Correct: ${halfCorrectCount}<br>`+
        `❌ Incorrect: ${incorrectCount}<br>`+
        `📈 Accuracy: ${percentage}%`;
      keywordDisplay.style.display = 'none';
      secondSentence.textContent = '';
      progress.textContent = `Final Score: ${Math.round(totalScore)} / ${maxScore}`;
      progressFill.style.width = '100%';
      restartBtn.style.display = 'inline-block';
      
      updateFooter();
      
      handleGameOver();
    }
  }

  function nextQuestion(){ idx++; load(); }

  continueBtn.onclick = () => { 
    continueBtn.style.display='none'; 
    nextQuestion(); 
  };
  
  restartBtn.onclick = () => {
    if (scoreCounter) scoreCounter.style.display = 'block';
    if (exclamation) {
      exclamation.style.opacity = '0';
      exclamation.style.animation = 'none';
    }
    
    speechBubble.style.display = 'none';
    speechBubble.classList.remove('show');
    speechBubble.textContent = '';
    
    thoughtBubble.style.display = 'none';
    thoughtBubble.classList.remove('show');
    thoughtBubble.textContent = '';
    
    incorrectSound.pause();
    incorrectSound.currentTime = 0;
    wrongSound.pause();
    wrongSound.currentTime = 0;
    correctSound.pause();
    correctSound.currentTime = 0;
    typeSound.pause();
    typeSound.currentTime = 0;
    
    stopCatAnimation();
    
    idx = 0;
    totalScore = 0;
    correctCount = 0;
    halfCorrectCount = 0;
    incorrectCount = 0;
    consecutiveCorrect = 0;
    attempts = 0;
    hintUsed = false;
    
    form.style.display = 'flex';
    input.disabled = true;
    submitBtn.disabled = true;
    input.value = '';
    
    continueBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    hintBtn.disabled = false;
    hintBtn.textContent = '🐾 Hint';
    
    window.totalScore = 0;
    window.correctCount = 0;
    window.halfCorrectCount = 0;
    window.incorrectCount = 0;
    
    if (totalScoreDisplay) totalScoreDisplay.textContent = '0';
    if (correctCountDisplay) correctCountDisplay.textContent = '0';
    if (halfCorrectCountDisplay) halfCorrectCountDisplay.textContent = '0';
    if (incorrectCountDisplay) incorrectCountDisplay.textContent = '0';
    
    // Reshuffle from the same pool of questions (allQuestions already contains only selected topics)
    questions = shuffle(allQuestions).slice(0, questionCount);
    
    charImg.src = 'catstill.png';
    load();
  };
  
  toggleBtn.onclick = () => {
    soundEnabled = !soundEnabled;
    toggleBtn.textContent = soundEnabled ? '🎵 Sound: On' : '🔇 Sound: Off';
  };
  
  hintBtn.onclick = () => {
    if (!hintUsed && !hintBtn.disabled) {
      animateSpeechBubble(speechBubble, questions[idx].hint);
      
      if (soundEnabled) playRandomCatSound();
      
      hintUsed = true;
      hintBtn.disabled = true;
      hintBtn.textContent = 'Hint Used 🐾';

      const paw = document.getElementById('pawTap');
      if (paw) {
        paw.style.animation = 'none';
        paw.offsetHeight;
        paw.style.animation = 'tapBounce 1s ease-out';
      }
    }
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    // Capitalize standalone "i" before processing
    let userInput = input.value.trim();
    userInput = userInput.replace(/\bi\b/g, 'I');
    const userAns = userInput.toLowerCase();
    
    // Validate word count (2-5 words)
    const wordCount = userAns.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 2 || wordCount > 5) {
      if (soundEnabled) {
        incorrectSound.currentTime = 0;
        incorrectSound.play();
      }
      
      charImg.src = 'catincorrect.png';
      
      let msg;
      if (wordCount < 2) {
        msg = "Too short! You need 2-5 words.";
      } else {
        msg = "Too long! You need 2-5 words.";
      }
      
      speechBubble.textContent = msg;
      speechBubble.style.display = 'block';
      speechBubble.classList.add('show');
      
      setTimeout(() => {
        charImg.src = 'catstill.png';
        speechBubble.style.display = 'none';
        speechBubble.classList.remove('show');
      }, 2000);
      
      return; // Don't process the answer
    }
    
    // Get the correct answer parts (can be string or array)
    const firstHalfOptions = Array.isArray(questions[idx].answerFirstHalf) 
      ? questions[idx].answerFirstHalf.map(a => a.trim().toLowerCase())
      : [questions[idx].answerFirstHalf.trim().toLowerCase()];
    
    const secondHalfOptions = Array.isArray(questions[idx].answerSecondHalf)
      ? questions[idx].answerSecondHalf.map(a => a.trim().toLowerCase())
      : [questions[idx].answerSecondHalf.trim().toLowerCase()];
    
    // For display purposes, use the first option
    const fullCorrectAnswer = `${firstHalfOptions[0]} ${secondHalfOptions[0]}`;
    
    // Check how many parts the user got correct
    let pointsEarned = 0;
    let isFullyCorrect = false;
    let userStartMatches = false;
    let userEndMatches = false;
    
    // Check if the full answer is correct (any combination)
    for (let firstHalf of firstHalfOptions) {
      for (let secondHalf of secondHalfOptions) {
        if (userAns === `${firstHalf} ${secondHalf}`) {
          pointsEarned = 2;
          isFullyCorrect = true;
          break;
        }
      }
      if (isFullyCorrect) break;
    }
    
    if (!isFullyCorrect) {
      // Check partial correctness
      const userWords = userAns.split(/\s+/);
      
      // Check if user answer starts with any first half option
      for (let firstHalf of firstHalfOptions) {
        const firstHalfWords = firstHalf.split(/\s+/);
        if (userWords.slice(0, firstHalfWords.length).join(' ') === firstHalf) {
          userStartMatches = true;
          pointsEarned += 1;
          break;
        }
      }
      
      // Check if user answer ends with any second half option
      for (let secondHalf of secondHalfOptions) {
        const secondHalfWords = secondHalf.split(/\s+/);
        if (userWords.slice(-secondHalfWords.length).join(' ') === secondHalf) {
          userEndMatches = true;
          pointsEarned += 1;
          break;
        }
      }
    }

    if (pointsEarned > 0) {
      
      if (isFullyCorrect) {
        // User got full credit - award points
        totalScore += pointsEarned;
        correctCount++;
        consecutiveCorrect++;
        
        // Always show green for fully correct answers
        const color = '#2ecc71';
        firstSentence.innerHTML = questions[idx].firstSentence;
        keywordDisplay.textContent = questions[idx].keyword.toUpperCase();
        secondSentence.innerHTML = questions[idx].secondSentence.replace(/___+/, 
          `<span style="color:${color}; font-weight:bold;">${userAns}</span>`);

        updateFooter();

        if (consecutiveCorrect === 3) {
          charImg.src = 'cathappy.png';
          const msg = "Three in a row! 🔥";
          animateSpeechBubble(speechBubble, msg, null, true);

          if (soundEnabled) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log("Couldn't play correct sound: ", e));
          }

          if (typeof confetti === 'function') {
            confetti({ 
              particleCount: 150, 
              spread: 70, 
              origin: { y: 0.6 },
              colors: ['#FF5722', '#FFA000', '#FFD600']
            });
            
            setTimeout(() => {
              confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#FF5722', '#FFA000', '#FFD600'] 
              });
            }, 800);

            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 50,
                origin: { y: 0.5 },
                colors: ['#FF5722', '#FFA000', '#FFD600'] 
              });
            }, 1600);
          }
        } else {
          charImg.src = 'cathappy.png';
          const msg = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
          animateSpeechBubble(speechBubble, msg + " 🎉", null, true);

          if (soundEnabled) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log("Couldn't play correct sound: ", e));
          }

          if (typeof confetti === 'function') {
            confetti({ 
              particleCount: 100,
              spread: 60,
              origin: { y: 0.6 }
            });
          }
        }
        
        input.disabled = submitBtn.disabled = true;
        setTimeout(nextQuestion, 2500);
      } else {
        // Partial credit - give them another chance on first attempt
        consecutiveCorrect = 0;
        
        if (attempts === 0) {
          // First attempt with partial credit - NO POINTS awarded yet, let them try again
          if (soundEnabled) {
            incorrectSound.currentTime = 0;
            incorrectSound.play();
          }
          
          charImg.src = 'catincorrect.png';
          
          const msg = `Only half correct! Try again for full credit!`;
          animateSpeechBubble(speechBubble, msg);
          
          // Show their answer in orange to indicate partial correctness
          firstSentence.innerHTML = questions[idx].firstSentence;
          keywordDisplay.textContent = questions[idx].keyword.toUpperCase();
          secondSentence.innerHTML = questions[idx].secondSentence.replace(/___+/, 
            `<span style="color:#FFA500; font-weight:bold;">${userAns}</span>`);
          
          // Keep input active for second attempt
          input.value = '';
          input.disabled = false;
          submitBtn.disabled = false;
          input.focus();
          attempts++; // Mark that they've had one attempt
        } else {
          // Second attempt with partial credit - NOW award the point(s)
          totalScore += pointsEarned;
          halfCorrectCount++;
          
          if (soundEnabled) {
            incorrectSound.currentTime = 0;
            incorrectSound.play();
          }
          
          charImg.src = 'catincorrect.png';
          
          const msg = `Half-correct! +${pointsEarned} point${pointsEarned > 1 ? 's' : ''}`;
          animateSpeechBubble(speechBubble, msg);
          
          updateFooter();
          
          // Show correct answer
          firstSentence.innerHTML = questions[idx].firstSentence;
          keywordDisplay.textContent = questions[idx].keyword.toUpperCase();
          secondSentence.innerHTML = questions[idx].secondSentence.replace(/___+/, 
            `<span style="color:#FFA500; font-weight:bold;">${fullCorrectAnswer}</span>`);

          thoughtBubble.innerHTML = `${questions[idx].explanation}<br><small style="color:#999; font-size:0.85em;">Full answer: ${fullCorrectAnswer}</small>`;
          thoughtBubble.style.display = 'block';
          thoughtBubble.classList.add('show');
          
          input.disabled = true;
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
          submitBtn.style.cursor = 'not-allowed';
          continueBtn.style.display = 'inline-block';
          hintBtn.disabled = true;
        }
      }
    } else {
      // No points earned
      attempts++;
      consecutiveCorrect = 0;
      
      if (attempts === 1) {
        if (soundEnabled) {
          incorrectSound.currentTime = 0;
          incorrectSound.play();
        }
        
        charImg.src = 'catincorrect.png';
        input.value = '';
        input.disabled = false;
        submitBtn.disabled = false;
        input.focus();
        speechBubble.textContent = "Oops, try again!";
        speechBubble.style.display = 'block';
        speechBubble.classList.add('show');
        thoughtBubble.style.display = 'none';
        thoughtBubble.classList.remove('show');
      } else {
        if (soundEnabled) {
          wrongSound.currentTime = 0;
          wrongSound.play();
        }
        
        charImg.src = 'catdefeat.png';
        incorrectCount++;
        updateFooter();

        input.disabled = submitBtn.disabled = true;
        
        firstSentence.innerHTML = questions[idx].firstSentence;
        keywordDisplay.textContent = questions[idx].keyword.toUpperCase();
        secondSentence.innerHTML = questions[idx].secondSentence.replace(/___+/, 
          `<span style="color:#FFA500; font-weight:bold;">${fullCorrectAnswer}</span>`);

        const questionId = questions[idx].id || 'N/A';
        thoughtBubble.innerHTML = `${questions[idx].explanation}<br><small style="color:#999; font-size:0.85em;">Question ID: ${questionId}</small>`;
        thoughtBubble.style.display = 'block';
        thoughtBubble.classList.add('show');
        
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        continueBtn.style.display = 'inline-block';
        hintBtn.disabled = true;
      }
    }
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
      e.preventDefault();
      if(!submitBtn.disabled) form.requestSubmit();
      else if(continueBtn.style.display !== 'none') continueBtn.click();
    }
    
    // Developer shortcut
    if(e.ctrlKey && e.shiftKey && e.key === 'A'){
      e.preventDefault();
      if(idx < questions.length){
        const questionId = questions[idx].id || 'N/A';
        const questionTopic = questions[idx].topic || 'N/A';
        const correctAnswer = `${questions[idx].answerFirstHalf} ${questions[idx].answerSecondHalf}`;
        
        console.log('=== DEVELOPER INFO ===');
        console.log('Question ID:', questionId);
        console.log('Topic:', questionTopic);
        console.log('Correct answer:', correctAnswer);
        console.log('First half:', questions[idx].answerFirstHalf);
        console.log('Second half:', questions[idx].answerSecondHalf);
        console.log('All data:', questions[idx]);
        
        thoughtBubble.innerHTML = `<strong>🔧 Developer Info:</strong><br>ID: ${questionId}<br>Topic: ${questionTopic}<br>Answer: ${correctAnswer}<br>First: ${questions[idx].answerFirstHalf}<br>Second: ${questions[idx].answerSecondHalf}`;
        thoughtBubble.style.display = 'block';
        thoughtBubble.classList.add('show');
        
        setTimeout(() => {
          thoughtBubble.style.display = 'none';
          thoughtBubble.classList.remove('show');
        }, 6000);
      }
    }
  });

  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('touchstart', () => btn.style.transform = 'scale(0.95)');
    btn.addEventListener('touchend', () => btn.style.transform = 'scale(1)');
  });

  // Cat blinking animation
  setInterval(() => {
    if(charImg.src.includes('catstill.png')){
      charImg.src = 'catblink.png';
      setTimeout(() => charImg.src = 'catstill.png', 200);
    }
  }, 5000);

  function playRandomCatSound() {
    const catSounds = ['catr2.wav', 'catr3.wav', 'catr4.wav', 'catr5.wav', 'catr6.wav', 'catmeow2.wav'];
    const randomSound = catSounds[Math.floor(Math.random() * catSounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.18;
    return audio.play();
  }

  charImg.addEventListener('click', () => {
    if(charImg.src.includes('catstill.png') || charImg.src.includes('catblink.png')) {
      animateCatTalking(charImg);

      if (soundEnabled) {
        playRandomCatSound()
          .then(() => {
            setTimeout(() => {
              if (!charImg.src.includes('cathappy.png') && 
                  !charImg.src.includes('type2.png') && 
                  !charImg.src.includes('type3.png') && 
                  !charImg.src.includes('type4.png') && 
                  !charImg.src.includes('catincorrect.png') && 
                  !charImg.src.includes('catdefeat.png')) {
                charImg.src = 'catstill.png';
              }
            }, 700);
          })
          .catch(error => {
            console.error('Error playing sound:', error);
            setTimeout(() => {
              if (!charImg.src.includes('cathappy.png') && 
                  !charImg.src.includes('type2.png') && 
                  !charImg.src.includes('type3.png') && 
                  !charImg.src.includes('type4.png') && 
                  !charImg.src.includes('catincorrect.png') && 
                  !charImg.src.includes('catdefeat.png')) {
                charImg.src = 'catstill.png';
              }
            }, 700);
          });
      } else {
        setTimeout(() => {
          if (!charImg.src.includes('cathappy.png') && 
              !charImg.src.includes('type2.png') && 
              !charImg.src.includes('type3.png') && 
              !charImg.src.includes('type4.png') && 
              !charImg.src.includes('catincorrect.png') && 
              !charImg.src.includes('catdefeat.png')) {
            charImg.src = 'catstill.png';
          }
        }, 700);
      }
    }
  });
  
  // load() is now called from the audio loading completion check above
}

function handleGameOver() {
  const totalScore = parseFloat(document.getElementById('totalScore').textContent);
  const maxScore = 20; // 10 questions × 2 points each
  
  if (totalScore > maxScore * 0.6) {
    const harpSound = new Audio('harp.wav');
    harpSound.volume = 0.9;
    harpSound.currentTime = 0;
    harpSound.play().catch(e => console.log("Couldn't play harp sound: ", e));
    
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
}
