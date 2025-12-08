
const testCases = [
    { input: '1,Simple', expected: '1,"Simple"' },
    { input: '2,Complex, with, commas', expected: '2,"Complex, with, commas"' },
    { input: '3,"Already quoted"', expected: '3,"""Already quoted"""' },
    { input: '4,Text with "quotes"', expected: '4,"Text with ""quotes"""' },
    { input: '5,', expected: '5,""' }
];

function testLogic(line) {
    const firstCommaIndex = line.indexOf(',');
    if (firstCommaIndex === -1) return line;

    const firstPart = line.substring(0, firstCommaIndex);
    let secondPart = line.substring(firstCommaIndex + 1);

    secondPart = secondPart.replace(/"/g, '""');
    return `${firstPart},"${secondPart}"`;
}

console.log("Running Tests...");
let failed = 0;
testCases.forEach((test, index) => {
    const result = testLogic(test.input);
    if (result !== test.expected) {
        console.error(`Test ${index + 1} Failed!`);
        console.error(`Input:    ${test.input}`);
        console.error(`Expected: ${test.expected}`);
        console.error(`Got:      ${result}`);
        failed++;
    } else {
        console.log(`Test ${index + 1} Passed`);
    }
});

if (failed === 0) {
    console.log("All tests passed!");
} else {
    console.log(`${failed} tests failed.`);
}
