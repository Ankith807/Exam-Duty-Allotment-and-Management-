/**
 * Test file for cn utility function
 * This can be used to verify the cn function works correctly
 */

import { cn } from './cn';

// Test cases for the cn function
const testCases = [
  {
    input: ['class1', 'class2'],
    expected: 'class1 class2',
    description: 'Basic class combination'
  },
  {
    input: ['class1', null, 'class2'],
    expected: 'class1 class2',
    description: 'Filtering null values'
  },
  {
    input: ['class1', undefined, 'class2'],
    expected: 'class1 class2',
    description: 'Filtering undefined values'
  },
  {
    input: ['class1', false, 'class2'],
    expected: 'class1 class2',
    description: 'Filtering false values'
  },
  {
    input: ['class1', '', 'class2'],
    expected: 'class1 class2',
    description: 'Filtering empty strings'
  },
  {
    input: [' class1 ', ' class2 '],
    expected: 'class1   class2',
    description: 'Preserving internal spaces but trimming result'
  },
  {
    input: [],
    expected: '',
    description: 'Empty array'
  },
  {
    input: [''],
    expected: '',
    description: 'Array with empty string'
  }
];

// Function to run tests (for development/debugging)
export const runTests = () => {
  console.log('🧪 Testing cn utility function...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = cn(...testCase.input);
    const success = result === testCase.expected;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Expected: "${testCase.expected}"`);
      console.log(`   Got: "${result}"`);
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  }
  
  return { passed, failed };
};

// Example usage patterns
export const examples = {
  basic: () => cn('btn', 'btn-primary'),
  conditional: (isActive) => cn('btn', isActive && 'btn-active'),
  multiple: () => cn('flex', 'items-center', 'justify-center', 'p-4'),
  withTailwind: () => cn('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'px-4', 'py-2'),
};

// Uncomment the line below to run tests when this file is imported
// runTests();
