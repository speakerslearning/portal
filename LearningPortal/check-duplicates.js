const fs = require('fs');

const data = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
const sentences = data.map(q => q.sentence);
const counts = {};

sentences.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
});

const duplicates = Object.entries(counts).filter(([s, c]) => c > 1);

if (duplicates.length > 0) {
    console.log('DUPLICATES FOUND:');
    duplicates.forEach(([s, c]) => {
        console.log(`${c}x: ${s}`);
    });
} else {
    console.log('No duplicate sentences found.');
}

console.log('\nTotal questions:', sentences.length);
