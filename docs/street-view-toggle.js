/**
 * Interactive Street View Pegman Toggle with Smooth Transition
 * 
 * Features:
 * - Custom pegman button with animations
 * - Smooth transition when entering/exiting Street View
 * - Visual indicators when Street View is available
 * - Responsive design that works on all screen sizes
 */
(function() {
  console.log("[StreetViewToggle] Initializing Interactive Street View Toggle");
  
  // Wait for map to be fully loaded
  let initAttempts = 0;
  const maxAttempts = 10;
  
  function initialize() {
    if (initAttempts >= maxAttempts) {
      console.log("[StreetViewToggle] Maximum attempts reached, aborting initialization");
      return;
    }
    
    initAttempts++;
    
    // Check if Google Maps is loaded
    if (!window.google || !window.google.maps || !window.map) {
      console.log("[StreetViewToggle] Google Maps not loaded yet, retrying in 1 second...");
      setTimeout(initialize, 1000);
      return;
    }
    
    console.log("[StreetViewToggle] Google Maps detected, setting up Street View toggle");
    setupStreetViewToggle();
  }
  
  // Start initialization
  setTimeout(initialize, 1500);
  
  // Main setup function
  function setupStreetViewToggle() {
    try {
      // Get map instance
      const map = window.map;
      
      // Create custom controls container if it doesn't exist
      let customControls = document.querySelector('.custom-map-controls');
      if (!customControls) {
        customControls = document.createElement('div');
        customControls.className = 'custom-map-controls';
        document.body.appendChild(customControls);
        
        // Apply styles to container
        Object.assign(customControls.style, {
          position: 'absolute',
          zIndex: '1000',
          right: '10px',
          top: '100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        });
      }
      
      // Create Street View toggle button
      const streetViewButton = document.createElement('div');
      streetViewButton.className = 'street-view-toggle';
      streetViewButton.innerHTML = `
        <div class="pegman-container">
          <div class="pegman-icon"></div>
          <div class="ripple-effect"></div>
        </div>
      `;
      
      // Add button to custom controls
      customControls.appendChild(streetViewButton);
      
      // Add styles for the button and animations
      addCustomStyles();
      
      // Create Street View instance
      const panorama = new google.maps.StreetViewPanorama(
        document.createElement('div'), // Temporary container
        {
          addressControl: false,
          linksControl: true,
          panControl: true,
          enableCloseButton: true
        }
      );
      
      // Keep reference to panorama
      window.streetViewPanorama = panorama;
      
      // Set panorama as the Street View for the map
      map.setStreetView(panorama);
      
      // Initialize Street View service for availability checks
      const streetViewService = new google.maps.StreetViewService();
      
      // Track Street View state
      let isInStreetView = false;
      let streetViewAvailable = false;
      
      // Add click handler to toggle button
      streetViewButton.addEventListener('click', function() {
        if (isInStreetView) {
          // Exit Street View
          exitStreetView();
        } else if (streetViewAvailable) {
          // Enter Street View at current position
          enterStreetView();
        } else {
          // Check if Street View is available at current center
          checkStreetViewAvailability(map.getCenter());
        }
      });
      
      // Add map event listeners
      map.addListener('center_changed', function() {
        // Check Street View availability when map center changes
        checkStreetViewAvailability(map.getCenter());
      });
      
      // Check Street View availability at current position
      function checkStreetViewAvailability(position) {
        streetViewService.getPanorama({ location: position, radius: 50 }, function(data, status) {
          if (status === google.maps.StreetViewStatus.OK) {
            streetViewAvailable = true;
            streetViewButton.classList.add('available');
            
            // Update panorama position
            window.streetViewLocation = data.location.latLng;
          } else {
            streetViewAvailable = false;
            streetViewButton.classList.remove('available');
          }
        });
      }
      
      // Enter Street View mode
      function enterStreetView() {
        if (!streetViewAvailable || !window.streetViewLocation) return;
        
        // Backup current map state
        window.mapStateBeforeStreetView = {
          center: map.getCenter(),
          zoom: map.getZoom()
        };
        
        // Add transition overlay
        const transitionOverlay = createTransitionOverlay();
        document.body.appendChild(transitionOverlay);
        
        // Start transition
        setTimeout(() => {
          transitionOverlay.classList.add('active');
          
          // Set panorama position and make it visible
          panorama.setPosition(window.streetViewLocation);
          
          // After transition completes, show Street View
          setTimeout(() => {
            map.setStreetView(panorama);
            
            // Update button state
            isInStreetView = true;
            streetViewButton.classList.add('active');
            
            // Complete transition
            transitionOverlay.classList.remove('active');
            setTimeout(() => {
              document.body.removeChild(transitionOverlay);
            }, 500);
          }, 500);
        }, 50);
      }
      
      // Exit Street View mode
      function exitStreetView() {
        // Add transition overlay
        const transitionOverlay = createTransitionOverlay();
        document.body.appendChild(transitionOverlay);
        
        // Start transition
        setTimeout(() => {
          transitionOverlay.classList.add('active');
          
          // After transition completes, exit Street View
          setTimeout(() => {
            panorama.setVisible(false);
            
            // Restore previous map state if available
            if (window.mapStateBeforeStreetView) {
              map.setCenter(window.mapStateBeforeStreetView.center);
              map.setZoom(window.mapStateBeforeStreetView.zoom);
            }
            
            // Update button state
            isInStreetView = false;
            streetViewButton.classList.remove('active');
            
            // Complete transition
            transitionOverlay.classList.remove('active');
            setTimeout(() => {
              document.body.removeChild(transitionOverlay);
            }, 500);
          }, 500);
        }, 50);
      }
      
      // Create transition overlay element
      function createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'street-view-transition-overlay';
        
        Object.assign(overlay.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'white',
          opacity: '0',
          transition: 'opacity 0.5s ease',
          zIndex: '1500',
          pointerEvents: 'none'
        });
        
        return overlay;
      }
      
      // Check initial Street View availability
      checkStreetViewAvailability(map.getCenter());
      
      console.log("[StreetViewToggle] Street View toggle initialized successfully");
    } catch (error) {
      console.error("[StreetViewToggle] Error during initialization:", error);
    }
  }
  
  // Add custom styles for the Street View toggle
  function addCustomStyles() {
    if (document.getElementById('street-view-toggle-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'street-view-toggle-styles';
    style.textContent = `
      .street-view-toggle {
        width: 40px;
        height: 40px;
        background-color: white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        transform: scale(1);
      }
      
      .street-view-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
      }
      
      .street-view-toggle.available {
        background-color: #FFD700;
      }
      
      .street-view-toggle.active {
        background-color: #4285F4;
      }
      
      .pegman-container {
        width: 24px;
        height: 24px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .pegman-icon {
        width: 20px;
        height: 20px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M12 11v8"/><path d="M8 15h8"/><path d="M16 19l-4 4"/><path d="M8 19l4 4"/></svg>');
        background-repeat: no-repeat;
        background-position: center;
        transition: all 0.3s ease;
      }
      
      .street-view-toggle.available .pegman-icon {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
      }
      
      .street-view-toggle.active .pegman-icon {
        filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.5));
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M12 11v8"/><path d="M8 15h8"/><path d="M16 19l-4 4"/><path d="M8 19l4 4"/></svg>');
      }
      
      .ripple-effect {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(255, 215, 0, 0.3);
        opacity: 0;
        transform: scale(0);
        transition: all 0.6s ease-out;
      }
      
      .street-view-toggle.available:hover .ripple-effect {
        opacity: 1;
        transform: scale(1.5);
      }
      
      .street-view-transition-overlay.active {
        opacity: 0.7 !important;
      }
    `;
    
    document.head.appendChild(style);
  }
})();