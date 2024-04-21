// 数据的是-------------shuju-------------
// Convert the flood extent to hectares (area calculations are originally given in meters)  
var flood_area_ha = flood_stats
  .getNumber(polarization)
  .divide(10000)
  .round();
  
// 假设这些变量是通过一些GEE服务器端操作计算出来的， 按照 按照上面 按照上面的按照上面的改一改的 
var damagedBuildUpAreas = ee.Number(123); // 示例值
var damagedCropLandAreas = ee.Number(456); // 示例值
var estimatedDamagedBuildings = ee.Number(789); // 示例值
var estimatedAffectedPopulation = ee.Number(1000); // 示例值

  
  
// 从这里 从这里开始 从这里开始是 从这里开始是准备 从这里开始是准备做UI
// -------- Visualizing Results----------

// 创建一个垂直面板，作为整个右侧面板的容器
var rightPanel = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px',
    width: '250px' // 根据需要调整宽度
  },
  layout: ui.Panel.Layout.flow('vertical') // 设置面板垂直布局
});


// Set position of panel where the results will be displayed 

// var results = ui.Panel({
//   style: {
//     position: 'bottom-left',
//     padding: '8px 15px',
//     width: '350px'
//   }
// });


// 创建一个面板用于结果（results）
var results = ui.Panel({
  style: {
    // 添加或调整样式
    padding: '8px',
    margin: '0 0 8px 0' // 添加下边距以和图例面板分隔
  }
});





// Prepare the visualization parameters of the labels 
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
  'font-weight':'', 
  'color': '3333ff'
  };

// Create labels of the results 
// Title and time period
var title = ui.Label('Results', titleTextVis);
var text1 = ui.Label('Flood status between:',textVis);
var number1 = ui.Label(after_start.concat(" and ",after_end),numberVIS);

// Alternatively, print dates of the selected tiles
//var number1 = ui.Label('Please wait...',numberVIS); 
//(after_collection).evaluate(function(val){number1.setValue(val)}),numberVIS;

// Estimated flood extent 
var text2 = ui.Label('Estimated flood extent:',textVis);
var text2_2 = ui.Label('Please wait...',subTextVis);
dates(after_collection).evaluate(function(val){text2_2.setValue('based on Sentinel-1 imagery '+val)});
var number2 = ui.Label('Please wait...',numberVIS); 
flood_area_ha.evaluate(function(val){number2.setValue(val+' hectares')}),numberVIS;

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
      
      
      
      
      
// 创建图例面板
var legend = ui.Panel({
  style: {
    // 添加或调整样式
    padding: '8px',
    margin: '0'
  }
});
legend.add(ui.Label('Legend', {fontWeight: 'bold'}));
legend.add(ui.Label('CropLand', {backgroundColor: 'yellow', padding: '4px'}));

// 将结果和图例面板添加到右侧面板容器
rightPanel.add(results);
rightPanel.add(legend);

// 将整个右侧面板添加到地图界面
Map.add(rightPanel);
      
//Map.add(results);
//--------------------------- 到 到这里UI 结束结束------------------------------