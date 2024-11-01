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

    var data = {"OkPercent": 99.59109495683781, "KoPercent": 0.408905043162199};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.995910949568378, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.955, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 18, 0.408905043162199, 46.588596092685265, 0, 883, 9.0, 140.0, 269.0, 389.880000000001, 361.85778873818333, 263.61720676633786, 15435.913657906905], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.432500000000005, 8, 218, 38.5, 97.0, 120.89999999999998, 169.94000000000005, 40.66280370031514, 147.62781780522516, 18.067945003557995], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.185000000000034, 2, 133, 19.0, 54.0, 67.94999999999999, 107.8900000000001, 40.58441558441558, 39.89935540533685, 34.06554383116883], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 12.092752659574469, 12.52908909574468], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.9587499999999972, 0, 170, 0.0, 1.0, 1.0, 11.990000000000009, 71.74887892376681, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7691666666666672, 0, 175, 1.0, 1.0, 3.0, 17.980000000000018, 110.18271967679735, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 62.172500000000014, 10, 247, 52.0, 122.0, 148.95, 194.91000000000008, 41.13533525298231, 12.212052653229124, 20.20612659399424], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 345.0, 345, 345, 345.0, 345.0, 345.0, 345.0, 2.898550724637681, 1.7521512681159421, 0.8661684782608696], "isController": false}, {"data": ["Post Booking Request", 400, 18, 4.5, 296.8450000000003, 80, 883, 279.0, 396.90000000000003, 485.0999999999998, 647.99, 37.5481085140336, 36.08688573641228, 17521.49500874167], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 27.04250000000002, 2, 126, 19.0, 63.0, 75.0, 107.99000000000001, 40.51863857374392, 47.168898621100084, 23.820527755267424], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 44.824999999999996, 1, 154, 40.0, 85.90000000000003, 105.94999999999999, 142.95000000000005, 40.19292604501608, 39.33205558556069, 17.623656049035368], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 648 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 881 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 627 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 605 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 710 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 608 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 647 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 11.11111111111111, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 576 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 11.11111111111111, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 564 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 883 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 628 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 625 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 18, "The operation lasted too long: It took 647 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 576 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 648 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 18, "The operation lasted too long: It took 647 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 576 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 648 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
