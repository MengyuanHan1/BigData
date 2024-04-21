var label = ui.Label('这是一个标签');
var button = ui.Button({
  label: '点击我',
  onClick: function() {
    label.setValue('按钮已被点击');
  }
});
var selectBox = ui.Select({
  items: ['选项1', '选项2', '选项3'],
  onChange: function(value) {
    label.setValue('你选择了 ' + value);
  }
});
var slider = ui.Slider({
  min: 0,
  max: 100,
  value: 50,
  step: 1,
  onChange: function(value) {
    label.setValue('滑块值: ' + value);
  }
});


var panel = ui.Panel({
    widgets: [label, button, selectBox, slider],
    style: {width: '400px', padding: '8px'}
  });
  

  ui.root.add(panel);
