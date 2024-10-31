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

    var data = {"OkPercent": 99.56837800999546, "KoPercent": 0.4316219900045434};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9956837800999546, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9525, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 19, 0.4316219900045434, 49.006360745115785, 0, 789, 10.0, 148.70000000000027, 286.0, 409.9400000000005, 346.4777646595829, 252.07695358618653, 14806.776213842975], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 50.72250000000002, 8, 251, 41.0, 99.80000000000007, 124.89999999999998, 187.96000000000004, 38.270187523918864, 138.55975530998853, 17.004819651741293], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 29.834999999999987, 2, 243, 21.0, 64.90000000000003, 87.89999999999998, 120.97000000000003, 38.06985818977824, 37.33216174336157, 31.895960728561914], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 12.071974734042554, 12.52908909574468], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8224999999999979, 0, 142, 0.0, 1.0, 1.0, 9.980000000000018, 68.58122588941278, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7425000000000015, 0, 161, 1.0, 1.0, 4.0, 25.99000000000001, 104.7211798586264, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 66.02249999999992, 10, 273, 54.0, 124.0, 164.79999999999995, 225.97000000000003, 38.71092615890835, 11.492306203425917, 19.015230330010645], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 361.0, 361, 361, 361.0, 361.0, 361.0, 361.0, 2.770083102493075, 1.6744935941828256, 0.8277787396121884], "isController": false}, {"data": ["Post Booking Request", 400, 19, 4.75, 311.19250000000005, 59, 789, 298.5, 410.90000000000003, 496.5999999999999, 595.0, 35.46099290780142, 34.10298232491135, 16577.952802942156], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.227499999999996, 2, 168, 21.0, 59.900000000000034, 76.89999999999998, 120.91000000000008, 37.9794910748196, 44.2355366383403, 22.327786745157614], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 45.42249999999997, 1, 170, 38.0, 94.90000000000003, 111.89999999999998, 157.91000000000008, 37.50586029067042, 36.72479342475387, 16.445440693858416], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.526315789473685, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 595 milliseconds, but should not have lasted longer than 500 milliseconds.", 3, 15.789473684210526, 0.06815084052703317], "isController": false}, {"data": ["The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 664 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 546 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 599 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 587 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 541 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 536 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 789 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 594 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 19, "The operation lasted too long: It took 595 milliseconds, but should not have lasted longer than 500 milliseconds.", 3, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 664 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 19, "The operation lasted too long: It took 595 milliseconds, but should not have lasted longer than 500 milliseconds.", 3, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 664 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
