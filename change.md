### User Interface

1. Create a map instance and Set the center point and zoom level of the map. Focus on the country that needs to be analysed.

```js
Map.setCenter(21.0842, 31.9395, 10);

var admin = ee.FeatureCollection("projects/ee-hanmengyuan9/assets/libya");
var geometry=admin.filter(ee.Filter.eq('shapeName','Al Marj'));

// Add the filtered feature collection to the map
Map.addLayer(geometry,{color:'grey'},'Al Marj');

// Add Google Satellite imagery to the map
Map.setOptions('SATELLITE');

// Set the map center to the area of interest
Map.centerObject(geometry, 8);
```

2. User interface layout

The UI design is structured to facilitate the interpretation and analysis of data regarding flooded regions.  The layout can be divided into distinct zones: the map visualization area, area selection and the statistical information panel.

The map visualization provides a geographical representation of the affected areas, employing a color-coded legend for immediate visual differentiation between various categories such as 'Affected Cropland', 'Affected Built-up', 'Flooded Areas', and 'Affected Building Footprints'.  The choice of contrasting colors enhances the readability of the data on a spatial scale. 

```js
// Load the products we generated
var Affected_Builtup = ee.Image('projects/ee-zhengying11140/assets/Affected_Builtup');
var Flooded_Population = ee.Image('projects/ee-zhengying11140/assets/Flooded_Population');
var Flooded_Areas = ee.Image('projects/ee-zhengying11140/assets/Flooded_Areas');
var Classification_Result = ee.Image('projects/ee-zhengying11140/assets/Classification_Result');
var Affected_Cropland = ee.Image('projects/ee-zhengying11140/assets/Affected_Cropland');
var BuildingFootprints = ee.Image('projects/ee-zhengying11140/assets/MaskedClassPrediction');

// Set raster pixels with no value to transparent
var Flooded_Areas_Unmasked = Flooded_Areas.unmask(0).selfMask();
var Affected_Cropland_Unmasked = Affected_Cropland.unmask(0).selfMask();
var Affected_Builtup_Unmasked = Affected_Builtup.unmask(0).selfMask();
var BuildingFootprints_Unmasked = BuildingFootprints.unmask(0).selfMask();

// Define visualisation parameters for flooded areas and affected cropland
// affected built-up land and affected building footprints
var floodedAreasVis = {
  palette: ['blue'],
  opacity: 0.7
};

var affectedCroplandVis = {
  palette: ['yellow'],
  opacity: 0.7
};

var affectedBuiltuplandVis = {
  palette: ['red'],
  opacity: 0.7
};

var affectedBuildingFootprintsVis = {
  palette: ['#050509'],
  opacity: 0.7
};

// Add layers accordingly
Map.addLayer(Flooded_Areas_Unmasked, floodedAreasVis, 'Flooded Areas');
Map.addLayer(Affected_Cropland_Unmasked, affectedCroplandVis, 'Affected Cropland');
Map.addLayer(Affected_Builtup_Unmasked, affectedBuiltuplandVis, 'Affected Built-up');
Map.addLayer(BuildingFootprints_Unmasked, affectedBuildingFootprintsVis, 'Affected Building Footprints');
```


On the top-left of the UI is a tool bar which enables the user to freely select the area they wish to analyse.

```js
// Create a drawing tool
var drawingTools = Map.drawingTools();
drawingTools.setShown(true);
```


On the right side of  the map is the statistical information panel, which presents crucial data in a concise, tabulated format.  This includes metrics such as affected cropland area (in hectares), affected built-up area, affected population, total flood area, and the total area under consideration.  The numerical data is clearly delineated which directly answer the questions examined in this project. If the user want to choose another area, he can click the "clear" button on the bottom of the panel and repeat the process of selecting.

```js
// Create a panel to display the statistics and clear button
var panel = ui.Panel({
  style: {
    position: 'bottom-right',
    width: '250px',
    padding: '8px',
    backgroundColor: 'white',
    fontFamily: 'Arial',
    fontSize: '14px'
  }
});

// Create a title label
var titleLabel = ui.Label({
  value: 'Flood Impact Statistics',
  style: {fontWeight: 'bold', fontSize: '18px', margin: '10px 0'}
});

// Create labels to display the statistics
var croplandLabel = ui.Label({style: {color: '#CD8B0E', fontSize: '16px'}});
var buildlandLabel = ui.Label({style: {color: 'red', fontSize: '16px'}});
var populationLabel = ui.Label({style: {color: 'green', fontSize: '16px'}});
var floodAreaLabel = ui.Label({style: {color: '#415FC1', fontSize: '16px'}});
var totalAreaLabel = ui.Label({style: {color: '#243F81', fontSize: '16px'}});

// Create a clear button
var clearButton = ui.Button({
  label: 'Clear',
  style: {backgroundColor: '#FF5722', color: 'black', fontSize: '14px', margin: '10px 0'},
  onClick: function() {
    drawingTools.layers().reset();
    croplandLabel.setValue('');
    buildlandLabel.setValue('');
    populationLabel.setValue('');
    floodAreaLabel.setValue('');
    totalAreaLabel.setValue('');
  }
});

// Add the labels and clear button to the panel
panel.add(titleLabel);
panel.add(ui.Label('Affected Cropland (ha):'));
panel.add(croplandLabel);
panel.add(ui.Label('Affected Built-up (ha):'));
panel.add(buildlandLabel);
panel.add(ui.Label('Affected Population:'));
panel.add(populationLabel);
panel.add(ui.Label('Flood Area (ha):'));
panel.add(floodAreaLabel);
panel.add(ui.Label('Total Area (ha):'));
panel.add(totalAreaLabel);
panel.add(clearButton);

```
On the left-bottom is a panel of lengend, which represents different color of the land use.

```js
// Create a legend panel
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px'
  }
});

// Create a legend title
var legendTitle = ui.Label({
  value: 'Legend',
  style: {fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0'}
});

legend.add(legendTitle);

// Create a legend row
var makeRow = function(color, name) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });
  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

// Add legend items
legend.add(makeRow('yellow', 'Affected Cropland'));
legend.add(makeRow('red', 'Affected Built-up'));
legend.add(makeRow('#415FC1', 'Flooded Areas'));
legend.add(makeRow('#050509', 'Affected Building Footprints'));

// Add the legend to the map
Map.add(legend);
```

4. Data transmission



The code loads a series of pre-generated raster images representing different aspects of the flood impact such as 'Affected Builtup', 'Flooded Population', etc.  These rasters are processed to set non-valued pixels to transparent, which would allow for overlaying them on the map without obscuring other layers.

```js
// Load the products we generated
var Affected_Builtup = ee.Image('projects/ee-zhengying11140/assets/Affected_Builtup');
var Flooded_Population = ee.Image('projects/ee-zhengying11140/assets/Flooded_Population');
var Flooded_Areas = ee.Image('projects/ee-zhengying11140/assets/Flooded_Areas');
var Classification_Result = ee.Image('projects/ee-zhengying11140/assets/Classification_Result');
var Affected_Cropland = ee.Image('projects/ee-zhengying11140/assets/Affected_Cropland');
var BuildingFootprints = ee.Image('projects/ee-zhengying11140/assets/MaskedClassPrediction');
```

When the user selects an area on the map, the onDraw event triggers data capture. Then, a variable aoi is returned, which represents geometry, and this variable is brought into the function calculateFloodImpactStats for calculation. The equations are encapsulated to calculate the full range of values required. When the user needs to calculate new data, just refresh the value of aoi, which is very efficient.

```js
// Listen for the draw end event
drawingTools.onDraw(function(geometry) {
  // Get the drawn geometry
  var aoi = geometry;
  
  // Display a calculating message
  croplandLabel.setValue('Calculating...');
  buildlandLabel.setValue('Calculating...');
  populationLabel.setValue('Calculating...');
  floodAreaLabel.setValue('Calculating...');
  totalAreaLabel.setValue('Calculating...');
  
  // Call the calculation function and update the labels
  var stats = calculateFloodImpactStats(Affected_Cropland, Affected_Builtup, Flooded_Population, Flooded_Areas, BuildingFootprints, 'VV', aoi);
  ```


A function calculateFloodImpactStats is defined to compute statistics such as the area of affected cropland and built-up land in hectares, the number of affected population, and the area of flooded regions, based on the pixel values of the respective images within the selected AOI.  The calculations use GEE's reduction methods over the specified region at a defined scale.

```js
function calculateFloodImpactStats(Affected_Cropland, Affected_Builtup, Flooded_Population, Flooded_Areas, BuildingFootprints, polarization, aoi) {
  // Calculate the area of each affected cropland pixel
  var affectedCroplandArea = Affected_Cropland.multiply(ee.Image.pixelArea());

  // Calculate the sum of the affected cropland area
  var croplandStats = affectedCroplandArea.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 10, 
    maxPixels: 1e9
  });

  var croplandAreaHectares = ee.Number(croplandStats.get('b1')).divide(10000).round();

  // Calculate the area of each affected built-up land pixel
  var affectedBuildlandArea = Affected_Builtup.multiply(ee.Image.pixelArea());

  // Calculate the sum of the affected built-up land area
  var buildlandStats = affectedBuildlandArea.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 10,
    maxPixels: 1e9
  });

  var buildlandAreaHectares = ee.Number(buildlandStats.get('b1')).divide(10000).round();

  // Calculate the number of affected population
  var populationStats = Flooded_Population.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 100,
    maxPixels: 1e9
  });

  var affectedPopulation = ee.Number(populationStats.get('b1')).round();

  // Calculate the area of flooded regions
  var flood_pixelarea = Flooded_Areas.multiply(ee.Image.pixelArea());

  var flood_stats = flood_pixelarea.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 10,
    bestEffort: true
  });

  var flood_area_ha = ee.Number(flood_stats.get('b1')).divide(10000).round();


  // Calculate the total area of the selected AOI
  var totalArea = ee.Image.pixelArea().reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 10,
    maxPixels: 1e13
  });

  var totalAreaHectares = ee.Number(totalArea.get('area')).divide(10000).round();

 // Return an object containing all the calculated results
  return {
    croplandAreaHectares: croplandAreaHectares,
    buildlandAreaHectares: buildlandAreaHectares,
    affectedPopulation: affectedPopulation,
    floodAreaHectares: flood_area_ha,
    totalAreaHectares: totalAreaHectares
  };
}

```