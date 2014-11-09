( function( $, undefined ) {
    var plugname = 'ext_calender';
    var year , month;
    var startDate;
    var elements;
    var separator = false;
    var _click = null;

    $.fn[plugname] = function(params){
        return new Class(this, $.extend(this._defaultStyle , params, {}));
    }
    var Class = function(elem , params){
        elements = elem;
        this.elements = elem;
        this.elements.data(plugname, this)
        year = params['year'];
        month = params['month'];
        separator = params['separator'];
        if (year == undefined)
            year = (new Date()).getFullYear();
        if (month == undefined)
            month = (new Date()).getMonth() + 1;
        if (params['click'] != undefined)
            _click = params['click']
        makeCalender(year , month)
    }
    /// -----------------------------------------------------------------------
    /// @fn             prevMonth
    /// @brief          change previous month
    /// @param[in]      (none)
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.prevMonth = function() {
        month--;
        Class.prototype.Month(month);
    }
    /// -----------------------------------------------------------------------
    /// @fn             nextMonth
    /// @brief          change next month
    /// @param[in]      (none)
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.nextMonth = function() {
        month++;
        Class.prototype.Month(month);
    }
    /// -----------------------------------------------------------------------
    /// @fn             Month
    /// @brief          set monthly number
    /// @param[in]      number of month
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.Month = function(mm) {
        if (mm == undefined)
            return month;
        if (month == mm) return;
        month = mm;
        makeCalender(year , month);
    }
    /// -----------------------------------------------------------------------
    /// @fn             prevYear
    /// @brief          change previous year
    /// @param[in]      (none)
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.prevYear = function() {
        year--;
        Class.prototype.Year(year);
    }
    /// -----------------------------------------------------------------------
    /// @fn             nextYear
    /// @brief          change next year
    /// @param[in]      (none)
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.nextYear = function() {
        year++;
        Class.prototype.Year(year);
    }
    /// -----------------------------------------------------------------------
    /// @fn             Year
    /// @brief          set year number
    /// @param[in]      number of year
    /// @param[out]     (none)
    /// @return         (none)
    /// -----------------------------------------------------------------------
    Class.prototype.Year = function(yy) {
        if (yy == undefined)
            return year;
        if (year == yy) return;
        year = yy;
        makeCalender(year , month);
    }
    
    Class.prototype.setYearMonth = function(yy , mm) {
        year = yy;
        month = mm;
        makeCalender(year , month);
    }
    /// -----------------------------------------------------------------------
    /// @fn             getDayElement
    /// @brief          day element
    /// @details        get element of inner html in 'div' tag
    /// @param[in]      number of day
    /// @param[out]     (none)
    /// @return         jQuery selected object
    /// -----------------------------------------------------------------------
    Class.prototype.getDayElement = function(day) {
        var id = '#' + year + convertNum(month,2) + convertNum(day,2);
        var e = $(id);
        return e;
    }
    ///////////////////////////////////////////////////////////////////////////
    //
    //
    // The following functions are private functions.
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function makeCalender(year , month){
        elements.html('');
        var wk = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
        var headcls = ['ext-cal-sun-header','ext-cal-day-header','ext-cal-day-header','ext-cal-day-header','ext-cal-day-header','ext-cal-day-header','ext-cal-sat-header'];
        startDate = new Date(year , month - 1, 1);
        endDate = new  Date(year , month , 1);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        startDate.setDate(startDate.getDate() - startDate.getDay());
        // make header
        var thead = $('<thead>');
        for (var w = 0 ; w < 7 ; w++){
            thead.append($('<th>').text(wk[w]).addClass('ext-cal-header').addClass(headcls[w]));
        }
        
        var tbody = $('<tbody>');
        startSr = getSerial(startDate);
        endSr = getSerial(endDate);
        var dy = new Date()
        var tr =$('<tr>');
        for (var w = startSr ; w <= endSr ; w+=86400000){
            dy.setTime(w);
            console.log(dy.toLocaleString());
            var id = dy.getFullYear() + convertNum(dy.getMonth()+1,2) + convertNum(dy.getDate(),2)
            var td = $('<td>').addClass('ext-cal-day')
                .append($('<div>').addClass('ext-cal-datenumber').text(dy.getDate()))
            if (separator) {
                td.append($('<hr>').addClass('ext-cal-separator'));
            }
            td.append($('<div>').attr({id:id})
              .addClass('ext-cal-string'))
              .attr({date_serial:w, year:dy.getFullYear(),month:dy.getMonth(),day:dy.getDate()});
            if (dy.getMonth() + 1 != month){
                td.addClass('ext-cal-transparent');
            }
            if (dy.getDay() == 0){
                tr = $('<tr>');
                td.addClass('ext-cal-sun');
                tr.append(td);
            } else if (dy.getDay() == 6) {
                td.addClass('ext-cal-sat');
                tr.append(td);
                tbody.append(tr);
            } else {
                td.addClass('ext-cal-week')
                tr.append(td);
            }
        }
        elements.addClass('ext-cal').append(thead).append(tbody);
        
        elements.ext_tables({
            click : function(params) {
                var serial = $(params['cell']).attr('date_serial');
                var dt = new Date();
                dt.setTime(serial);
                params['date'] = dt;
                _click($(params['cell']) , params);
            } ,
        });
        function getSerial(dt){
            var yy = dt.getFullYear();
            var MM = dt.getMonth();
            var dd = dt.getDate();
            var hh = dt.getHours();
            var mm = dt.getMinutes();
            var srl = Date.UTC(yy,MM,dd,hh,mm,0);
            return srl;
        }
    }
    function convertNum(num, figures) {
        var str = String(num);
        if (str.length > figures){
            str2 = new String();
            for (var i=str.length-1;i >= 0;i--) {
                str2 = str.charAt(i) + str2;
                if (str2.length == figures)
                    break;
            }
            str = str2;
        }
        while (str.length < figures) {
            str = "0"+str;
        }
        return str;
    }
})(jQuery);
