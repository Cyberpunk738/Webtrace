import { runEngineTests } from './engine.test';

const { passed, report } = runEngineTests();

console.log('\n--- WebTrace Analysis Engine Test Suite ---');
report.forEach((line) => console.log(line));
console.log('-------------------------------------------');

if (passed) {
  console.log('ALL TESTS PASSED SUCCESSFULLY.\n');
  process.exit(0);
} else {
  console.error('ENGINE TESTS FAILED.\n');
  process.exit(1);
}
