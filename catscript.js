document.addEventListener('DOMContentLoaded', () => {
  
  // Global variable to store the function that should run when gameReady fires
  window.handleGameReady = null;
  
  // SET UP GAMREADY LISTENER IMMEDIATELY (before anything else)
  // This ensures it's ready when the HTML dispatches the event
  document.addEventListener('gameReady', () => {
    console.log('🎮🎮🎮 GLOBAL gameReady event received at top level! 🎮🎮🎮');
    
    // VISUAL DEBUG: Show that we received the event
    const testDiv = document.createElement('div');
    testDiv.id = 'VISUAL_TEST_DIV';
    testDiv.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 999999 !important;
      background-color: red !important;
      color: white !important;
      font-size: 40px !important;
      font-weight: bold !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
    `;
    testDiv.innerHTML = 'CATSCRIPT: GAMREADY RECEIVED!<br>Top level listener works!';
    document.body.appendChild(testDiv);
    
    // Remove test div after 2 seconds
    setTimeout(() => {
      console.log('🕐 2 seconds passed, removing red screen and calling handler...');
      console.log('🔍 window.handleGameReady exists?', typeof window.handleGameReady);
      console.log('🔍 window.handleGameReady value:', window.handleGameReady);
      
      if (testDiv.parentNode) {
        testDiv.parentNode.removeChild(testDiv);
      }
      
      // Function to try calling handleGameReady with retries
      const tryCallHandler = (retries = 0, maxRetries = 100) => { // Increased to 100 retries = 10 seconds
        console.log(`🔄 Retry attempt ${retries + 1}/${maxRetries}...`);
        console.log(`   - handleGameReady exists?: ${typeof window.handleGameReady === 'function'}`);
        console.log(`   - gameIsInitialized?: ${window.gameIsInitialized}`);
        
        if (window.handleGameReady && typeof window.handleGameReady === 'function') {
          console.log(`✅ Calling handleGameReady function NOW (attempt ${retries + 1})...`);
          try {
            window.handleGameReady();
            console.log('✅ handleGameReady executed successfully');
          } catch (error) {
            console.error('❌ Error calling handleGameReady:', error);
          }
        } else if (retries < maxRetries) {
          setTimeout(() => tryCallHandler(retries + 1, maxRetries), 100);
        } else {
          console.error('❌ handleGameReady function not set up after ' + maxRetries + ' attempts (10 seconds)!');
          console.error('❌ Type:', typeof window.handleGameReady);
          console.error('❌ Value:', window.handleGameReady);
          
          // Show error on screen
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 999999 !important;
            background-color: orange !important;
            color: black !important;
            font-size: 30px !important;
            font-weight: bold !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
          `;
          errorDiv.innerHTML = 'ERROR: Game failed to initialize!<br>Please refresh the page';
          document.body.appendChild(errorDiv);
        }
      };
      
      // Start trying to call the handler
      tryCallHandler();
    }, 2000);
  });
  
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
        console.log('🎯 Auto-starting game (app already visible)');
        initializeGame(allSentences);
      }
      
      // Listen for the startGame event from index.html
      document.addEventListener('startGame', () => {
        console.log('🔔 ===== startGame EVENT RECEIVED IN CATSCRIPT.JS =====');
        console.log('🔔 Topics:', window.selectedTopics);
        console.log('🔔 Sentences loaded:', allSentences.length);
        console.log('🔔 About to call initializeGame()...');
        
        // Show visual indicator that event was received
        const greenDiv = document.createElement('div');
        greenDiv.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 999999 !important;
          background-color: #00ff00 !important;
          color: black !important;
          font-size: 40px !important;
          font-weight: bold !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        `;
        greenDiv.textContent = 'GREEN: startGame received!';
        document.body.appendChild(greenDiv);
        
        setTimeout(() => {
          greenDiv.remove();
          console.log('🎮 Now calling initializeGame()...');
          initializeGame(allSentences);
          console.log('✅ initializeGame() call completed');
        }, 2000);
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
  window.gameIsInitialized = true; // Set global flag
  console.log('🎮 initializeGame CALLED with', allSentences.length, 'sentences');
  console.log('✅ Set window.gameIsInitialized = true');
  
  // Get screen elements
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBar = document.getElementById('loadingBar');
  const loadingText = document.getElementById('loadingText');
  const startScreen = document.getElementById('startScreen');
  const topicSelection = document.getElementById('topicSelection');
  
  // Hide other screens (but NOT app if it's already visible - for mobile version)
  const appElement = document.getElementById('app');
  if (startScreen) startScreen.style.display = 'none';
  if (topicSelection) topicSelection.style.display = 'none';
  // Don't hide app element - it should already be visible from the mobile start button
  
  // Now show loading screen if it exists (desktop version)
  if (loadingScreen) {
    loadingScreen.style.display = 'block';
    loadingBar.style.width = '20%';
    loadingText.textContent = 'Loading audio files...';
  }
  
  // Filter sentences based on selected topics if available
  let filteredSentences = allSentences;
  
  if (window.selectedTopics && window.selectedTopics.length > 0) {
    console.log('Filtering sentences by topics:', window.selectedTopics);
    console.log('Total sentences available:', allSentences.length);
    
    // Filter sentences that match ANY of the selected topics (exact match, case-sensitive)
    filteredSentences = allSentences.filter(sentence => {
      if (!sentence.topic) {
        console.warn('Sentence missing topic field:', sentence);
        return false;
      }
      const matches = window.selectedTopics.includes(sentence.topic);
      return matches;
    });
    
    console.log(`Found ${filteredSentences.length} sentences matching selected topics out of ${allSentences.length} total`);
    console.log('Sample filtered sentences:', filteredSentences.slice(0, 3));
    
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
  typeSound.volume = 0.4;
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
  
  // Failsafe: Click on sentence container to force visibility
  if (sentDiv) {
    sentDiv.addEventListener('click', function forceVisibility() {
      console.log('🖱️ Sentence container clicked - forcing visibility');
      
      // Force container visible
      this.style.display = 'block';
      this.style.visibility = 'visible';
      this.style.opacity = '1';
      
      // If there are spans (letter-by-letter animation), make them all visible
      if (this.children.length > 0) {
        Array.from(this.children).forEach(child => {
          if (child.tagName === 'SPAN') {
            child.style.opacity = '1';
            child.style.visibility = 'visible';
            child.style.display = 'inline';
          }
        });
      }
      
      // Force repaint
      this.style.display = 'none';
      this.offsetHeight;
      this.style.display = 'block';
      
      console.log('✅ Sentence forced visible by click');
    });
  }
  
  // Function to complete loading and start game
  function startGameAfterLoading() {
    if (loadingBar) loadingBar.style.width = '100%';
    if (loadingText) loadingText.textContent = 'Ready!';
    
    // Brief pause to show 100% before starting countdown
    setTimeout(() => {
      if (loadingScreen) loadingScreen.style.display = 'none';
      
      // Show app - use classList for mobile compatibility
      if (app) {
        if (app.classList) {
          app.classList.add('visible');
        } else {
          app.style.display = 'block'; // Fallback for non-mobile
        }
      }
      if (scoreCounter) scoreCounter.style.display = 'block';
      updateFooter();
      
      // Force reflow to ensure layout is stable
      if (app) app.offsetHeight;
      
      // Don't load the first question yet - wait for the loading screen to finish
      // The loading screen will dispatch a 'gameReady' event when it's done
      window.gameReadyToStart = false;
      
      // Set up the handler function for when gameReady fires
      // This will be called by the top-level listener after showing the red screen
      window.handleGameReady = () => {
        window.gameReadyToStart = true;
        
        console.log('🎮 handleGameReady function called');
        console.log('📊 Sentences available:', sentences ? sentences.length : 'NONE');
        console.log('📝 First sentence:', sentences && sentences[0] ? sentences[0].sentence : 'NOT FOUND');
        
        const sentContainer = document.getElementById('sentenceContainer');
        console.log('📦 Sentence container element:', sentContainer ? 'FOUND' : 'NOT FOUND');
        
        // For FIRST question only: Show as plain text immediately (no animation)
        // This avoids all mobile rendering issues
        if (sentences && sentences.length > 0 && sentences[0]) {
          console.log('🚀 Showing first question as plain text (mobile safe)');
          
          // Set first sentence directly as plain text
          if (sentContainer) {
            // NUCLEAR OPTION: Fixed position in center of screen with max visibility
            sentContainer.style.cssText = `
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              z-index: 99999 !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              color: #000000 !important;
              background-color: #ffff00 !important;
              font-size: 24px !important;
              font-weight: bold !important;
              padding: 30px !important;
              border: 10px solid red !important;
              min-width: 300px !important;
              min-height: 150px !important;
              max-width: 90vw !important;
              text-align: center !important;
            `;
            sentContainer.textContent = ''; // Clear first
            sentContainer.innerHTML = 'TEST: ' + sentences[0].sentence;
            
            // Force multiple reflows
            sentContainer.offsetHeight;
            document.body.offsetHeight;
            
            // Log what was set
            console.log('✅ First sentence HTML set to:', sentContainer.innerHTML);
            console.log('📐 Container computed styles:', {
              position: window.getComputedStyle(sentContainer).position,
              display: window.getComputedStyle(sentContainer).display,
              visibility: window.getComputedStyle(sentContainer).visibility,
              opacity: window.getComputedStyle(sentContainer).opacity,
              zIndex: window.getComputedStyle(sentContainer).zIndex,
              top: window.getComputedStyle(sentContainer).top,
              left: window.getComputedStyle(sentContainer).left,
              color: window.getComputedStyle(sentContainer).color,
              backgroundColor: window.getComputedStyle(sentContainer).backgroundColor,
              width: sentContainer.offsetWidth,
              height: sentContainer.offsetHeight
            });
          } else {
            console.error('❌ Sentence container is null!');
          }
          
          // Set cat to still
          if (charImg) {
            charImg.src = 'catstill.png';
            console.log('🐱 Cat image set to catstill.png');
          }
          
          // Enable input immediately
          if (input) {
            input.disabled = false;
            console.log('⌨️ Input enabled');
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            console.log('✅ Submit button enabled');
          }
          if (input) input.focus();
          
          // Set progress
          if (progress) {
            progress.textContent = `Sentence 1 of ${sentences.length}`;
            console.log('📊 Progress text set');
          }
          if (progressFill) {
            progressFill.style.width = '0%';
          }
          
          console.log('✅✅✅ FIRST QUESTION SETUP COMPLETE ✅✅✅');
        } else {
          console.error('❌ Sentences array not properly initialized');
          console.error('Sentences:', sentences);
          if (sentContainer) {
            sentContainer.textContent = 'Error: Questions not loaded properly. Please refresh.';
            sentContainer.style.color = 'red';
          }
        }
      }; // End of handleGameReady function
      
      console.log('✅ handleGameReady function has been set up and is ready');
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
    // Check if app is not visible yet
    const isVisible = app && (app.classList.contains('visible') || app.style.display === 'block' || app.style.display === 'flex');
    if (!isVisible) {
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
    console.log('📝 Typing sentence:', text, 'Question index:', idx);
    
    const isFirstQuestion = (idx === 0);
    console.log('Is first question?', isFirstQuestion);
    
    // Clear and prepare container
    sentDiv.innerHTML = '';
    sentDiv.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
    
    // For ALL questions (including first): Create span for each letter
    const letters = text.split('');
    letters.forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.opacity = '0';
      span.style.transition = 'opacity 0.1s ease';
      // Mobile rendering fixes
      span.style.webkitTransform = 'translateZ(0)';
      span.style.transform = 'translateZ(0)';
      span.style.webkitBackfaceVisibility = 'hidden';
      span.style.backfaceVisibility = 'hidden';
      sentDiv.appendChild(span);
    });
    
    // Force layout calculation
    sentDiv.offsetHeight;
    
    // Start the typing animation and sound
    animateCatTyping(charImg, true);
    
    // Always play typing sound (not affected by sound toggle)
    typeSound.currentTime = 0;
    typeSound.play().then(() => {
      typeSoundIsPlaying = true;
    }).catch(e => console.log("Couldn't play typing sound: ", e));
    
    // Reveal letters one by one
    let index = 0;
    const revealInterval = setInterval(() => {
      if (index < letters.length) {
        if (sentDiv.children[index]) {
          const span = sentDiv.children[index];
          span.style.opacity = '1';
          // Force repaint on mobile browsers
          span.offsetHeight;
        }
        index++;
      } else {
        clearInterval(revealInterval);
        typeSoundIsPlaying = false;
        typeSound.pause();
        stopCatAnimation();
        charImg.src = 'catstill.png';
        
        // Failsafe: ensure ALL spans are visible
        Array.from(sentDiv.children).forEach(span => {
          span.style.opacity = '1';
          span.style.visibility = 'visible';
          span.style.display = 'inline';
        });
        
        console.log('✅ Sentence typing complete');
        cb();
      }
    }, 30);
    
    // Failsafe timeout - if animation fails, show everything after 3 seconds
    setTimeout(() => {
      if (sentDiv.children.length > 0) {
        Array.from(sentDiv.children).forEach(span => {
          span.style.opacity = '1';
          span.style.visibility = 'visible';
          span.style.display = 'inline';
        });
        // Force a complete repaint on mobile
        sentDiv.style.display = 'none';
        sentDiv.offsetHeight; // Trigger reflow
        sentDiv.style.display = 'block';
        console.log('⚠️ Failsafe triggered - forced all letters visible');
      }
    }, 3000);
  }

  function load(){
    attempts = 0;
    hintUsed = false;
    hintBtn.disabled = false;
    hintBtn.textContent = '💡';
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
    submitBtn.disabled = false; // Re-enable submit button for next question
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
        hintBtn.textContent = '💡';
        
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
    toggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  };
  
  hintBtn.onclick = () => {
    if (!hintUsed && !hintBtn.disabled) {
      // Use the new animation function instead of direct text assignment
      animateSpeechBubble(speechBubble, sentences[idx].hint);
      
      // Use playRandomCatSound instead of hintSound
      if (soundEnabled) playRandomCatSound();
      
      hintUsed = true;
      hintBtn.disabled = true;
      hintBtn.textContent = '💡';

      // Animate the lightbulb
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

            // Display explanation (question ID removed for production)
            thoughtBubble.innerHTML = `${sentences[idx].explanation}`;
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
    audio.volume = 0.7; // Increased from 0.18 to 0.7 for better audibility
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