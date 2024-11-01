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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 18, 0.408905043162199, 46.35915492957742, 0, 766, 9.0, 134.0, 274.0, 391.97000000000025, 360.3175902431039, 263.25125849226487, 15362.014444524024], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.36250000000003, 8, 199, 40.0, 90.0, 111.89999999999998, 142.97000000000003, 40.55972419387548, 147.84851259886432, 18.022143074427095], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.254999999999995, 2, 143, 19.0, 59.0, 67.89999999999998, 114.85000000000014, 40.440804772014964, 39.90646484177535, 34.05143406885047], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 12.37686820652174, 12.801460597826088], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.9, 0, 168, 0.0, 1.0, 1.0, 12.990000000000009, 71.76818875033642, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.8424999999999998, 0, 195, 1.0, 1.0, 3.0, 24.980000000000018, 109.61907371882708, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 62.01250000000002, 11, 264, 52.0, 116.0, 143.95, 228.97000000000003, 40.91234530019433, 12.145852510995194, 20.09659149023218], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 359.0, 359, 359, 359.0, 359.0, 359.0, 359.0, 2.785515320334262, 1.6838222493036212, 0.8323903203342619], "isController": false}, {"data": ["Post Booking Request", 400, 18, 4.5, 297.3074999999999, 33, 766, 283.5, 400.90000000000003, 494.9, 579.94, 37.36920777279522, 35.975526088378174, 17428.557026724822], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 26.45249999999999, 2, 150, 21.0, 53.0, 75.94999999999999, 116.94000000000005, 40.318516278600946, 46.9991251196956, 23.70287773409939], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.45250000000003, 1, 196, 35.0, 85.90000000000003, 108.89999999999998, 143.80000000000018, 39.73378364954803, 38.945025361329094, 17.422332869772525], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 622 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 572 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 580 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 549 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 766 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 557 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 520 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 553 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 570 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 556 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 18, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 622 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 18, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 622 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
