// 全局变量，用于保存用户绘制的AOI
var drawnAOI = null;

// 创建右侧面板用于显示按钮和结果
var console = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    position: 'top-right',
    padding: '8px 15px',
    width: '350px'
  }
});

// Add the panel to the map.
Map.add(console);

// 创建用于获取AOI信息和处理的函数
var getData = function() {
  // 获取用户绘制的AOI
  drawnAOI = Map.drawingTools().layers().get(0).toGeometry();
  console.add(ui.Label('Area computed!')); // 或者其他的一些处理
  // 这里可以添加其他基于AOI的分析，例如查询、统计等
};

// 添加用于启动绘制AOI的按钮
var drawButton = ui.Button({
  label: 'Draw AOI',
  style: { width: '100%' },
  onClick: function() {
    // 清除之前的绘制
    Map.drawingTools().clear();
    // 设置绘制模式为矩形
    Map.drawingTools().setDrawingMode('rectangle');
    // 激活绘制工具，等待用户绘制
    Map.drawingTools().onDraw(getData);
  }
});

// 添加用于清除绘制的按钮
var clearButton = ui.Button({
  label: 'Clear AOI',
  style: { width: '100%' },
  onClick: function() {
    Map.drawingTools().clear(); // 清除绘制的AOI
    drawnAOI = null; // 重置AOI变量
    console.clear(); // 清除面板上的信息
    initializeUI(); // 重新初始化界面
  }
});

// 函数用于初始化界面，显示按钮和信息
var initializeUI = function() {
  console.clear(); // 首先清除控制台
  console.add(ui.Label('Draw an AOI to get information on oil pollution in a specific area.'));
  console.add(drawButton);
  console.add(clearButton);
};

// 调用函数以初始化界面
initializeUI();
