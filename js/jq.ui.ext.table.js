( function( $, undefined ) {
    var plugname = 'ext_tables';
    var isedited = false;
    var isEdit = false;
    var isSort = false;
    var clickDisableRows = new Array();
    var tableListData = new Array();
    var sortOrderFlag = new Array();
    var editFlag = new Array();
    var tableId = '';

    var _default = {
                        searchBox : false ,
                        isEdit : false ,
                        isSort : false ,
                        click : null ,
                        dblclick : null ,
                        headclick : null ,
                        change : null ,
                        
                        search : null ,
                        sorted : null ,
                   };
    $.fn[plugname] = function(params){
        return new Class(this, $.extend(this._defaultStyle , params, {}));
    }
    var Class = function(elem , params){
        tableId = elem[0].id;
        this.elements = elem;
        this.elements.data(plugname, this)
        _default = $.extend(_default, params);
        getListData();
        setClickMethod();
        if (_default['searchBox'])
            setSearchRows(elem);
    }
    /// -----------------------------------------------------------------------
    /// @fn             descendingOrder
    /// @brief          descending order
    /// @details        This method performs rearrangement in descending order in the specified column. 
    /// @param[in]      colIndex    A colmun is specified numerically. 
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.descendingOrder = function(colIndex) {
        sortOrderFlag[colIndex] = -1;
        sortList(colIndex , sortOrderFlag[colIndex]) ;
    }
    /// -----------------------------------------------------------------------
    /// @fn             ascendingOrder
    /// @brief          ascending order 
    /// @details        This method performs rearrangement in ascending order in the specified column. 
    /// @param[in]      colIndex    A colmun is specified numerically. 
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.ascendingOrder = function(colIndex) {
        sortOrderFlag[colIndex] = 1;
        sortList(colIndex , sortOrderFlag[colIndex]) ;
    }
    /// -----------------------------------------------------------------------
    /// @fn             toggleOrder
    /// @brief          Order tggle
    /// @details        This method replaces an order of the specified column. 
    /// @param[in]      colIndex    A colmun is specified numerically. 
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.toggleOrder = function(colIndex) {
        sortOrderFlag[colIndex] *= -1;
        sortList(colIndex , sortOrderFlag[colIndex]) ;
    }
    /// -----------------------------------------------------------------------
    /// @fn             search(keywords)
    /// @brief          Data is narrowed down.  
    /// @details        Only the data in which this function suits the keyword specified from the table displays. 
    /// @n              Each element of an argument [keywords] corresponds to each row of a table. 
    /// @param[in]      keywords    specifies in arrangement. 
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.search = function(keywords) {
        searchData(keywords);
    }
    /// -----------------------------------------------------------------------
    /// @fn             search(keywords)
    /// @brief          Data is narrowed down.  
    /// @details        This method searches a table with the value of a search box. 
    /// @param[in]      (none)
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.inputSearch = function() {
        var keywords = new Array();
        var inputs = $('#'+ tableId +' thead tr > th > input');
        inputs.each(function(i){
            keywords.push($(this).val());
        });
        searchData(keywords);
    }
    Class.prototype.setEditEnable = function(row , col , flag) {
        editFlag[row][col] = flag;
    }
    Class.prototype.getEditEnable = function(row , col) {
        return editFlag[row][col];
    }
    Class.prototype.setEditFlags = function(flagArray) {
        editFlag = flagArray;
    }
    ///////////////////////////////////////////////////////////////////////////
    //
    //
    // The following functions are private functions.
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    /// -----------------------------------------------------------------------
    /// @brief          assigns Click-Event to Table-Tag. 
    /// @details        This function is a function which assigns a click event.
    /// @param[in]      (none)
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    function setClickMethod(){
        var rows = $("#" + tableId)[0].rows;
        var isHeader = true;
        // header click
        if (isSort){
            $('#' + tableId + ' thead tr:has(th)').each(function(row) {
                $('#' + tableId + ' thead tr:eq(' + row + ') th').each(function(col) {
                    var objCell = $(this);
                    var text = $(this).text();
                    $(this).click(function(e) {
                        _default.headclick({column:$(this)[0].cellIndex,text:$(this).text()});
                        Class.prototype.toggleOrder($(this)[0].cellIndex);
                    }).mouseover(function(e){
                        $(this).css('cursor','pointer');
                    });
                });
            });
        }
        // cell click
        $('#' + tableId + ' tbody tr').each(function(row) {
            $('#' + tableId + ' tbody tr:eq(' + row + ') > *').each(function(col) {
                var text = $(this).text();
                if ($.inArray(row,clickDisableRows)) {
                    if (this.tagName.toUpperCase() == 'TD') {
                        var param = {'row':row , 'column':col ,'text':text, 'cell':$(this)};
                        $(this).click(function(e){
                            _default.click(param);
                            if (isEdit && editFlag[row][col]){
                                cellEdit($(this));
                            }
                        })
                        .change(function(e){
                            _default.change(param);
                        })
                        .mouseover(function(e){
                            $(this).css('cursor','pointer');
                        });
                    }
                }
            });
        });
    }
    function setSearchRows(objTable){
        var tr = $('<tr>');
        var tableLength = objTable.children().length;
        var thead = $('#'+ objTable[0].id+' thead');
        var thtr = $('#'+ objTable[0].id+' tr:has(th)');
        var cols =  $('#'+ objTable[0].id+ ' thead tr:first').children().length;
        // no thead-tag
        if (tableLength == 1) {
            thead = $('<thead>');
            if (thtr.length != 0)
                thead.append(thtr);
            objTable.prepend(thead);
            cols = thtr.children().length;
        } else if (tableLength == 0) {
            thead = $('<thead>');
            objTable.prepend(thead)
        }
        for (var i = 0 ; i < cols ;i++)
            tr.append($('<th>').css({backgroundColor:'aliceblue'}).append(
            $('<input>').css({width:'98%',border:0,backgroundColor:'transparent'}).keydown(function(e){
                if (e.keyCode == 13) {
                    Class.prototype.inputSearch();
                }
            })));
        thead.append(tr);
        clickDisableRows.push(tr.index());
    }
    /// -----------------------------------------------------------------------
    /// @fn             searchData(keywords)
    /// @brief          Data is narrowed down.  
    /// @details        Only the data in which this function suits the keyword specified from the table displays. 
    /// @n              Each element of an argument [keywords] corresponds to each row of a table. 
    /// @param[in]      keywords    specifies in arrangement. 
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    function searchData(keywords){
        var tbody  = $('#'+ tableId +' tbody tr > *');
        // All the data is displayed.
        $('#'+ tableId+' tbody tr').each(function(i) {
            $('#'+ tableId+' tbody tr:eq(' + i + ')').css('visibility' , 'visible');
        });
        if (keywords.length == 0){
            return;
        }
        // The data which is not applied to conditions is made undisplayed. 
        tbody.each(function(i){
            var cell = this;
            var keyword = keywords[$(this).index()];
            var text = $(this).text();
            var row = $(this)[0].parentElement.rowIndex;
            if (keyword != '' && keyword != null){
                if (text.indexOf(keyword) == -1)
                    $(this.parentElement).css('visibility' , 'collapse');
            }
        });
        // [search] is called.
        _default.search({keywords:keywords});
    }
    function getListData(){
        tableListData = new Array();
        sortOrderFlag = new Array();
        editFlag = new Array();
        $('#'+ tableId+' tbody tr').each(function(row) {
            var rowData = new Array();
            var editData = new Array();
            $('#'+ tableId+' tbody tr:eq(' + row + ') > *').each(function(col){
                rowData[col] = $(this).text();
                editData[col] = true;
            });
            tableListData[row] = rowData;
            editFlag[row] = editData;
        });
        $('#'+ tableId+' tbody tr:first td').each(function(i){
            sortOrderFlag.push(1);
        });
    }
    function cellEdit(cell){
        if (isedited) return;
        isedited = true;
        var input = $('<input>');
        var text = cell.text();
        var row = cell[0].parentElement.rowIndex;
        var col = cell[0].cellIndex;
        var backgound = cell.css('backgroundColor');
        cell.css({backgroundColor:'aliceblue'}).text('').append(input);
        input.attr({type:'text',id:'dateselector'}).val(text)
            .css({width:'99%',height:cell.height() ,backgroundColor:'transparent',border:'0px'})
            .keydown(function(e) {
                if (e.keyCode == 13) {
                    if (input.val() != text)
                        text = input.val();
                    cell.text(text).css('backgroundColor' , backgound);
                    tableListData[row][col] = text;
                    input.remove();
                    isedited = false;
                }
            })
            .blur(function(e) {
                cell.text(text).css('backgroundColor' , backgound);
                input.remove();
                isedited = false;
            }).focus();
    }
    function sortList(col , flag) {
        if (! isSort) return
        tableListData = sort(tableListData,col,flag);
        $.each(tableListData,function(row, data){
            $.each(data , function(col,value){
                $($('#' + tableId + ' tbody tr:eq('+ row +')')[0].cells[col]).text(value);
            });
        });
        _default.sorted({colmun:col , order:flag});
        Class.prototype.inputSearch();
    }
    function sort(sqs,col,order){
        sqs.sort(function(a,b){
            var as = a[col].toString();
            var bs = b[col].toString();
            if (as > bs) return 1 * order; 
            if (as < bs) return -1 * order; 
            return 0; 
         });
         return(sqs);
    }
})(jQuery);
