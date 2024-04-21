
// Convert the flood extent to hectares (area calculations are originally given in meters)  
var flood_area_ha = flood_stats
  .getNumber(polarization)
  .divide(10000)
  .round();
  
// Assuming that these variables are calculated by some GEE server side operation, follow the above according to the above according to the above according to the above change 
var damagedBuildUpAreas = ee.Number(123); // 示例值
var damagedCropLandAreas = ee.Number(456); // 示例值
var estimatedDamagedBuildings = ee.Number(789); // 示例值
var estimatedAffectedPopulation = ee.Number(1000); // 示例值

  
  
// 从这里 从这里开始 从这里开始是 从这里开始是准备 从这里开始是准备做UI

// -------- Visualizing Results----------

// Create a vertical panel that acts as a container for the entire right panel
var rightPanel = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px',
    width: '250px' // Adjust the width as needed
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
      }),
      ui.Label(label, {
        margin: '-8px 0 0 4px',
        padding: '8px 0px', // Adjust the upper and lower margins of the text to align it vertically
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
      
//--------------------------- UI ------------------------------