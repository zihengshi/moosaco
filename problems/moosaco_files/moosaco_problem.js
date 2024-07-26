const submitForm = document.getElementById('submit-form');
const lastStatus = document.getElementById('last-status');
const trialInformation = document.getElementById('trial-information');

async function runCode(code, input) {
    try {
        const response = await fetch('https://ggzk2rm2ad.execute-api.us-west-1.amazonaws.com/Prod/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                compilerOptions: '-std=c++17 -O2 -Wall -Wextra -Wshadow -Wconversion -Wfloat-equal -Wduplicated-cond -Wlogical-op',
                filename: 'main.cpp',
                input: input,
                language: 'cpp',
                sourceCode: code,
                timeout_ms: 1024
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        alert('Error:', error);
    }
}


async function runCode2(code, input) {
    try {
        const response = await fetch('https://v3nuswv3poqzw6giv37wmrt6su0krxvt.lambda-url.us-east-1.on.aws/compile-and-execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                compile: {
                    compilerOptions: '-std=c++17 -O2 -Wall -Wextra -Wshadow -Wconversion -Wfloat-equal -Wduplicated-cond -Wlogical-op',
                    language: 'cpp',
                    sourceCode: code
                }, execute: {
                    timeout_ms: 1024,
                    stdin: input,
                }
            })
        });
        const data = await response.json();
        let result = {
            stdout: "",
            status: "contact website owner",
            time: "0.00",
            memory: "0",
            stderr: ""
        };
        if (data.execute == null) {
            result.status = "compile_error";
        } else {
            result.memory = data.execute.memory_usage;
            result.time = data.execute.wall_time;
            result.stderr = data.stderr;
            if (data.execute.verdict != "accepted") {
                result.status = data.execute.verdict;
            } else {
                result.status = "success";
                result.stdout = data.execute.stdout;
            }
        }
        return result;
    } catch (error) {
        alert('Error:', error);
    }
}

async function fetchTestCase(testNumber) {
    const url = window.location.pathname;

    const inputUrl = `${url}tests/${testNumber}.in`;
    const outputUrl = `${url}tests/${testNumber}.out`;

    console.log(`inputurl: ${inputUrl}, outputurl: ${outputUrl}`);

    try {
        const inputResponse = await fetch(inputUrl);
        if (!inputResponse.ok) throw new Error(`No more test cases at ${inputUrl}`);
        const outputResponse = await fetch(outputUrl);
        if (!outputResponse.ok) throw new Error(`No expected output file at ${outputUrl}`);

        const input = await inputResponse.text();
        const expectedOutput = await outputResponse.text();

        return { input, expectedOutput };
    } catch (error) {
        return null;
    }
}

function addTestCase(title, status, num, mb, ms, symbol) {
    let outputHTML = `
<a href="#" title="${title}" class="masterTooltip">
    <div class="trial-result trial-status-${status}">
        <div class="res-symbol">${symbol}</div>
        <div class="trial-num">${num}</div>
        <div class="info">
            <span>${mb}mb</span>
            <span>${ms}ms</span>
        </div>
    </div>
</a>`;
    lastStatus.children[0].children[0].innerText = "Submitted; Results below show the outcome for each judge test case";
    trialInformation.innerHTML += outputHTML;
}

submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    trialInformation.innerHTML = '';
    const fileInput = submitForm.querySelector('input[name="sourcefile"]');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const code = e.target.result;

            let testNumber = 1;

            while (true) {
                const testCase = await fetchTestCase(testNumber);
                if (!testCase) {
                    console.log('No more test cases');
                    break;
                }

                const { input, expectedOutput } = testCase;
                const result = await runCode(code, input);

                let status = "no", title = "contact website owner or look at console", symbol = "error!";
                if (result.status == "success") {
                    if (Math.round(Number.parseFloat(result.time) * 1000) > 1024) {
                        title = "Time limit exceeded";
                        status = "no";
                        symbol = "t";
                    } else if (result.stdout.trim() === expectedOutput.trim()) {
                        title = "Correct answer";
                        status = "yes";
                        symbol = "*";
                    } else {
                        title = "Wrong answer";
                        status = "no";
                        symbol = "x";
                    }
                } else {
                    status = "no";
                    if (result.status == 'compile_error') {
                        title = "Compile error";
                        symbol = "ce";
                    } else if (result.status == "runtime_error") {
                        title = "Runtime error";
                        symbol = "!";
                    } else if (result.status = "time_limit_exceeded") {
                        title = "Time limit exceeded";
                        symbol = "t";
                    } else {
                        console.log("other issue!");
                    }
                }
                console.log(result);
                addTestCase(
                    title,
                    status,
                    testNumber,
                    (Number.parseInt(result.memory) / 1048576).toFixed(1),
                    Math.round(Number.parseFloat(result.time) * 1000),
                    symbol
                );
                
                testNumber++;
            }
        };
        reader.readAsText(file);
    } else {
        console.log('No file selected');
    }
});