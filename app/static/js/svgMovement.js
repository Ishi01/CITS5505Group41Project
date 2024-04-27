$(document).ready(function () {
    let svg = $('svg');

    const zoomFactor = 0.1;

    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;

    const originalWidth = 2000;
    const originalHeight = 857;

    let currentWindowWidth = window.innerWidth;
    let currentWindowHeight = window.innerHeight;

    console.log("initial ratio");
    console.log(window.innerWidth / originalWidth);
    console.log(window.innerHeight / originalHeight);

    // Set initial scale based on which dimension (height or width) is the limiting factor
    let scale = Math.max(1.9 * (window.innerWidth / originalWidth), 1.9 * (window.innerHeight / originalHeight));

    // Set max and min scale based on the initial scale logic
    let maxScale = 12 * Math.min(window.innerWidth / originalWidth, window.innerHeight / originalHeight);
    let globlalMin = scale;

    console.log("scale ");
    console.log(scale);
    $(window).resize(setInitialZoom);
    setInitialZoom();  // Calling it initially to set the scale based on the current window size

    // Function to update the transform properties of the SVG
    function updateTransform(scaling = 1) {
        console.log('Initial svg.width: ', svg.width(), 'svg.height: ', svg.height());
        svg.width(window.innerWidth);
        svg.height(window.innerHeight);
        console.log('Updated svg.width: ', svg.width(), 'svg.height: ', svg.height());

        let viewWidth = svg.width();
        let viewHeight = svg.height();

        // Adjust boundary scaling
        let scaledWidth = viewWidth * scale;
        let scaledHeight = viewHeight * scale;
        let boundaryPaddingX = -(viewWidth * 0.40); // Constant padding, could adjust as needed
        let boundaryPaddingY = -(viewHeight * 0.20); // Constant padding, could adjust as needed

        // Compute boundaries based on scaled dimensions
        let minX = -(scaledWidth - viewWidth) / 2 - boundaryPaddingX;
        let maxX = (scaledWidth - viewWidth) / 2 + boundaryPaddingX;
        let minY = -(scaledHeight - viewHeight) / 2 - boundaryPaddingY;
        let maxY = (scaledHeight - viewHeight) / 2 + boundaryPaddingY;

        console.log('window.innerWidth: ', window.innerWidth, 'window.innerHeight: ', window.innerHeight);
        console.log('minX: ', minX, ' maxX: ', maxX, ' minY: ', minY, ' maxY: ', maxY);
        console.log('translateX: ', translateX, ' translateY: ', translateY);

        // Apply dynamic boundaries
        if (scale < 2) {
            minX = 0;
            minY = 0;
        }
        translateX = Math.max(minX, Math.min(maxX, translateX));
        translateY = Math.max(minY, Math.min(maxY, translateY));

        svg.css('transform', `translate(${translateX * scaling}px, ${translateY * scaling}px) scale(${scale})`);

        console.log('Updated scale: ', scale);
        console.log('Updated translateX: ', translateX, ' translateY: ', translateY);
    }


    function setInitialZoom() {

        let heightScaleMax = 12 * (window.innerHeight / originalHeight);
        let weightScaleMax = 12 * (window.innerWidth / originalWidth);
        let heightScaleMin = 1.9 * (window.innerHeight / originalHeight);
        let weightScaleMin = 1.9 * (window.innerWidth / originalWidth);

        let scalingBy = Math.min(window.innerHeight / currentWindowHeight, window.innerWidth / currentWindowWidth);

        currentWindowHeight = window.innerHeight;
        currentWindowWidth = window.innerWidth;

        maxScale = Math.min(heightScaleMax, weightScaleMax, 12);
        minScale = Math.max(heightScaleMin, weightScaleMin, globlalMin);
        //scale = Math.min(Math.max(scale * scalingBy, minScale), maxScale);

        svg.width(window.innerWidth);
        svg.height(window.innerHeight);

        updateTransform(scalingBy);
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
    svg.on('wheel', function (e) {
        stopEvent(e); // Stop scrolling and other default behaviors
        const deltaY = normalizeWheelDelta(e);
        let oldScale = scale;
        scale *= deltaY < 0 ? 1 + zoomFactor : 1 / (1 + zoomFactor);
        scale = Math.min(Math.max(scale, minScale), maxScale);

        let scaleChange = scale / oldScale;

        // Determine if we are zooming in or out
        if (deltaY < 0) { // Zooming in
            let centerX = e.clientX - window.innerWidth / 2;
            let centerY = e.clientY - window.innerHeight / 2;
            translateX = scaleChange * (translateX - centerX * 1.005) + centerX / 1.025;
            translateY = scaleChange * (translateY - centerY * 1.005) + centerY / 1.025;
        } else { // Zooming out
            // Translate towards the center of the screen
            translateX = translateX * 0.8;
            translateY = translateY * 0.8;
        }

        updateTransform();
    });

    // Disable text selection during panning
    svg.on('mousedown touchstart', function (e) {
        svg.css('user-select', 'none');
    });

    // Mouse down to start panning
    svg.on('mousedown', function (e) {
        if (e.button === 0) { // Left mouse button
            stopEvent(e);
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            svg.css('cursor', 'grabbing');
        }
    });

    // Mouse move to handle panning
    $(document).on('mousemove', function (e) {
        if (isPanning) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });

    // Mouse up to end panning
    $(document).on('mouseup', function (e) {
        if (isPanning) {
            isPanning = false;
            svg.css('cursor', 'grab');
        }
    });

    // Mouse leave to end panning
    svg.on('mouseleave', function (e) {
        if (isPanning) {
            isPanning = false;
            svg.css('cursor', 'grab');
        }
    });

    // Touch events for panning on mobile devices
    svg.on('touchstart', function (e) {
        stopEvent(e);
        if (e.touches.length === 1) {
            let touch = e.touches[0];
            isPanning = true;
            startX = touch.clientX - translateX;
            startY = touch.clientY - translateY;
            svg.css('cursor', 'grabbing');
        }
    });

    svg.on('touchmove', function (e) {
        if (isPanning && e.touches.length === 1) {
            let touch = e.touches[0];
            translateX = touch.clientX - startX;
            translateY = touch.clientY - startY;
            updateTransform();
        }
    });

    svg.on('touchend', function (e) {
        if (isPanning) {
            isPanning = false;
            svg.css('cursor', 'grab');
        }
    });
});

