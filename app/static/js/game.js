$(document).ready(function () {
    // Add new question block
    $('#addQuestion').click(function () {
        var newQuestion = $('.question_block:first').clone(true);
        newQuestion.find('input[type="text"], textarea').val('');
        newQuestion.find('.form-text.text-danger').hide();
        newQuestion.find('input, textarea').css('border', '');
        $('#questions_container').append(newQuestion);
        newQuestion.find('input[type="text"]:first').focus();
    });

    // Add new data input (country/element)
    $('#questions_container').on('click', '.add-data', function() {
        var parent = $(this).closest('.question_block');
        var newInput = $('<input type="text" class="answer-data" name="data[]" list="dataList" required>');
        parent.find('.data-inputs').append(newInput);
        $('#responseMessage').removeClass('error').hide();
    });

    // Remove last data input
    $('#questions_container').on('click', '.remove-data', function() {
        var parent = $(this).closest('.question_block');
        var dataInputs = parent.find('.answer-data');
        if (dataInputs.length > 1) {
            dataInputs.last().remove();
            $('#responseMessage').removeClass('error').hide();
        }
    });

    // Remove current question block
    $('#questions_container').on('click', '.remove-question', function() {
        var parent = $(this).closest('.question_block');
        if ($('.question_block').length > 1) {
            parent.remove();
            $('#responseMessage').removeClass('error').hide();
        } else {
            let message = 'You must have at least one question.';
            $('#responseMessage').removeClass('success').addClass('error').text(message).show();
        }
    });

    // Get data for selected category
    var availableData;
    $('select[name="category"]').change(function() {
        var category = $(this).val();
        $.getJSON('/get-data/' + category, function(data) {
            availableData = data;  
            var dataList = $('#dataList');  
            dataList.empty();
            availableData.forEach(function(item) {
                dataList.append($('<option>').val(item));
            });
        });

        // Handle disabling of location selects and changing labels for 'elements'
        var locationSelects = $('.question_block').find('select[name="location[]"]');
        var locationLabels = $('.question_block').find('.location-label');
        var dataLabels = $('.question_block').find('.data-label');
        if (category === 'elements') {
            locationSelects.val(''); 
            locationSelects.attr('disabled', 'disabled');
            locationSelects.hide();
            locationLabels.hide();
            dataLabels.text('Answer Elements:');
        } else {
            locationSelects.removeAttr('disabled');
            locationSelects.show();
            locationLabels.show();
            dataLabels.text('Answer Countries:');
        }
    }).trigger('change'); 

    // Check if game name is unique
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

    // Submit game form
    $('#quizForm').submit(function(event) {
        event.preventDefault();
        var allDataValid = true;
    
        var formData = {
            category: $('#category').val(),
            game_name: $('#game_name').val(),
            description: $('#description').val(),
            questions: []
        };
    
        $('.question_block').each(function() {
            var $block = $(this);
            var dataItems = [];
            $block.find('.answer-data').each(function() {
                var dataItem = $(this).val().trim();
                if (dataItem) {
                    if (!availableData.includes(dataItem)) {
                        allDataValid = false;
                        $(this).css('border', '2px solid red');
                    }
                    dataItems.push(dataItem);
                }
            });
    
            if (allDataValid) {
                formData.questions.push({
                    question_text: $block.find('[name="question_text[]"]').val(),
                    location: $block.find('[name="location[]"]').val(),
                    data: dataItems
                });
            }
        });
    
        if (!allDataValid) {
            $('#error_message').text('Please enter valid data items only.').show();
        } else {
            $('#error_message').hide();
            console.log('Sending the following data package:', formData);  
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