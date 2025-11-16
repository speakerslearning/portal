// Available tests database
const testsDatabase = {
    B1: [
        { code: 'PET001', file: 'PET001.html', status: 'Available' },
        { code: 'PET002', file: 'PET002.html', status: 'Available' },
        { code: 'PET003', file: 'PET003.html', status: 'Available' },
        { code: 'PET004', file: 'PET004.html', status: 'Available' },
        { code: 'PET005', file: 'PET005.html', status: 'Available' }
    ],
    B2: [
        { code: 'FCE001', file: 'FCE001.html', status: 'Available' },
        { code: 'FCE002', file: 'FCE002.html', status: 'Available' },
        { code: 'FCE003', file: 'FCE003.html', status: 'Available' },
        { code: 'FCE004', file: 'FCE004.html', status: 'Available' },
        { code: 'FCE005', file: 'FCE005.html', status: 'Available' }
    ],
    C1: [
        { code: 'CAE001', file: 'CAE001.html', status: 'Available' },
        { code: 'CAE002', file: 'CAE002.html', status: 'Available' },
        { code: 'CAE003', file: 'CAE003.html', status: 'Available' },
        { code: 'CAE004', file: 'CAE004.html', status: 'Available' },
        { code: 'CAE005', file: 'CAE005.html', status: 'Available' }
    ]
};

// Level names mapping
const levelNames = {
    B1: 'B1 Preliminary (PET)',
    B2: 'B2 First (FCE)',
    C1: 'C1 Advanced (CAE)'
};

// Current state
let currentLevel = null;
let selectedTest = null;

// Navigate to section from main menu
function navigateToSection(section) {
    // Update active tab
    updateActiveTab(section);
    
    // Hide all screens first
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('levelScreen').style.display = 'none';
    document.getElementById('testScreen').style.display = 'none';
    document.getElementById('gamesScreen').style.display = 'none';
    
    if (section === 'exams') {
        document.getElementById('levelScreen').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'games') {
        document.getElementById('gamesScreen').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'home') {
        document.getElementById('mainMenu').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Coming soon for other sections
        alert('This feature is coming soon!');
        document.getElementById('mainMenu').style.display = 'block';
    }
}

// Update active tab styling
function updateActiveTab(section) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    if (section === 'exams') {
        tabs[1].classList.add('active'); // Exams tab
    } else if (section === 'games') {
        tabs[2].classList.add('active'); // Games tab
    } else {
        tabs[0].classList.add('active'); // Home tab
    }
}

// Go back to main menu
function goBackToMain() {
    // Update active tab to Home
    updateActiveTab('home');
    
    document.getElementById('levelScreen').style.display = 'none';
    document.getElementById('gamesScreen').style.display = 'none';
    document.getElementById('testScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigate to a game
function navigateToGame(gameName) {
    const gameUrls = {
        'clozecat-mobile': 'clozecat-start-mobile.html',
        'clozecat-desktop': 'clozecat-start-computer.html',
        'transformercat': 'transformercat.html'
    };
    
    if (gameUrls[gameName]) {
        window.location.href = gameUrls[gameName];
    }
}

// Select a level
function selectLevel(level) {
    currentLevel = level;
    
    // Hide level screen, show test screen
    document.getElementById('levelScreen').style.display = 'none';
    document.getElementById('testScreen').style.display = 'block';
    
    // Update title and badge
    document.getElementById('selectedLevelTitle').textContent = levelNames[level];
    
    // Update level badge
    const badge = document.getElementById('testLevelBadge');
    badge.textContent = level;
    badge.className = 'test-level-badge ' + level.toLowerCase();
    
    // Load tests for this level
    loadTests(level);
}

// Load tests for selected level
function loadTests(level) {
    const testList = document.getElementById('testList');
    testList.innerHTML = '';
    
    const tests = testsDatabase[level];
    
    tests.forEach(test => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        
        if (test.status === 'Coming Soon') {
            testItem.style.opacity = '0.5';
            testItem.style.cursor = 'not-allowed';
        } else {
            testItem.onclick = () => selectTest(test);
        }
        
        testItem.innerHTML = `
            <div class="test-code">${test.code}</div>
            <div class="test-status">${test.status}</div>
        `;
        
        testList.appendChild(testItem);
    });
}

// Select a test
function selectTest(test) {
    if (test.status === 'Coming Soon') {
        return;
    }
    
    selectedTest = test;
    
    // Remove selection from all tests
    const testItems = document.querySelectorAll('.test-item');
    testItems.forEach(item => item.classList.remove('selected'));
    
    // Add selection to clicked test
    event.target.closest('.test-item').classList.add('selected');
    
    // Enable start button
    document.getElementById('startBtn').disabled = false;
}

// Start the selected test
function startTest() {
    if (selectedTest && selectedTest.file) {
        // Navigate to the test file
        window.location.href = selectedTest.file;
    }
}

// Go back to level selection
function goBack() {
    document.getElementById('testScreen').style.display = 'none';
    document.getElementById('levelScreen').style.display = 'block';
    
    currentLevel = null;
    selectedTest = null;
}

// Password protection
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const correctPassword = 'student25';
    
    if (passwordInput.value === correctPassword) {
        // Correct password - hide overlay and show content
        document.getElementById('passwordOverlay').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        // Store in session so they don't need to re-enter if they refresh
        sessionStorage.setItem('authenticated', 'true');
    } else {
        // Wrong password
        passwordError.textContent = 'Incorrect password. Please try again.';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Allow Enter key to submit password
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.getElementById('passwordOverlay').style.display !== 'none') {
        checkPassword();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated in this session
    if (sessionStorage.getItem('authenticated') === 'true') {
        document.getElementById('passwordOverlay').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    } else {
        // Show password overlay
        document.getElementById('passwordOverlay').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        // Focus on password input
        setTimeout(() => {
            document.getElementById('passwordInput').focus();
        }, 100);
    }
    
    // Only set up screens if authenticated
    if (sessionStorage.getItem('authenticated') === 'true') {
        // Check if coming back from a game
        if (window.location.hash === '#games') {
            document.getElementById('mainMenu').style.display = 'none';
            document.getElementById('levelScreen').style.display = 'none';
            document.getElementById('testScreen').style.display = 'none';
            document.getElementById('gamesScreen').style.display = 'block';
            // Clear the hash
            history.replaceState(null, null, ' ');
        } else {
            // Show main menu by default, hide all others
            document.getElementById('mainMenu').style.display = 'block';
            document.getElementById('levelScreen').style.display = 'none';
            document.getElementById('testScreen').style.display = 'none';
            document.getElementById('gamesScreen').style.display = 'none';
        }
    }
});

// Handle hash navigation (for returning from games)
window.addEventListener('load', function() {
    if (window.location.hash === '#games') {
        navigateToSection('games');
    }
});
