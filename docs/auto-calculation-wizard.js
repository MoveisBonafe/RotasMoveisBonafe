/**
 * Intelligent Auto-Calculation Wizard
 * 
 * This advanced calculator provides intelligent route optimization with:
 * - Smart velocity calculation based on road types
 * - Traffic pattern predictions
 * - Accurate time estimates considering stops
 * - Fuel consumption estimation
 * - Cost comparison
 */
(function() {
  console.log("🧙 [AutoWizard] Initializing Intelligent Auto-Calculation Wizard");

  // Constants and configuration
  const CONFIG = {
    // Base velocity (km/h) for different road types
    velocities: {
      highway: 100,     // Highways, motorways
      urban: 40,        // Urban areas, cities
      rural: 70,        // Rural roads, countryside
      default: 90       // Default when road type is unknown
    },
    
    // Time adjustments
    timeFactors: {
      trafficFactor: 1.1,   // 10% increase in travel time for normal traffic
      stopTimeMins: 15,     // Average time spent at each stop (minutes)
      restTimeMins: 30,     // Required rest time every 4 hours of driving
    },
    
    // Fuel consumption estimation (L/100km)
    fuelConsumption: {
      highway: 9,       // Highway consumption
      urban: 12,        // Urban consumption
      rural: 10,        // Rural roads consumption
      default: 10       // Default consumption
    },
    
    // Cost factors
    costs: {
      fuelPricePerLiter: 5.5,  // Fuel price in currency/liter
      driverCostPerHour: 60,   // Driver cost per hour
      vehicleCostPerKm: 0.5,   // Vehicle maintenance cost per km
    }
  };
  
  // State variables
  let routeData = {
    normal: null,
    optimized: null
  };
  
  // Initialization
  function initialize() {
    console.log("🧙 [AutoWizard] Setting up event listeners and observers");
    
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupWizard);
    } else {
      setupWizard();
    }
    
    // Retry setup after a delay to ensure everything is loaded
    setTimeout(setupWizard, 1500);
    setTimeout(setupWizard, 3000);
  }
  
  // Setup the wizard functionality
  function setupWizard() {
    // Intercept the route buttons
    interceptButtons();
    
    // Set up an observer to detect when route info is displayed or changed
    setupRouteObserver();
    
    // Process any existing route data
    processExistingRouteData();
  }
  
  // Intercept route calculation buttons
  function interceptButtons() {
    // Find the route buttons
    const visualizeButton = document.getElementById("visualize-button");
    const optimizeButton = document.getElementById("optimize-button");
    
    // Intercept Visualize button
    if (visualizeButton) {
      const originalClick = visualizeButton.onclick;
      visualizeButton.onclick = function(event) {
        console.log("🧙 [AutoWizard] Visualize button clicked");
        
        // Call original click handler
        if (originalClick) {
          originalClick.call(this, event);
        }
        
        // Process route after a delay to allow Google Maps to calculate
        setTimeout(() => processRouteData("normal"), 1000);
        setTimeout(() => processRouteData("normal"), 2000);
      };
      console.log("🧙 [AutoWizard] Visualize button intercepted");
    }
    
    // Intercept Optimize button
    if (optimizeButton) {
      const originalClick = optimizeButton.onclick;
      optimizeButton.onclick = function(event) {
        console.log("🧙 [AutoWizard] Optimize button clicked");
        
        // Call original click handler
        if (originalClick) {
          originalClick.call(this, event);
        }
        
        // Process route after a delay to allow Google Maps to calculate
        setTimeout(() => processRouteData("optimized"), 1000);
        setTimeout(() => processRouteData("optimized"), 2000);
      };
      console.log("🧙 [AutoWizard] Optimize button intercepted");
    }
  }
  
  // Set up an observer to detect when route info is displayed or changed
  function setupRouteObserver() {
    // Find the container for route information
    const routeInfoContainer = document.getElementById("bottom-info");
    if (!routeInfoContainer) {
      console.log("🧙 [AutoWizard] Route info container not found, will retry later");
      return;
    }
    
    // Create a mutation observer to watch for changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === "childList" || mutation.type === "subtree") {
          // Check if this is a route information update
          const routeInfo = document.getElementById("route-info");
          if (routeInfo) {
            // Determine the route type (normal or optimized)
            const routeType = routeInfo.innerHTML.includes("Rota Otimizada") ? 
                             "optimized" : "normal";
            
            // Process the route data
            processRouteData(routeType);
          }
        }
      });
    });
    
    // Start observing
    observer.observe(routeInfoContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log("🧙 [AutoWizard] Route observer set up");
  }
  
  // Process any existing route data on the page
  function processExistingRouteData() {
    const routeInfo = document.getElementById("route-info");
    if (routeInfo) {
      // Determine the route type
      const routeType = routeInfo.innerHTML.includes("Rota Otimizada") ? 
                       "optimized" : "normal";
      
      // Process the route data
      processRouteData(routeType);
    }
  }
  
  // Process route data and enhance with intelligent calculations
  function processRouteData(routeType) {
    console.log(`🧙 [AutoWizard] Processing ${routeType} route data`);
    
    // Get the route info element
    const routeInfo = document.getElementById("route-info");
    if (!routeInfo) {
      console.log("🧙 [AutoWizard] Route info element not found");
      return;
    }
    
    // Extract distance from the HTML
    const distanceMatch = routeInfo.innerHTML.match(/Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i);
    if (!distanceMatch) {
      console.log("🧙 [AutoWizard] Could not extract distance from route info");
      return;
    }
    
    // Parse the distance
    const distance = parseFloat(distanceMatch[1].replace(',', '.'));
    
    // Get stop count (number of waypoints)
    const stopsMatch = routeInfo.innerHTML.match(/Paradas:<\/strong>\s*(\d+)/i);
    const stops = stopsMatch ? parseInt(stopsMatch[1]) : 0;
    
    // Calculate estimated road types based on distance and locations
    const roadTypes = estimateRoadTypes(distance, stops);
    
    // Calculate travel time based on intelligent factors
    const travelTimeData = calculateTravelTime(distance, roadTypes, stops);
    
    // Calculate costs
    const costData = calculateCosts(distance, travelTimeData.travelTimeHours, roadTypes);
    
    // Store the route data for comparison
    routeData[routeType] = {
      distance: distance,
      travelTime: travelTimeData.travelTimeHours,
      stops: stops,
      roadTypes: roadTypes,
      costs: costData
    };
    
    // Update the route information display
    updateRouteDisplay(routeInfo, routeType, distance, travelTimeData, costData);
    
    console.log(`🧙 [AutoWizard] ${routeType} route processed`, routeData[routeType]);
  }
  
  // Estimate the road types based on distance and locations
  function estimateRoadTypes(distance, stops) {
    // Simplified estimation of road types based on total distance and stops
    let roadTypes = {
      highway: 0,
      urban: 0,
      rural: 0
    };
    
    if (distance < 30) {
      // Short routes are likely more urban
      roadTypes.urban = 0.7;
      roadTypes.rural = 0.2;
      roadTypes.highway = 0.1;
    } else if (distance < 100) {
      // Medium routes have a mix
      roadTypes.urban = 0.3;
      roadTypes.rural = 0.3;
      roadTypes.highway = 0.4;
    } else {
      // Long routes are predominantly highway
      roadTypes.urban = 0.1;
      roadTypes.rural = 0.2;
      roadTypes.highway = 0.7;
    }
    
    // Adjust for number of stops - more stops usually means more urban driving
    if (stops > 2) {
      // Increase urban driving with more stops
      const urbanIncrease = Math.min(0.3, stops * 0.05);
      roadTypes.urban += urbanIncrease;
      roadTypes.highway -= urbanIncrease * 0.7;
      roadTypes.rural -= urbanIncrease * 0.3;
      
      // Ensure percentages don't go negative or exceed 1
      roadTypes.highway = Math.max(0.05, roadTypes.highway);
      roadTypes.rural = Math.max(0.05, roadTypes.rural);
      
      // Normalize to ensure they sum to 1
      const total = roadTypes.urban + roadTypes.rural + roadTypes.highway;
      roadTypes.urban /= total;
      roadTypes.rural /= total;
      roadTypes.highway /= total;
    }
    
    return roadTypes;
  }
  
  // Calculate intelligent travel time based on multiple factors
  function calculateTravelTime(distance, roadTypes, stops) {
    // Calculate base travel time using weighted average of speeds by road type
    const baseTimeHours = 
      (distance * roadTypes.highway / CONFIG.velocities.highway) +
      (distance * roadTypes.urban / CONFIG.velocities.urban) +
      (distance * roadTypes.rural / CONFIG.velocities.rural);
    
    // Apply traffic factor
    const trafficAdjustedTime = baseTimeHours * CONFIG.timeFactors.trafficFactor;
    
    // Add time for stops
    const stopTime = (stops * CONFIG.timeFactors.stopTimeMins) / 60; // Convert to hours
    
    // Add mandatory rest periods for long drives
    const restPeriods = Math.floor(trafficAdjustedTime / 4); // Rest every 4 hours
    const restTime = (restPeriods * CONFIG.timeFactors.restTimeMins) / 60; // Convert to hours
    
    // Total travel time in hours
    const travelTimeHours = trafficAdjustedTime + stopTime + restTime;
    
    // Convert to hours and minutes for display
    const hours = Math.floor(travelTimeHours);
    const minutes = Math.round((travelTimeHours - hours) * 60);
    
    return {
      travelTimeHours: travelTimeHours,
      hours: hours,
      minutes: minutes,
      baseTimeHours: baseTimeHours,
      stopTimeHours: stopTime,
      restTimeHours: restTime
    };
  }
  
  // Calculate trip costs
  function calculateCosts(distance, travelTimeHours, roadTypes) {
    // Calculate fuel consumption based on road types
    const fuelConsumption =
      (distance * roadTypes.highway * CONFIG.fuelConsumption.highway / 100) +
      (distance * roadTypes.urban * CONFIG.fuelConsumption.urban / 100) +
      (distance * roadTypes.rural * CONFIG.fuelConsumption.rural / 100);
    
    // Calculate fuel cost
    const fuelCost = fuelConsumption * CONFIG.costs.fuelPricePerLiter;
    
    // Calculate driver cost
    const driverCost = travelTimeHours * CONFIG.costs.driverCostPerHour;
    
    // Calculate vehicle maintenance cost
    const vehicleCost = distance * CONFIG.costs.vehicleCostPerKm;
    
    // Total cost
    const totalCost = fuelCost + driverCost + vehicleCost;
    
    return {
      fuelConsumption: fuelConsumption,
      fuelCost: fuelCost,
      driverCost: driverCost,
      vehicleCost: vehicleCost,
      totalCost: totalCost
    };
  }
  
  // Update the route information display with enhanced data
  function updateRouteDisplay(routeInfoElement, routeType, distance, travelTimeData, costData) {
    // Format the time for display
    const timeDisplay = `${travelTimeData.hours}h ${travelTimeData.minutes}min`;
    
    // Update the time in the existing HTML
    let updatedHtml = routeInfoElement.innerHTML.replace(
      /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
      `Tempo estimado:</strong> ${timeDisplay}`
    );
    
    // Check if we should add a comparison
    if (routeType === "optimized" && routeData.normal) {
      // Calculate the differences
      updatedHtml = addComparisonToDisplay(updatedHtml, routeData.normal, routeData.optimized);
    }
    
    // Update the HTML
    if (updatedHtml !== routeInfoElement.innerHTML) {
      routeInfoElement.innerHTML = updatedHtml;
      console.log(`🧙 [AutoWizard] Updated route display for ${routeType} route`);
    }
  }
  
  // Add comparison data to the optimized route display
  function addComparisonToDisplay(html, normalRoute, optimizedRoute) {
    // Calculate differences
    const distanceDiff = normalRoute.distance - optimizedRoute.distance;
    const timeDiff = normalRoute.travelTime - optimizedRoute.travelTime;
    const costDiff = normalRoute.costs.totalCost - optimizedRoute.costs.totalCost;
    
    // Calculate percentages
    const distancePercent = (distanceDiff / normalRoute.distance * 100).toFixed(1);
    const timePercent = (timeDiff / normalRoute.travelTime * 100).toFixed(1);
    const costPercent = (costDiff / normalRoute.costs.totalCost * 100).toFixed(1);
    
    // Determine text and colors
    const distanceText = distanceDiff > 0 ? "Economia" : "Aumento";
    const timeText = timeDiff > 0 ? "Economia" : "Aumento";
    const costText = costDiff > 0 ? "Economia" : "Aumento";
    
    const distanceColor = distanceDiff > 0 ? "#4CAF50" : "#F44336";
    const timeColor = timeDiff > 0 ? "#4CAF50" : "#F44336";
    const costColor = costDiff > 0 ? "#4CAF50" : "#F44336";
    
    // Format time difference
    const hoursDiff = Math.floor(Math.abs(timeDiff));
    const minutesDiff = Math.round((Math.abs(timeDiff) - hoursDiff) * 60);
    const timeDiffFormatted = hoursDiff > 0 ? 
                             `${hoursDiff}h ${minutesDiff}min` : 
                             `${minutesDiff} minutos`;
    
    // Create comparison HTML
    const comparisonHtml = `
      <div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p><strong>Comparação com rota não otimizada:</strong></p>
        <p>Distância: <span style="color: ${distanceColor}">
          ${distanceText} de ${Math.abs(distanceDiff).toFixed(1)} km (${Math.abs(distancePercent)}%)
        </span></p>
        <p>Tempo: <span style="color: ${timeColor}">
          ${timeText} de ${timeDiffFormatted} (${Math.abs(timePercent)}%)
        </span></p>
        <p>Custo estimado: <span style="color: ${costColor}">
          ${costText} de R$ ${Math.abs(costDiff).toFixed(2)} (${Math.abs(costPercent)}%)
        </span></p>
        <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
          Análise inteligente considera tipos de estrada e paradas.
        </p>
      </div>
    `;
    
    // If there's already a comparison section, replace it
    if (html.includes("route-comparison")) {
      return html.replace(/<div class="route-comparison">(.*?)<\/div>/s, comparisonHtml);
    } else {
      // Otherwise add it at the end
      return html + comparisonHtml;
    }
  }
  
  // Start the wizard
  initialize();
})();