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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 20, 0.45433893684688775, 47.62721490231719, 0, 649, 9.0, 137.70000000000027, 287.0, 413.97000000000025, 355.45865633074936, 259.13082783228356, 15193.64365373163], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 47.5925, 6, 202, 37.0, 96.90000000000003, 122.94999999999999, 165.95000000000005, 39.181114702713295, 142.44592700068569, 17.409577333725146], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.180000000000007, 2, 164, 21.0, 60.80000000000007, 75.89999999999998, 107.95000000000005, 39.0205833577212, 38.411839393717685, 32.76385764193737], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 12.113530585106384, 12.52908909574468], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.1087499999999997, 0, 139, 0.0, 1.0, 1.0, 27.0, 70.6152352370024, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7550000000000006, 0, 169, 1.0, 1.0, 4.0, 26.970000000000027, 107.8167115902965, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 62.96499999999998, 10, 235, 53.5, 124.80000000000007, 155.84999999999997, 192.98000000000002, 39.5687011573845, 11.746958156098525, 19.43657879117618], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 366.0, 366, 366, 366.0, 366.0, 366.0, 366.0, 2.73224043715847, 1.65161799863388, 0.8164702868852459], "isController": false}, {"data": ["Post Booking Request", 400, 20, 5.0, 307.12500000000034, 57, 649, 298.0, 419.80000000000007, 509.34999999999985, 590.9100000000001, 36.56307129798903, 35.12982746800731, 17096.57837137226], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.872500000000006, 2, 131, 25.0, 66.0, 79.84999999999997, 106.97000000000003, 38.8689145855602, 45.23664108808668, 22.8506704887766], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 40.88749999999997, 1, 138, 36.0, 81.60000000000014, 97.0, 123.94000000000005, 38.52080123266564, 37.684083535968796, 16.890468509244993], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.0, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.0, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 546 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 510 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 525 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 537 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.0, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 568 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 594 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 582 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 649 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 20, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 20, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
