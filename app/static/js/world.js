$(document).ready(function () {

    var selectedPaths = []; // Array to store the currently selected paths
    var currentMode = 0; // Default mode
    var selectOnly = [];

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
            if (timeSinceLastTouch < 500 && timeSinceLastTouch > 0) {
                // Trigger double click if it's a quick successive touch
                $('#submitAnswerButton').trigger('click');
            } else {
                // Handle single tap
                if(currentMode === 0) {
                    selectPathMode0(this);
                }
                else if (currentMode === 1) {
                    selectPathMode1(this);
                }
                resetSVGStyles(this);
            }
            lastTouchTime = now;
        }

        let lastTouchTime = 0; // to store the time of the last touch

        if (currentMode === 0) {
            $('#answerInput').on('input', function () {
                resetSVGStyles(); // Reset all highlights first
                highlightPathFromInput_Mode0(); // Then apply new highlight based on the mode
            });
            $('#svg-container svg path').on('click', function () {
                selectPathMode0(this);
                resetSVGStyles(this);
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
                resetSVGStyles(this);
            });
        }
    }

    // Function to reset SVG path styles to default
    function resetSVGStyles(path) {
        let className = $(path).attr('class');
        $('#svg-container svg path').each(function () {
            if (selectOnly.includes(className) || selectOnly.length == 0) {
                $(this).css({
                    'fill': '',
                    'stroke': '',
                    'stroke-width': ''
                });
            }
        });

        for (selectedPath of selectedPaths) {
            $(selectedPath).css({
                'fill': 'green',
                'stroke': '#225522',
                'stroke-width': '2'
            });
        }
    }

    // Highlight a path function for mouseover
    function highlightPath(path) {
        let className = $(path).attr('class');
        if (selectOnly.includes(className) || selectOnly.length == 0) {
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
        selectedPaths = [pathClass]; // Reset and select new path
        var className = $(path).attr('class'); // Get the class attribute of the clicked path
        if (className) {
            className = className.replace(/_/g, ' '); // Replace all underscores with spaces
            $('#answerInput').val(className);
            updateSelectedCountriesDisplay(className);
        }
        resetSVGStyles();
    }

    function selectPathMode1(path) {
        let countryName = $(path).attr('class');
        let pathClass = '#svg-container svg path.' + countryName;
        if (selectedPaths.includes(pathClass)) {
            selectedPaths = selectedPaths.filter(p => p !== pathClass); // Toggle off
            updateSelectedCountriesDisplay(countryName);
        } else {
            selectedPaths.push(pathClass);
            updateSelectedCountriesDisplay(countryName);
        }
        resetSVGStyles();
    }

    function updateSelectedCountriesDisplay(country) {
        if (!$('#tab-' + country.replace(/\s+/g, '-')).length) { // Check if the tab does not already exist
            var tab = $('<div/>', {
                id: 'tab-' + country.replace(/\s+/g, '-'),
                class: 'country-tab',
                text: country,
                click: function () {
                    $(this).remove();
                    adjustTabsPosition(); // Adjust the remaining tabs' positions
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
            }, 10); // Timeout ensures the CSS is applied after the tab is rendered
            adjustTabsPosition(); // Adjust positions of all tabs to accommodate the new one
            $(document).trigger('tabs-update');
        } else {
            $('#tab-' + country.replace(/\s+/g, '-')).remove(); // Remove the tab if it already exists
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

    $('#modeSwitchButton').on('click', function () {
        currentMode = (currentMode === 0 ? 1 : 0); // Toggle mode
        selectedPaths = []; // Clear selections on mode change
        resetSVGStyles();
        attachInputHandlers(); // Re-attach input handlers based on new currentMode
        console.log('Mode switched to:', currentMode);
    });

    // Get Random Question Button & Response Handling
    $('#getQAcountries').on('click', function () {
        $.ajax({
            url: '/get-random-qa#countries',
            type: 'GET',
            success: function (response) {
                $('#question').text(response.question); // Display the question
                $('#answerInput').val(''); // Clear previous answer
                $('#feedback').text(''); // Clear previous feedback
                if (response.type === "<class 'list'>") {
                    currentMode = 1;
                    selectedPaths = []
                    resetSVGStyles();
                    attachInputHandlers();
                } else if (response.type === "<class 'str'>") {
                    currentMode = 0;
                    selectedPaths = []
                    resetSVGStyles();
                    attachInputHandlers();
                }
                resetSVGStyles();
                selectedPath = null; // Clear selected path
            },
            error: function (error) {
                console.log("Error fetching question:", error);
            }
        });
    });

    // Submit Answer Button & Response Handling
    $('#submitAnswerButton').on('click', function () {
        var selectedCountries = selectedPaths.map(function (path) {
            return $(path).attr('class').replace(/_/g, ' ');  // Convert class to country name
        });
        var answerData = {
            answer: selectedCountries,  // Always send as an array
            question: $('#question').text()
        };
        $.ajax({
            url: '/check-answer#countries',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(answerData),
            success: function (response) {
                $('#feedback').text(response.is_correct ? 'Correct!' : 'Incorrect. Try again!');
                resetSVGStyles();
                selectedPath = null; // Clear selected path on submission
            },
            error: function (error) {
                console.log("Error checking answer:", error);
            }
        });
    });

    //////////////////////////////////////
    //        Area lock functions       //
    //////////////////////////////////////

    $('#zoomToEurope').on('click', function () {
        console.log("before")
        // Example viewBox values for Europe, these would need to be adjusted to your specific SVG
        viewBox.x = 0;
        viewBox.y = 0;
        scale = minScale;
        updateTransform();
        $('#svg-container svg').attr('viewBox', '500 -50 1000 500');
        $('svg path').each(function () {
            var pathClass = $(this).attr('class');
            var formattedClass = pathClass.replace(/_/g, ' '); // Replace underscores with spaces

            // Check if the class of the path is not in the list of European countries
            if ($.inArray(formattedClass, europeanCountries) === -1) {
                // Apply CSS if not found in the list
                $(this).css({
                    'stroke-width': '0.4083586658048981',
                    'stroke': '#333',
                    'stroke-opacity': '1',
                    'fill': '#fff7ec',
                    'fill-opacity': '1'
                });
            }
        });
        selectOnly = europeanCountries;
    });

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
        let newRatio = Math.max(rawNewRatio, 0.9);
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

        // Calculate new viewBox dimensions
        let newWidth = boundBox.widthMax / scaleSVG;
        let newHeight = boundBox.heightMax / scaleSVG;

        console.log('newWidth:', newWidth, 'newHeight:', newHeight, 'scaleSVG:', scaleSVG);

        let scaleChange = scaleSVG / oldScale;

        viewBox.width = newWidth;
        viewBox.height = newHeight;

        let oldX = viewBox.x;
        let oldY = viewBox.y;

        // Adjust viewBox to keep the zoom centered on the cursor
        if (deltaY < 0) { // Zooming in
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
            let newWidth = Math.min(viewBox.width / scaleChange, boundBox.widthMax);
            let newHeight = Math.min(viewBox.height / scaleChange, boundBox.heightMax);

            // Calculate the linear interpolation factor for moving towards the offsets
            let lerpFactor = 0.01; // You can adjust this factor to control the speed of convergence

            // Interpolate towards the origin (0,0) for xOffset and yOffset
            viewBox.x = boundBox.xOffset - (boundBox.xOffset - viewBox.x * scaleChange) * 0.95;
            viewBox.y = boundBox.yOffset - (boundBox.yOffset - viewBox.y * scaleChange) * 0.95;

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

    let touchX = 0, touchY = 0;

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

    $('#zoomtoEurope').on('click', function () {
        console.log("before")
        // Example viewBox values for Europe, these would need to be adjusted to your specific SVG
        viewBox.x = 0;
        viewBox.y = 0;
        updateViewBox();
        $('#svg-container svg').attr('viewBox', '500 -50 1000 500');
        console.log("?");
        $('svg path').each(function () {
            var pathClass = $(this).attr('class');
            // Check if the class of the path is not in the list of European countries
            if ($.inArray(pathClass, europeanCountries) === -1) {
                // Apply CSS if not found in the list
                $(this).css({
                    'stroke-width': '0.4083586658048981',
                    'stroke': '#333',
                    'stroke-opacity': '1',
                    'fill': '#fff7ec',
                    'fill-opacity': '1'
                });
            }
        });
    });


    $(window).resize(function () {
        adjustContainerMargin(); // Call this function to adjust margins whenever the window is resized
    });

    // Function to adjust margins dynamically based on the number of tabs
    function adjustContainerMargin() {
        var tabsHeight = $('#tabsContainer').outerHeight(true); // true includes margin in the calculation
        $('.container').css('margin-bottom', tabsHeight + 'px'); // Apply bottom margin to '.container'
    }

    // Trigger this adjustment when tabs are added or removed
    $(document).on('tabs-update', adjustContainerMargin); // Custom event when tabs change





});