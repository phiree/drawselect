/* 不再使用 仅供参考.*/
$.fn.DrawSelect = function (options) {

    var params = $.extend({
        'mouse_up': null,
        'container':'#container'
    }, options);
    var that = $("#container");
    var status = ['fixed', 'current'];
    var is_mouse_down = false;
    var lastDrawDivStartPosition = {left: 0, top: 0};
    var childrenDivs = that.children("div");
    //将div相关数值放入变量, 供便利,替代直接遍历div引起的性能问题.
    var childrenDataList = [];
    for (var c = 0; c < childrenDivs.length; c++) {
        var currentChild = $(childrenDivs[c]);
        var left = currentChild.offset().left;
        var top = currentChild.offset().top;
        var outerHeight = currentChild.outerHeight(true);
        var outerWidth = currentChild.outerWidth(true);
        var childData = {index: c, left: left, top: top, outerHeight: outerHeight, outerWidth: outerWidth};
        childrenDataList.push(childData);
    }
    $(window).mousedown(function (e) {
        is_mouse_down = true;
        var drawDiv = $('.draw');
        if (drawDiv.length == 0) {
            drawDiv = $("<div class='draw' style='position:absolute'></div>");//创建划框div
            that.append(drawDiv);
        }
        lastDrawDivStartPosition.left = e.pageX;//划框的起始位置
        lastDrawDivStartPosition.top = e.pageY;
        drawDiv.css({
            'left': lastDrawDivStartPosition.left + 'px',
            'top': lastDrawDivStartPosition.top + 'px',
            width: 0,
            height: 0
        });//drawDiv.css(lastDrawDivStartPosition);
        e.preventDefault();
        ChangeSelectedStatus();
        $(window).on('mouseover', function (e) {
            if (is_mouse_down) {
                ChangeSelectedStatus();
                console.log("entered");
            }
        });

    });
    $(window).mouseup(function (e) {
        childrenDivs.removeAttr('fixed');
        $('.selected').attr('fixed', 'fixed')
        is_mouse_down = false;
        params.mouse_up($('.selected'));
        $(this).off("mouseover");
    });
    $(window).mousemove(function (e) {

        if (is_mouse_down) {
            var lastDrawDiv = $(".draw:last");
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
            lastDrawDiv.css({width: width_abs + 2 + 'px', height: height_abs + 2 + 'px'});
        }
        //e.preventDefault();
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


    function ChangeSelectedStatus() {
        var last_draw_div = $(".draw:last");
        var draw_div_data = {
            left: last_draw_div.offset().left,
            top: last_draw_div.offset().top,
            outerHeight: last_draw_div.outerHeight(true),
            outerWidth: last_draw_div.outerWidth(true)
        };

        for (var i = 0; i < childrenDataList.length; i++) {

            $divdata = childrenDataList[i];

            var overlayed = collision($divdata, draw_div_data);
            $div = $(childrenDivs[i]);
            if (overlayed) {

                if ($div.attr('fixed') == "fixed") {
                    $div.removeClass('selected');
                }

                else {
                    $div.addClass('selected');
                }
            }
            else {
                if ($div.attr('fixed') != "fixed") {

                    $div.removeClass('selected');
                }
            }

        }

    }


}

