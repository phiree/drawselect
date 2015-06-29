/*
 插件名称: DrawSelect
 环境: jQuery.
 描述:
 鼠标框选 页面元素.
 传入对象:
 可以被选择的元素集合.
 用法:

 $(".can_be_selected_div").DrawSelect({
 on_select_complete:function(selected_elements){
 for(var s in selected_elements)
 ..........
 .......
 }
 });
 2015-6-27
 */

$.fn.DrawSelect = function (options) {
    var params = $.extend({
        'container':$(document),//包含所有需要框选元素的 容器, 默认是 document.
        'selectable':'selectable', //可以被选取的元素的样式名称.
        'selected_class': 'selected',                //被选中元素的样式
        'drawer_class': 'draw',                      //框的样式.
        'interval_span': 100,                          //计时器循环间隔, 单位:毫秒
        'on_select_complete': function () {
        }     //框选结束(鼠标弹起)后的调用的函数,  传入已选元素的jquery对象列表$(selected_class), 供调用方使用.
    }, options);
    var container=params.container;
    var selectableDivs = $('.'+params.selectable);
    var is_mouse_down = false;
    var lastDrawDivStartPosition = {left: 0, top: 0};
    //将div相关数值放入变量, 供遍历比较,替代直接遍历div引起的性能问题.
    var dataList = [];
    for (var c = 0; c < selectableDivs.length; c++) {
        var currentDiv = $(selectableDivs[c]);
        var left = currentDiv.offset().left;
        var top = currentDiv.offset().top;
        var outerHeight = currentDiv.outerHeight();
        var outerWidth = currentDiv.outerWidth();
        var data = {index: c, left: left, top: top, outerHeight: outerHeight, outerWidth: outerWidth};
        dataList.push(data);
    }

    //鼠标按下,计时器开始,判断画框 和元素的重叠性
    var timeInteval = null;

    container.mousedown(function (e) {

        is_mouse_down = true;
        //创建划框div
        var drawDiv = $("." + params.drawer_class);
        if (drawDiv.length == 0) {
            drawDiv = $("<div class='" + params.drawer_class + "' style='position:absolute'></div>");
            $(document.body).append(drawDiv);
        }
        lastDrawDivStartPosition.left = e.pageX;//划框的起始位置
        lastDrawDivStartPosition.top = e.pageY;
        drawDiv.css({
            'left': lastDrawDivStartPosition.left + 'px',
            'top': lastDrawDivStartPosition.top + 'px',
            width: 0,
            height: 0
        });
        //阻止默认框选事件
        e.preventDefault();

        //循环比较是否被框中.
        timeInteval = setInterval(ChangeSelectedStatus, params.interval_span);

    });
    //鼠标弹起,计时器停止.
    $(window).mouseup(function (e) {
        clearInterval(timeInteval);
        selectableDivs.removeAttr('fixed');
        $('.' + params.selected_class).attr('fixed', 'fixed')
        is_mouse_down = false;
          $("." + params.drawer_class).remove();
        //选中结束
        params.on_select_complete($('.' + params.selected_class));
    });
    //鼠标移动,修改画框大小
    container.mousemove(function (e) {
        if (is_mouse_down) {
            var lastDrawDiv = $('.' + params.drawer_class);
            var width = e.pageX - lastDrawDivStartPosition.left;
            var height = e.pageY - lastDrawDivStartPosition.top;
            var width_abs = Math.abs(width);
            var height_abs = Math.abs(height);
            if (width < 0) {
                lastDrawDiv.css({left: e.pageX})
            }
            if (height < 0) {
                lastDrawDiv.css({top: e.pageY});
            }
            lastDrawDiv.css({width: width_abs + 'px', height: height_abs + 'px'});
        }
        e.preventDefault();
    });
    //判断两个div是否重叠.
    function collision($div1, $div2) {
        var x1 = $div1.left;
        var y1 = $div1.top;
        var h1 = $div1.outerHeight;
        var w1 = $div1.outerWidth;
        var b1 = y1 + h1;
        var r1 = x1 + w1;
        var x2 = $div2.left;
        var y2 = $div2.top;
        var h2 = $div2.outerHeight;
        var w2 = $div2.outerWidth;
        var b2 = y2 + h2;
        var r2 = x2 + w2;

        if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) {
            return false;
        }
        else {
            return true;
        }
    }


//更改 选中状态.
    function ChangeSelectedStatus() {

        var last_draw_div = $('.' + params.drawer_class);
        var draw_div_data = {
            left: last_draw_div.offset().left,
            top: last_draw_div.offset().top,
            outerHeight: last_draw_div.outerHeight(true),
            outerWidth: last_draw_div.outerWidth(true)
        };
        for (var i = 0; i < dataList.length; i++) {
            $divdata = dataList[i];
            var overlayed = collision($divdata, draw_div_data);
            $div = $(selectableDivs[i]);
            if (overlayed) {
                //如果是之前选中的
                if ($div.attr('fixed') == "fixed") {
                    if ($div.hasClass(params.selected_class)) {
                        $div.removeClass(params.selected_class);
                    }
                }
                else {
                    $div.addClass(params.selected_class);
                }
            }
            else {
                //如果不重叠
                if ($div.attr('fixed') != "fixed") {
                    $div.removeClass(params.selected_class);
                }

            }

        }

    }


}

