$(document).documentready(function() {
    var currentQuestion = '';

    $('#getQAcountries').click(function() {
        $.ajax({
            url: '/get-random-qa',
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