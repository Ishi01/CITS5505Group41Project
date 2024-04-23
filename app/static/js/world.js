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
    const zoomFactor = 0.2; // Set the zoom factor
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
    
    // Prevent default behavior for an event
    function stopEvent(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    
    // Mouse wheel zoom
    svg.on('wheel', function(e) {
        stopEvent(e); // Stop scrolling and other default behaviors
        var oldScale = scale; // Store the old scale
        // Determine the zoom direction and adjust the scale
        scale *= e.originalEvent.deltaY < 0 ? 1 + zoomFactor : 1 / (1 + zoomFactor);
    
        // Constrain scale to the maximum and minimum zoom levels
        scale = Math.min(Math.max(scale, minScale), maxScale);
    
        // Calculate the factor by which the scale changed
        var scaleChange = scale / oldScale;
    
        // Get the center coordinates of the screen
        var centerX = e.clientX - window.innerWidth / 2;
        var centerY = e.clientY - window.innerHeight / 2;
        console.log(centerX, centerY);
        console.log(window.innerWidth, window.innerHeight);
    
        // Calculate new translations to zoom into the center of the screen
        translateX = scaleChange * (translateX - centerX) + centerX + 20;
        translateY = scaleChange * (translateY - centerY) + centerY;
        updateTransform(); // Apply the new transformations
    });
        

    // Mouse down to start panning
    svg.on('mousedown', function(e) {
        if (e.button === 0) { // Left mouse button
            stopEvent(e);
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            svg.css('cursor', 'grabbing');
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
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
        if (e.button === 0 && isPanning) { // Left mouse button
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

    // Touch support for mobile devices
    svg.on('touchstart', function(e) {
        e.preventDefault();
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

