$(document).ready(function () {

    var selectedPaths = []; // Array to store the currently selected paths
    var currentMode = 0; // Default mode
    var selectOnly = [];
    let lastTouchTime = 0; // to store the time of the last touch

    attachInputHandlers();

    function attachInputHandlers() {
        // Remove previous handlers to avoid duplicates
        $('#answerInput').off('input keypress');
        $('#svg-container svg path').off('click dblclick touchstart touchend')

        function handleTouchEnd(event, currentMode) {
            // Prevent firing click event immediately after touchend
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
                resetSVGStyles(); // Reset all highlights first
                highlightPathFromInput_Mode0(); // Then apply new highlight based on the mode
            });
            $('#svg-container svg path').on('click', function () {
                selectPathMode0(this);
            });
            $('#svg-container svg path').on('dblclick touchend', function (event) {
                handleTouchEnd.call(this, event, currentMode);
            });
            $('#answerInput').on('keypress', function (event) {
                if (event.which == 13) { // 13 is the keycode for Enter
                    let inputVal = $('#answerInput').val().replace(/ /g, '_'); // Convert spaces to underscores
                    let pathClass = $('#svg-container svg path.' + inputVal);
                    selectedPaths = [pathClass]; // Reset and select new path
                    resetSVGStyles(); // Then apply new highlight
                }
            });
        }
        else if (currentMode === 1) {
            $('#answerInput').on('input', function () {
                resetSVGStyles(); // Reset all highlights first
                highlightPathFromInput_Mode1(); // Then apply new highlight based on the mode
            });
            $('#answerInput').on('keypress', function (event) {
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
            $('#svg-container svg path').on('click touchend', function (event) {
                selectPathMode1(this);
            });
        }
    }

    // Function to reset SVG path styles to default
    function resetSVGStyles(path) {
        let className = $(path).attr('class');
        $('#svg-container svg path').each(function () {
            let eachPathName = $(this).attr('class');
            if (selectOnly.includes(eachPathName) || selectOnly.length == 0) {
                $(this).css({
                    'fill': '',
                    'stroke': '',
                    'stroke-width': ''
                });
            }
        });

        for (selectedPath of selectedPaths) {
            let className = $(selectedPath).attr('class');
            if (selectOnly.includes(className) || selectOnly.length == 0) {
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
        let className = $(path).attr('class');
        if (selectOnly.includes(className) || selectOnly.length == 0) {
            //  console.log(className);
            //  console.log(selectOnly.length);
            let highlightName = '#svg-container svg path.' + className;
            if (!selectedPaths.includes(highlightName)) {
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
        let pathClass = '#svg-container svg path.' + $(path).attr('class');
        let className = $(path).attr('class'); // Get the class attribute of the clicked path
        if (selectedPaths[0] == pathClass) {
            selectedPaths = [];
            resetSVGStyles(this);
            className = className.replace(/_/g, ' '); // Replace all underscores with spaces
            $('#answerInput').val(className);
            updateSelectedCountriesDisplay(className);
        } else {
            if (selectOnly.includes(className) || selectOnly.length == 0) {
                selectedPaths = [pathClass]; // Reset and select new path
                if (className) {
                    className = className.replace(/_/g, ' '); // Replace all underscores with spaces
                    $('#answerInput').val(className);
                    updateSelectedCountriesDisplay(className);
                }
                resetSVGStyles(this);
            }
        }
    }

    function selectPathMode1(path) {
        let className = $(path).attr('class');
        let pathClass = '#svg-container svg path.' + className;
        if (selectOnly.includes(className) || selectOnly.length == 0) {
            if (selectedPaths.includes(pathClass)) {
                selectedPaths = selectedPaths.filter(p => p !== pathClass); // Toggle off
                updateSelectedCountriesDisplay(className);
            } else {
                selectedPaths.push(pathClass);
                updateSelectedCountriesDisplay(className);
            }
            resetSVGStyles(this);
        }
    }

    function updateSelectedCountriesDisplay(country) {
        var countryId = 'tab-' + country.replace(/\s+/g, '-');
        if (!$('#' + countryId).length) {
            if (currentMode === 0) {
                // Single tab mode: clear existing tabs before adding a new one
                $('.country-tab').remove();
                selectedCountries = []; // Clear the array as only one country can be selected
            }
            // Proceed to add new tab
            var tab = $('<div/>', {
                id: countryId,
                class: 'country-tab',
                text: country,
                click: function () {
                    $(this).remove(); // Remove the tab from UI
                    selectedPaths = selectedPaths.filter(c => c !== country); // Update selectedCountries
                    adjustTabsPosition(); // Adjust the positions of remaining tabs
                    $(document).trigger('tabs-update'); // Notify the document about the update
                }
            }).css({
                transform: 'scale(0)',
                opacity: 0
            }).appendTo('#tabsContainer');

            // Animate the tab to scale up and fade in
            setTimeout(function () {
                tab.css({
                    transform: 'scale(1)',
                    opacity: 1
                });
            }, 10);

            selectedPaths.push(country); // Add new country to the array
        } else {
            // If the tab exists and the mode allows multiple tabs, or it's the only tab in single mode
            $('#' + countryId).remove();
            selectedPaths = selectedPaths.filter(c => c !== country); // Update selectedCountries
        }
        adjustTabsPosition(); // Adjust positions after adding or removing tabs
        $(document).trigger('tabs-update'); // Notify the document about the update
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

    function removeAllTabs() {
        $('.country-tab').each(function () {
            $(this).remove(); // Remove each tab
        });
        adjustTabsPosition(); // Adjust the positions in case you need to realign other elements
        $(document).trigger('tabs-update'); // Notify the document that all tabs have been removed
    }

    $('.country-tab').click(function () {
        $(this).remove();
        $(document).trigger('tabs-update');  // Trigger layout update after a tab is removed
    });

    // Handler for mouseover to temporarily highlight SVG paths
    $('#svg-container svg path').on('mouseover', function () {
        highlightPath(this);
    });

    $('#svg-container svg path').on('mouseout', function () {
        resetSVGStyles(this);
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

    //////////////////////////////////////
    //              Buttons             //
    //////////////////////////////////////

    $('#startGame').on('click', function () {
        $(this).hide(); // Hide the startGame button
        $('#pass').show(); // Show the pass button
        $.ajax({
            url: '/start-game-session#countries',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    var serverStartTime = response.start_time * 1000; // Convert to milliseconds
                    var timerInterval = setInterval(function() {
                        var currentTime = Date.now();
                        var elapsedTime = currentTime - serverStartTime;
                        var seconds = Math.floor(elapsedTime / 1000); // Convert milliseconds to seconds
                        $('#timer').text(seconds + 's');
                    }, 1000); // Update the timer every second
                    getNextQuestion();  // Start the game by fetching the first question
                }
            },
            error: function (error) {
                console.log("Error starting game session:", error);
            }
        });
    });

    function getNextQuestion() {
        $.ajax({
            url: '/get-next-question#countries',
            type: 'GET',
            success: function (response) {
                if (response.error) {
                    // If no more questions are available, end the game
                    if (response.error === "No more questions or session not started") {
                        endGame();  // Call the function to handle end of the game
                    } else {
                        alert('Game Over or Error: ' + response.error);
                    }
                } else {
                    $('#question').text(response.question);
                    $('#answerInput').val('');
                    $('#feedback').text('');
                    
                    currentMode = response.is_multiple_choice ? 1 : 0;
                    removeAllTabs();
                    selectedPaths = [];
                    resetSVGStyles();
                    attachInputHandlers();
                    if(response.location == "Europe") {
                        zoneEurope();    
                    } else {
                        zoneGlobal();
                        resetSVGStyles();
                    }
                }
            },
            error: function (error) {
                console.log("Error fetching next question:", error);
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
                    $('#results').html(`Game Over!<br>Total Time: ${response.total_time_spent}s<br>Score: ${response.score} out of ${response.total_questions}`);
                    $('#pass').hide(); // Hide the pass button
                    $('#submitAnswerButton').hide(); // Hide the submit button
                    $('#endGame').hide(); // Hide the end game button
                    clearInterval(timerInterval); // Stop the timer
                } else {
                    alert('Error: ' + response.error);
                }
            },
            error: function (error) {
                console.log("Error ending game session:", error);
            }
        });
    }    
    

    $('#pass').on('click', function () {
        $.ajax({
            url: '/skip-question',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({}),
            success: function(response) {
                if (response.end_of_game) {
                    // Handle end of game, like showing results or disabling game controls
                    $('#results').text("You've reached the end of the game!");
                } else if (response.success) {
                    getNextQuestion();  // Get the next question if skip was successful
                } else {
                    alert('Error: ' + response.error);
                }
            },
            error: function(error) {
                console.log("Error skipping question:", error);
                getNextQuestion();  // Attempt to continue to the next question even in case of error
            }
        });
    });
    
    $('#submitAnswerButton').on('click', function () {
        var answerData;

        if (currentMode === 0) {
            answerData = {
                answer: [$('#answerInput').val()],
                question: $('#question').text()
            };
        } else {
            let selectedAnswerCountries = selectedPaths.map(function (path) {
                let $path = $(path);
                if ($path.length) {
                    return $path.attr('class').replace(/\_/g, ' ');  // Convert class to country name
                } else {
                    return null;
                }
            });
            // Filter out any null values from the resulting array
            selectedAnswerCountries = selectedAnswerCountries.filter(function (country) {
                return country !== null;
            });

            answerData = {
                answer: selectedAnswerCountries,
                question: $('#question').text()
            };
        }

        $.ajax({
            url: '/game-answer#countries',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(answerData),
            success: function (response) {
                if (response.is_correct) {
                    $('#feedback').text('Correct!');
                    getNextQuestion();  // Fetch next question only on correct answer
                } else {
                    $('#feedback').text('Incorrect. Try again!');
                    // Optionally reset or end the game here
                }

            },
            error: function (error) {
                console.log("Error checking answer:", error);
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
        const europeViewBox = { x: 750, y: 150, scale: maxScale };
        const europeanCountries = [
            "Albania", "Andorra", "Austria", "Belarus", "Belgium",
            "Bosnia_and_Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech_Republic",
            "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
            "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia",
            "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco",
            "Montenegro", "Netherlands", "Norway", "Poland", "Portugal",
            "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain",
            "Sweden", "Switzerland", "Turkey", "Ukraine", "United_Kingdom", "Vatican_City",
            "Russian_Federation", "Macedonia", "Cyprus"
        ];
        zoomToRegion(europeViewBox, europeanCountries);
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
            var pathClass = $(this).attr('class');
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

    let scaleSVG = 2.4;
    let minScale = 2.4;
    let maxScale = 6;

    let boundBox = {
        xOffset: 200,
        yOffset: 140,
        widthMax: 4000,
        heightMax: 1714,
        widthMin: 500,
        heightMin: (857 * 0.8) / 4,
    }

    let viewBox = {
        x: 200,
        y: 140,
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

        // Calculate the maximum allowed translation in x and y directions (30% of viewBox dimensions)
        let maxTranslateX = (boundBox.widthMax / minScale) * 0.8;
        let maxTranslateY = (boundBox.heightMax / minScale) * 0.9;
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
        let oldScale = scaleSVG;
        scaleSVG *= deltaY < 0 ? 1 + zoomFactor : 1 / (1 + zoomFactor);
        scaleSVG = Math.max(minScale, Math.min(maxScale, scaleSVG)); // Set reasonable limits for zoom

        // Coordinates adjustment to focus zoom on cursor position
        let cursorX = e.clientX - svg.offset().left; // Cursor's x-coordinate relative to the SVG
        let cursorY = e.clientY - svg.offset().top;  // Cursor's y-coordinate relative to the SVG

        let scaleChange = scaleSVG / oldScale;

        let oldX = viewBox.x;
        let oldY = viewBox.y;

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
            viewBox.x = viewBox.x + svgPoint.svgX * cursorPercentX * 0.1;
            viewBox.y = viewBox.y + svgPoint.svgY * cursorPercentY * 0.1;

            // Debug
            //console.log('cursorPercentX:', cursorPercentX, 'cursorPercentY:', cursorPercentY);
            //console.log('svgPoint.svgX:', svgPoint.svgX, 'svgPoint.svgY:', svgPoint.svgY, 'viewBox.x:', viewBox.x, 'viewBox.y:', viewBox.y, 'scaleSVG:', scaleSVG, 'scaleChange:', scaleChange);
        } else { // Zooming out
            // Calculate the new viewBox dimensions based on the scale change
            //  console.log()
            console.log("Before", viewBox.width, viewBox.height);
            //    let newWidth = Math.min(viewBox.width / scaleChange, boundBox.widthMax);
            //   let newHeight = Math.min(viewBox.height / scaleChange, boundBox.heightMax);
            let newWidth = Math.min(boundBox.widthMax / scaleSVG, boundBox.widthMax / minScale);
            let newHeight = Math.min(boundBox.heightMax / scaleSVG, boundBox.heightMax / minScale);

            console.log("After", viewBox.width, viewBox.height);
            // Interpolate towards the origin (0,0) for xOffset and yOffset
            //  viewBox.x = boundBox.xOffset*0.05 + viewBox.x*0.99;// - (boundBox.xOffset - viewBox.x * scaleChange) * 0.95;
            //  viewBox.y = boundBox.yOffset*0.05 + viewBox.y*0.99;// - (boundBox.yOffset - viewBox.y * scaleChange) * 0.95;

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


        // console.log('oldX:', oldX, 'oldY:', oldY, 'viewBox.x:', viewBox.x, 'viewBox.y:', viewBox.y, 'scaleSVG:', scaleSVG, 'scaleChange:', scaleChange);
        //  console.log('Ratio X', viewBox.x/oldX, 'Ratio Y', viewBox.y/oldY, 'Ratio Width', viewBox.width/newWidth, 'Ratio Height', viewBox.height/newHeight);


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
        $('.container .clickable-child').css('pointer-events', 'none');
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
        $('.container .clickable-child').css('pointer-events', '');
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
    });

    svg.on('touchmove', function (e) {
        if (isPanning && e.touches.length === 1) {
            let touch = e.touches[0];
            movePanning(touch.clientX, touch.clientY);
        }
    });

    svg.on('touchend touchcancel', function (e) {
        if (isPanning) {
            endPanning();
        }
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
});