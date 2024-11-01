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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 19, 0.4316219900045434, 48.23534756928678, 0, 796, 10.0, 145.70000000000027, 277.0, 406.9400000000005, 346.09639122572526, 252.54601875147418, 14774.824604184685], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 51.63750000000003, 7, 223, 42.0, 105.80000000000007, 136.84999999999997, 182.99, 38.93701937116713, 141.66458799766377, 17.30111700574321], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 29.902500000000035, 2, 206, 20.5, 62.900000000000034, 94.94999999999999, 135.96000000000004, 38.73716831299632, 38.15951542223513, 32.551894187003676], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 71.0, 71, 71, 71.0, 71.0, 71.0, 71.0, 14.084507042253522, 8.018816021126762, 8.293904049295776], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.0525000000000009, 0, 164, 0.0, 1.0, 1.0, 21.980000000000018, 69.16227198063456, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 2.0366666666666657, 0, 189, 1.0, 2.0, 4.0, 22.980000000000018, 105.60591393118014, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 64.39750000000012, 10, 373, 54.0, 122.7000000000001, 149.84999999999997, 211.74000000000024, 39.52959778634253, 11.735349342820436, 19.417370787627235], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 371.0, 371, 371, 371.0, 371.0, 371.0, 371.0, 2.6954177897574128, 1.6293589959568733, 0.8054666442048518], "isController": false}, {"data": ["Post Booking Request", 400, 19, 4.75, 302.7099999999998, 39, 796, 289.5, 413.7000000000001, 499.84999999999997, 725.920000000001, 36.11738148984198, 34.75239841986456, 16866.74582040068], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.592500000000026, 2, 175, 24.0, 62.0, 76.94999999999999, 123.91000000000008, 38.528221922558274, 44.89450265483529, 22.650380466191486], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 43.27000000000002, 1, 144, 37.5, 85.0, 97.0, 126.99000000000001, 38.186157517899765, 37.41059442124105, 16.74373508353222], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 603 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 758 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 580 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.526315789473685, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.526315789473685, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 796 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 727 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 619 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 597 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 523 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 791 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 544 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 503 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 19, "The operation lasted too long: It took 580 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 19, "The operation lasted too long: It took 580 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
