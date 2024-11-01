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

    var data = {"OkPercent": 99.54566106315312, "KoPercent": 0.45433893684688775};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9954566106315311, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.95, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 20, 0.45433893684688775, 47.81303952748746, 0, 758, 8.0, 136.70000000000027, 282.0, 409.97000000000025, 350.5614398343553, 255.57644640439594, 14895.445129584095], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.93749999999997, 8, 212, 41.0, 98.0, 129.0, 178.94000000000005, 39.28887142716825, 142.56642274825657, 17.45745751890777], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 28.290000000000028, 1, 140, 21.0, 67.90000000000003, 77.89999999999998, 112.96000000000004, 39.07776475185619, 38.40344433860883, 32.74308354093396], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 53.0, 53, 53, 53.0, 53.0, 53.0, 53.0, 18.867924528301884, 10.7421875, 11.110701650943396], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.9800000000000011, 0, 167, 0.0, 1.0, 1.0, 16.970000000000027, 69.58336957467165, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7433333333333336, 0, 169, 1.0, 1.0, 3.0, 22.970000000000027, 106.33584404076207, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 65.70000000000005, 10, 273, 57.0, 115.0, 161.74999999999994, 240.82000000000016, 39.580447259054026, 11.750445280031665, 19.442348604789235], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 378.0, 378, 378, 378.0, 378.0, 378.0, 378.0, 2.6455026455026456, 1.5991856812169312, 0.7905505952380952], "isController": false}, {"data": ["Post Booking Request", 400, 20, 5.0, 303.98499999999996, 38, 758, 290.5, 419.0, 501.89999999999975, 609.99, 36.202371255317225, 34.894277762693456, 16826.97918080822], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 27.267500000000005, 1, 157, 21.0, 59.0, 79.89999999999998, 117.92000000000007, 39.005363237445145, 45.512192985129204, 22.93088737201365], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.73499999999999, 1, 160, 35.5, 85.0, 104.0, 144.95000000000005, 38.439361906592346, 37.71946848572939, 16.854759273496057], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 609 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 584 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 758 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 587 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 563 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 745 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 638 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 557 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 520 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 511 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 503 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 518 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 20, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 609 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 20, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 609 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
