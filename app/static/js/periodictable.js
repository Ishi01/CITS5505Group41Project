$(document).ready(function () {
    $('#feedback').hide();
    var selectedPaths = []; // Array to store the currently selected paths
    var currentMode = 0; // Single Click Mode
    var selectOnly = [];
    let lastTouchTime = 0; // to store the time of the last touch

    const svgPath = $('#svg-container svg g g g path');

    attachInputHandlers();
    
    function attachInputHandlers() {
        $('#answerInput').off('input keypress');
        $('#svg-container svg g g.top path').off('click dblclick touchstart touchend')
        function handleTouchEnd(event, currentMode) {
            event.preventDefault();
            let now = new Date().getTime();
            let timeSinceLastTouch = now - lastTouchTime;
            if (timeSinceLastTouch < 300 && timeSinceLastTouch > 0) {
                // Trigger double click if it's a quick successive touch
                $('#submitAnswerButton').trigger('click');
            } else {
                // Handle single tap
                if (currentMode === 0) {
                    selectPathMode0(this);
                }
                else if (currentMode === 1) {
                    selectPathMode1(this);
                }
            }
            lastTouchTime = now;
        }
        if (currentMode === 0) {
            $('#answerInput').on('input', function () {
                if (event.which != 13) {
                    highlightPathFromInput(currentMode); // Highlight country if text matches input
                }
            });
            $('#svg-container svg g g.top path').on('click', function () {
                selectPathMode0(this);
            });
            $('#svg-container svg g g.top path').on('dblclick touchend', function (e) {
                handleTouchEnd.call(this, e, currentMode);
            });
            $('#answerInput').on('keypress', function (event) {
                if (event.which == 13) { // 13 is the keycode for Enter
                    let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
                    let pathClass = $('#svg-container svg g g.top path.' + inputVal);
                    if (selectOnly.includes(inputVal) || selectOnly.length == 0) {
                        removeAllPaths();
                        updateSelectedCountriesDisplay(pathClass);
                    }
                }
            });
        }
        else if (currentMode === 1) {
            $('#answerInput').on('input', function () {
                if (event.which != 13) {
                    highlightPathFromInput(currentMode); // Highlight country if text matches input
                }
            });
            $('#answerInput').on('keypress', function (event) {
                console.log(event.which)
                if (event.which == 13) { // 13 is the keycode for Enter
                    let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
                    let pathClass = $('#svg-container svg g g.top path.' + inputVal);
                    if (selectOnly.includes(inputVal) || selectOnly.length == 0) {
                        updateSelectedCountriesDisplay(pathClass);
                    }
                }
            });
            $('#svg-container svg g g.top path').on('click touchend', function () {
                selectPathMode1(this);
            });
        }
    }

    // Function to reset SVG path styles to only the paths contained in selectedPaths
    function resetSVGStyles() {
        $('#svg-container svg g g.top path').each(function () {
            if (isPathAllowed(getFirstClassName(this))) {
                $(this).css({
                    'fill': '',
                    'stroke': '',
                    'stroke-width': ''
                });
            }
        });

        for (selectedPath of selectedPaths) {
            if (isPathAllowed(getFirstClassName(selectedPath))) {
                $(selectedPath).css({
                    'fill': 'purple',
                    'stroke': '#225522',
                    'stroke-width': '2'
                });
            }
        }
    }

    // Highlight a path function for mouseover
    function highlightPath(path) {
        let className = getFirstClassName(path);
        if (isPathAllowed(className)) {
            let highlightName = '#svg-container svg g g.top path.' + className;
            if (!isPathSelected(className)) {
                $(highlightName).css({
                    'fill': 'palegreen',
                    'stroke': '#225522',
                    'stroke-width': '2'
                });
            }
        }
    }

    // Apply selected style to a path
    function selectPathMode0(path) {
        let className = getFirstClassName(path);
        if (isPathAllowed(className)) {
            if (className) {
                className = className.replace(/_/g, ' '); // Replace all underscores with spaces
                $('#answerInput').val(className);
                removeAllPaths();
                updateSelectedCountriesDisplay(path);
            }
        }
    }

    function selectPathMode1(path) {
        if (isPathAllowed(getFirstClassName(path))) {
            updateSelectedCountriesDisplay(path);
        }
    }

    function updateSelectedCountriesDisplay(path) {
        let country = $(path).attr('class').split(/\s+/)[0];
        let countryId = 'tab-' + country.replace(/\s+/g, '-')
        let countryTab = $('#' + countryId);
        if (!countryTab.length) {
            // No existing tab for the country, add a new one
            var tab = $('<div/>', {
                id: countryId,
                class: 'country-tab',
                text: country.replace(/_/g, ' '),
                click: function () {
                    removePath(path);
                }
            }).css({
                transform: 'scale(0)',
                opacity: 0
            }).appendTo('#tabsContainer');
            setTimeout(function () {
                tab.css({
                    transform: 'scale(1)',
                    opacity: 1
                });
            }, 10);
            selectedPaths.push($('#svg-container svg g g.top path.' + getFirstClassName(path)));
            adjustTabsPosition();
            $(document).trigger('tabs-update');
            resetSVGStyles();
        } else {
            console.log("removing!" + path)
            removePath(path);
        }
    }

    function adjustTabsPosition() {
        // This function will adjust the flex positioning of the tabs
        var tabsCount = $('.country-tab').length;
        if (tabsCount > 3) { // Example condition to switch alignment based on count
            $('#tabsContainer').css('justify-content', 'center');
        } else {
            $('#tabsContainer').css('justify-content', 'center');
        }
    }

    function removePath(path) {
        let country = getFirstClassName(path);
        let countryId = 'tab-' + country.replace(/\s+/g, '-')
        $('#' + countryId).remove();
        console.log($('#svg-container svg g g.top path.' + getFirstClassName(path)));
        selectedPaths = removePathFromSelected(country); // Update selectedPaths

        adjustTabsPosition(); // Adjust the positions of remaining tabs
        $(document).trigger('tabs-update'); // Notify the document about the update
        resetSVGStyles();
    }

    function removeAllPaths() {
        $('.country-tab').each(function () {
            $(this).remove(); // Remove each tab
        });
        selectedPaths = []
        adjustTabsPosition();
        $(document).trigger('tabs-update');
        resetSVGStyles();
    }

    // Handler for mouseover to temporarily highlight SVG paths

   $('#svg-container svg g g.top path').on('mouseover', function () {
        highlightPath(this);
    });

    $('#svg-container svg g g.top path').on('mouseout', function () {
        resetSVGStyles();
    });

    function highlightPathFromInput(currentMode) {
        try {
            let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
            let pathToHighlight = $('#svg-container svg g g.top path.' + inputVal);
            if (pathToHighlight.length) {
                if (currentMode === 0) {
                    resetSVGStyles();
                    highlightPath(pathToHighlight); // Highlight the first found path for Mode 0
                } else if (currentMode === 1) {
                    // In Mode 1, add the path to the selection list if it's not already included
                    let className = getFirstClassName(pathToHighlight[0]);
                    let pathClass = '#svg-container svg g g.top path.' + className;
                    if (!selectedPaths.includes(pathClass)) {
                        resetSVGStyles();
                        highlightPath(pathToHighlight);
                    }
                }
            }
        } catch (error) {
        }
    }

    function getFirstClassName(element) {
        return $(element).attr('class').split(/\s+/)[0];
    }

    function isPathAllowed(className) {
        return selectOnly.includes(className) || selectOnly.length === 0;
    }

    function isPathSelected(className) {
        return selectedPaths.some(pathObj =>
            Object.values(pathObj).some(path =>
                path.classList && path.classList.contains(className)
            )
        );
    }

    function removePathFromSelected(className) {
        // Filter the selectedPaths array to exclude any paths that have the specified class
        return selectedPaths.filter(path => {
            return !path.hasClass(className);
        });
    }
    //////////////////////////////////////
    //              Buttons             //
    //////////////////////////////////////

    $('#startGame').on('click', function () {
        startGameSession();
    });

    $('#pass').on('click', function () {
        skipQuestion();
    });

    $('#submitAnswerButton').on('click', function () {
        submitAnswer();
    });

    // Function to start the game session
    function startGameSession() {
        $.ajax({
            url: '/start-game-session?category=elements',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    updateGameUI('start', response);
                    getNextQuestion();  // Start the game by fetching the first question
                }
            },
            error: function (error) {
                console.error("Error starting game session:", error);
                alert("Error starting the game session. Please try again.");
            }
        });
    }

    // Function to update the game UI based on the action
    function updateGameUI(action, data) {
        switch (action) {
            case 'start':
                $('#answerInput').prop('disabled', false);
                $('#submitAnswerButton').prop('disabled', false);
                $('#overlay').hide();
                $('#feedback').hide();
                // Start the timer
                var serverStartTime = data.start_time * 1000; // Convert to milliseconds
                window.timerInterval = setInterval(function () {
                    var currentTime = Date.now();
                    var elapsedTime = currentTime - serverStartTime;
                    var seconds = Math.floor(elapsedTime / 1000); // Convert milliseconds to seconds
                    $('#timer').text(seconds + 's');
                }, 1000); // Update the timer every second
                break;
            case 'question':
                // Update the UI with the new question and reset necessary fields
                currentMode = data.is_multiple_choice ? 1 : 0;
                $('#question').text(data.question);
                $('#answerInput').val('');
                removeAllPaths();
                attachInputHandlers();
                break;
            case 'end':
                // Stop the timer and display results
                clearInterval(window.timerInterval); // Stop the timer
                feedback(`Game Over!<br>Total Time: ${data.total_time_spent}s<br>Score: ${data.score} out of ${data.total_questions}`, false, true);
                $('#submitAnswerButton').prop('disabled', true);
                $('#endGame').hide(); // Hide the end game button
                $('#answerInput').prop('disabled', true);
                $('#overlay').show();
                removeAllPaths();
                break;
        }
    }

    // Function to fetch the next question from the server
    function getNextQuestion() {
        $.ajax({
            url: '/get-next-question',
            type: 'GET',
            success: function (response) {
                if (response.error) {
                    if (response.error === "No more questions or session not started") {
                        endGame();  // Call the function to handle end of the game
                    } else {
                        alert('Game Over or Error: ' + response.error);
                    }
                } else {
                    console.log(response);
                    updateGameUI('question', response);
                }
            },
            error: function (error) {
                console.error("Error fetching next question:", error);
            }
        });
    }

    function submitAnswer() {
        var answerData;
        if (currentMode === 0) {
            if (selectedPaths.length > 0) {
                answerData = {
                    answer: [getCountryNameFromPath(selectedPaths[0]).replace(/_/g, ' ')],
                    question: $('#question').text()
                };
            } else {
                feedback('No element selected!');
                return;
            }
        } else {
            let selectedAnswerCountries = selectedPaths.map(function (path) {
                if ($(path).length) {
                    return getCountryNameFromPath(path).replace(/_/g, ' ');
                } else {
                    return null;
                }
            }).filter(function (country) { return country !== null; }); // Filter out null values
            answerData = {
                answer: selectedAnswerCountries,
                question: $('#question').text()
            };
        }
        $.ajax({
            url: '/game-answer',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(answerData),
            success: function (response) {
                if (response.is_correct) {
                    feedback('Correct!');
                } else {
                    feedback('Incorrect. Try again!');
                    // Do something here? (lives?)
                }
                if (response.next_question) {
                    getNextQuestion();  // Fetch next question only on correct answer
                }
            },
            error: function (error) {
                console.error("Error checking answer:", error);
            }
        });
    }

    function endGame() {
        $.ajax({
            url: '/end-game-session',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    // Display results such as time spent and score
                    updateGameUI('end', response)
                } else {
                    feedback('Error: ' + response.error);
                }
            },
            error: function (error) {
                console.log("Error ending game session:", error);
            }
        });
    }

    function skipQuestion() {
        answerData = {
            question: $('#question').text()
        };
        $.ajax({
            url: '/game-answer',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(answerData),
            success: function (response) {
                if (response.success) {
                    getNextQuestion();  // Get the next question if skip was successful
                } else {
                    alert('Error: ' + response.error);
                }
            },
            error: function (error) {
                console.error("Error skipping question:", error);
            }
        });
    }

    function getCountryNameFromPath(path) {
        let $path = $(path);
        let className = $path.attr('class').split(/\s+/)[0];
        if (className) {
            return className.replace(/_/g, ' '); // Replace underscores with spaces
        } else {
            return null;
        }
    }

    // Function to display feedback messages
    function feedback(message1 = false, message2 = false, endOfGame = false) {
        $('#feedback').stop(true, true);
    
        if (message1 !== false) {
            $('#feedback span#feedback1').html(message1);
        }
        
        if (message2 !== false) {
            $('#feedback span#feedback2').html(message2).show();
        } else {
            $('#feedback span#feedback2').hide();
        }
    
        if (endOfGame) {
            $('#feedback').show();
            $('.thumbs-up, .thumbs-down').show();
        } else {
            $('#feedback').show().delay(3000).fadeOut(5000);
            $('.thumbs-up, .thumbs-down').hide();
        }
    }

    $('.thumbs-up').click(function () {
        submitRating('positive');
    });

    $('.thumbs-down').click(function () {
        submitRating('negative');
    });

    function submitRating(ratingType) {
        $.ajax({
            url: '/submit-rating',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ rating_type: ratingType }),
            success: function (response) {
                if (response.success) {
                    console.log('Rating submitted:', ratingType);
                    feedback(false, 'Rating submitted!', true);
                } else {
                    feedback(false, 'Error: ' + response.error, true);
                }
            },
            error: function (error) {
                console.error("Error submitting rating:", error);
            }
        });
    }

    $('.location-row').click(function () {
        var selectedLocation = $(this).children('td').first().text();
        $.ajax({
            url: '/set-location',
            type: 'POST',
            data: JSON.stringify({ game_name: selectedLocation }),
            contentType: 'application/json;charset=UTF-8',
            success: function (response) {
                if (response.success) {
                    startGameSession();
                }
            }
        });
    });


    //////////////////////////////////////
    // World map zoom and pan functions //
    //////////////////////////////////////

    let svg = $('#svg-container svg');

    let scaleSVG = 1;
    let minScale = 1;
    let maxScale = 1;

    let boundBox = {
        xOffset: 0,
        yOffset: 0,
        widthMax: svg.get(0).viewBox.baseVal.width,
        heightMax: svg.get(0).viewBox.baseVal.height,
        widthMin: 0,
        heightMin: 0,
    }

    let viewBox = {
        x: 0,
        y: 0,
        width: boundBox.widthMax / scaleSVG,
        height: boundBox.heightMax / scaleSVG
    }

    console.log(viewBox.x, viewBox.y, viewBox.width, viewBox.height);


    $(window).resize(function () {
        adjustContainerMargin(); // Call this function to adjust margins whenever the window is resized
    });

    // Function to adjust margins dynamically based on the number of tabs
    function adjustContainerMargin() {
        var tabsHeight = $('#tabsContainer').outerHeight(true); // true includes margin in the calculation
        $('.bottom-container').css('margin-top', tabsHeight + 'px'); // Apply bottom margin to '.bottom-container'
    }

    // Trigger this adjustment when tabs are added or removed
    $(document).on('tabs-update', adjustContainerMargin); // Custom event when tabs change



});