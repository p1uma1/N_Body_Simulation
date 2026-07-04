const { execFile } = require('child_process');

// Path to your compiled C executable
const exePath = './cuda_v2';

console.log("we are inside js")

// Run the executable with arguments ['arg1', 'arg2']
execFile(exePath, [], (error, stdout, stderr) => {
    if (error) {
        console.error(`Execution failed: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`C Program Error: ${stderr}`);
        return;
    }
    
    // Output returned from your C program (printf)
    console.log(`C Program Output: ${stdout}`);
});