$(document).ready(function () {

    var selectedPaths = []; // Array to store the currently selected paths
    var currentMode = 0; // Single Click Mode
    var selectOnly = [];
    let lastTouchTime = 0; // to store the time of the last touch

    attachInputHandlers();

    function attachInputHandlers() {
        $('#answerInput').off('input keypress');
        $('#svg-container svg path').off('click dblclick touchstart touchend')
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
            $('#svg-container svg path').on('click', function () {
                selectPathMode0(this);
            });
            $('#svg-container svg path').on('dblclick touchend', function (e) {
                handleTouchEnd.call(this, e, currentMode);
            });
            $('#answerInput').on('keypress', function (event) {
                if (event.which == 13) { // 13 is the keycode for Enter
                    let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
                    let pathClass = $('#svg-container svg path.' + inputVal);
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
                    let pathClass = $('#svg-container svg path.' + inputVal);
                    if (selectOnly.includes(inputVal) || selectOnly.length == 0) {
                        updateSelectedCountriesDisplay(pathClass);
                    }
                }
            });
            $('#svg-container svg path').on('click touchend', function () {
                selectPathMode1(this);
            });
        }
    }

    // Function to reset SVG path styles to only the paths contained in selectedPaths
    function resetSVGStyles() {
        $('#svg-container svg path').each(function () {
            if(isPathAllowed(getFirstClassName(this))) {
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
                    'fill': 'green',
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
            let highlightName = '#svg-container svg path.' + className;
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
        if(isPathAllowed(className)) {
            if (className) {
                className = className.replace(/_/g, ' '); // Replace all underscores with spaces
                $('#answerInput').val(className);
                removeAllPaths();
                updateSelectedCountriesDisplay(path);
            }
        }
    }

    function selectPathMode1(path) {
        if(isPathAllowed(getFirstClassName(path))) {
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
            selectedPaths.push($('#svg-container svg path.' + getFirstClassName(path)));            
            adjustTabsPosition();
            $(document).trigger('tabs-update'); 
            resetSVGStyles();
        } else {
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
        console.log($('#svg-container svg path.' + getFirstClassName(path)));
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
    $('#svg-container svg path').on('mouseover', function () {
        highlightPath(this);
    });

    $('#svg-container svg path').on('mouseout', function () {
        resetSVGStyles();
    });

    function highlightPathFromInput(currentMode) {
        try {
            let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
            let pathToHighlight = $('#svg-container svg path.' + inputVal);
            if (pathToHighlight.length) {
                if (currentMode === 0) {
                    resetSVGStyles();
                    highlightPath(pathToHighlight); // Highlight the first found path for Mode 0
                } else if (currentMode === 1) {
                    // In Mode 1, add the path to the selection list if it's not already included
                    let className = getFirstClassName(pathToHighlight[0]);
                    let pathClass = '#svg-container svg path.' + className;
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
            url: '/start-game-session?category=countries',
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
                $('#pass').show();
                $('#answerInput').prop('disabled', false);
                $('#submitAnswerButton').prop('disabled', false);
                $('#overlay').hide(); 
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
                console.log(data.location);
                switch (data.location.toLowerCase()) {
                  case "europe":
                    zoneEurope();
                    break;
                  case "east asia":
                    zoneEastAsia();
                    break;
                  case "north america":
                    zoneNorthAmerica();
                    break;
                  case "south america":
                    zoneSouthAmerica();
                    break;
                  case "middle east":
                    zoneMiddleEast();
                    break;
                  default:
                    zoneGlobal();
                    break;
                }                
                break;
            case 'end':
                // Stop the timer and display results
                clearInterval(window.timerInterval); // Stop the timer
                feedback(`Game Over!<br>Total Time: ${data.total_time_spent}s<br>Score: ${data.score} out of ${data.total_questions}`);

                $('#pass').hide(); // Hide the pass button
                $('#submitAnswerButton').prop('disabled', true);
                $('#endGame').hide(); // Hide the end game button
                $('#answerInput').prop('disabled', true);
                $('#overlay').show(); 
                break;
        }
    }

    // Function to fetch the next question from the server
    function getNextQuestion() {
        $.ajax({
            url: '/get-next-question',
            type: 'GET',
            success: function(response) {
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
            error: function(error) {
                console.error("Error fetching next question:", error);
            }
        });
    }

    function submitAnswer() {
        var answerData;
        if (currentMode === 0) {
            answerData = {
                answer: [getCountryNameFromPath(selectedPaths[0]).replace(/_/g, ' ')],
                question: $('#question').text()
            };
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

    function feedback(message) {
        $('#feedback').stop(true, true);
        $('#feedback').html(message);
        $('#feedback').show().delay(5000).fadeOut(5000);
    }

    $('.location-row').click(function() {
        var selectedLocation = $(this).children('td').first().text();
        $.ajax({
            url: '/set-location',
            type: 'POST',
            data: JSON.stringify({ game_name: selectedLocation }),
            contentType: 'application/json;charset=UTF-8',
            success: function(response) {
                if (response.success) {
                    startGameSession();
                }
            }
        });
    });
    
    

    //////////////////////////////////////
    //    Zone and Area lock functions  //
    //////////////////////////////////////

    function zoneGlobal() {
        const globalViewBox = { x: boundBox.xOffset, y: boundBox.yOffset, scale: minScale };
        zoomToRegion(globalViewBox, []);
    }

    function zoneEurope() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let europeViewBox = { x: 240 + browserRatioOffset, y: 150, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 6 : 6) };
        const europeanCountries = [
            "Albania", "Andorra", "Austria", "Belarus", "Belgium",
            "Bosnia_and_Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech_Republic",
            "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
            "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia",
            "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco",
            "Montenegro", "Netherlands", "Norway", "Poland", "Portugal",
            "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain",
            "Sweden", "Switzerland", "Turkey", "Ukraine", "United_Kingdom", "Vatican_City",
            "Russia", "Macedonia", "Cyprus"
        ];
        zoomToRegion(europeViewBox, europeanCountries);
    }

    function zoneEastAsia() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let viewBox = { x: 725 + browserRatioOffset, y: 295, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 6 : 6) };
        const countries = [
            "China", "Taiwan", "North_Korea", "South_Korea", "Japan", "Mongolia"
        ];
        zoomToRegion(viewBox, countries);
    }

    function zoneEurope() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let europeViewBox = { x: 240 + browserRatioOffset, y: 150, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 6 : 6) };
        const europeanCountries = [
            "Albania", "Andorra", "Austria", "Belarus", "Belgium",
            "Bosnia_and_Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech_Republic",
            "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
            "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia",
            "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco",
            "Montenegro", "Netherlands", "Norway", "Poland", "Portugal",
            "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain",
            "Sweden", "Switzerland", "Turkey", "Ukraine", "United_Kingdom", "Vatican_City",
            "Russia", "Macedonia", "Cyprus"
        ];
        zoomToRegion(europeViewBox, europeanCountries);
    }

    function zoneEastAsia() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let viewBox = { x: 725 + browserRatioOffset, y: 295, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 6 : 6) };
        const countries = [
            "China", "Taiwan", "North_Korea", "South_Korea", "Japan", "Mongolia"
        ];
        zoomToRegion(viewBox, countries);
    }

    function zoneNorthAmerica() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let northAmericaViewBox = { x: 1015 + browserRatioOffset, y: 230, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 4 : 4) };
        const northAmericanCountries = [
            "Canada", "United_States", "Mexico", "Guatemala", "Belize", 
            "Honduras", "El_Salvador", "Nicaragua", "Costa_Rica", "Panama"
        ];
        zoomToRegion(northAmericaViewBox, northAmericanCountries);
    }

    function zoneSouthAmerica() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let southAmericaViewBox = { x: 1140 + browserRatioOffset, y: 575, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 3.75 : 3.75) };
        const southAmericanCountries = [
            "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", 
            "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", 
            "Uruguay", "Venezuela"
        ];
        zoomToRegion(southAmericaViewBox, southAmericanCountries);
    }

    function zoneAfrica_NOT_IMPLEMENTED() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let africaViewBox = { x: 500 + browserRatioOffset, y: 200, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 5 : 5) };
        const africanCountries = [
        ];
        zoomToRegion(africaViewBox, africanCountries);
    }

    function zoneMiddleEast() {
        let browserRatioOffset = browserRatio > 1 ? 50 : 0;
        let middleEastViewBox = { x: 440 + browserRatioOffset, y: 290, scale: Math.min(maxScale, browserRatio > 1 ? 1.2 * browserRatio * 7.5 : 7.5) };
        const middleEasternCountries = [
            "Saudi_Arabia", "Iran", "Turkey", "Iraq", "United_Arab_Emirates", 
            "Israel", "Jordan", "Lebanon", "Oman", "Kuwait", "Qatar", "Bahrain", "Yemen", "Syria"
        ];
        zoomToRegion(middleEastViewBox, middleEasternCountries);
    }
    

    function zoomToRegion(regionViewBox, regionCountries) {
        console.log("Zooming to region");
        viewBox.x = regionViewBox.x;
        viewBox.y = regionViewBox.y;
        scaleSVG = regionViewBox.scale;
        viewBox.width = boundBox.widthMax / scaleSVG;
        viewBox.height = boundBox.heightMax / scaleSVG;

        updateViewBox();

        $('svg path').each(function () {
            var pathClass = $(this).attr('class').split(/\s+/)[0];
            if (regionCountries.length != 0) {
                if ($.inArray(pathClass, regionCountries) === -1) {
                    $(this).css({
                        'stroke-width': '0.4083586658048981',
                        'stroke': '#333',
                        'stroke-opacity': '1',
                        'fill': '#fff7ec',
                        'fill-opacity': '1'
                    });
                }
            }
        });
        selectOnly = regionCountries;
    }

    //////////////////////////////////////
    // World map zoom and pan functions //
    //////////////////////////////////////

    let svg = $('#svg-container svg');

    let scaleSVG = 2.74;
    let minScale = 2.74;
    let maxScale = 14;

    let boundBox = {
        xOffset: 250,
        yOffset: 230,
        widthMax: 4000,
        heightMax: 1714,
        widthMin: 300,
        heightMin: (857 * 0.8) / 5,
    }

    let viewBox = {
        x: 250,
        y: 230,
        width: boundBox.widthMax / scaleSVG,
        height: boundBox.heightMax / scaleSVG
    }

    console.log(viewBox.x, viewBox.y, viewBox.width, viewBox.height);

    const zoomFactor = 0.03;
    let browserRatio = window.innerHeight / window.innerWidth;
    $(window).on('resize', updateViewBox);
    updateViewBox();

    // Calculate new viewBox based on current scale and translation
    function updateViewBox(scale = 1) {
        // console.trace("updateViewBox function called");
        let rawNewRatio = window.innerHeight / window.innerWidth;
        let newRatio = Math.max(Math.min(rawNewRatio, 1.4), 0.9);
        if (newRatio !== browserRatio) {
            browserRatio = newRatio;
            scaleSVG *= browserRatio < 0 ? 1 + zoomFactor : 1 / (1 + zoomFactor);
            scaleSVG = Math.max(minScale, Math.min(maxScale, scaleSVG)); // Set reasonable limits for zoom
            // viewBox.width = boundBox.widthMax / scaleSVG;
            //  viewBox.height = boundBox.heightMax / scaleSVG;
        }

        // Linear scaling of the y-axis. Adjust the multiplier and base scale according to your needs.
        let baseScaleY = 1.1; // Base scale factor when aspect ratio is 1
        let scaleMultiplier = 1.8; // Adjust this to control how much the scale changes with the ratio
        let scaleY = baseScaleY + (newRatio - 1) * scaleMultiplier;

        // Linear translation along the y-axis. Adjust these multipliers to control the translation sensitivity.
        let translateBase = 100; // Base translation when ratio is 1
        let translateMultiplier = -480; // Adjust this to control the translation amount change with the ratio
        let translateY = translateBase + (newRatio - 1) * translateMultiplier;

        let elements = svg.find('*');

        console.log('scaleSVG:', scaleSVG);
        console.log('viewBox:', viewBox.x, viewBox.y, viewBox.width, viewBox.height)

        // Bounds: Keep dimensions within bounds
        viewBox.width = Math.min(Math.max(viewBox.width, boundBox.widthMin), boundBox.widthMax);
        viewBox.height = Math.min(Math.max(viewBox.height, boundBox.heightMin), boundBox.heightMax);
        console.log(scale, boundBox.widthMin, boundBox.widthMax, boundBox.heightMin, boundBox.heightMax);
        console.log(viewBox.width, viewBox.height);

        // Calculate the maximum allowed translation in x and y directions
        let maxTranslateX = (boundBox.widthMax / minScale) * 0.8;
        let maxTranslateY = (boundBox.heightMax / minScale) * 1.2;
        // console.log('c_scaleSVG:', scaleSVG, 'maxTranslateX:', maxTranslateX, 'maxTranslateY:', maxTranslateY);
        viewBox.x = Math.max(Math.min(viewBox.x, maxTranslateX), -maxTranslateX);
        viewBox.y = Math.max(Math.min(viewBox.y, maxTranslateY), -maxTranslateY);

        svg.attr('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        elements.css('transform', `scale(1, ${scaleY}) translate(0, ${translateY}px)`);
        console.log(`Updated viewBox: ${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);

    }

    // Prevent default behavior and stop propagation
    function stopEvent(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function getSVGPoint(svg, clientX, clientY) {

        let rect = svg[0].getBoundingClientRect(); // Get the bounding rectangle of the SVG element
        let x = clientX - rect.left; // X coordinate relative to the SVG element
        let y = clientY - rect.top;  // Y coordinate relative to the SVG element

        // Current viewBox attributes
        let viewBox = svg[0].viewBox.baseVal;

        // Calculate scale factors if viewBox is being used
        let xScale = viewBox.width / rect.width;
        let yScale = viewBox.height / rect.height;

        // Adjust points by the scale factor
        let svgX = (x * xScale) + viewBox.x;
        let svgY = (y * yScale) + viewBox.y;

        return { svgX, svgY };
    }


    // Normalize wheel event delta
    svg.on('wheel', function (e) {
        e.preventDefault();
        const deltaY = normalizeWheelDelta(e);
        scaleSVG *= deltaY < 0 ? 1 + zoomFactor : 1 / (1 + zoomFactor);
        scaleSVG = Math.max(minScale, Math.min(maxScale, scaleSVG));
        // Adjust viewBox to keep the zoom centered on the cursor
        if (deltaY < 0) { // Zooming in

            let newWidth = boundBox.widthMax / scaleSVG;
            let newHeight = boundBox.heightMax / scaleSVG;

            viewBox.width = newWidth;
            viewBox.height = newHeight;

            let svgPoint = getSVGPoint(svg, e.clientX, e.clientY);
            let cursorPercentX = ((svgPoint.svgX - viewBox.x) / viewBox.width) - 0.5;
            let cursorPercentY = ((svgPoint.svgY - viewBox.y) / viewBox.height) - 0.5;

            // Zoom to mouse coursor position
            viewBox.x = viewBox.x + svgPoint.svgX * cursorPercentX * 0.09;
            viewBox.y = viewBox.y + svgPoint.svgY * cursorPercentY * 0.09;

            // Debug
            //console.log('cursorPercentX:', cursorPercentX, 'cursorPercentY:', cursorPercentY);
            //console.log('svgPoint.svgX:', svgPoint.svgX, 'svgPoint.svgY:', svgPoint.svgY, 'viewBox.x:', viewBox.x, 'viewBox.y:', viewBox.y, 'scaleSVG:', scaleSVG, 'scaleChange:', scaleChange);
        } else { // Zooming out
            // Calculate the new viewBox dimensions based on the scale change
            console.log("Before", viewBox.width, viewBox.height);
            let newWidth = Math.min(boundBox.widthMax / scaleSVG, boundBox.widthMax / minScale);
            let newHeight = Math.min(boundBox.heightMax / scaleSVG, boundBox.heightMax / minScale);

            console.log("After", viewBox.width, viewBox.height);
            // Interpolate towards the origin (0,0) for xOffset and yOffset
            if (scaleSVG === minScale) {
                const transitionFactor = 0.25; // Adjust this value to control the transition speed
                viewBox.x = boundBox.xOffset * transitionFactor + viewBox.x * (1 - transitionFactor);
                viewBox.y = boundBox.yOffset * transitionFactor + viewBox.y * (1 - transitionFactor);
            } else {
                const transitionFactor = 0.05; // Adjust this value to control the transition speed
                viewBox.x = boundBox.xOffset * transitionFactor + viewBox.x * (1 - transitionFactor);
                viewBox.y = boundBox.yOffset * transitionFactor + viewBox.y * (1 - transitionFactor);
            }
            // Update the dimensions of the viewBox
            viewBox.width = newWidth;
            viewBox.height = newHeight;

            console.log('Updated viewBox:', 'x:', viewBox.x, 'y:', viewBox.y, 'width:', viewBox.width, 'height:', viewBox.height);
        }
        updateViewBox();
    });

    // Helper function to normalize the wheel delta
    function normalizeWheelDelta(e) {
        if (e.originalEvent.deltaMode === 1) { // Line mode (typical for mouse wheel)
            return e.originalEvent.deltaY * 15; // Multiply by a factor for normalization
        } else { // Pixel mode (typical for trackpads)
            return e.originalEvent.deltaY;
        }
    }

    // Handle event stopping
    function stopEvent(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    //////////////////////////////////////
    // Panning mouse and touch events   //
    //////////////////////////////////////

    let isPanning = false;
    let initialX = 0, initialY = 0;


    // Panning functionality
    function startPanning(x, y) {
        initialX = x;
        initialY = y;
        isPanning = true;
        svg.css('cursor', 'grabbing');
        $('.clickable-child').css('pointer-events', 'none');
    }

    // Move panning function
    function movePanning(x, y) {
        let deltaX = x - initialX;
        let deltaY = y - initialY;

        viewBox.x -= deltaX;
        viewBox.y -= deltaY;

        updateViewBox();

        initialX = x;
        initialY = y;
    }

    // Common end panning function
    function endPanning() {
        isPanning = false;
        svg.css('cursor', 'grab');
        $('.clickable-child').css('pointer-events', '');
    }

    // Disable text selection during panning
    svg.on('mousedown touchstart', function (e) {
        svg.css('user-select', 'none');
    });

    // Mouse events
    svg.on('mousedown', function (e) {
        if (e.button === 0) { // Left mouse button
            e.preventDefault();
            startPanning(e.clientX, e.clientY);
        }
    });

    $(document).on('mousemove', function (e) {
        if (isPanning) {
            movePanning(e.clientX, e.clientY);
        }
    });

    $(document).on('mouseup mouseleave', function (e) {
        if (isPanning) {
            endPanning();
        }
    });

    // Touch events
    svg.on('touchstart', function (e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            let touch = e.touches[0];
            startPanning(touch.clientX, touch.clientY);
        }
        console.log("touchstart")
    });

    svg.on('touchmove', function (e) {
        if (isPanning && e.touches.length === 1) {
            let touch = e.touches[0];
            movePanning(touch.clientX, touch.clientY);
        }
        console.log("touchmove")
    });

    svg.on('touchend touchcancel', function (e) {
        if (isPanning) {
            endPanning();
        }
        console.log("touchend")
    });

    $(window).resize(function () {
        adjustContainerMargin(); // Call this function to adjust margins whenever the window is resized
    });

    // Function to adjust margins dynamically based on the number of tabs
    function adjustContainerMargin() {
        var tabsHeight = $('#tabsContainer').outerHeight(true); // true includes margin in the calculation
        $('.container').css('margin-top', tabsHeight + 'px'); // Apply bottom margin to '.container'
    }

    // Trigger this adjustment when tabs are added or removed
    $(document).on('tabs-update', adjustContainerMargin); // Custom event when tabs change

    //////////////////////////////////////
    //      Expand Small Countries      //
    //////////////////////////////////////

    var smallCountries = [
        'Luxembourg', 'Brunei', 'Burundi', 'Swaziland', 'Lesotho', 'Rwanda',
        'Belize', 'El-Salvador', 'Jamaica', 'Dominican_Republic', 'Dominica',
        'Trinidad_and_Tobago' 
    ];

    var selector = smallCountries.map(function(country) {
        return '.' + country;
    }).join(', ');

    $('.click-helper').on('click', function() {
        var targetId = $(this).attr('data-target');
        console.log(targetId);
        $(targetId + ':first').click();
    });

    $('.click-helper').on('touchend', function() {
        var targetId = $(this).attr('data-target');
        console.log(targetId);
        $(targetId + ':first').trigger('touchend')
    });

    $('.click-helper').on('mouseover', function() {
        var targetId = $(this).attr('data-target');
        $(targetId).mouseover();
    });

    $('.click-helper').on('mouseleave', function() {
        var targetId = $(this).attr('data-target');
        $(targetId).mouseleave();
    });

});