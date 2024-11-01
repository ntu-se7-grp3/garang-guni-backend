/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.7955474784189, "KoPercent": 0.2044525215810995};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.997955474784189, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9775, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 9, 0.2044525215810995, 47.39095865515683, 0, 749, 10.0, 132.0, 285.84999999999945, 405.97000000000025, 352.97891107369094, 256.87822310259804, 15067.126201537567], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.692499999999995, 8, 205, 40.0, 98.80000000000007, 116.94999999999999, 171.92000000000007, 39.142773265485864, 141.86885336138567, 17.392540855269598], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.04750000000002, 2, 157, 20.0, 58.0, 80.59999999999991, 130.86000000000013, 39.043435822352365, 38.32280990727184, 32.70812362737921], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 54.0, 54, 54, 54.0, 54.0, 54.0, 54.0, 18.51851851851852, 10.52517361111111, 10.904947916666666], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.7149999999999983, 0, 155, 0.0, 1.0, 1.0, 67.97000000000003, 70.35441034209832, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7941666666666662, 0, 158, 1.0, 1.0, 3.0, 27.980000000000018, 107.52688172043011, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 61.63500000000007, 8, 240, 50.5, 112.7000000000001, 141.95, 205.99, 39.52569169960474, 11.734189723320158, 19.415452075098816], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 377.0, 377, 377, 377.0, 377.0, 377.0, 377.0, 2.6525198938992043, 1.6034275530503979, 0.7926475464190982], "isController": false}, {"data": ["Post Booking Request", 400, 9, 2.25, 300.0024999999998, 50, 749, 290.0, 411.0, 459.95, 578.9300000000001, 36.44314868804665, 35.01602929118076, 17017.254264987245], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 30.694999999999986, 2, 147, 24.0, 65.90000000000003, 80.94999999999999, 103.99000000000001, 38.82364359895176, 45.18651272687566, 22.824056100165], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 43.574999999999996, 1, 167, 37.0, 90.0, 105.94999999999999, 128.98000000000002, 38.409832917226815, 37.57805748271558, 16.84181150374496], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 645 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 579 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 22.22222222222222, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 572 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 553 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 749 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 9, "The operation lasted too long: It took 579 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 645 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 9, "The operation lasted too long: It took 579 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 645 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
