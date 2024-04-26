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
                'fill': 'lightgreen',
                'stroke': '#225522',
                'stroke-width': '2'     
            });
            
        }
        else{
            console.log('not idea');
        }
        updateTransform();
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

    let svg = $('svg'); // Assuming there's only one SVG element
    let scale = 1;
    const zoomFactor = 0.1; // Reduced zoom factor for finer control
    const maxScale = 6; // Maximum zoom level
    const minScale = 0.8; // Minimum zoom level
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;

    // Function to update the transform properties of the SVG
    function updateTransform() {
        svg.css('transform', `translate(${translateX}px, ${translateY}px) scale(${scale})`);
    }

    // Prevent default behavior and stop propagation
    function stopEvent(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    // Normalize wheel event delta
    function normalizeWheelDelta(e) {
        if (e.originalEvent.deltaMode === 1) { // Line mode (typical for mouse wheel)
            return e.originalEvent.deltaY * 15; // Arbitrary factor for normalization
        } else { // Pixel mode (typical for trackpads)
            return e.originalEvent.deltaY;
        }
    }

    // Mouse wheel zoom
    svg.on('wheel', function(e) {
        stopEvent(e); // Stop scrolling and other default behaviors
        const deltaY = normalizeWheelDelta(e);
        var oldScale = scale;
        scale *= deltaY < 0 ? 1 + zoomFactor : 1 / (1 + zoomFactor);

        scale = Math.min(Math.max(scale, minScale), maxScale);
        var scaleChange = scale / oldScale;

        var centerX = e.clientX - window.innerWidth / 2;
        var centerY = e.clientY - window.innerHeight / 2;

        translateX = scaleChange * (translateX - centerX) + centerX;
        translateY = scaleChange * (translateY - centerY) + centerY;
        updateTransform();
    });

    // Disable text selection during panning
    svg.on('mousedown touchstart', function(e) {
        svg.css('user-select', 'none');
    });

    // Mouse down to start panning
    svg.on('mousedown', function(e) {
        if (e.button === 0) { // Left mouse button
            stopEvent(e);
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            svg.css('cursor', 'grabbing');
        }
    });

    // Mouse move to handle panning
    $(document).on('mousemove', function(e) {
        if (isPanning) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });

    // Mouse up to end panning
    $(document).on('mouseup', function(e) {
        if (isPanning) {
            isPanning = false;
            svg.css('cursor', 'grab');
        }
    });

    // Mouse leave to end panning
    svg.on('mouseleave', function(e) {
        if (isPanning) {
            isPanning = false;
            svg.css('cursor', 'grab');
        }
    });

    // Touch events for panning on mobile devices
    svg.on('touchstart', function(e) {
        stopEvent(e);
        if (e.touches.length === 1) {
            let touch = e.touches[0];
            isPanning = true;
            startX = touch.clientX - translateX;
            startY = touch.clientY - translateY;
            svg.css('cursor', 'grabbing');
        }
    });

    svg.on('touchmove', function(e) {
        if (isPanning && e.touches.length === 1) {
            let touch = e.touches[0];
            translateX = touch.clientX - startX;
            translateY = touch.clientY - startY;
            updateTransform();
        }
    });

    svg.on('touchend', function(e) {
        if (isPanning) {
            isPanning = false;
            svg.css('cursor', 'grab');
        }
    });
});

