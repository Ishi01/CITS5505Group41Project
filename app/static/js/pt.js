$(document).ready(function() {
    var lastClickedId = null;

    // Function to update highlight and log ID
    function highlightAndLog(element) {
        
        if($(element).attr('id') !== undefined) {
            // Clear previous highlights if any
        $('svg g path').css({
            'fill': '',         // Reset fill color
            'stroke': '',       // Reset stroke color
            'stroke-width': ''  // Reset stroke width
        });
            // Highlight the selected path
            $(element).css({
                'fill': 'yellow',         // Change fill color to yellow
                'stroke': '#FF0000',      // Change stroke color to red
                'stroke-width': '2'       // Increase stroke width
            });
        }
    }

    // Adding mouseover event to all SVG paths inside #svg-container
    $('#svg-container svg g path').on('mouseover', function(event) {
        // Prevent default action and event bubbling
        event.preventDefault();
        event.stopPropagation();
        highlightAndLog(event.target);
    });

    $('#svg-container svg g path').on('click', function(event) {
        // Prevent default action and event bubbling
        event.preventDefault();
        event.stopPropagation();
        $('#answerInput').val($(event.target).attr('id'));
    });

    $('#svg-container svg g path').on('dblclick', function(event) {
        event.preventDefault();
        event.stopPropagation();

        $('#submitAnswerButton').trigger('click'); // Trigger the submit button on double-click
    });

    $('#getQAelements').click(function() {
        $.ajax({
            url: '/get-random-qa#elements',
            type: 'GET',
            success: function(response) {
                $('#question').text(response.question);
                currentQuestion = response.question;
                $('#answerInput').val(''); // Clear previous answer
                $('#feedback').text(''); // Clear previous feedback
            },
            error: function(error) {
                console.log(error);
            }
        });
    });

    $('#submitAnswerButton').click(function() {
        var userAnswer = $('#answerInput').val();
        if (userAnswer) {
            $.ajax({
                url: '/check-answer',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ answer: userAnswer, question: currentQuestion }),
                success: function(response) {
                    if (response.is_correct) {
                        $('#feedback').text('Correct!');
                    } else {
                        $('#feedback').text('Incorrect. Try again!');
                    }
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
    });
    
});
