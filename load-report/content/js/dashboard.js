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

    var data = {"OkPercent": 99.68196274420718, "KoPercent": 0.31803725579282144};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9968196274420718, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.965, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 14, 0.31803725579282144, 47.54702407996385, 0, 824, 9.0, 133.0, 282.0, 407.97000000000025, 354.37127676702625, 258.43356293270006, 15127.78692164104], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.057499999999976, 8, 210, 41.0, 94.0, 110.89999999999998, 161.98000000000002, 39.42440370589395, 143.40087842499506, 17.51767938103686], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.64500000000001, 2, 134, 20.0, 59.900000000000034, 74.94999999999999, 114.97000000000003, 39.23107100823853, 38.638869562818755, 32.958984375], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 65.0, 65, 65, 65.0, 65.0, 65.0, 65.0, 15.384615384615385, 8.759014423076923, 9.059495192307692], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.9449999999999993, 0, 170, 0.0, 1.0, 1.0, 12.0, 70.51564565888056, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.9124999999999992, 0, 176, 1.0, 2.0, 4.0, 28.980000000000018, 108.34236186348862, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 64.26499999999996, 11, 219, 57.0, 119.0, 142.79999999999995, 192.86000000000013, 39.88433542726094, 11.840662079968093, 19.591621796789312], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 361.0, 361, 361, 361.0, 361.0, 361.0, 361.0, 2.770083102493075, 1.6744935941828256, 0.8277787396121884], "isController": false}, {"data": ["Post Booking Request", 400, 14, 3.5, 300.8925000000002, 75, 824, 289.5, 413.90000000000003, 460.0, 572.9100000000001, 36.70735064696706, 35.275351730981, 17141.935029423235], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.792499999999947, 2, 182, 23.0, 62.900000000000034, 78.0, 120.97000000000003, 39.142773265485864, 45.56482563117722, 23.011669439279775], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.910000000000004, 1, 148, 38.0, 82.0, 100.89999999999998, 124.0, 38.85381253035454, 38.019252367654204, 17.036486158329286], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 14.285714285714286, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 824 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 551 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 560 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 537 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 576 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 564 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 539 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.142857142857143, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 14, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 824 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 551 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 560 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 14, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 824 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 551 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 560 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
