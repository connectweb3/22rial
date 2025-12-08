
const lines = [
    "HEADER,Row",    // Line 1
    "1,Alice",       // Line 2 (User Row 1)
    "2,Bob",         // Line 3 (User Row 2)
    "3,Charlie",     // Line 4 (User Row 3)
    "4,David"        // Line 5 (User Row 4)
];

function runTest(testName, input, mode, ignoreHeader, expectedLines) {
    console.log(`--- Test: ${testName} ---`);
    console.log(`Input: "${input}", Mode: ${mode}, IgnoreHeader: ${ignoreHeader}`);

    const rowsToDelete = new Set();
    const parts = input.split(',').map(s => s.trim());
    const mapRow = (n) => ignoreHeader ? n + 1 : n;

    for (const part of parts) {
        if (!part) continue;
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) rowsToDelete.add(mapRow(i));
        } else {
            rowsToDelete.add(mapRow(Number(part)));
        }
    }

    let result;
    if (mode === 'keep') {
        result = lines.filter((_, index) => {
            const currentLineNum = index + 1;
            if (ignoreHeader && currentLineNum === 1) return true;
            return rowsToDelete.has(currentLineNum);
        });
    } else {
        result = lines.filter((_, index) => !rowsToDelete.has(index + 1));
    }

    const output = result.join('\n');
    const expected = expectedLines.join('\n');

    if (output === expected) {
        console.log("PASSED");
    } else {
        console.error("FAILED");
        console.log("Expected:\n" + expected);
        console.log("Got:\n" + output);
    }
    console.log("");
}

// Case 1: Delete Row 2 (Bob) with Ignore Header
// User Row 2 maps to File Line 3. Header (Line 1) kept.
runTest("Delete Row 2 (Bob)", "2", "delete", true, [
    "HEADER,Row",
    "1,Alice",
    // Bob deleted
    "3,Charlie",
    "4,David"
]);

// Case 2: Keep Row 2 (Bob) with Ignore Header
// User Row 2 maps to File Line 3. Header (Line 1) must be kept automatically.
runTest("Keep Row 2 (Bob)", "2", "keep", true, [
    "HEADER,Row",
    // Alice deleted
    "2,Bob",
    // Charlie deleted
    // David deleted
]);

// Case 3: Delete Row 1 (Alice) with Ignore Header
// User Row 1 maps to File Line 2.
runTest("Delete Row 1 (Alice)", "1", "delete", true, [
    "HEADER,Row",
    // Alice deleted
    "2,Bob",
    "3,Charlie",
    "4,David"
]);

// Case 4: Delete Row 1 (Header) WITHOUT Ignore Header
// User Row 1 maps to File Line 1.
runTest("Delete Row 1 (Header) - No Ignore", "1", "delete", false, [
    // Header deleted
    "1,Alice",
    "2,Bob",
    "3,Charlie",
    "4,David"
]);
