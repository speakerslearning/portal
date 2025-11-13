# Quick Start Guide - Category Filtering

## For Users

### How to Play with Specific Topics:

1. **Open the app** - Load `index.html` in your browser
2. **Click the start button** - The cat will animate and show topic selection
3. **Select your topics:**
   - Check individual boxes for specific topics
   - OR check "All topics" to select everything
4. **Choose question count:** Enter a number between 1-100
5. **Click "Start Game"** - The game begins with your selected topics!

### Example: "I want to practice prepositions and conditionals"
- ✅ Check "Prepositions"
- ✅ Check "Conditionals"  
- ❌ Leave others unchecked
- Set count to "20"
- Click "Start Game"
- **Result:** 20 random questions from only those 2 categories

---

## For Developers

### Quick Test:
```bash
# Just open the file in a browser
index.html
```

### Adding 1 Question (5 minute task):

**1. Open questions.json**

**2. Add your question at the end (before the closing `]`):**
```json
  ,
  {
    "sentence": "Your sentence with ___ blank.",
    "answers": ["answer"],
    "hint": "Your hint here",
    "explanation": "Grammar explanation here",
    "topic": "existing-topic-name"
  }
```

**3. Save and refresh browser** - Done!

### Adding a New Category (10 minute task):

**1. Add 5+ questions to questions.json with your new topic:**
```json
{
  "sentence": "Question 1 with ___.",
  "answers": ["answer1"],
  "hint": "Hint 1",
  "explanation": "Explanation 1",
  "topic": "new-topic"
}
```

**2. Add checkbox to index.html (find the `<div id="topicsList">` section):**
```html
<label style="display: block; margin: 4px; font-size: 14px;">
  <input type="checkbox" class="topicToggle" value="new-topic"> New Topic
</label>
```

**3. Save both files and refresh** - Your new category appears!

---

## Category Reference

| Category | Question Count | Examples |
|----------|----------------|----------|
| connectors | 5 | although, but, so, despite |
| prepositions | 5 | in, at, for, of, to |
| conditionals | 5 | if-clauses (0,1st,2nd,3rd) |
| relative-pronouns | 5 | who, which, that, where |
| modal-verbs | 5 | must, could, can, should |
| phrasal-verbs | 5 | give up, come up with |
| quantifiers | 5 | much, many, some, few |
| passive-voice | 5 | be + past participle |
| reported-speech | 5 | he said, she told |
| auxiliary-verbs | 5 | have, do, would |

**Total: 50 questions across 10 categories**

---

## Common Tasks

### Task: "I want more preposition questions"
```json
// Add to questions.json:
{
  "sentence": "She depends ___ her parents.",
  "answers": ["on"],
  "hint": "Which preposition goes with 'depends'?",
  "explanation": "depend + on + noun/pronoun",
  "topic": "prepositions"
}
```

### Task: "I want to disable a category"
```html
<!-- In index.html, add disabled attribute: -->
<label style="display: block; margin: 4px; font-size: 14px;">
  <input type="checkbox" class="topicToggle" value="modal-verbs" disabled> 
  Modal Verbs (Coming Soon)
</label>
```

### Task: "Check which topics a user selected"
```javascript
// Open browser console while playing:
console.log(window.selectedTopics);
// Output: ['connectors', 'prepositions', 'conditionals']
```

### Task: "See how many questions matched"
The app automatically logs this to console:
```
Found 15 sentences matching selected topics out of 50 total
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Submit answer / Continue to next |
| Tab | Navigate between input and buttons |

---

## File Structure

```
ClozeCat/
├── index.html              # Main app file
├── script.js               # Game logic
├── questions.json          # All questions ⭐
├── style.css               # Styling
├── CATEGORY_SYSTEM.md      # Full documentation
├── QUESTION_FORMAT.md      # Question guide
├── MIGRATION_SUMMARY.md    # Migration details
└── QUICK_START.md          # This file
```

---

## Need Help?

1. **Check console** - Press F12 in browser to see debug messages
2. **Validate JSON** - Use https://jsonlint.com if you get errors
3. **Read docs** - See CATEGORY_SYSTEM.md for details
4. **Test incrementally** - Add 1 question at a time and test

---

**Happy Learning! 🐱📚**
