var admin = ee.FeatureCollection("projects/ee-hanmengyuan9/assets/libya");
// Create a filter to select the element named 'Ghadamis'
var geometry=admin.filter(ee.Filter.eq('shapeName','Al Marj'));

// Adds the filtered element set to the map
Map.addLayer(geometry,{color:'grey'},'Al Marj');

var before_start= '2023-09-01';
var before_end='2023-09-15';

var after_start='2023-09-23';
var after_end='2023-09-30';

//  Selection of Sensor Parameters
var polarization = ("VH","VV");
var pass_direction = "DESCENDING";
var difference_threshold = 1.00;

var aoi=geometry;

var collection= ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', polarization))
  .filter(ee.Filter.eq('orbitProperties_pass',pass_direction)) 
  .filter(ee.Filter.eq('resolution_meters',10))
  .filterBounds(aoi)
  .select(polarization);
  
  
var before_collection = collection.filterDate(before_start, before_end);
var after_collection = collection.filterDate(after_start,after_end);


function dates(imgcol){
        var range = imgcol.reduceColumns(ee.Reducer.minMax(), ["system:time_start"]);
        var printed = ee.String('from ')
          .cat(ee.Date(range.get('min')).format('YYYY-MM-dd'))
          .cat(' to ')
          .cat(ee.Date(range.get('max')).format('YYYY-MM-dd'));
        return printed;
      }
      // print dates of before images to console
      var before_count = before_collection.size();
      print(ee.String('Tiles selected: Before Flood ').cat('(').cat(before_count).cat(')'),
        dates(before_collection), before_collection);
      
      // print dates of after images to console
      var after_count = before_collection.size();
      print(ee.String('Tiles selected: After Flood ').cat('(').cat(after_count).cat(')'),
        dates(after_collection), after_collection);

// Create a mosaic of selected tiles and clip to study area
var before = before_collection.mosaic().clip(aoi);
var after = after_collection.mosaic().clip(aoi);

// Apply reduce the radar speckle by smoothing  
var smoothing_radius = 50;
var before_filtered = before.focal_mean(smoothing_radius, 'circle', 'meters');
var after_filtered = after.focal_mean(smoothing_radius, 'circle', 'meters');

// -------------Area calculation of flood extent------------
// Calculate the difference between the before and after images
var difference = after_filtered.divide(before_filtered);

// Apply the predefined difference-threshold and create the flood extent mask 
var threshold = difference_threshold;
var difference_binary = difference.gt(threshold);

// Refine flood result using additional datasets
      
      // Include JRC layer on surface water seasonality to mask flood pixels from areas
      // of "permanent" water (where there is water > 10 months of the year)
      var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
      var swater_mask = swater.gte(10).updateMask(swater.gte(10));
      
      // Flooded layer where perennial water bodies (water > 10 mo/yr) is assigned a 0 value
      var flooded_mask = difference_binary.where(swater_mask,0);
      // final flooded area without pixels in perennial waterbodies
      var flooded = flooded_mask.updateMask(flooded_mask);
      
      // Compute connectivity of pixels to eliminate those connected to 8 or fewer neighbours
      // This operation reduces noise of the flood extent product 
      var connections = flooded.connectedPixelCount();    
      var flooded = flooded.updateMask(connections.gte(8));
      
      // Mask out areas with more than 5 percent slope using a Digital Elevation Model 
      var DEM = ee.Image('WWF/HydroSHEDS/03VFDEM');
      var terrain = ee.Algorithms.Terrain(DEM);
      var slope = terrain.select('slope');
      var flooded = flooded.updateMask(slope.lt(5));

// Calculate flood extent area
// Create a raster layer containing the area information of each pixel 
var flood_pixelarea = flooded.select(polarization)
  .multiply(ee.Image.pixelArea());

// Sum the areas of flooded pixels
// default is set to 'bestEffort: true' in order to reduce computation time, for a more 
// accurate result set bestEffort to false and increase 'maxPixels'. 
var flood_stats = flood_pixelarea.reduceRegion({
  reducer: ee.Reducer.sum(),              
  geometry: aoi,
  scale: 10, // native resolution 
  //maxPixels: 1e9,
  bestEffort: true
  });


  


//----------------------------------------------------------------------------
var Affected_Builtup = ee.Image('projects/ee-zhengying11140/assets/Affected_Builtup');
var Flooded_Population = ee.Image('projects/ee-zhengying11140/assets/Flooded_Population');
var Flooded_Areas = ee.Image('projects/ee-zhengying11140/assets/Flooded_Areas');
var Classification_Result = ee.Image('projects/ee-zhengying11140/assets/Classification_Result');
var Affected_Cropland = ee.Image('projects/ee-zhengying11140/assets/Affected_Cropland');
var buildingsFootprint = ee.Image('projects/ee-zhengying11140/assets/MaskedClassPrediction');


// Convert the flood extent to hectares (area calculations are originally given in meters)
// ------------------ Flooded Areas ------------

// Calculate the area of each affected field pixel
var TotalFlooded_Area = Flooded_Areas.multiply(ee.Image.pixelArea());

// The total area of farmland affected is calculated
var floodAreaStats = TotalFlooded_Area.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 10, // 使用WorldCover数据集的原始分辨率10m
  maxPixels: 1e9
}); 

var flood_area_ha = ee.Number(floodAreaStats.get('b1')).divide(10000).round();


// ------------------ Cropland ------------

// Calculate the area of each affected field pixel
var affectedCroplandArea = Affected_Cropland.multiply(ee.Image.pixelArea());

// The total area of farmland affected is calculated
var croplandStats = affectedCroplandArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 10, // 使用WorldCover数据集的原始分辨率10m
  maxPixels: 1e9
}); 

var damagedCropLandAreas = ee.Number(croplandStats.get('b1')).divide(10000).round();

// -------------builtup area ----------------

// Calculate the area of each affected pixel
var affectedBuildlandArea = Affected_Builtup.multiply(ee.Image.pixelArea());

// The total area of farmland affected is calculated
var buildlandStats = affectedBuildlandArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 10, 
  maxPixels: 1e9
});

var damagedBuildUpAreas = ee.Number(buildlandStats.get('b1')).divide(10000).round();


// ----------   population ----------- 

var populationStats = Flooded_Population.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 100, 
  maxPixels: 1e9
  //bestEffort: true
});

var estimatedAffectedPopulation = ee.Number(populationStats.get('b1')).round();

  

// ----------- buildings footprint -------------

var buildingFootprintArea = buildingsFootprint.multiply(ee.Image.pixelArea());
var buildingFootprintAreaSum = buildingFootprintArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 10, 
  maxPixels: 1e13
});

var estimatedDamagedBuildings = ee.Number(buildingFootprintAreaSum.get('b1')).divide(10000).round();

  

// -------- Visualizing Results----------

// Create a vertical panel that acts as a container for the entire right panel
var rightPanel = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px',
    width: '250px' 
  },
  layout: ui.Panel.Layout.flow('vertical') // Set the panel vertical layout
});

// Create a panel to display the results
var results = ui.Panel({
  style: {
    padding: '8px',
    margin: '0 0 8px 0' // Add a bottom margin to separate it from the legend panel
  }
});

// Prepare the visualization parameters of the labels
// Defines visual style parameters for text labels
var textVis = {
  'margin':'0px 8px 2px 0px',
  'fontWeight':'bold'
};
var numberVIS = {
  'margin':'0px 0px 15px 0px', 
  'color':'bf0f19',
  'fontWeight':'bold'
};
var subTextVis = {
  'margin':'0px 0px 2px 0px',
  'fontSize':'12px',
  'color':'grey'
};

var titleTextVis = {
  'margin':'0px 0px 15px 0px',
  'fontSize': '18px', 
  'color': '3333ff'
};

// Create text labels for titles and data
var title = ui.Label('Results', titleTextVis);
var text1 = ui.Label('Flood status between:', textVis);
var number1 = ui.Label(after_start.concat(" and ",after_end), numberVIS);

// The default text label is "Please wait..." Then replace it with the actual data
var text2 = ui.Label('Estimated flood extent:', textVis);
var text2_2 = ui.Label('Please wait...', subTextVis);
dates(after_collection).evaluate(function(val){text2_2.setValue('based on Sentinel-1 imagery '+val)});
var number2 = ui.Label('Please wait...', numberVIS); 
flood_area_ha.evaluate(function(val){number2.setValue(val+' hectares')});

//some more data
var text3 = ui.Label('Damaged Built-Up Areas (Ha):', textVis);
var number3 = ui.Label('Please wait...', numberVIS);
damagedBuildUpAreas.evaluate(function(val) {
  number3.setValue(val + ' hectares');
});

var text4 = ui.Label('Damaged Crop Land Areas (Ha):', textVis);
var number4 = ui.Label('Please wait...', numberVIS);
damagedCropLandAreas.evaluate(function(val) {
  number4.setValue(val + ' hectares');
});

var text5 = ui.Label('Estimated Damaged Buildings Land Area (Ha):', textVis);
var number5 = ui.Label('Please wait...', numberVIS);
estimatedDamagedBuildings.evaluate(function(val) {
  number5.setValue(val + ' hectares');
});

var text6 = ui.Label('Estimated Affected Population:', textVis);
var number6 = ui.Label('Please wait...', numberVIS);
estimatedAffectedPopulation.evaluate(function(val) {
  number6.setValue(val.toString());
});




// Get an example of a map drawing tool
var drawingTools = Map.drawingTools();
drawingTools.setLinked(false); // The drawn geometry is not automatically added to the map

// Define a variable to store the AOI
var AOI;

// Set the drawing tool to allow only polygons to be drawn
drawingTools.setDrawModes(['polygon']);

// When the user has finished drawing, the geometry is stored in the AOI variable
drawingTools.onDraw(function(e) {
  AOI = e.feature;
  // Here you can add code to handle AOI, for example for analysis
});

// Update the AOI variable when the user edits the drawing
drawingTools.onEdit(function(e) {
  AOI = e.features.get(0);
});

// Create a button that the user clicks to start drawing the AOI
var drawButton = ui.Button({
  label: 'Draw AOI',
  onClick: function() {
    // Activate drawing mode
    drawingTools.setShape('polygon');
    drawingTools.draw();
  }
});

// Creates a Clear button to clear drawn AOI
var clearButton = ui.Button({
  label: 'Clear',
  onClick: function() {
    // Clears all geometries on the default drawing layer
    drawingTools.clear(); 
    // Reset the AOI variable
    AOI = null;
  }
});

// Create a label that describes the text
var descriptionLabel = ui.Label({
  value: 'This map identifies the locations of likely oil spills using Sentinel-2 imagery from 04/20 to 08/20. Click on the "Layers" tab above to toggle layers. Draw an AOI to get information on oil pollution in a specific area:',
  style: { whiteSpace: 'pre-wrap', fontSize: '13px' }
});

// Create a panel to organize your controls
var controlPanel = ui.Panel({
  widgets: [descriptionLabel, drawButton, clearButton],
  style: { position: 'top-left', padding: '8px 15px' }
});

// Adds a new panel to the map interface
Map.add(controlPanel);



results.add(ui.Panel([
        title,
        text1,
        number1,
        text2,
        text2_2,
        number2,
        text3,
        number3,
        text4,
        number4,
        text5,
        number5,
        text6,
        number6,
       ]
      ));
      
      
      
// Create a function to generate legend items with colors and labels
function createLegendItem(color, label) {
  return ui.Panel({
    widgets: [
      ui.Label('', {
        backgroundColor: color,
        padding: '8px', // Adjust to fit the size of the legend color block
        margin: '0 4px 0 0',
        // verticalAlign: 'middle' // Delete invalid attribute
      }),
      ui.Label(label, {
        margin: '-8px 0 0 4px',
        padding: '8px 0px', // New: Adjust the upper and lower margins of text to align it vertically
        fontSize: '12px'
      })
    ],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
}


// Create a legend panel and add a title
var legend = ui.Panel({
  style: {
    padding: '8px',
    margin: '0'
  }
});
legend.add(ui.Label('Legend', {fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px 0'}));

// Create a legend item using a function and add it to the legend panel
legend.add(createLegendItem('blue', 'Flood'));
legend.add(createLegendItem('#fa0000', 'Built-up'));
legend.add(createLegendItem('#f096ff', 'CropLand'));
legend.add(createLegendItem('purple', 'Damaged Building'));

// Add a splitter between the results panel and the Legend panel
var separatorLine = ui.Panel({
  style: {
    height: '2px',
    backgroundColor: 'black',
    margin: '8px 0'
  }
});

// Add the results panel and Legend panel to the right panel container
rightPanel.add(results);
rightPanel.add(separatorLine); 
rightPanel.add(legend);

// Adds the entire right panel to the map interface
Map.add(rightPanel);
      
//Map.add(results);
//-------------------------------------------------------

// Before and after flood SAR mosaic
Map.centerObject(aoi,8);
Map.addLayer(before_filtered, {min:-25,max:0}, 'Before Flood',0);
Map.addLayer(after_filtered, {min:-25,max:0}, 'After Flood',1);

// Difference layer
Map.addLayer(difference,{min:0,max:2},"Difference Layer",0);

// Flooded areas
Map.addLayer(flooded,{palette:"0000FF"},'Flooded areas');



// The ESA WorldCover 10m v200 dataset was used
var dataset = ee.ImageCollection('ESA/WorldCover/v200')
  .first() // Fetch the first Image
  .select('Map') // Select the 'Map' band
  .clip(aoi);

// Get ESA WorldCover projection information
var worldCoverProjection = dataset.projection();

// Reproject the flood layer to ESA WorldCover scale
var flooded_res = flooded.reproject({
  crs: worldCoverProjection