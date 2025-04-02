document.addEventListener("DOMContentLoaded", function() {
    const scriptSelect = document.getElementById("script-select");
    const scriptDescription = document.getElementById("script-description");
    const scriptArg = document.getElementById("script-arg");
    const fileInput = document.getElementById("script-file");
    const outputContainer = document.getElementById("output-container");
    const runButton = document.getElementById("run-script");

    // ✅ Load scripts into dropdown
    function loadScripts() {
        fetch("/list_scripts")
            .then(response => response.json())
            .then(data => {
                console.log("DEBUG: Received scripts:", data); // Debugging
                
                const scriptSelect = document.getElementById("script-select");
                scriptSelect.innerHTML = "<option value=''>Select a script</option>";
    
                if (data.scripts && data.scripts.length > 0) {
                    data.scripts.forEach(script => {
                        const option = document.createElement("option");
                        option.value = script;
                        option.textContent = script;
                        scriptSelect.appendChild(option);
                    });
                } else {
                    console.error("No scripts found in the API response.");
                    scriptSelect.innerHTML = "<option value=''>No scripts found</option>";
                }
            })
            .catch(error => console.error("Error loading scripts:", error));
    }
    document.addEventListener("DOMContentLoaded", loadScripts);

    // ✅ Load script descriptions
    function updateScriptDescription() {
        fetch("/script_metadata")
            .then(response => response.json())
            .then(metadata => {
                const selectedScript = scriptSelect.value;
                scriptDescription.textContent = metadata[selectedScript] || "No description available.";
            })
            .catch(error => console.error("Error fetching script metadata:", error));
    }

    // ✅ Run script with argument & file
    function runSelectedScript() {
        const selectedScript = scriptSelect.value;
        const scriptArgValue = scriptArg.value.trim();
        const selectedFile = fileInput.files[0];

        if (!selectedScript) {
            alert("Please select a script.");
            return;
        }

        const formData = new FormData();
        formData.append("script_name", selectedScript);
        formData.append("script_arg", scriptArgValue);
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        outputContainer.innerHTML = `Running script: ${selectedScript}<br><br>`;

        fetch("/run_script", {
            method: "POST",
            body: formData
        }).catch(error => console.error("Error running script:", error));
    }

    // ✅ WebSocket for real-time script output
    const socket = io.connect(window.location.origin);
    socket.on("output", function(data) {
        outputContainer.innerHTML += data.data + "<br>";
        outputContainer.scrollTop = outputContainer.scrollHeight;
    });

    // Attach event listeners
    scriptSelect.addEventListener("change", updateScriptDescription);
    runButton.addEventListener("click", runSelectedScript);

    // Load scripts on page load
    loadScripts();
});
