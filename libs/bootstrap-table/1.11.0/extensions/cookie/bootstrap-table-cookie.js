/**
 * @author: Dennis Hernández
 * @webSite: http://djhvscf.github.io/Blog
 * @version: v1.2.1
 *
 * @update zhixin wen <wenzhixin2010@gmail.com>
 */

(function ($) {
    'use strict';

    var cookieIds = {
        sortOrder: 'bs.table.sortOrder',
        sortName: 'bs.table.sortName',
        pageNumber: 'bs.table.pageNumber',
        pageList: 'bs.table.pageList',
        columns: 'bs.table.columns',
        searchText: 'bs.table.searchText',
        filterControl: 'bs.table.filterControl'
    };

    var getCurrentHeader = function (that) {
        var header = that.$header;
        if (that.options.height) {
            header = that.$tableHeader;
        }

        return header;
    };

    var getCurrentSearchControls = function (that) {
        var searchControls = 'select, input';
        if (that.options.height) {
            searchControls = 'table select, table input';
        }

        return searchControls;
    };

    var cookieEnabled = function () {
        return !!(navigator.cookieEnabled);
    };

    var inArrayCookiesEnabled = function (cookieName, cookiesEnabled) {
        var index = -1;

        for (var i = 0; i < cookiesEnabled.length; i++) {
            if (cookieName.toLowerCase() === cookiesEnabled[i].toLowerCase()) {
                index = i;
                break;
            }
        }

        return index;
    };

    var setCookie = function (that, cookieName, cookieValue) {
        if ((!that.options.cookie) || (!cookieEnabled()) || (that.options.cookieIdTable === '')) {
            return;
        }

        if (inArrayCookiesEnabled(cookieName, that.options.cookiesEnabled) === -1) {
            return;
        }

        cookieName = that.options.cookieIdTable + '.' + cookieName;
        if (!cookieName || /^(?:expires|max\-age|path|domain|secure)$/i.test(cookieName)) {
            return false;
        }

        document.cookie = encodeURIComponent(cookieName) + '=' + encodeURIComponent(cookieValue) + calculateExpiration(that.options.cookieExpire) + (that.options.cookieDomain ? '; domain=' + that.options.cookieDomain : '') + (that.options.cookiePath ? '; path=' + that.options.cookiePath : '') + (that.cookieSecure ? '; secure' : '');
        return true;
    };

    var getCookie = function (that, tableName, cookieName) {
        if (!cookieName) {
            return null;
        }

        if (inArrayCookiesEnabled(cookieName, that.options.cookiesEnabled) === -1) {
            return null;
        }

        cookieName = tableName + '.' + cookieName;

        return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(cookieName).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
    };

    var hasCookie = function (cookieName) {
        if (!cookieName) {
            return false;
        }
        return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(cookieName).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
    };

    var deleteCookie = function (tableName, cookieName, sPath, sDomain) {
        cookieName = tableName + '.' + cookieName;
        if (!hasCookie(cookieName)) {
            return false;
        }
        document.cookie = encodeURIComponent(cookieName) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
        return true;
    };

    var calculateExpiration = function(cookieExpire) {
        var time = cookieExpire.replace(/[0-9]*/, ''); //s,mi,h,d,m,y
        cookieExpire = cookieExpire.replace(/[A-Za-z]/, ''); //number

        switch (time.toLowerCase()) {
            case 's':
                cookieExpire = +cookieExpire;
                break;
            case 'mi':
                cookieExpire = cookieExpire * 60;
                break;
            case 'h':
                cookieExpire = cookieExpire * 60 * 60;
                break;
            case 'd':
                cookieExpire = cookieExpire * 24 * 60 * 60;
                break;
            case 'm':
                cookieExpire = cookieExpire * 30 * 24 * 60 * 60;
                break;
            case 'y':
                cookieExpire = cookieExpire * 365 * 24 * 60 * 60;
                break;
            default:
                cookieExpire = undefined;
                break;
        }

        return cookieExpire === undefined ? '' : '; max-age=' + cookieExpire;
    };

    var initCookieFilters = function (bootstrapTable) {
        setTimeout(function () {
            var parsedCookieFilters = JSON.parse(getCookie(bootstrapTable, bootstrapTable.options.cookieIdTable, cookieIds.filterControl));

            if (!bootstrapTable.options.filterControlValuesLoaded && parsedCookieFilters) {
                bootstrapTable.options.filterControlValuesLoaded = true;

                var cachedFilters = {},
                    header = getCurrentHeader(bootstrapTable),
                    searchControls = getCurrentSearchControls(bootstrapTable),

                    applyCookieFilters = function (element, filteredCookies) {
                        $(filteredCookies).each(function (i, cookie) {
                            $(element).val(cookie.text);
                            cachedFilters[cookie.field] = cookie.text;
                        });
                    };

                header.find(searchControls).each(function () {
                    var field = $(this).closest('[data-field]').data('field'),
                        filteredCookies = $.grep(parsedCookieFilters, function (cookie) {
                            return cookie.field === field;
                        });

                    applyCookieFilters(this, filteredCookies);
                });

                bootstrapTable.initColumnSearch(cachedFilters);
            }
        }, 250);
    }

    $.extend($.fn.bootstrapTable.defaults, {
        cookie: false,
        cookieExpire: '2h',
        cookiePath: null,
        cookieDomain: null,
        cookieSecure: null,
        cookieIdTable: '',
        cookiesEnabled: ['bs.table.sortOrder', 'bs.table.sortName', 'bs.table.pageNumber', 'bs.table.pageList', 'bs.table.columns', 'bs.table.searchText', 'bs.table.filterControl'],
        //internal variable
        filterControls: [],
        filterControlValuesLoaded: false
    });

    $.fn.bootstrapTable.methods.push('deleteCookie');

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _init = BootstrapTable.prototype.init,
        _initTable = BootstrapTable.prototype.initTable,
        _initServer = BootstrapTable.prototype.initServer,
        _onSort = BootstrapTable.prototype.onSort,
        _onPageNumber = BootstrapTable.prototype.onPageNumber,
        _onPageListChange = BootstrapTable.prototype.onPageListChange,
        _onPageFirst = BootstrapTable.prototype.onPageFirst,
        _onPagePre = BootstrapTable.prototype.onPagePre,
        _onPageNext = BootstrapTable.prototype.onPageNext,
        _onPageLast = BootstrapTable.prototype.onPageLast,
        _toggleColumn = BootstrapTable.prototype.toggleColumn,
        _selectPage = BootstrapTable.prototype.selectPage,
        _onSearch = BootstrapTable.prototype.onSearch;

    BootstrapTable.prototype.init = function () {
        var timeoutId = 0;
        this.options.filterControls = [];
        this.options.filterControlValuesLoaded = false;


        this.options.cookiesEnabled = typeof this.options.cookiesEnabled === 'string' ?
            this.options.cookiesEnabled.replace('[', '').replace(']', '').replace(/ /g, '').toLowerCase().split(',') : this.options.cookiesEnabled;

        if (this.options.filterControl) {
            var that = this;
            this.$el.on('column-search.bs.table', function (e, field, text) {
                var isNewField = true;

                for (var i = 0; i < that.options.filterControls.length; i++) {
                    if (that.options.filterControls[i].field === field) {
                        that.options.filterControls[i].text = text;
                        isNewField = false;
                        break;
                    }
                }
                if (isNewField) {
                    that.options.filterControls.push({
                        field: field,
                        text: text
                    });
                }

                setCookie(that, cookieIds.filterControl, JSON.stringify(that.options.filterControls));
            }).on('post-body.bs.table', initCookieFilters(that));
        }
        _init.apply(this, Array.prototype.slice.apply(arguments));

        $.extend($.fn.bootstrapTable.utils, {
            setCookie: setCookie,
            getCookie: getCookie
        });
    };

    BootstrapTable.prototype.initServer = function () {
        var bootstrapTable = this,
            selectsWithoutDefaults = [],

            columnHasSelectControl = function (column) {
                return column.filterControl && column.filterControl === 'select';
            },

            columnHasDefaultSelectValues = function (column) {
                return column.filterData && column.filterData !== 'column';
            },

            cookiesPresent = function() {
                return bootstrapTable.options.cookie && bootstrapTable.getCookies(bootstrapTable);
            };

        selectsWithoutDefaults = $.grep(bootstrapTable.columns, function(column) {
            return columnHasSelectControl(column) && !columnHasDefaultSelectValues(column);
        });

        // reset variable to original initServer function, so that future calls to initServer
        // use the original function from this point on.
        BootstrapTable.prototype.initServer = _initServer;

        // early return if we don't need to populate any select values with cookie values
        if (cookiesPresent() && selectsWithoutDefaults.length === 0) {
            return;
        }

        // call BootstrapTable.prototype.initServer
        _initServer.apply(this, Array.prototype.slice.apply(arguments));
    }


    BootstrapTable.prototype.initTable = function () {
        _initTable.apply(this, Array.prototype.slice.apply(arguments));
        this.initCookie();
    };

    BootstrapTable.prototype.initCookie = function () {
        if (!this.options.cookie) {
            return;
        }

        if ((this.options.cookieIdTable === '') || (this.options.cookieExpire === '') || (!cookieEnabled())) {
            throw new Error("Configuration error. Please review the cookieIdTable, cookieExpire properties, if those properties are ok, then this browser does not support the cookies");
            return;
        }

        var sortOrderCookie = getCookie(this, this.options.cookieIdTable, cookieIds.sortOrder),
            sortOrderNameCookie = getCookie(this, this.options.cookieIdTable, cookieIds.sortName),
            pageNumberCookie = getCookie(this, this.options.cookieIdTable, cookieIds.pageNumber),
            pageListCookie = getCookie(this, this.options.cookieIdTable, cookieIds.pageList),
            columnsCookie = JSON.parse(getCookie(this, this.options.cookieIdTable, cookieIds.columns)),
            searchTextCookie = getCookie(this, this.options.cookieIdTable, cookieIds.searchText);

        //sortOrder
        this.options.sortOrder = sortOrderCookie ? sortOrderCookie : this.options.sortOrder;
        //sortName
        this.options.sortName = sortOrderNameCookie ? sortOrderNameCookie : this.options.sortName;
        //pageNumber
        this.options.pageNumber = pageNumberCookie ? +pageNumberCookie : this.options.pageNumber;
        //pageSize
        this.options.pageSize = pageListCookie ? pageListCookie === this.options.formatAllRows() ? pageListCookie : +pageListCookie : this.options.pageSize;
        //searchText
        this.options.searchText = searchTextCookie ? searchTextCookie : '';

        if (columnsCookie) {
            $.each(this.columns, function (i, column) {
                column.visible = $.inArray(column.field, columnsCookie) !== -1;
            });
        }
    };

    BootstrapTable.prototype.onSort = function () {
        _onSort.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.sortOrder, this.options.sortOrder);
        setCookie(this, cookieIds.sortName, this.options.sortName);
    };

    BootstrapTable.prototype.onPageNumber = function () {
        _onPageNumber.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.pageNumber, this.options.pageNumber);
    };

    BootstrapTable.prototype.onPageListChange = function () {
        _onPageListChange.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.pageList, this.options.pageSize);
    };

    BootstrapTable.prototype.onPageFirst = function () {
        _onPageFirst.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.pageNumber, this.options.pageNumber);
    };

    BootstrapTable.prototype.onPagePre = function () {
        _onPagePre.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.pageNumber, this.options.pageNumber);
    };

    BootstrapTable.prototype.onPageNext = function () {
        _onPageNext.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.pageNumber, this.options.pageNumber);
    };

    BootstrapTable.prototype.onPageLast = function () {
        _onPageLast.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.pageNumber, this.options.pageNumber);
    };

    BootstrapTable.prototype.toggleColumn = function () {
        _toggleColumn.apply(this, Array.prototype.slice.apply(arguments));

        var visibleColumns = [];

        $.each(this.columns, function (i, column) {
            if (column.visible) {
                visibleColumns.push(column.field);
            }
        });

        setCookie(this, cookieIds.columns, JSON.stringify(visibleColumns));
    };

    BootstrapTable.prototype.selectPage = function (page) {
        _selectPage.apply(this, Array.prototype.slice.apply(arguments));
        setCookie(this, cookieIds.pageNumber, page);
    };

    BootstrapTable.prototype.onSearch = function () {
        var target = Array.prototype.slice.apply(arguments);
        _onSearch.apply(this, target);

        if ($(target[0].currentTarget).parent().hasClass('search')) {
          setCookie(this, cookieIds.searchText, this.searchText);
        }
    };

    BootstrapTable.prototype.getCookies = function(bootstrapTable) {
        var cookies = [];
        $.each( cookieIds, function( key, value ) {
            var cookie = JSON.parse(getCookie(bootstrapTable, bootstrapTable.options.cookieIdTable, cookieIds.filterControl));
            cookies.concat(cookie);
        });

        return cookies;
    };

    BootstrapTable.prototype.deleteCookie = function (cookieName) {
        if ((cookieName === '') || (!cookieEnabled())) {
            return;
        }

        deleteCookie(this.options.cookieIdTable, cookieIds[cookieName], this.options.cookiePath, this.options.cookieDomain);
    };
})(jQuery);
