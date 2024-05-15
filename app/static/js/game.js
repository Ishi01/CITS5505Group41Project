$(document).ready(function () {
    $('#addQuestion').click(function () {
        var newQuestion = $('.question_block:first').clone(true);
        newQuestion.find('input[type="text"], textarea').val('');
        newQuestion.find('.form-text.text-danger').hide();
        newQuestion.find('input, textarea').css('border', '');
        $('#questions_container').append(newQuestion);
        newQuestion.find('input[type="text"]:first').focus();
    });

    $('#questions_container').on('click', '.add-country', function() {
        var parent = $(this).closest('.question_block');
        var newInput = $('<input type="text" class="answer-countries" name="countries[]" list="countries" required>');
        parent.find('.country-inputs').append(newInput);
    });

    var availableCountries;
    $.getJSON('/get-countries', function(data) {
        availableCountries = data;
        var countriesList = $('#countries');
        countriesList.empty(); // Clear previous options if any
        availableCountries.forEach(function(country) {
            countriesList.append($('<option>').val(country));
        });
    });


    var debounceTimer;
    $('#game_name').on('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            var gameName = $('#game_name').val();
            $.post('/check_game_name', { game_name: gameName }, function (data) {
                var errorSpan = $('#game_name_error');
                if (data.is_unique === false) {
                    errorSpan.text('Game name already exists. Please choose a different name.');
                    $('#game_name').addClass('is-invalid');
                } else {
                    errorSpan.text('');
                    $('#game_name').removeClass('is-invalid');
                }
            });
        }, 300);
    });

    $('#quizForm').submit(function(event) {
        event.preventDefault();
        var allCountriesValid = true;
    
        var formData = {
            game_name: $('#game_name').val(),
            description: $('#description').val(),
            questions: []
        };
    
        $('.question_block').each(function() {
            var $block = $(this);
            var countries = [];
            $block.find('.answer-countries').each(function() {
                var country = $(this).val().trim();
                if (country) {
                    if (!availableCountries.includes(country)) {
                        allCountriesValid = false;
                        $(this).css('border', '2px solid red');
                    }
                    countries.push(country);
                }
            });
    
            if (allCountriesValid) {
                formData.questions.push({
                    question_text: $block.find('[name="question_text[]"]').val(),
                    location: $block.find('[name="location[]"]').val(),
                    countries: countries
                });
            }
        });
    
        if (!allCountriesValid) {
            $('#error_message').text('Please enter valid country names only.').show();
        } else {
            $('#error_message').hide();
            $.ajax({
                type: 'POST',
                url: '/submit_game',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                dataType: 'json'
            }).done(function(data) {
                if (data.status === 'success') {
                    $('#responseMessage').removeClass('error').addClass('success').text(data.message).show();
                } else {
                    $('#responseMessage').removeClass('success').addClass('error').text(data.message).show();
                }
            }).fail(function(xhr, status, error) {
                $('#responseMessage').removeClass('success').addClass('error').text('Error saving game: ' + error).show();
            });
        }
    });

});