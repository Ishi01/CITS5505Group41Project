$(document).ready(function() {
    var selectedPaths = []; // Array to store the currently selected paths
    var currentMode = 0; // Default mode

    attachInputHandlers();

    function attachInputHandlers() {
        // Remove previous handlers to avoid duplicates
        $('#answerInput').off('input'); 
        $('#answerInput').off('keypress');
        $('#svg-container svg path').off('click');
        $('#svg-container svg path').off('dblclick');

        if (currentMode === 0) {
            $('#answerInput').on('input', function() {
                resetSVGStyles(); // Reset all highlights first
                highlightPathFromInput_Mode0(); // Then apply new highlight based on the mode
            });
            $('#svg-container svg path').on('dblclick', function() {
                $('#submitAnswerButton').trigger('click'); // Simulate a click on the submit button
            });
            $('#svg-container svg path').on('click', function() {
                selectPathMode0(this);
                resetSVGStyles(this);
            });
            $('#answerInput').on('keypress', function(event) {
                if (event.which == 13) { // 13 is the keycode for Enter
                    let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
                    let pathClass = $('#svg-container svg path.' + inputVal);
                    selectedPaths = [pathClass]; // Reset and select new path
                    resetSVGStyles(); // Then apply new highlight
                }
            });
        } 
        else if (currentMode === 1) {
            $('#answerInput').on('input', function() {
                resetSVGStyles(); // Reset all highlights first
                highlightPathFromInput_Mode1(); // Then apply new highlight based on the mode
            });
            $('#answerInput').on('keypress', function(event) {
                if (event.which == 13) { // 13 is the keycode for Enter
                    console.log('Current mode is 1');
                    let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
                    let pathClass = $('#svg-container svg path.' + inputVal);
                    if (!selectedPaths.includes(pathClass)) {
                        selectedPaths.push(pathClass);
                    }
                    resetSVGStyles(); // Then apply new highlight
                }
            });
            $('#svg-container svg path').on('click', function() {
                selectPathMode1(this);
                resetSVGStyles(this);
            });
        }
    }

    // Function to reset SVG path styles to default
    function resetSVGStyles(path) {
        $('#svg-container svg path').css({
            'fill': '',
            'stroke': '',
            'stroke-width': ''
        });

        selectedPaths.forEach(function(selectedPath) {
            $(selectedPath).css({
                'fill': 'green',
                'stroke': '#225522',
                'stroke-width': '2'
            });
        });

        highlightPath(path);
    }

    // Highlight a path function for mouseover
    function highlightPath(path) {
        let highlightName = '#svg-container svg path.' + $(path).attr('class');
        if (!selectedPaths.includes(highlightName)) {
            $(highlightName).css({
                'fill': 'palegreen',
                'stroke': '#225522',
                'stroke-width': '2'
            });
        }
    }

    // Apply selected style to a path
    function selectPathMode0(path) {
        let pathClass = '#svg-container svg path.' + $(path).attr('class');
        selectedPaths = [pathClass]; // Reset and select new path
        var className = $(path).attr('class'); // Get the class attribute of the clicked path
        if (className) {
            className = className.replace(/_/g, ' '); // Replace all underscores with spaces
            $('#answerInput').val(className); 
        }
        resetSVGStyles();
    }

    function selectPathMode1(path) {
        let pathClass = '#svg-container svg path.' + $(path).attr('class');
        // Multiple selection mode
        if (selectedPaths.includes(pathClass)) {
            selectedPaths = selectedPaths.filter(p => p !== pathClass); // Toggle off
        } else {
            selectedPaths.push(pathClass); // Add to selections
        }
        resetSVGStyles();
    }

    // Handler for mouseover to temporarily highlight SVG paths
    $('#svg-container svg path').on('mouseover', function() {
        highlightPath(this);
    });

    $('#svg-container svg path').on('mouseout', function() {
        resetSVGStyles();
    });

    function highlightPathFromInput_Mode0() {
        try {
            let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
            let pathToHighlight = $('#svg-container svg path.' + inputVal);
            if (pathToHighlight.length) {
                highlightPath(pathToHighlight); // Highlight the first found path
            }
        } catch (error) {
            //console.log('Error highlighting path:', error);
        }
    }

    function highlightPathFromInput_Mode1() {
        try {
            let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
            let pathToHighlight = $('#svg-container svg path.' + inputVal);
            if (pathToHighlight.length) {
                // In Mode 1, add the path to the selection list if it's not already included
                let pathClass = '#svg-container svg path.' + $(pathToHighlight[0]).attr('class');
                if (!selectedPaths.includes(pathClass)) {
                    selectedPaths.push(pathClass);
                    highlightPath(pathClass); // Refresh SVG styles to reflect the new selection
                }
            }
        } catch (error) {
            //console.log('Error highlighting path:', error);
        }
    }

    $('#modeSwitchButton').on('click', function() {
        currentMode = (currentMode === 0 ? 1 : 0); // Toggle mode
        selectedPaths = []; // Clear selections on mode change
        resetSVGStyles();
        attachInputHandlers(); // Re-attach input handlers based on new currentMode
        console.log('Mode switched to:', currentMode);
    });

    // Fetch and display a random question related to countries
    $('#getQAcountries').on('click', function() {
        $.ajax({
            url: '/get-random-qa#countries',
            type: 'GET',
            success: function(response) {
                $('#question').text(response.question); // Display the question
                $('#answerInput').val(''); // Clear previous answer
                $('#feedback').text(''); // Clear previous feedback
                resetSVGStyles();
                selectedPath = null; // Clear selected path
            },
            error: function(error) {
                console.log("Error fetching question:", error);
            }
        });
    });

    // Submit answer and handle response
    $('#submitAnswerButton').on('click', function() {
        var answerData = {
            answer: $('#answerInput').val(),
            question: $('#question').text() // Retrieve the current question text
        };

        $.ajax({
            url: '/check-answer',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(answerData),
            success: function(response) {
                $('#feedback').text(response.is_correct ? 'Correct!' : 'Incorrect. Try again!');
                resetSVGStyles();
                selectedPath = null; // Clear selected path on submission
            },
            error: function(error) {
                console.log("Error checking answer:", error);
            }
        });
    });

});
