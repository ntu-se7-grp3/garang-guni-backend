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

    var data = {"OkPercent": 99.70467969104952, "KoPercent": 0.29532030895047706};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9970467969104952, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9675, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 13, 0.29532030895047706, 47.44956837801007, 0, 617, 9.0, 138.0, 284.0, 416.9400000000005, 355.83218818203864, 259.2865402200711, 15226.757402013782], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 46.724999999999994, 8, 195, 40.0, 89.0, 115.94999999999999, 159.91000000000008, 39.07776475185619, 141.7503938305979, 17.363655236420474], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.942500000000006, 1, 146, 19.0, 55.0, 76.0, 103.99000000000001, 39.02819787296322, 38.337772282661724, 32.68887894550688], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 11.861165364583334, 12.26806640625], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.9162500000000001, 0, 132, 0.0, 1.0, 1.0, 25.950000000000045, 70.52807899144847, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.6125000000000003, 0, 148, 1.0, 1.0, 3.0, 21.99000000000001, 108.45006778129236, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 67.2525, 11, 258, 57.5, 128.0, 155.79999999999995, 209.94000000000005, 39.44384183019426, 11.709890543338922, 19.375246524011438], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 343.0, 343, 343, 343.0, 343.0, 343.0, 343.0, 2.9154518950437316, 1.7623678935860057, 0.8712190233236151], "isController": false}, {"data": ["Post Booking Request", 400, 13, 3.25, 301.9074999999999, 70, 617, 294.0, 419.90000000000003, 460.5999999999999, 564.8400000000001, 36.46308113035551, 35.11521122948952, 17069.237391038056], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 30.772500000000015, 2, 154, 23.0, 67.0, 89.94999999999999, 115.99000000000001, 38.955979742890534, 45.42432724849045, 22.901855278535255], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 41.93499999999995, 1, 165, 34.0, 85.0, 102.79999999999995, 138.92000000000007, 38.53564547206165, 37.78403103925819, 16.896977360308284], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 565 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 15.384615384615385, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 566 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 549 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 519 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 515 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 523 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 13, "The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 565 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 13, "The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 565 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
