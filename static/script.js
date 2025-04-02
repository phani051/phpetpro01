document.addEventListener("DOMContentLoaded", function() {
    const socket = io.connect(window.location.protocol + "//" + window.location.host);
    const outputContainer = document.getElementById('output-container');
    const scriptSelect = document.getElementById('script-select');
    const scriptDescription = document.getElementById('script-description');

    let scriptsData = [];

    // Fetch available scripts and populate the dropdown
    fetch('/get_scripts')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched scripts:", data); // Debugging log
            scriptsData = data;
            scriptSelect.innerHTML = ''; // Clear existing options
            data.forEach(script => {
                let option = document.createElement("option");
                option.value = script.name;
                option.textContent = script.name;
                scriptSelect.appendChild(option);
            });
            updateScriptDescription();
        })
        .catch(error => {
            console.error("Error fetching scripts:", error);
        });

    // Function to update script description
    window.updateScriptDescription = function() {
        const selectedScript = scriptSelect.value;
        const scriptInfo = scriptsData.find(script => script.name === selectedScript);
        scriptDescription.innerText = scriptInfo ? scriptInfo.description : "No description available.";
    };

    // Function to run selected script
    window.runSelectedScript = function() {
        const selectedScript = scriptSelect.value;
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
