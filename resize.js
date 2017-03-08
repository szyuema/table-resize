/*
    *create by mayue
    *@desc 传入表格id，进行列拖拽功能实现
    * @date 2017-3-7
*/


    /*
        * @desc 传入元素节点，返回当前元素宽度值
        * @date 2017-3-7
    */
    function parseWidth(x) {
        return parseFloat(x.style.width.replace('px', ''));
    }

    /*
        * @desc 传入事件，进行事件阻断
        * @date 2017-3-7
    */
    function preventEvent(e) {
        var ev = e || window.event;
        if (ev.preventDefault) ev.preventDefault();
        else ev.returnValue = false;
        if (ev.stopPropagation)
            ev.stopPropagation();
        return false;
    }



    /*
        * @desc 传入事件，进行事件阻断
        * @date 2017-3-7
    */
    function getWidth(x) {
        if (x.currentStyle)
            // in IE
            var y = x.clientWidth - parseInt(x.currentStyle["paddingLeft"]) - parseInt(x.currentStyle["paddingRight"]);
            // for IE5: var y = x.offsetWidth;
        else if (window.getComputedStyle)
            // in Gecko
            var y = document.defaultView.getComputedStyle(x, null).getPropertyValue("width");
        return y || 0;
    }

    function setCookie(name, value, expires, path, domain, secure) {
        // document.cookie = name + "=" + escape(value) +
        // 	((expires) ? "; expires=" + expires : "") +
        // 	((path) ? "; path=" + path : "") +
        // 	((domain) ? "; domain=" + domain : "") +
        // 	((secure) ? "; secure" : "");
    }

    function getCookie(name) {
        //var cookie = " " + document.cookie;
        //var search = " " + name + "=";
        //var setStr = null;
        //var offset = 0;
        //var end = 0;
        //if (cookie.length > 0) {
        //    offset = cookie.indexOf(search);
        //    if (offset != -1) {
        //        offset += search.length;
        //        end = cookie.indexOf(";", offset)
        //        if (end == -1) {
        //            end = cookie.length;
        //        }
        //        setStr = unescape(cookie.substring(offset, end));
        //    }
        //}
        //return (setStr);
    }


    // main class prototype
    function TableResize(item) {
        var tablelist = []; //存储表
        var dragColumnslist = [];//存储表第一行的列 ,用于改变宽度

        for (j = 0; j < item.tableid.length; j++) {
            var table = document.getElementById(item.tableid[j]);
            if (!table || (table.tagName != 'TABLE')) {
                console.log("第" + i + "个表id 有误，不是表或者找不到表");
                return;//如果不是表 结束
            } else {
                tablelist.push(table);
                if (!table.rows[0]) {
                    console.log("第" + i + "个表没有元素");
                    return//如果表没有元素 结束
                } else {
                    //todo 当前列隐藏
                    dragColumnslist.push(table.rows[0].cells)
                }
                if (j > 0 && (dragColumnslist[j - 1].length != dragColumnslist[j].length)) {
                    console.log("表列数不一致");
                    return;
                }
            }
        }

        var minwidth = item.minwidth || 80;
        var maxwidth = item.maxwidth ||400;

        //this.id1 = table.id;
        //this.id2 = table2.id;
        var self = this;

        var dragColumnNo; // current dragging column
        var dragX;        // last event X mouse coordinate
        var saveOnmouseup;   // save document onmouseup event handler
        var saveOnmousemove; // save document onmousemove event handler
        var saveBodyCursor;  // save body cursor property

        this.changeColumnWidth = function (no, w) {
            var dragColumns = dragColumnslist[0];
            if (!dragColumns) return false;
            if (no < 0) return false;

            if ((parseInt(dragColumns[no].style.width) + w) > maxwidth) return;
            if ((parseInt(dragColumns[no].style.width) + w) < minwidth) {
                var width = '80px';
            } else {
                var width = parseInt(dragColumns[no].style.width) + w + 'px';
            }
            dragColumns[no].style.width = width;

            //设置表的宽度
            var len = 0;
            for (var i = 0; i < dragColumns.length; i++) {
                len = len + parseWidth(dragColumns[i]);
            }
            if (len < i * minwidth) {
                len = i * minwidth;
            }
            table.style.width = len + 'px';


            for (var i = 0; i < tablelist.length; i++) {
                tablelist[i].style.width = len + 'px';
                dragColumnslist[i][no].style.width = dragColumns[no].style.width;
            }
            return true;
        }

        this.columnDrag = function (e) {
            var e = e || window.event;
            var X = e.clientX || e.pageX;
            if (!self.changeColumnWidth(dragColumnNo, X - dragX)) {
                self.stopColumnDrag(e);
            }
            dragX = X;
            // prevent other event handling
            preventEvent(e);
            return false;
        }

        // ============================================================
        // stops column dragging
        this.stopColumnDrag = function (e) {
            var e = e || window.event;
            var dragColumns = dragColumnslist[0];
            if (!dragColumns) return;
            // restore handlers & cursor
            document.onmouseup = saveOnmouseup;
            document.onmousemove = saveOnmousemove;
            document.body.style.cursor = saveBodyCursor;

            // remember columns widths in cookies for server side
            var colWidth = '';
            var separator = '';
            for (var i = 0; i < dragColumns.length; i++) {
                colWidth += separator + parseInt(getWidth(dragColumns[i]));
                separator = '+';
            }
            var expire = new Date();
            expire.setDate(expire.getDate() + 365); // year
            document.cookie = self.id + '-width=' + colWidth +
                '; expires=' + expire.toGMTString();

            preventEvent(e);
        }

        // ============================================================
        // init data and start dragging
        this.startColumnDrag = function (e) {
            var e = e || window.event;
            // if not first button was clicked
            //if (e.button != 0) return;
            // remember dragging object
            dragColumnNo = (e.target || e.srcElement).parentNode.parentNode.cellIndex;
            dragX = e.clientX || e.pageX;
            // set up current columns widths in their particular attributes
            // do it in two steps to avoid jumps on page!
            var colWidth = new Array();
            var dragColumns = dragColumnslist[0];
            for (var i = 0; i < dragColumns.length; i++)
                colWidth[i] = parseInt(getWidth(dragColumns[i])) < minwidth ? minwidth : parseInt(getWidth(dragColumns[i]));

            for (var i = 0; i < dragColumns.length; i++) {
                for (var j = 0; j < dragColumnslist.length; j++) {
                    dragColumnslist[j][i].style.width = ""; // for sure
                    dragColumnslist[j][i].style.width = colWidth[i] + "px";
                }
            }

            saveOnmouseup = document.onmouseup;
            document.onmouseup = self.stopColumnDrag;

            saveBodyCursor = document.body.style.cursor;
            document.body.style.cursor = 'w-resize';

            // fire!
            saveOnmousemove = document.onmousemove;
            document.onmousemove = self.columnDrag;

            preventEvent(e);
        }

        for (var k = 0; k < tablelist.length; k++) {
            var table = tablelist[k];
            for (var i = 0; i < table.rows.length; i++) {
                var tabrow = table.rows[i].cells;
                for (var j = 0; j < tabrow.length; j++) {
                    if (i == 0) {
                        tabrow[j].style.width = minwidth + "px";
                    }
                    tabrow[j].innerHTML = "<div style='position:relative;height:100%;width:100%'>" +
                "<div style='" +
                "position:absolute;height:100%;width:5px;margin-right:-5px;" +
                "left:100%;top:0px;cursor:w-resize;z-index:10;'>" +
                "</div>" +
                tabrow[j].innerHTML +
                "</div>";
                    // BUGBUG: calculate real border width instead of 5px!!!
                    tabrow[j].firstChild.firstChild.onmousedown = this.startColumnDrag;
                }
            }
            table.style.width = minwidth * j + 'px';
        }

        //table.getElementsByTagName("thead")[0] && (table.getElementsByTagName("thead")[0].style.width = table.style.width);
        //table.getElementsByTagName("tbody")[0] && (table.getElementsByTagName("tbody")[0].style.width = table.style.width);
    }


