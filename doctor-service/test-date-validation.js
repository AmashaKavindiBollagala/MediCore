// Test date validation logic
const slot_date = '2026-04-26';

// Parse date components directly to avoid timezone issues
const [year, month, day] = slot_date.split('-').map(Number);
const selectedDate = new Date(year, month - 1, day); // month is 0-indexed
selectedDate.setHours(0, 0, 0, 0);

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

const endOfWeek = new Date(tomorrow);
endOfWeek.setDate(tomorrow.getDate() + 6);
endOfWeek.setHours(23, 59, 59, 999);

console.log('Selected Date:', selectedDate.toDateString());
console.log('Tomorrow:', tomorrow.toDateString());
console.log('End of Week:', endOfWeek.toDateString());
console.log('');
console.log('Selected < Tomorrow:', selectedDate < tomorrow);
console.log('Selected > EndOfWeek:', selectedDate > endOfWeek);
console.log('');
console.log('Is Valid:', selectedDate >= tomorrow && selectedDate <= endOfWeek);
