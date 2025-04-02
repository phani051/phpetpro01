document.addEventListener("DOMContentLoaded", function() {
    const socket = io.connect(window.location.protocol + "//" + window.location.host);
    const outputContainer = document.getElementById('output-container');

    // Fetch available scripts and populate the dropdown
    fetch('/get_scripts')
        .then(response => response.json())
        .then(scripts => {
            const scriptSelect = document.getElementById('script-select');
            scripts.forEach(script => {
                let option = document.createElement("option");
                option.value = script;
                option.textContent = script;
                scriptSelect.appendChild(option);
            });
        });

    // Function to run selected script
    window.runSelectedScript = function() {
        const selectedScript = document.getElementById('script-select').value;
        const scriptArgs = document.getElementById('script-args').value;

        // Clear previous output
        outputContainer.innerHTML = `Running script: ${selectedScript} ${scriptArgs}\n\n`;

        socket.emit('run_script', { script_name: selectedScript, args: scriptArgs });
    };

    // Receive script output and display it
    socket.on('output', function(msg) {
        outputContainer.innerHTML += msg.data + "\n";
        outputContainer.scrollTop = outputContainer.scrollHeight; // Auto-scroll to bottom
    });
});
