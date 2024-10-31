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

    var data = {"OkPercent": 99.50022716946842, "KoPercent": 0.49977283053157656};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9950022716946842, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.945, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 22, 0.49977283053157656, 49.49182189913671, 0, 828, 10.0, 152.0, 292.0, 431.9400000000005, 340.71207430340553, 248.25760690789474, 14478.756666626354], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 51.367500000000014, 9, 197, 43.0, 97.80000000000007, 130.74999999999994, 164.98000000000002, 38.15701612133931, 138.52971775732138, 16.954533530477917], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.590000000000014, 2, 172, 20.0, 61.900000000000034, 76.79999999999995, 146.92000000000007, 38.04089396100809, 37.39793226937708, 31.928996522824534], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 55.0, 55, 55, 55.0, 55.0, 55.0, 55.0, 18.18181818181818, 10.333806818181818, 10.706676136363637], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.240000000000001, 0, 178, 0.0, 1.0, 1.0, 25.99000000000001, 67.3911212197793, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 2.251666666666665, 0, 193, 1.0, 2.0, 5.0, 31.0, 103.2258064516129, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 67.60749999999999, 11, 279, 52.0, 138.80000000000007, 178.0, 258.97, 38.59886133359066, 11.459036958409728, 18.96018286210557], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 383.0, 383, 383, 383.0, 383.0, 383.0, 383.0, 2.6109660574412534, 1.5783085835509139, 0.7802300913838119], "isController": false}, {"data": ["Post Booking Request", 400, 22, 5.5, 316.56749999999977, 63, 828, 306.0, 438.0, 508.9, 605.7900000000002, 35.08771929824561, 33.741262335526315, 16310.890299479166], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.01750000000002, 2, 161, 21.0, 57.900000000000034, 79.94999999999999, 118.99000000000001, 37.93626707132018, 44.180932283763276, 22.30237575872534], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 43.17750000000004, 1, 218, 36.5, 85.0, 102.89999999999998, 134.98000000000002, 37.40415186085656, 36.621002431269865, 16.40084393117636], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 565 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 643 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 9.090909090909092, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 606 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 563 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 9.090909090909092, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 564 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 520 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 808 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 828 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 509 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 585 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 532 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 556 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.545454545454546, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 22, "The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 565 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 22, "The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 565 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
