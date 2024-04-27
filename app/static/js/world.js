$(document).ready(function() {
    var selectedPaths = []; // Array to store the currently selected paths
    var currentMode = 0; // Default mode

    // Function to reset SVG path styles to default
    function resetSVGStyles() {
        $('#svg-container svg path').css({
            'fill': '',
            'stroke': '',
            'stroke-width': ''
        });
        selectedPaths.forEach(function(path) {
            $(path).css({
                'fill': 'green',
                'stroke': '#225522',
                'stroke-width': '2'
            });
        });
    }

    // Highlight a path function for mouseover
    function highlightPath(path) {
        let highlightName = '#svg-container svg path.' + $(path).attr('class');
        if (!selectedPaths.includes(highlightName)) {
            $(path).css({
                'fill': 'palegreen',
                'stroke': '#225522',
                'stroke-width': '2'
            });
        }
    }

    // Apply selected style to a path
    function selectPath(path) {
        let pathClass = '#svg-container svg path.' + $(path).attr('class');
        if (currentMode === 0) {
            // Single selection mode
            selectedPaths = [pathClass]; // Reset and select new path
        } else if (currentMode === 1) {
            // Multiple selection mode
            if (selectedPaths.includes(pathClass)) {
                selectedPaths = selectedPaths.filter(p => p !== pathClass); // Toggle off
            } else {
                selectedPaths.push(pathClass); // Add to selections
            }
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

    // Function to highlight path based on the input value
    function highlightPathFromInput() {
        try {
            var inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
            var pathToHighlight = $('#svg-container svg path.' + inputVal);
    
            if (pathToHighlight.length) {
                if (currentMode === 1) {
                    // In Mode 1, add the path to the selection list if it's not already included
                    let pathClass = '#svg-container svg path.' + $(pathToHighlight[0]).attr('class');
                    if (!selectedPaths.includes(pathClass)) {
                        selectedPaths.push(pathClass);
                        resetSVGStyles(); // Refresh SVG styles to reflect the new selection
                    }
                } else {
                    // In Mode 0, select only the path that matches the input
                    selectPath(pathToHighlight[0]); // Highlight the first found path
                }
            }
        } catch (error) {
            //console.log('Error highlighting path:', error);
        }
    }

    // Attach event handler to the input box to handle changes
    $('#answerInput').on('input', function() {
        resetSVGStyles(); // Reset all highlights first
        highlightPathFromInput(); // Then apply new highlight
    });

    // Handler for click to set the input value based on path ID and keep the path highlighted
    $('#svg-container svg path').on('click', function() {
        selectPath(this);
        if (currentMode === 0) {
            var className = $(this).attr('class').replace(/_/g, ' ');
            $('#answerInput').val(className);
        }
    });

    $('#modeSwitchButton').on('click', function() {
        currentMode = (currentMode === 0 ? 1 : 0); // Toggle mode
        selectedPaths = []; // Clear selections on mode change
        resetSVGStyles();
        console.log('Mode switched to:', currentMode);
    });

    // Reset highlight when the answer input is modified or submitted
    $('#answerInput').on('input', function() {
        resetSVGStyles(); // Reset all highlights first
        highlightPathFromInput(); // Then apply new highlight based on the mode
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
