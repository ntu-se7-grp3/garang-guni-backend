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

    var data = {"OkPercent": 99.65924579736483, "KoPercent": 0.3407542026351658};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9965924579736484, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9625, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 15, 0.3407542026351658, 48.15765561108595, 0, 791, 10.0, 141.0, 275.0, 397.91000000000076, 348.8390522228386, 254.07727806284174, 14859.14608551589], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 55.265, 9, 175, 46.5, 105.0, 128.95, 158.0, 39.30817610062893, 142.8303268720519, 17.46603527908805], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 28.999999999999982, 2, 134, 21.0, 64.80000000000007, 87.94999999999999, 124.92000000000007, 39.20031360250882, 38.567328069874556, 32.89361861769894], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 52.0, 52, 52, 52.0, 52.0, 52.0, 52.0, 19.230769230769234, 10.948768028846155, 11.324368990384617], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.1774999999999982, 0, 179, 0.0, 1.0, 1.0, 17.99000000000001, 69.49270326615705, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.8350000000000002, 0, 165, 1.0, 1.0, 4.0, 25.99000000000001, 106.5057246827017, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 67.85999999999996, 11, 240, 59.0, 126.90000000000003, 156.0, 224.93000000000006, 39.63928252898623, 11.767912000792787, 19.471249132890694], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 358.0, 358, 358, 358.0, 358.0, 358.0, 358.0, 2.793296089385475, 1.6885256634078214, 0.8347154329608939], "isController": false}, {"data": ["Post Booking Request", 400, 15, 3.75, 296.72999999999945, 63, 791, 286.0, 409.00000000000034, 450.84999999999997, 591.99, 36.14022406938923, 34.66708642031081, 16840.10341962753], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.589999999999996, 2, 204, 21.0, 63.80000000000007, 75.0, 112.0, 39.05868567522703, 45.396853792354264, 22.962235133287766], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 43.64500000000002, 1, 138, 39.5, 88.0, 99.89999999999998, 130.99, 38.63614411281755, 37.736929362262146, 16.941043658842847], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 609 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 592 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 548 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 588 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 706 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 791 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 582 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 15, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 609 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 592 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 15, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 609 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 592 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
