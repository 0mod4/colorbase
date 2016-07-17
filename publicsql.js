/*************************************************/
/* PublicSQL Version 1.2.1                       */
/* This programm is Open Source                  */
/* you can redistribute it and/or modify it      */
/* under the terms of the MIT-License            */
/*                                               */
/* More Info at license.txt                      */
/* or at:                                        */
/* www.opensource.org/licenses/mit-license.php   */
/*                                               */
/* Copyright by Jörg Siebrands, Germany, 2013    */
/*************************************************/

var porTables = new Array();
var publicSQL = (function() {
    var nextArrayPos;
    var browserType;
    var loadParameter = 0;
    var tableCache = true;

    function query2(qc) {
        var tarray = new Array();
        var darray = new Array();
        var qselect, qwhere, qorder
        var qorderNew;
        var tPosArray, tPosRows;
        var tPosIndex;
        var cols;
        var i, j, k, idx;
        var b;
        var c;
        var tb;
        var ende;
        var tempArray = new Array();

        function distinctAdd() {
            var j, k;
            j = 1;
            while (j < tarray.length) {
                k = 0;
                while (k < darray.length) {
                    if (darray[k] == tarray[j][k]) {
                        k++;
                    } else {
                        k = darray.length + 1;
                    }
                }
                if (k == (darray.length)) {
                    j = (tarray.length + 1);
                } else {
                    j++;
                }
            }
            if (j == (tarray.length)) {
                tarray[j] = new Array();
                for (k = 0; k < darray.length; k++) {
                    tarray[j][k] = darray[k];
                }
            }
        }

        function whereCondition() {
            var i, j;
            var cp;
            var b = true;
            var t1, t2, s1, s2;
            var w1, w2;
            var s;
            var tp1, tp2;
            var bArray = new Array(qwhere.length);
            for (var i = 0; i < qwhere.length; i++) {
                t1 = qwhere[i][0][0];
                s1 = qwhere[i][0][1];
                t2 = qwhere[i][1][0];
                s2 = qwhere[i][1][1];
                if (s1 > -1) {
                    w1 = (typeof(tb[t1][tPosArray[t1] * cols[t1] + s1]) == "string") ? ("\"" + tb[t1][tPosArray[t1] * cols[t1] + s1] + "\"") : (tb[t1][tPosArray[t1] * cols[t1] + s1]);
                } else {
                    w1 = (typeof(qc["where"][i][0]) == "string") ? ("\"" + qc["where"][i][0] + "\"") : qc["where"][i][0];
                }
                if (s2 > -1) {
                    w2 = (typeof(tb[t2][tPosArray[t2] * cols[t2] + s2]) == "string") ? ("\"" + tb[t2][tPosArray[t2] * cols[t2] + s2] + "\"") : (tb[t2][tPosArray[t2] * cols[t2] + s2]);
                } else {
                    w2 = (typeof(qc["where"][i][2]) == "string") ? ("\"" + qc["where"][i][2] + "\"") : qc["where"][i][2];
                }
                cp = whereCompare(w1, w2);
                switch (qc["where"][i][1]) {
                    case "=":
                        bArray[i] = (cp == 0);
                        break;
                    case "<":
                        bArray[i] = (cp == -1);
                        break;
                    case ">":
                        bArray[i] = (cp == 1);
                        break;
                    case "<>":
                        bArray[i] = (cp != 0);
                        break;
                    case "<=":
                        bArray[i] = ((cp == -1) || (cp == 0));
                        break;
                    case ">=":
                        bArray[i] = (cp > -1);
                        break;
                    default:
                        bArray[i] = false;
                        break;
                }
            }
            s = "b = (";
            for (i = 0; i < bArray.length; i++) {
                if (i > 0) {
                    if (qc["where"][i][5] == "A") {
                        s = s + " && ";
                    } else if (qc["where"][i][5] == "O") {
                        s = s + " || ";
                    }
                }
                s = s + qc["where"][i][6];
                s = s + bArray[i];
                s = s + qc["where"][i][7];
            }
            s = s + ")";
            eval(s);
            return b;
        }
        tb = new Array();
        cols = new Array();
        for (t = 0; t < qc["from"].length; t++) {
            tb[t] = porTables[publicSQL.tableNames[qc["from"][t]]];
            cols[t] = tb[t][tb[t].length - 1];
        }
        if (qc["select"][0][0] == "*") {
            idx = 0;
            for (t = 0; t < tb.length; t++) {
                for (i = 0; i < cols[t]; i++) {
                    qc["select"][0][idx] = tb[t][i];
                    qc["select"][1][idx] = t;
                    idx++;
                }
            }
        }
        qselect = new Array();
        for (i = 0; i < qc["select"][0].length; i++) {
            t = qc["select"][1][i];
            for (j = 0; j < cols[t]; j++) {
                if (tb[t][j] == qc["select"][0][i]) {
                    qselect[i] = j;
                }
            }
        }
        if (qc["order"]) {
            qorder = new Array();
            for (i = 0; i < qc["order"][0].length; i++) {
                t = qc["order"][1][i];
                for (j = 0; j < cols[t]; j++) {
                    if (tb[t][j] == qc["order"][0][i]) {
                        qorder[i] = j;
                    }
                }
            }
        }
        if (qc["where"]) {
            qwhere = new Array(qc["where"].length);
            for (i = 0; i < qc["where"].length; i++) {
                qwhere[i] = new Array();
                qwhere[i][0] = new Array(-1, -1);
                qwhere[i][1] = new Array(-1, -1);
                for (t = 0; t < tb.length; t++) {
                    for (j = 0; j < cols[t]; j++) {
                        if ((qc["where"][i][3] == t) && (tb[qc["where"][i][3]][j] == qc["where"][i][0])) {
                            qwhere[i][0] = new Array(t, j);
                        }
                        if ((qc["where"][i][4] == t) && (tb[qc["where"][i][4]][j] == qc["where"][i][2])) {
                            qwhere[i][1] = new Array(t, j);
                        }
                    }
                }
            }
        }
        tarray[0] = new Array();
        for (i = 0; i < qselect.length; i++) {
            if (!qc["as"]) {
                tarray[0][i] = qc["select"][0][i];
            } else {
                tarray[0][i] = qc["as"][i];
            }
        }
        if (qorder) {
            qorderNew = new Array();
            for (i = 0; i < qorder.length; i++) {
                j = 0;
                while (j < qselect.length) {
                    if (tarray[0][j] == qc["order"][0][i]) {
                        qorderNew[i] = j;
                        j = 10000;
                    }
                    j++;
                }
                if (j < 10000) {
                    qorderNew[i] = tarray[0].length;
                    tarray[0][tarray[0].length] = qc["order"][0][i];
                }
            }
        }
        tPosArray = new Array(tb.length);
        tPosRows = new Array(tb.length);
        for (t = 0; t < tb.length; t++) {
            tPosArray[t] = 1;
            tPosRows[t] = (((tb[t].length - 1) / cols[t]) - 1);
        }
        tPosIndex = tb.length - 1;
        ende = false;
        while (ende == false) {
            if (tPosArray[tPosIndex] > tPosRows[tPosIndex]) {
                tPosIndex--;
                if (tPosIndex > -1) {
                    tPosArray[tPosIndex]++;
                } else {
                    ende = true;
                }
                while ((ende == false) && (tPosIndex >= 0) && (tPosArray[tPosIndex] > tPosRows[tPosIndex])) {
                    tPosArray[tPosIndex] = 1;
                    if (tPosIndex == 0) {
                        ende = true;
                    } else {
                        tPosIndex--;
                        tPosArray[tPosIndex]++;
                    }
                }
                tPosIndex = tb.length - 1;
                tPosArray[tPosIndex] = 1;
            }
            tPosIndex = tb.length - 1;
            if ((ende == false) && ((!qwhere) || (whereCondition() == true))) {
                if (qc["distinct"] == false) {
                    tarray[tarray.length] = new Array(qselect.length);
                    for (i = 0; i < qselect.length; i++) {
                        t = qc["select"][1][i];
                        tarray[tarray.length - 1][i] = tb[t][tPosArray[t] * cols[t] + qselect[i]];
                    }
                    if (qorder) {
                        for (i = 0; i < qorder.length; i++) {
                            if (qorderNew[i] >= qselect.length) {
                                t = qc["order"][1][i];
                                tarray[tarray.length - 1][qorderNew[i]] = tb[t][tPosArray[t] * cols[t] + qorder[i]]
                            }
                        }
                    }
                } else {
                    for (i = 0; i < qselect.length; i++) {
                        t = qc["select"][1][i];
                        darray[i] = tb[t][tPosArray[t] * cols[t] + qselect[i]];
                    }
                    distinctAdd();
                }
            }
            tPosArray[tPosIndex]++;
        }
        if (qc["order"]) {
            if (qc["order"][2].length == 1) {
                publicSQL.arraySort(tarray, qorderNew[0], qc["order"][2][0]);
            } else {
                publicSQL.arraySort(tarray, qorderNew, qc["order"][2]);
            }
            if (qselect.length < tarray[0].length) {
                for (i = 0; i < tarray.length; i++) {
                    tarray[i].length = qselect.length;
                }
            }
        }
        s = qc["func"] + "(tarray)";
        eval(s);
    }

    function tableLoader(qc) {
        if (qc["fromNextLoad"] < qc["from"].length) {
            if (eval('typeof publicSQL.tableNames[qc["from"][qc["fromNextLoad"]]]') == "number") {
                qc["fromNextLoad"]++;
                tableLoader(qc);
            } else {
                loadTable(qc);
            }
        } else {
            query2(qc);
        }
    }

    function loadTable2(qc) {
        if (eval("typeof porTables[nextArrayPos]") != "object") {
            if (browserType == "firefoxAndCo") {
                return false;
            }
            window.setTimeout(function() {
                loadTable2(qc);
            }, 1);
        }
        publicSQL.tableNames[qc["from"][qc["fromNextLoad"]]] = nextArrayPos;
        qc["fromNextLoad"]++;
        tableLoader(qc);
        return true;
    }

    function loadTable(qc) {
        nextArrayPos = porTables.length;
        var Head = document.getElementsByTagName("head")[0];
        var Script = document.createElement('script');
        if (tableCache == true) {
            var s = publicSQL.tablePath + qc["from"][qc["fromNextLoad"]] + "." + publicSQL.tableExtension;
        } else {
            var s = publicSQL.tablePath + qc["from"][qc["fromNextLoad"]] + "." + publicSQL.tableExtension + "?x=" + loadParameter;
        }
        Script.setAttribute('src', s);
        Script.setAttribute('type', 'text/javascript');
        if (browserType == "firefoxAndCo") {
            Script.onload = function() {
                loadTable2(qc);
            };
            Head.appendChild(Script);
        } else {
            Head.appendChild(Script);
            loadTable2(qc);
        }
    }

    function whereCompare(v1, v2) {
        var ret;
        if ((v1 == null) != (v2 == null)) {
            ret = -2;
        } else {
            ret = sortCompare(v1, v2);
        }
        return (ret);
    }

    function sortCompare(v1, v2) {
        var ret;
        if ((typeof(v1) == "number") != (typeof(v2) == "number")) {
            if (typeof(v1) == "number") {
                v1 = v1.toString();
            } else {
                v2 = v2.toString();
            }
        }
        if ((v1 == null) != (v2 == null)) {
            ret = (v1 == null) ? -1 : 1;
        } else if (isNaN(v1) == false && isNaN(v2) == false) {
            if (v1 == v2) {
                ret = 0;
            } else {
                ret = (v1 < v2) ? -1 : 1;
            }
        } else if (v1.toLowerCase() < v2.toLowerCase()) {
            ret = -1;
        } else if (v2.toLowerCase() < v1.toLowerCase()) {
            ret = 1;
        } else if (v1.toLowerCase() == v2.toLowerCase()) {
            if (v1 < v2) {
                ret = -1;
            } else if (v2 < v1) {
                ret = 1;
            } else {
                ret = 0;
            }
        }
        return (ret);
    }
    return {
        tableNames: new Array(),
        tableExtension: "ptf",
        tablePath: "Tables/",
        htmlStandardTable: "defaultTable",
        nullValue: "-",
        errorNumber: 0,
        errorText: "",
        setTableCache: function(b) {
            if (b != tableCache) {
                tableCache = b;
                if ((tableCache == false) && (loadParameter == 0)) {
                    var act = new Date();
                    var actTime = act.getTime() / 1000;
                    var start = new Date(2013, 0, 1, 0, 0, 0)
                    var startTime = start.getTime() / 1000;
                    loadParameter = Math.floor(startTime - actTime);
                }
            }
        },
        getTableCache: function() {
            return tableCache;
        },
        arraySort: function(arr, col, asc) {
            var hlp;
            var i, j, k;
            var dir;
            var dirArray = new Array();
            var cp;
            if (typeof col == "number") {
                if (typeof(asc) == "object") {
                    dir = (typeof(asc[0]) == "boolean") ? asc[0] : true;
                } else {
                    dir = (typeof(asc) == "boolean") ? asc : true;
                }
                if ((col >= arr[0].length) || (col < 0)) return;
                for (i = 1; i < arr.length - 1; i++) {
                    for (j = (i + 1); j < arr.length; j++) {
                        cp = sortCompare(arr[i][col], arr[j][col]);
                        if ((asc == true) && (cp > 0)) {
                            hlp = arr[i];
                            arr[i] = arr[j];
                            arr[j] = hlp;
                        } else if ((asc == false) && (cp < 0)) {
                            hlp = arr[i];
                            arr[i] = arr[j];
                            arr[j] = hlp;
                        }
                    }
                }
            } else if (typeof col == "object") {
                for (i = 0; i < col.length; i++) {
                    if ((col[i] >= arr[0].length) || (col[i] < 0)) {
                        col[i] = -1;
                    }
                    if (typeof(asc) == "object") {
                        dirArray[i] = (typeof(asc[i]) == "boolean") ? asc[i] : true;
                    } else {
                        dirArray[i] = (typeof(asc) == "boolean") ? asc : true;
                    }
                }
                for (i = 1; i < arr.length - 1; i++) {
                    for (j = (i + 1); j < arr.length; j++) {
                        k = 0;
                        while (k < col.length) {
                            if (col[k] == -1) {
                                k++;
                            } else {
                                cp = sortCompare(arr[i][col[k]], arr[j][col[k]]);
                                dir = dirArray[k];
                                if (dir == true) {
                                    if (cp > 0) {
                                        hlp = arr[i];
                                        arr[i] = arr[j];
                                        arr[j] = hlp;
                                        k = col.length;
                                    } else {
                                        k = (cp == 0) ? k + 1 : col.length;
                                    }
                                } else {
                                    if (cp < 0) {
                                        hlp = arr[i];
                                        arr[i] = arr[j];
                                        arr[j] = hlp;
                                        k = col.length;
                                    } else {
                                        k = (cp == 0) ? k + 1 : col.length;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        htmlTableDelete: function(tid) {
            var tp;
            var tb;
            tp = typeof tid;
            switch (tp) {
                case "string":
                    tb = document.getElementById(tid);
                    break;
                case "number":
                    tb = document.getElementsByTagName("table")[tid];
                    break;
                case "object":
                    tb = tid;
                    break;
                default:
                    return;
            }
            while (tb.rows.length > 0) {
                tb.deleteRow(0);
            }
            tb.deleteTFoot();
            tb.deleteTHead();
            tb.cellPadding = 0;
            tb.cellSpacing = 0;
        },
        show: function(t, ident) {
            var i, j;
            var s;
            var tr, td, th, tbody, ttext, tid;
            var tp;
            tp = typeof ident;
            tid = "";
            switch (tp) {
                case "string":
                    tb = document.getElementById(ident);
                    tid = ident;
                    break;
                case "number":
                    tb = document.getElementsByTagName("table")[ident];
                    if (tb == null) {
                        tid = publicSQL.htmlStandardTable;
                    }
                    break;
                case "object":
                    tb = ident;
                    tid = tb.getAttribute("ID", 0);
                    break;
                default:
                    tid = publicSQL.htmlStandardTable;
                    tb = document.getElementById(tid);
                    break;
            }
            if ((typeof(tb) != "object") || (tb == null)) {
                tb = document.createElement("table");
                tb.setAttribute("Border", 1, 0);
                tb.setAttribute("ID", tid, 0);
                document.getElementsByTagName("body")[0].appendChild(tb);
            } else {
                publicSQL.htmlTableDelete(tb);
            }
            tbody = document.createElement("tbody");
            tr = document.createElement("tr");
            th = document.createElement("th");
            ttext = document.createTextNode(" ");
            th.appendChild(ttext);
            tr.appendChild(th);
            for (i = 0; i < t[0].length; i++) {
                th = document.createElement("th");
                s = t[0][i];
                ttext = document.createTextNode(s);
                th.appendChild(ttext);
                tr.appendChild(th);
            }
            tbody.appendChild(tr);
            for (i = 1; i < t.length; i++) {
                tr = document.createElement("tr");
                td = document.createElement("td");
                ttext = document.createTextNode(i);
                td.appendChild(ttext);
                td.style.fontWeight = "bold";
                tr.appendChild(td);
                for (j = 0; j < t[i].length; j++) {
                    td = document.createElement("td");
                    if ((typeof t[i][j] == "object") && (t[i][j] == null)) {
                        s = publicSQL.nullValue;
                    } else {
                        s = t[i][j];
                    }
                    ttext = document.createTextNode(s);
                    td.appendChild(ttext);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            tb.cellPadding = 1;
            tb.cellSpacing = 0;
            tb.appendChild(tbody);
        },
        query: function(qselect, qfunc) {
            var i, j;
            var b;
            var c;
            var s;
            var idx;
            var qfrom, qwhere, qorder = "";
            var qc = new Array();
            var tempArray, tempArray2, tempArray3 = new Array();
            var tabAliasArray = new Array();
            var notfound;
            var delimiterArray = new Array();
            var agent;
            publicSQL.errorNumber = 0;
            publicSQL.errorText = "";
            agent = navigator.userAgent.toLowerCase();
            if ((agent.toLowerCase().indexOf("msie") > -1) && (parseInt(navigator.appVersion) <= 4)) {
                browserType = "ieAndCo";
            } else {
                browserType = "firefoxAndCo";
            }

            function setDelimiterArray(s) {
                var i;
                var c;
                var found1 = "";
                delimiterArray.length = s.length;
                for (i = 0; i < s.length; i++) {
                    c = s.charAt(i);
                    switch (found1) {
                        case "":
                            switch (c) {
                                case "'":
                                case '"':
                                case "`":
                                    found1 = c;
                                    delimiterArray[i] = false;
                                    break;
                                case "\\":
                                    found1 = c;
                                    delimiterArray[i] = true;
                                    break;
                                default:
                                    delimiterArray[i] = true;
                                    break;
                            }
                            break;
                        case "\\":
                            found1 = "";
                            delimiterArray[i] = true;
                            break;
                        case "'":
                        case '"':
                        case "`":
                            delimiterArray[i] = false;
                            if ((c == found1) && (s.charAt(i - 1) != "\\")) {
                                found1 = "";
                            }
                            break;
                    }
                }
            }

            function mergeQuerySpaces() {
                var i, p;
                var inSpace = false;
                var c;
                for (i = qselect.length - 1; i >= 0; i--) {
                    c = qselect.charAt(i);
                    if (inSpace == false) {
                        switch (c) {
                            case " ":
                            case "\n":
                            case "\f":
                            case "\b":
                            case "\r":
                            case "\t":
                            case "\xA0":
                                if (delimiterArray[i] == true) {
                                    inSpace = true;
                                    p = i;
                                }
                                break;
                        }
                    } else {
                        switch (c) {
                            case " ":
                            case "\n":
                            case "\f":
                            case "\b":
                            case "\r":
                            case "\t":
                            case "\xA0":
                                break;
                            default:
                                inSpace = false;
                                qselect = qselect.slice(0, i + 1) + ' ' + qselect.slice(p + 1);
                                delimiterArray.splice(i + 1, (p - i - 1));
                                break;
                        }
                    }
                }
            }

            function getWordPos(s, w) {
                var p = -1;
                var found = -1;
                w = w.toLowerCase(w);
                do {
                    p = s.toLowerCase().indexOf(w, p + 1);
                    if (delimiterArray[p] == true) {
                        found = p;
                    }
                } while ((p != -1) && (delimiterArray[p] == false));
                return found;
            }

            function splitStatement(s, w) {
                var p = -1;
                var lastp = 0;
                var na = new Array;
                do {
                    p = s.toLowerCase().indexOf(w.toLowerCase(), lastp);
                    if ((p != -1) && (delimiterArray[p] == true)) {
                        na[na.length] = s.slice(lastp, p);
                        lastp = p + w.length;
                    } else {
                        break;
                    }
                } while (p != -1);
                if (lastp < s.length) {
                    na[na.length] = s.slice(lastp);
                }
                return na;
            }
            qselect = qselect.replace(/^\s+/g, "");
            qselect = qselect.replace(/\s+$/g, "");
            setDelimiterArray(qselect);
            mergeQuerySpaces();
            idx = getWordPos(qselect, "ORDER BY");
            if (idx != -1) {
                qorder = qselect.substring(idx + 8);
                qselect = qselect.substring(0, idx);
                b = qorder.match(/\s+\S+(\s+(ASC|DESC))?\s*(,\s+\S+(\s+(ASC|DESC))\s*)*\s*/i);
                if (!b) {
                    publicSQL.errorNumber = 50;
                    publicSQL.errorText = qorder;
                    return;
                }
            }
            idx = getWordPos(qselect, "WHERE");
            if (idx != -1) {
                qwhere = qselect.substring(idx + 5);
                qselect = qselect.substring(0, idx);
                b = qwhere.match(/\s+\S+\s+(=|<>|<|>|>=|<=)\s+\S+(\s+(AND|OR)\s+\S+\s+(=|<>|<|>|>=|<=)\s+\S+)*\s*/i);
                if (!b) {
                    publicSQL.errorNumber = 30;
                    publicSQL.errorText = qselect;
                    return;
                }
            }
            idx = getWordPos(qselect, "FROM");
            if (idx == -1) {
                publicSQL.errorNumber = 20;
                publicSQL.errorText = qselect;
                return;
            } else {
                qfrom = qselect.substring(idx + 4);
                qselect = qselect.substring(0, idx);
                b = qfrom.match(/\s+\S+(\s+\S+)?\s*(,\s*\S+(\s+\S+)?\s*)*/i);
                if (!b) {
                    publicSQL.errorNumber = 21;
                    publicSQL.errorText = qfrom;
                    return;
                }
            }
            qfrom = qfrom.replace(/\s+$/g, "");
            setDelimiterArray(qfrom);
            qc["from"] = new Array();
            tempArray = splitStatement(qfrom, ",");
            for (i = 0; i < tempArray.length; i++) {
                tempArray[i] = tempArray[i].replace(/^\s+/g, "");
                tempArray[i] = tempArray[i].replace(/\s+$/g, "");
                setDelimiterArray(tempArray[i]);
                tempArray2 = splitStatement(tempArray[i], " ");
                qc["from"][i] = tempArray2[0];
                if (tempArray2.length > 1) {
                    tabAliasArray[i] = tempArray2[1];
                } else {
                    tabAliasArray[i] = "";
                }
            }
            if (qwhere) {
                qwhere = qwhere.replace(/\s+$/g, "");
                setDelimiterArray(qwhere);
                tempArray = splitStatement(qwhere, " and ");
                for (i = 1; i < tempArray.length; i++) {
                    setDelimiterArray(tempArray[i]);
                    tempArray[i] = "A" + tempArray[i];
                }
                k = 0;
                tempArray3.length = 0;
                for (i = 0; i < tempArray.length; i++) {
                    setDelimiterArray(tempArray[i]);
                    tempArray2 = splitStatement(tempArray[i], " or ");
                    for (j = 0; j < tempArray2.length; j++) {
                        if (j > 0) {
                            tempArray2[j] = "O" + tempArray2[j];
                        }
                        tempArray2[j] = tempArray2[j].replace(/^\s+/g, "");
                        tempArray3[k++] = tempArray2[j];
                    }
                }
                tempArray = tempArray3;
                qc["where"] = new Array();
                for (i = 0; i < tempArray.length; i++) {
                    qc["where"][i] = new Array();
                    tempArray[i] = tempArray[i].replace(/^\s+/g, "");
                    if (i > 0) {
                        qc["where"][i][5] = tempArray[i].substr(0, 1);
                        tempArray[i] = tempArray[i].substr(1);
                    }
                    s = "";
                    while (tempArray[i].search(/^(\(|not|\s)/i) > -1) {
                        c = tempArray[i].charAt(0);
                        if (c == "(") {
                            s = s + c;
                            tempArray[i] = tempArray[i].substr(1);
                        } else if (tempArray[i].substr(0, 3).toLowerCase() == "not") {
                            s = s + "!";
                            tempArray[i] = tempArray[i].substr(3);
                        } else {
                            tempArray[i] = tempArray[i].substr(1);
                        }
                    }
                    qc["where"][i][6] = s;
                    s = "";
                    j = tempArray[i].length - 1;
                    c = tempArray[i].charAt(j);
                    while ((j >= 0) && ((c == ")") || (c == " "))) {
                        if (c == ")") {
                            s = s + c;
                        }
                        j--;
                        c = tempArray[i].charAt(j);
                    }
                    tempArray[i] = tempArray[i].substring(0, j + 1);
                    qc["where"][i][7] = s;
                    setDelimiterArray(tempArray[i]);
                    tempArray2 = splitStatement(tempArray[i], " ");
                    idx = tempArray2[0].search(/^(\"|\'|\`).*(\"|\'|\`)$/);
                    if (idx > -1) {
                        tempArray2[0] = tempArray2[0].replace(/^./, "");
                        tempArray2[0] = tempArray2[0].replace(/.$/, "");
                        qc["where"][i][0] = tempArray2[0];
                        qc["where"][i][3] = -1;
                    } else if ((parseFloat(tempArray2[0])) != tempArray2[0]) {
                        idx = tempArray2[0].search(/\./);
                        if (idx > -1) {
                            tempArray3 = tempArray2[0].split(".");
                            qc["where"][i][0] = tempArray3[1];
                            j = 0;
                            while (j < qc["from"].length) {
                                if ((tempArray3[0] == tabAliasArray[j]) || (tempArray3[0] == qc["from"][j])) {
                                    qc["where"][i][3] = j;
                                    j = qc["from"].length;
                                }
                                j++;
                            }
                            if (j == qc["from"].length) {
                                qc["where"][i][3] = -1;
                            }
                        } else {
                            if (tempArray2[0].toLowerCase() == "null") {
                                qc["where"][i][0] = null;
                                qc["where"][i][3] = -1;
                            } else {
                                qc["where"][i][0] = tempArray2[0];
                                qc["where"][i][3] = 0;
                            }
                        }
                    } else {
                        qc["where"][i][0] = parseFloat(tempArray2[0]);
                        qc["where"][i][3] = -1;
                    }
                    idx = tempArray2[2].search(/^(\"|\'|\`).*(\"|\'|\`)$/);
                    if (idx > -1) {
                        tempArray2[2] = tempArray2[2].replace(/^./, "");
                        tempArray2[2] = tempArray2[2].replace(/.$/, "");
                        qc["where"][i][2] = tempArray2[2];
                        qc["where"][i][4] = -1;
                    } else if ((parseFloat(tempArray2[2])) != tempArray2[2]) {
                        idx = tempArray2[2].search(/\./);
                        if (idx > -1) {
                            tempArray3 = tempArray2[2].split(".");
                            qc["where"][i][2] = tempArray3[1];
                            j = 0;
                            while (j < qc["from"].length) {
                                if ((tempArray3[0] == tabAliasArray[j]) || (tempArray3[0] == qc["from"][j])) {
                                    qc["where"][i][4] = j;
                                    j = qc["from"].length;
                                }
                                j++;
                            }
                            if (j == qc["from"].length) {
                                qc["where"][i][4] = -1;
                            }
                        } else {
                            if (tempArray2[2].toLowerCase() == "null") {
                                qc["where"][i][2] = null;
                                qc["where"][i][4] = -1;
                            } else {
                                qc["where"][i][2] = tempArray2[2];
                                qc["where"][i][4] = 0;
                            }
                        }
                    } else {
                        qc["where"][i][2] = parseFloat(tempArray2[2]);
                        qc["where"][i][4] = -1;
                    }
                    qc["where"][i][1] = tempArray2[1];
                }
            }
            if (qorder) {
                qorder = qorder.replace(/\s+$/g, "");
                setDelimiterArray(qorder);
                qc["order"] = new Array();
                qc["order"][0] = new Array();
                qc["order"][1] = new Array();
                qc["order"][2] = new Array();
                tempArray = splitStatement(qorder, ",");
                for (i = 0; i < tempArray.length; i++) {
                    tempArray[i] = tempArray[i].replace(/^\s+/g, "");
                    tempArray[i] = tempArray[i].replace(/\s+$/g, "");
                    qc["order"][2][i] = Boolean(true);
                    setDelimiterArray(tempArray[i]);
                    idx = getWordPos(tempArray[i], " ASC");
                    if (idx > -1) {
                        tempArray[i] = tempArray[i].substring(0, idx);
                    } else {
                        idx = getWordPos(tempArray[i], " DESC");
                        if (idx > -1) {
                            qc["order"][2][i] = Boolean(false);
                            tempArray[i] = tempArray[i].substring(0, idx);
                        }
                    }
                    idx = tempArray[i].search(/\./);
                    if (idx > -1) {
                        tempArray2 = tempArray[i].split(".");
                        qc["order"][0][i] = tempArray2[1];
                        j = 0;
                        while (j < qc["from"].length) {
                            if ((tempArray2[0] == tabAliasArray[j]) || (tempArray2[0] == qc["from"][j])) {
                                qc["order"][1][i] = j;
                                j = qc["from"].length;
                            }
                            j++;
                        }
                        if (j == qc["from"].length) {
                            publicSQL.errorNumber = 51;
                            publicSQL.errorText = tempArray2[0];
                            return;
                        }
                    } else {
                        if (qc["from"].length != 1) {
                            publicSQL.errorNumber = 52;
                            publicSQL.errorText = tempArray2[0];
                            return;
                        } else {
                            qc["order"][0][i] = tempArray[i];
                            qc["order"][1][i] = 0;
                        }
                    }
                }
            }
            qselect = qselect.replace(/^\s+/g, "");
            qselect = qselect.replace(/\s+$/g, "");
            setDelimiterArray(qselect);
            idx = getWordPos(qselect, "SELECT");
            if (idx == -1) {
                publicSQL.errorNumber = 10;
                publicSQL.errorText = qselect;
                return;
            } else {
                qselect = qselect.substring(idx + 6);
                qselect = qselect.replace(/^\s+/g, "");
                b = qselect.match(/\s*(DISTINCT\s+)?(\*\s+|(\S+\.\S+\s*|\S+\s*)(,\s*\S+\.\S+\s*|,\s*\S+\s*)*\s*)/i);
                if (!b) {
                    publicSQL.errorNumber = 11;
                    publicSQL.errorText = qselect;
                    return;
                }
            }
            setDelimiterArray(qselect);
            idx = getWordPos(qselect, "DISTINCT");
            if (idx == 0) {
                qselect = qselect.substring(idx + 8);
                qc["distinct"] = true;
            } else {
                qc["distinct"] = false;
            }
            qselect = qselect.replace(/^\s+/g, "");
            qc["select"] = new Array();
            qc["select"][0] = new Array();
            qc["select"][1] = new Array();
            if (qselect == "*") {
                qc["select"][0] = new Array("*");
            } else {
                tempArray = qselect.split(",");
                for (i = 0; i < tempArray.length; i++) {
                    tempArray[i] = tempArray[i].replace(/^\s+/g, "");
                    tempArray[i] = tempArray[i].replace(/\s+$/g, "");
                    idx = qselect.search(/\./);
                    if (idx > -1) {
                        tempArray2 = tempArray[i].split(".");
                        qc["select"][0][i] = tempArray2[1];
                        j = 0;
                        while (j < qc["from"].length) {
                            if ((tempArray2[0] == tabAliasArray[j]) || (tempArray2[0] == qc["from"][j])) {
                                qc["select"][1][i] = j;
                                j = qc["from"].length;
                            }
                            j++;
                        }
                        if (j == qc["from"].length) {
                            publicSQL.errorNumber = 12;
                            publicSQL.errorText = tempArray2[0];
                            return;
                        }
                    } else {
                        if (qc["from"].length != 1) {
                            publicSQL.errorNumber = 13;
                            publicSQL.errorText = tempArray2[0];
                        } else {
                            qc["select"][0][i] = tempArray[i];
                            qc["select"][1][i] = 0;
                        }
                    }
                    setDelimiterArray(qc["select"][0][i]);
                    idx = getWordPos(qc["select"][0][i], "AS");
                    if (idx > -1) {
                        s = qc["select"][0][i].replace(/\sas\s/i, " ");
                        qc["select"][0][i] = s;
                    }
                    qc["select"][0][i] = qc["select"][0][i].replace(/^\s+/g, "");
                    qc["select"][0][i] = qc["select"][0][i].replace(/\s+$/g, "");
                    setDelimiterArray(qc["select"][0][i]);
                    idx = getWordPos(qc["select"][0][i], " ");
                    if ((idx > -1) || (qc["as"])) {
                        if (!qc["as"]) {
                            qc["as"] = new Array();
                            for (j = 0; j < i; j++) {
                                qc["as"][j] = qc["select"][0][j];
                            }
                        }
                        if (idx > -1) {
                            tempArray2 = splitStatement(qc["select"][0][i], " ");
                            qc["select"][0][i] = tempArray2[0];
                            qc["as"][i] = tempArray2[1];
                        } else {
                            qc["as"][i] = qc["select"][0][i];
                        }
                        qc["as"][i] = qc["as"][i].replace(/^(\"|\')/, "");
                        qc["as"][i] = qc["as"][i].replace(/(\"|\')$/, "");
                    }
                }
            }
            qc["fromNextLoad"] = 0;
            qc["func"] = qfunc;
            tableLoader(qc);
        }
    }
})();