$(document).ready(function() {
    // Function to reset SVG path styles to default
    function resetSVGStyles() {
        $('#svg-container svg path').css({
            'fill': '',
            'stroke': '',
            'stroke-width': ''
        });
    }

    // Handler for mouseover to highlight SVG paths by class
    $('#svg-container svg path').on('mouseover', function() {
        resetSVGStyles(); // Reset all paths to default styles
        console.log(this);
        var className = $(this).attr('class');
        if (className) {
            $('#svg-container svg path.' + className).css({
                'fill': 'yellow',
                'stroke': '#FF0000',
                'stroke-width': '2'     
            });
            
        }
        else{
            console.log('not idea');
        }
    });

    // Handler for click to set the input value based on path ID
    $('#svg-container svg path').on('click', function() {
        var className = $(this).attr('class'); // Get the class attribute of the clicked path
        if (className) {
            className = className.replace(/_/g, ' '); // Replace all underscores with spaces
            $('#answerInput').val(className); 
        }
    });

    // Handler for double-click to submit the answer
    $('#svg-container svg path').on('dblclick', function() {
        $('#submitAnswerButton').trigger('click'); // Simulate a click on the submit button
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
            },
            error: function(error) {
                console.log("Error checking answer:", error);
            }
        });
    });
});
