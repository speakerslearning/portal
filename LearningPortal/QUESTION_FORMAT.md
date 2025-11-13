# Question Format Reference

## Standard Question Structure

```json
{
  "sentence": "The sentence with ___ blank.",
  "answers": ["correct", "answer"],
  "hint": "A helpful hint for the user",
  "explanation": "Grammar explanation shown after incorrect answer",
  "topic": "category-name"
}
```

## Field Descriptions

### sentence (required)
- The question text with a blank represented by `___` (three underscores)
- The blank can be at the beginning, middle, or end
- Examples:
  - `"If I ___ rich, I would travel."`
  - `"___ it was raining, we went out."`
  - `"I'm interested ___ learning Spanish."`

### answers (required)
- Array of acceptable answers (case variations)
- First answer is shown as the "correct" answer if user gets it wrong
- Can include multiple valid options
- Examples:
  - `["Although", "although"]` - accepts both cases
  - `["were", "was"]` - accepts either answer
  - `["that", "which"]` - multiple correct options

### hint (required)
- Short helpful hint shown when user clicks the Hint button
- Should guide without giving away the answer
- Keep it concise (1-2 sentences)
- Examples:
  - `"Shows contrast."`
  - `"Which preposition follows 'interested'?"`
  - `"Second conditional structure"`

### explanation (required)
- Grammar explanation shown after user gets answer wrong (2nd attempt)
- Should explain the grammar rule or pattern
- Can be more detailed than the hint
- Examples:
  - `"connector: although + clause"`
  - `"interested + in + gerund/noun"`
  - `"if + past simple, would + infinitive (hypothetical present)"`

### topic (required)
- Category identifier for filtering
- Must match exactly with topic checkbox values in HTML
- Use lowercase with hyphens for multi-word topics
- Current available topics:
  - `"connectors"`
  - `"prepositions"`
  - `"conditionals"`
  - `"relative-pronouns"`
  - `"modal-verbs"`
  - `"phrasal-verbs"`
  - `"quantifiers"`
  - `"passive-voice"`
  - `"reported-speech"`
  - `"auxiliary-verbs"`

## Complete Examples

### Example 1: Simple Fill-in-the-Blank
```json
{
  "sentence": "She's good ___ mathematics.",
  "answers": ["at"],
  "hint": "Which preposition goes with 'good'?",
  "explanation": "good/bad + at + noun/gerund",
  "topic": "prepositions"
}
```

### Example 2: Multiple Acceptable Answers
```json
{
  "sentence": "The book ___ I'm reading is fascinating.",
  "answers": ["that", "which"],
  "hint": "Relative pronoun for things",
  "explanation": "relative clause with that/which for objects",
  "topic": "relative-pronouns"
}
```

### Example 3: Case Variations
```json
{
  "sentence": "___ it was raining, we went hiking.",
  "answers": ["Although", "although"],
  "hint": "Shows contrast.",
  "explanation": "connector: although + clause",
  "topic": "connectors"
}
```

### Example 4: Phrasal Verb
```json
{
  "sentence": "Can you ___ up with a better solution?",
  "answers": ["come"],
  "hint": "To think of or produce something",
  "explanation": "come up with - to think of/produce an idea",
  "topic": "phrasal-verbs"
}
```

## Tips for Creating Questions

### ✅ DO:
- Use clear, natural English sentences
- Provide multiple answer variations when appropriate
- Make hints helpful but not too obvious
- Write explanations that teach the grammar rule
- Test questions to ensure they work correctly
- Group similar questions under the same topic

### ❌ DON'T:
- Use ambiguous sentences with multiple possible answers
- Make hints too obvious or too vague
- Include typos or grammatical errors
- Forget to include all case variations in answers array
- Use topics that don't exist in the HTML checkbox list

## JSON Formatting Rules

1. **Use double quotes** for all strings (not single quotes)
2. **No trailing commas** after the last item in arrays or objects
3. **Escape special characters** with backslash if needed
4. **Validate JSON** before saving (use https://jsonlint.com)

## Adding Questions to questions.json

Simply add your new question object to the array:

```json
[
  {
    "sentence": "existing question...",
    "answers": ["answer"],
    "hint": "hint",
    "explanation": "explanation",
    "topic": "topic"
  },
  {
    "sentence": "YOUR NEW QUESTION with ___ blank.",
    "answers": ["answer1", "answer2"],
    "hint": "Your helpful hint",
    "explanation": "Your grammar explanation",
    "topic": "your-topic"
  }
]
```

Remember: The array must start with `[` and end with `]`, and each question object must be separated by commas!
