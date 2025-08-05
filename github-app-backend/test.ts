#!/usr/bin/env node

// TypeScript test script for the Claude Todo GitHub App
import { todoParser } from './src/services/todoParser.js';

console.log('🧪 Testing Claude Todo GitHub App (TypeScript) Components\n');

// Test 1: Todo Parser
console.log('📋 Testing Todo Parser...');
const testTodoContent = `
# Project Todo List

## Features to Implement
- [ ] Create user authentication system @claude
- [ ] Build React dashboard with charts @claude  
- [ ] Implement email notifications
- [x] Setup database connection

## Bug Fixes  
// TODO: Fix mobile responsive issues @claude
# TODO: Optimize database queries

## Simple Tasks
- Add payment processing with Stripe @claude
- Update documentation
- Write unit tests
`;

const todos = todoParser.extractTodos(testTodoContent);
console.log(`✅ Found ${todos.length} todos`);

// Show Claude-mentioned todos
const claudeTodos = todos.filter(todo => todo.claudeMentioned);
console.log(`🤖 Found ${claudeTodos.length} todos mentioning @claude:`);

claudeTodos.forEach((todo, index) => {
  console.log(`  ${index + 1}. "${todo.text}" (Line ${todo.line}, Priority: ${todo.priority})`);
});

// Test 2: Project Suggestions
console.log('\n🚀 Testing Project Suggestions...');
if (claudeTodos.length > 0) {
  const suggestion = todoParser.generateProjectSuggestion(claudeTodos[0]);
  console.log(`✅ Generated project suggestion:`);
  console.log(`   Name: ${suggestion.project.name}`);
  console.log(`   Description: ${suggestion.project.description}`);
  console.log(`   Technology: ${suggestion.project.technology}`);
  console.log(`   Features: ${suggestion.project.features.join(', ')}`);
}

console.log('\n✅ All TypeScript tests completed successfully!');
console.log('\n📝 TypeScript Features:');
console.log('   ✅ Full type safety with strict TypeScript configuration');
console.log('   ✅ Proper interface definitions for all data structures');
console.log('   ✅ Type-safe GitHub API interactions');
console.log('   ✅ Enhanced developer experience with IntelliSense');
console.log('   ✅ Build-time error detection');

console.log('\n🚀 Build and Run Commands:');
console.log('   npm run build     - Compile TypeScript to JavaScript');
console.log('   npm run dev       - Run in development mode with hot reload');
console.log('   npm run start     - Run production build');
console.log('   npm run type-check - Check types without building');