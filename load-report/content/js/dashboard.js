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

    var data = {"OkPercent": 99.77283053157656, "KoPercent": 0.22716946842344388};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9977283053157655, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.975, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 10, 0.22716946842344388, 48.276465243071414, 0, 700, 9.0, 141.0, 287.0, 419.9400000000005, 350.72902557565135, 256.56750146900646, 15001.425278613258], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.625000000000014, 9, 221, 39.5, 90.0, 121.89999999999998, 177.98000000000002, 38.86136209074128, 142.0007073982318, 17.26749975711649], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 28.262499999999967, 2, 140, 20.0, 64.7000000000001, 79.0, 118.98000000000002, 38.71842028845223, 38.29153458038912, 32.68870692575743], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 59.0, 59, 59, 59.0, 59.0, 59.0, 59.0, 16.949152542372882, 9.649761652542374, 9.980799788135593], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8962499999999992, 0, 149, 0.0, 1.0, 1.0, 10.960000000000036, 69.93006993006993, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.8141666666666674, 0, 152, 1.0, 2.0, 4.0, 27.980000000000018, 107.34412738169782, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 65.58249999999995, 11, 249, 55.5, 125.90000000000003, 151.89999999999998, 208.94000000000005, 39.30431364842291, 11.668468114375553, 19.306708755035867], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 372.0, 372, 372, 372.0, 372.0, 372.0, 372.0, 2.688172043010753, 1.624978998655914, 0.8033014112903226], "isController": false}, {"data": ["Post Booking Request", 400, 10, 2.5, 306.27499999999986, 70, 700, 296.5, 425.7000000000001, 458.74999999999994, 529.9100000000001, 36.27459871225175, 34.90978464790968, 16972.84196248413], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 30.185, 2, 153, 22.0, 66.0, 82.0, 113.99000000000001, 38.54307188282906, 44.918111028136444, 22.659110618616303], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 44.03999999999999, 1, 150, 39.0, 85.0, 105.0, 134.0, 38.2262996941896, 37.45617414468654, 16.761336487003057], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 598 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 502 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 541 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 700 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 509 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 510 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 501 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 10, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 598 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 502 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 10, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 598 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 502 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
