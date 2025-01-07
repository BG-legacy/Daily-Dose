import {
  analyzeMoodInput,
  generateMoodStrategies,
  analyzeMoodPatterns,
  getDailyMoodInspiration
} from '../src/utils/moodAnalysis.js';

// Helper function to format console output with colors and proper line wrapping
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m"
};

const formatOutput = (obj) => {
  try {
    const wrapText = (text, maxLength = 80) => {
      if (text.length <= maxLength) return text;
      
      // Find the last space before maxLength
      const breakPoint = text.lastIndexOf(' ', maxLength);
      if (breakPoint === -1) return text;
      
      return text.substring(0, breakPoint) + '\n' + 
             ' '.repeat(text.search(/\S/)) + // Maintain indentation
             wrapText(text.substring(breakPoint + 1), maxLength);
    };

    return JSON.stringify(obj, null, 2)
      .split('\n')
      .map(line => {
        // Color coding for different sections
        let coloredLine = line;
        if (line.includes('"quote"')) coloredLine = colors.green + line + colors.reset;
        if (line.includes('"mentalHealthTip"')) coloredLine = colors.blue + line + colors.reset;
        if (line.includes('"productivityHack"')) coloredLine = colors.yellow + line + colors.reset;
        
        // Wrap long lines while preserving indentation
        return wrapText(coloredLine);
      })
      .join('\n');
  } catch (error) {
    console.error(colors.red + 'Error formatting output:', error.message + colors.reset);
    return obj;
  }
};

const testMoodContent = async () => {
  console.log('\n' + colors.bright + '=== Testing Mood-Specific Content Generation ===' + colors.reset + '\n');

  // Test each mood type
  const moods = ['happy', 'sad', 'stressed'];

  for (const mood of moods) {
    console.log(`\n${colors.bright}=== Testing ${mood.toUpperCase()} mood ===${colors.reset}\n`);

    // Test 1: Basic Mood Analysis
    try {
      console.log(colors.blue + '1. Mood Analysis & Content:' + colors.reset);
      const moodData = {
        type: mood,
        context: `User is feeling ${mood} due to recent events at work`
      };

      const analysis = await analyzeMoodInput(moodData);
      console.log('\nGenerated Content:');
      console.log(formatOutput(analysis));
    } catch (error) {
      console.error(colors.red + `Error in ${mood} mood analysis: ${error.message}` + colors.reset);
    }

    // Test 2: Coping Strategies
    try {
      console.log('\n2. Mood-Specific Strategies:');
      const strategies = await generateMoodStrategies(
        mood,
        `User is ${mood} and looking for ways to manage this feeling`
      );
      console.log('\nStrategies:');
      console.log(formatOutput(strategies));
    } catch (error) {
      console.error(`Error in ${mood} strategies:`, error.message);
    }

    // Test 3: Daily Inspiration
    try {
      console.log('\n3. Daily Inspiration:');
      const inspiration = await getDailyMoodInspiration(mood);
      console.log('\nInspiration Package:');
      console.log(formatOutput(inspiration));
    } catch (error) {
      console.error(`Error in ${mood} inspiration:`, error.message);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  // Test 4: Pattern Analysis
  try {
    console.log('=== Testing Mood Pattern Analysis ===\n');
    const moodHistory = [
      {
        type: 'happy',
        timestamp: '2024-01-01T09:00:00Z',
        context: 'Completed a major project'
      },
      {
        type: 'stressed',
        timestamp: '2024-01-02T14:00:00Z',
        context: 'Deadline pressure'
      },
      {
        type: 'sad',
        timestamp: '2024-01-03T20:00:00Z',
        context: 'Missed family event due to work'
      }
    ];

    const patterns = await analyzeMoodPatterns(moodHistory);
    console.log('Pattern Analysis:');
    console.log(formatOutput(patterns));
  } catch (error) {
    console.error('Error in pattern analysis:', error.message);
  }

  console.log('\n' + colors.bright + '=== Mood Content Testing Complete ===' + colors.reset + '\n');
};

// Run the tests
testMoodContent(); 