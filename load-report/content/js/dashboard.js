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

    var data = {"OkPercent": 99.75011358473421, "KoPercent": 0.24988641526578828};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9975011358473421, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9725, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 11, 0.24988641526578828, 46.21990004543381, 0, 717, 8.0, 129.40000000000055, 276.0, 396.8200000000015, 360.6718557968046, 263.0524119213437, 15452.299982717124], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.30749999999996, 8, 201, 40.0, 99.0, 109.89999999999998, 156.80000000000018, 40.18888777253089, 145.9386460112529, 17.8573671254898], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.587500000000016, 2, 206, 17.0, 62.900000000000034, 75.94999999999999, 136.7900000000002, 40.08417677121956, 39.41401944082574, 33.612187155526605], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 55.0, 55, 55, 55.0, 55.0, 55.0, 55.0, 18.18181818181818, 10.3515625, 10.706676136363637], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.7450000000000008, 0, 143, 0.0, 1.0, 1.0, 4.990000000000009, 71.80683960147203, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7900000000000025, 0, 164, 1.0, 1.0, 3.9500000000000455, 31.0, 109.60906101571064, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 63.32500000000007, 11, 216, 55.0, 113.0, 142.95, 194.0, 40.58853373921867, 12.049720953830542, 19.937531709791983], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 350.0, 350, 350, 350.0, 350.0, 350.0, 350.0, 2.857142857142857, 1.7271205357142858, 0.8537946428571429], "isController": false}, {"data": ["Post Booking Request", 400, 11, 2.75, 292.9825000000001, 46, 717, 283.0, 404.90000000000003, 453.84999999999997, 592.8200000000002, 37.216226274655746, 35.8704090295869, 17442.710453398307], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.66999999999997, 2, 158, 20.0, 64.0, 82.0, 126.91000000000008, 39.98800359892032, 46.6597325489853, 23.508572428271517], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 41.90499999999998, 1, 192, 35.0, 84.90000000000003, 100.0, 144.83000000000015, 39.31203931203931, 38.57676213144963, 17.23740786240786], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 18.181818181818183, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 18.181818181818183, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 597 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 627 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 510 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 525 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 575 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 11, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 597 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 11, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 597 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
