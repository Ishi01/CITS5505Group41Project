$(document).ready(function () {
    
    $('#jsonInput').change(function(e) {
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
            var content = e.target.result;
            try {
                var jsonData = JSON.parse(content);
                initializeFormWithJson(jsonData);
            } catch (error) {
                console.error("Error parsing JSON!", error);
                $('#responseMessage').addClass('error').text('Invalid JSON file.').show();
            }
        };
        fileReader.readAsText(e.target.files[0]);
    });

    // Function to clone a question block
    function cloneQuestionBlock() {
        var templateBlock = $('.question_block:first').clone(true);
        templateBlock.find('input[type="text"], textarea').val('');
        templateBlock.find('.form-text.text-danger').hide();
        templateBlock.find('input, textarea').css('border', '');
        $('#questions_container').append(templateBlock);
        templateBlock.show(); // Ensure it is visible
        templateBlock.find('input[type="text"]:first').focus();
        return templateBlock;
    }

    // Function to reset and prepare the first question block as a template
    function prepareTemplateBlock() {
        var firstBlock = $('.question_block:first');
        firstBlock.find('input[type="text"], textarea').val('');
        firstBlock.find('.form-text.text-danger').hide();
        firstBlock.find('input, textarea').css('border', '');
        firstBlock.find('.answer-data').remove(); // Remove previous answer data inputs if any
        firstBlock.show(); // Ensure it is visible
    }

    function initializeFormWithJson(jsonData) {
        $('#category').val(jsonData.category).change();
        $('#game_name').val(jsonData.game_name);
        $('#description').val(jsonData.description);
    
        $('.question_block:not(:first)').remove(); // Remove all but the first block
        prepareTemplateBlock();
    
        setTimeout(() => {
            jsonData.questions.forEach(function(question, index) {
                var newQuestion = (index === 0) ? $('.question_block:first') : cloneQuestionBlock();
                newQuestion.find('[name="question_text[]"]').val(question.question_text);
                newQuestion.find('[name="location[]"]').val(question.location);
    
                var dataInputs = newQuestion.find('.data-inputs');
                dataInputs.empty(); // Clear previous inputs
    
                // Create a label if not present and append before inputs
                var label = $('<label>').addClass('data-label').text('Answer Countries: ');
                dataInputs.append(label);
    
                // Add new inputs for each data item
                question.data.forEach(function(dataItem) {
                    var newDataInput = $('<input type="text" class="answer-data" name="data[]" list="dataList" required>');
                    newDataInput.val(dataItem);
                    dataInputs.append(newDataInput);
                });
    
                newQuestion.show(); // Make sure the new question block is visible
            });
        }, 500);
    }

    // Export form data to JSON
    $('#exportToJson').click(function() {
        var formData = collectFormData();
        var jsonStr = JSON.stringify(formData, null, 2);
        downloadJson(jsonStr, formData.game_name + "_data.json");
    });

    function collectFormData() {
        var formData = {
            category: $('#category').val(),
            game_name: $('#game_name').val(),
            description: $('#description').val(),
            questions: []
        };
        
        $('.question_block').each(function() {
            var $block = $(this);
            var dataItems = $block.find('.answer-data').map(function() {
                return $(this).val().trim();
            }).get();
            
            formData.questions.push({
                question_text: $block.find('[name="question_text[]"]').val(),
                location: $block.find('[name="location[]"]').val(),
                data: dataItems
            });
        });
        
        return formData;
    }

    function downloadJson(jsonStr, fileName) {
        var blob = new Blob([jsonStr], {type: "application/json"});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

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