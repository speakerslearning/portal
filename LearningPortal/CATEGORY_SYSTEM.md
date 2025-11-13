# ClozeCat Category Filtering System

## Overview
The app now uses **JSON** instead of YAML for storing questions, providing better performance (no external library needed) and faster loading times.

## How Category Filtering Works

### 1. Question Storage (questions.json)
Each question has a `topic` field that categorizes it:

```json
{
  "sentence": "If I ___ rich, I would travel the world.",
  "answers": ["were", "was"],
  "hint": "Second conditional structure",
  "explanation": "if + past simple, would + infinitive",
  "topic": "conditionals"
}
```

### 2. Available Categories
The following categories are included with sample questions:
- **connectors** - Although, but, so, despite, etc.
- **prepositions** - in, at, for, of, etc.
- **conditionals** - If clauses (zero, first, second, third)
- **relative-pronouns** - who, which, that, where, whose, why
- **modal-verbs** - must, could, can, should, might
- **phrasal-verbs** - come up with, fill out, put off, give up
- **quantifiers** - much, many, some, little, few
- **passive-voice** - be + past participle structures
- **reported-speech** - He said..., She asked...
- **auxiliary-verbs** - have, do, would rather

### 3. How Users Select Categories

**Step 1:** On the start screen, users click the start button.

**Step 2:** Topic selection screen appears with:
- "All topics" checkbox (selects/deselects all)
- Individual topic checkboxes
- Sentence count input (1-100)

**Step 3:** Users select one or more topics and click "Start Game"

### 4. Filtering Logic

**In `index.html`:**
```javascript
// Topics are stored when user clicks "Start Game"
window.selectedTopics = ['connectors', 'prepositions', 'conditionals'];
window.sentenceCount = 20;
```

**In `script.js`:**
```javascript
// Filter questions that match ANY of the selected topics
filteredSentences = allSentences.filter(sentence => {
  if (!sentence.topic) return false;
  return window.selectedTopics.includes(sentence.topic);
});

// Shuffle and select the requested number of questions
sentences = shuffle(filteredSentences).slice(0, sentenceCount);
```

### 5. Example Scenarios

**Scenario A: User selects 3 categories**
- User selects: Connectors, Prepositions, Conditionals
- User sets: 20 sentences
- Result: App randomly selects 20 questions from those 3 categories

**Scenario B: User selects "All topics"**
- All 10 categories selected
- User sets: 50 sentences  
- Result: App randomly selects 50 questions from all available questions

**Scenario C: Not enough questions**
- User selects: Modal Verbs only (5 questions available)
- User sets: 20 sentences
- Result: App uses all 5 available modal verb questions

## Adding More Questions

To add questions to existing categories or create new ones:

### Option 1: Add to Existing Category
Edit `questions.json` and add new question objects:

```json
{
  "sentence": "She's responsible ___ the project.",
  "answers": ["for"],
  "hint": "What preposition goes with 'responsible'?",
  "explanation": "responsible + for + noun/gerund",
  "topic": "prepositions"
}
```

### Option 2: Create New Category
1. Add questions with a new topic value in `questions.json`:
```json
{
  "sentence": "I wish I ___ taller.",
  "answers": ["were", "was"],
  "hint": "Expressing unreal wishes",
  "explanation": "wish + past simple for present unreal situations",
  "topic": "wish-clauses"
}
```

2. Add the category to `index.html` topic list:
```html
<label style="display: block; margin: 4px; font-size: 14px;">
  <input type="checkbox" class="topicToggle" value="wish-clauses"> Wish Clauses
</label>
```

## Benefits of JSON System

✅ **No external library** - Saves 73KB (removed js-yaml)
✅ **Faster loading** - Native JSON.parse() is very fast
✅ **Better performance** - Less JavaScript to parse and execute
✅ **Standard format** - More common in web development
✅ **Easy to edit** - JSON is straightforward
✅ **Category filtering** - Smart topic-based question selection

## Technical Details

### Files Modified
- `index.html` - Removed YAML script, updated topic values to match JSON
- `script.js` - Changed from YAML to JSON parsing, improved filtering logic
- `questions.json` - NEW file with 50 sample questions across 10 categories

### Backward Compatibility
The old `data.yaml` file is no longer used but can be kept as a backup. The app now exclusively uses `questions.json`.

### Browser Compatibility
JSON parsing is supported in all modern browsers (IE9+, Chrome, Firefox, Safari, Edge).
