document.addEventListener('DOMContentLoaded', () => {
  // Load JSON data from the questions.json file
  fetch('questions.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); // Get as text first
    })
    .then(text => {
      // Parse JSON manually to catch any parsing errors
      let allSentences;
      try {
        allSentences = JSON.parse(text);
      } catch (e) {
        throw new Error(`JSON parsing error: ${e.message}`);
      }
      
      // Validate the JSON structure
      if (!allSentences || !Array.isArray(allSentences)) {
        throw new Error('Invalid JSON structure - expected array');
      }
      
      console.log(`Loaded ${allSentences.length} total questions from JSON`);
      
      // Check if we're on the main game screen (not the topic selection screen)
      const app = document.getElementById('app');
      if (app && window.getComputedStyle(app).display === 'block') {
        initializeGame(allSentences);
      }
      
      // Listen for the startGame event from index.html
      document.addEventListener('startGame', () => {
        console.log('Start Game event received. Starting game with topics:', window.selectedTopics);
        initializeGame(allSentences);
      });
    })
    .catch(error => {
      console.error('Error loading JSON data:', error);
      const sentContainer = document.getElementById('sentenceContainer');
      if (sentContainer) {
        sentContainer.textContent = 'Error loading questions. Please refresh the page.';
      }
    });
});

function initializeGame(allSentences) {
  // Get screen elements
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBar = document.getElementById('loadingBar');
  const loadingText = document.getElementById('loadingText');
  const startScreen = document.getElementById('startScreen');
  const topicSelection = document.getElementById('topicSelection');
  
  // Hide all other screens FIRST (including app)
  const appElement = document.getElementById('app');
  if (startScreen) startScreen.style.display = 'none';
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
  
  // Filter sentences based on selected topics if available
  let filteredSentences = allSentences;
  
  if (window.selectedTopics && window.selectedTopics.length > 0) {
    console.log('Filtering sentences by topics:', window.selectedTopics);
    
    // Filter sentences that match ANY of the selected topics (exact match, case-sensitive)
    filteredSentences = allSentences.filter(sentence => {
      if (!sentence.topic) return false;
      return window.selectedTopics.includes(sentence.topic);
    });
    
    console.log(`Found ${filteredSentences.length} sentences matching selected topics out of ${allSentences.length} total`);
    
    // If no sentences match the selected topics, fall back to all sentences
    if (filteredSentences.length === 0) {
      console.warn('No sentences found for the selected topics. Using all sentences.');
      filteredSentences = allSentences;
      alert('No questions found for your selected topics. Loading all available questions instead.');
    }
  } else {
    console.log('No topics selected, using all sentences');
  }
  
  // Reset counters explicitly when starting a new game
  window.correctCount = 0;
  window.incorrectCount = 0;
  
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
    // If we're nearing the end of the audio file (within 0.2 seconds)
    if (this.currentTime > this.duration - 0.2 && typeSoundIsPlaying) {
      this.currentTime = 0; // Reset to the beginning
      this.play().catch(e => console.log("Couldn't restart typing sound: ", e));
    }
  });
  
  // Frame-based animation parameters and variables
  const typingFrames = ['type2.png', 'type3.png', 'type4.png']; // Removed type1.png from sequence
  let frameIndex = 0;
  let animationInterval;
  const frameDelay = 150; // milliseconds between frames (adjust for speed)
  
  // Chat animation variables and frames
  const chatFrames = ['chat1.png', 'chat2.png', 'chat3.png'];
  let chatFrameIndex = 0;
  let chatAnimationInterval;
  const chatFrameDelay = 150; // milliseconds between chat frames
  
  // Function to animate cat talking using individual frames
  function animateCatTalking(imgElement, duration = 800) {
    // Clear any existing animation
    if (chatAnimationInterval) {
      clearInterval(chatAnimationInterval);
      chatAnimationInterval = null;
    }
    
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    
    // Reset to first frame
    chatFrameIndex = 0;
    imgElement.src = chatFrames[chatFrameIndex];
    
    // Create animation interval that cycles through frames
    chatAnimationInterval = setInterval(() => {
      chatFrameIndex = (chatFrameIndex + 1) % chatFrames.length;
      imgElement.src = chatFrames[chatFrameIndex];
    }, chatFrameDelay);
    
    // If duration is provided, stop the animation after that time
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
  
  // Function to stop the chat animation
  function stopChatAnimation() {
    if (chatAnimationInterval) {
      clearInterval(chatAnimationInterval);
      chatAnimationInterval = null;
    }
  }
  
  // Function to animate cat using individual frames
  function animateCatTyping(imgElement, isPlaying = true) {
    // Clear any existing animation
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    
    // If not playing animation, just return
    if (!isPlaying) return;
    
    // Reset to first frame
    frameIndex = 0;
    imgElement.src = typingFrames[frameIndex];
    
    // Create animation interval that cycles through frames
    animationInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % typingFrames.length;
      imgElement.src = typingFrames[frameIndex];
    }, frameDelay);
    
    return animationInterval;
  }
  
  // Function to stop the frame animation
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
  
  // Get the user-selected sentence count or default to 20
  const sentenceCount = window.sentenceCount || 20;
  console.log(`Using ${sentenceCount} sentences for this game session.`);
  
  // Make sure the count is within bounds
  const finalCount = Math.min(Math.max(1, sentenceCount), 100);
  
  // Apply the user-defined sentence count
  let sentences = shuffle(filteredSentences).slice(0, finalCount);
  
  let idx = 0, correctCount = window.correctCount || 0, incorrectCount = window.incorrectCount || 0, attempts = 0;
  let consecutiveCorrect = 0; // Track consecutive correct answers
  
  // DOM elements
  const charImg = document.getElementById('charImg');
  const sentDiv = document.getElementById('sentenceContainer');
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
  const correctCountDisplay = document.getElementById('correctCount');
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
        if (sentences && sentences.length > 0 && sentences[0]) {
          load(); // Start the first question
        } else {
          console.error('Sentences array not properly initialized');
          const sentContainer = document.getElementById('sentenceContainer');
          if (sentContainer) {
            sentContainer.textContent = 'Error: Questions not loaded properly. Please refresh.';
          }
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

  // Function to update the footer display
  function updateFooter() {
    if (correctCountDisplay) correctCountDisplay.textContent = correctCount;
    if (incorrectCountDisplay) incorrectCountDisplay.textContent = incorrectCount;
    // Store the current count in window for persistence across game sessions
    window.correctCount = correctCount;
    window.incorrectCount = incorrectCount;
  }

  // Function to show exclamation mark with animation
  function showExclamation() {
    if (!exclamation) return;
    
    // Reset animation if it was already playing
    exclamation.style.animation = 'none';
    exclamation.offsetHeight; // Force reflow
    
    // Set and play the animation
    exclamation.style.opacity = '0';
    exclamation.style.animation = 'popIn 0.4s forwards'; // Faster animation for quick pop-in/out
  }

  // Update the animateSpeechBubble function to preserve cathappy.png state
  function animateSpeechBubble(bubble, text, callback, keepCatState = false) {
    if (!bubble || !charImg) return;
    
    // Clear previous content and create span for typing effect
    bubble.innerHTML = '';
    const textSpan = document.createElement('span');
    textSpan.className = 'typing-effect';
    textSpan.textContent = text;
    bubble.appendChild(textSpan);
    
    // Show the speech bubble
    bubble.style.display = 'block';
    bubble.classList.add('show');
    
    // Don't change cat to talking animation if:
    // 1. We're told to keep current state OR
    // 2. Cat is currently in happy state
    const isHappyCat = charImg.src.includes('cathappy.png');
    if (!keepCatState && !isHappyCat) {
      animateCatTalking(charImg);
    }
    
    // Set timeout for when animation completes (matching the CSS animation duration)
    const animationDuration = 600; // Faster typing animation (was 800ms)
    setTimeout(() => {
      // Return cat to previous state if not keeping current state AND not happy state
      if (!keepCatState && !isHappyCat) {
        charImg.src = 'catstill.png';
      }
      
      // Execute callback if provided
      if (callback && typeof callback === 'function') {
        callback();
      }
    }, animationDuration);
  }

  function typeSentence(text, cb) {
    sentDiv.textContent = "";
    
    // Start the frame-based typing animation
    animateCatTyping(charImg, true);
    
    if (soundEnabled) {
      typeSound.currentTime = 0; // Reset to beginning
      typeSound.play().then(() => {
        typeSoundIsPlaying = true; // Mark as playing after successful play
      }).catch(e => console.log("Couldn't play typing sound: ", e));
    }
    
    let i = 0, t = setInterval(() => {
      if (i < text.length) sentDiv.textContent += text[i++];
      else {
        clearInterval(t);
        typeSoundIsPlaying = false; // Stop the looping behavior
        typeSound.pause();
        // Stop the typing animation
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
    input.disabled = submitBtn.disabled = true;
    input.value = "";
    if (exclamation) {
      exclamation.style.opacity = '0';
      exclamation.style.animation = 'none';
    }

    if(idx < sentences.length){
      progress.textContent = `Sentence ${idx+1} of ${sentences.length}`;
      progressFill.style.width = `${(idx/sentences.length)*100}%`;
      typeSentence(sentences[idx].sentence, ()=>{
        input.disabled = submitBtn.disabled = false;
        input.focus();
      });
    } else {
      form.style.display = 'none';
      
      // Calculate final score - ensure missed count is accurate
      // The missed count should be total questions minus correct answers
      incorrectCount = sentences.length - correctCount;
      
      sentDiv.innerHTML =
        `Game Over! 🎉<br><br>`+
        `✅ Correct: ${correctCount}<br>`+
        `❌ Missed: ${incorrectCount}<br>`+
        `📊 Accuracy: ${Math.round((correctCount/sentences.length)*100)}%`;
      progress.textContent = `Final Score: ${correctCount} / ${sentences.length}`;
      progressFill.style.width = '100%';
      restartBtn.style.display = 'inline-block';
      
      // Update footer one last time at game end
      updateFooter();
      
      // End-game animations based on score
      handleGameOver();
    }
  }

  function nextQuestion(){ idx++; load(); }

  // Event listeners
  continueBtn.onclick = () => { 
    continueBtn.style.display='none'; 
    nextQuestion(); 
  };
  
  restartBtn.onclick = () => {
    // Instead of just clearing variables, completely reinitialize the game
    // This ensures a fresh start similar to the first playthrough
    
    // First, reload the JSON data to ensure we start fresh
    fetch('questions.json')
      .then(response => response.json())
      .then(freshSentences => {
        
        // Reset DOM elements to initial state
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
        
        // Reset audio objects
        incorrectSound.pause();
        incorrectSound.currentTime = 0;
        wrongSound.pause();
        wrongSound.currentTime = 0;
        correctSound.pause();
        correctSound.currentTime = 0;
        typeSound.pause();
        typeSound.currentTime = 0;
        
        // Stop any running animation
        stopCatAnimation();
        
        // Reset game state
        idx = 0;
        correctCount = 0;
        incorrectCount = 0;
        consecutiveCorrect = 0;
        attempts = 0;
        hintUsed = false;
        
        // Reset the form
        form.style.display = 'flex';
        input.disabled = true;
        submitBtn.disabled = true;
        input.value = '';
        
        // Reset buttons
        continueBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        hintBtn.disabled = false;
        hintBtn.textContent = '🐾 Hint';
        
        // Reset global counters
        window.correctCount = 0;
        window.incorrectCount = 0;
        
        // Reset the score display in DOM
        if (correctCountDisplay) correctCountDisplay.textContent = '0';
        if (incorrectCountDisplay) incorrectCountDisplay.textContent = '0';
        
        // User chose to replay, so keep the same selected topics
        // and keep the same sentence count that was used before
        const currentSentenceCount = window.sentenceCount || 20;
        sentences = shuffle(filteredSentences).slice(0, currentSentenceCount);
        
        // Start the game at the beginning
        charImg.src = 'catstill.png';
        load();
      })
      .catch(error => {
        console.error('Error reloading data for restart:', error);
        // If there's an error, fall back to the topic selection screen
        const app = document.getElementById('app');
        const topicSelection = document.getElementById('topicSelection');
        
        if (app && topicSelection) {
          app.style.display = 'none';
          topicSelection.style.display = 'block';
        }
      });
  };
  
  toggleBtn.onclick = () => {
    soundEnabled = !soundEnabled;
    toggleBtn.textContent = soundEnabled ? '🎵 Sound: On' : '🔇 Sound: Off';
  };
  
  hintBtn.onclick = () => {
    if (!hintUsed && !hintBtn.disabled) {
      // Use the new animation function instead of direct text assignment
      animateSpeechBubble(speechBubble, sentences[idx].hint);
      
      // Use playRandomCatSound instead of hintSound
      if (soundEnabled) playRandomCatSound();
      
      hintUsed = true;
      hintBtn.disabled = true;
      hintBtn.textContent = 'Hint Used 🐾';

      // Animate the paw tap
      const paw = document.getElementById('pawTap');
      if (paw) {
        paw.style.animation = 'none';
        paw.offsetHeight; // triggers reflow to restart animation
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
    const correctList = sentences[idx].answers.map(a => a.trim().toLowerCase()).filter(a => a);
    const isCorrect = correctList.includes(userAns);

    if (isCorrect) {
        // Always show green for correct answers
        const color = '#2ecc71';
        let displayedAnswer = userAns;
        if (sentences[idx].sentence.trim().startsWith("___")) {
            displayedAnswer = userAns.charAt(0).toUpperCase() + userAns.slice(1);
        }
        sentDiv.innerHTML = sentences[idx].sentence.replace("___", `<span style="color:${color}; font-weight:bold;">${displayedAnswer}</span>`);

        correctCount++;
        consecutiveCorrect++; // Increment consecutive correct counter
        updateFooter(); // Update the footer display

        // Check if user got three in a row
        if (consecutiveCorrect === 3) {
            // Change cat image first, before showing message
            charImg.src = 'cathappy.png';
            
            const msg = "Three in a row! 🔥";
            animateSpeechBubble(speechBubble, msg, null, true);

            if (soundEnabled) {
                correctSound.currentTime = 0; // Reset sound to the beginning
                correctSound.play().catch(e => console.log("Couldn't play correct sound: ", e));
            }

            if (typeof confetti === 'function') {
                // Trigger three bursts of confetti
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
            // Change cat image first, before showing message
            charImg.src = 'cathappy.png';
            
            const msg = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
            animateSpeechBubble(speechBubble, msg + " 🎉", null, true);

            if (soundEnabled) {
                correctSound.currentTime = 0; // Reset sound to the beginning
                correctSound.play().catch(e => console.log("Couldn't play correct sound: ", e));
            }

            if (typeof confetti === 'function') {
                // Trigger a single burst of confetti
                confetti({ 
                    particleCount: 100,
                    spread: 60,
                    origin: { y: 0.6 }
                });
            }
        }
        
        input.disabled = submitBtn.disabled = true;
        
        // Reduce celebration time from 3s to 2.5s for faster game flow
        setTimeout(nextQuestion, 2500);
    } else {
        attempts++;
        consecutiveCorrect = 0; // Reset consecutive correct counter on wrong answer
        
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
            
            let correctWord = sentences[idx].answers[0];
            if (sentences[idx].sentence.trim().startsWith("___")) {
                correctWord = correctWord.charAt(0).toUpperCase() + correctWord.slice(1);
            }
            sentDiv.innerHTML = sentences[idx].sentence.replace("___", `<span style="color:#FFA500; font-weight:bold;">${correctWord}</span>`);

            // Display explanation with question ID
            const questionId = sentences[idx].id || 'N/A';
            thoughtBubble.innerHTML = `${sentences[idx].explanation}<br><small style="color:#999; font-size:0.85em;">Question ID: ${questionId}</small>`;
            thoughtBubble.style.display = 'block';
            thoughtBubble.classList.add('show');
            
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
    
    // Secret developer shortcut: Ctrl+Shift+A to reveal answer
    if(e.ctrlKey && e.shiftKey && e.key === 'A'){
      e.preventDefault();
      if(idx < sentences.length){
        const questionId = sentences[idx].id || 'N/A';
        const correctAnswers = sentences[idx].answers.join(' / ');
        const topic = sentences[idx].topic || 'N/A';
        
        console.log('=== DEVELOPER INFO ===');
        console.log('Question ID:', questionId);
        console.log('Topic:', topic);
        console.log('Correct answer(s):', correctAnswers);
        console.log('All data:', sentences[idx]);
        
        // Show info in thought bubble for quick reference
        thoughtBubble.innerHTML = `<strong>🔧 Developer Info:</strong><br>ID: ${questionId}<br>Topic: ${topic}<br>Answer: ${correctAnswers}`;
        thoughtBubble.style.display = 'block';
        thoughtBubble.classList.add('show');
        
        // Hide after 6 seconds
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

  // Function to play a random cat sound
  function playRandomCatSound() {
    // Use only the catr*.wav and catmeow2.wav files, removed meow.mp3
    const catSounds = ['catr2.wav', 'catr3.wav', 'catr4.wav', 'catr5.wav', 'catr6.wav', 'catmeow2.wav'];
    const randomSound = catSounds[Math.floor(Math.random() * catSounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.18; // Increased by 20% from 0.15 to 0.18
    return audio.play();
  }

  // Add click event listener to the cat image for meow and animation only (no hint)
  charImg.addEventListener('click', () => {
    // Only respond if the cat is in waiting state to avoid interrupting other animations
    if(charImg.src.includes('catstill.png') || charImg.src.includes('catblink.png')) {
      // Change the cat image to speaking animation
      animateCatTalking(charImg);

      // Play a random cat sound if sound is enabled
      if (soundEnabled) {
        // Use the existing playRandomCatSound function to play a random cat sound
        playRandomCatSound()
          .then(() => {
            // After the sound finishes (or a short delay), revert to waiting image
            setTimeout(() => {
              if (!charImg.src.includes('cathappy.png') && 
                  !charImg.src.includes('type2.png') && 
                  !charImg.src.includes('type3.png') && 
                  !charImg.src.includes('type4.png') && 
                  !charImg.src.includes('catincorrect.png') && 
                  !charImg.src.includes('catdefeat.png')) {
                charImg.src = 'catstill.png';
              }
            }, 700); // Match to sound duration
          })
          .catch(error => {
            console.error('Error playing sound:', error);
            // Still revert animation after a delay if sound fails
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
        // If sound is disabled, just animate for a moment
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
  // Get final scores
  const correctCount = parseInt(document.getElementById('correctCount').textContent);
  const incorrectCount = parseInt(document.getElementById('incorrectCount').textContent);
  
  // Play harp sound if player has more correct than incorrect answers
  if (correctCount > incorrectCount) {
    harpSound.currentTime = 0;
    harpSound.play().catch(e => console.log("Couldn't play harp sound: ", e));
    
    // You could also add some visual celebration here
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  
  // Rest of your game over handling code...
}