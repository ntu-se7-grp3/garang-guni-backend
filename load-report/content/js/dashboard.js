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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 13, 0.29532030895047706, 48.83780099954571, 0, 741, 9.0, 139.70000000000027, 293.0, 403.97000000000025, 348.23194367534217, 253.9426364360019, 14886.490851940116], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 52.352499999999985, 8, 190, 41.0, 113.0, 130.95, 156.92000000000007, 38.4948513136368, 140.10546987777886, 17.104645847367916], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 28.2075, 2, 169, 20.0, 61.900000000000034, 76.89999999999998, 120.99000000000001, 38.439361906592346, 37.878913006919085, 32.315153216894096], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 51.0, 51, 51, 51.0, 51.0, 51.0, 51.0, 19.607843137254903, 11.163449754901961, 11.546415441176471], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.1512499999999999, 0, 168, 0.0, 1.0, 1.0, 27.960000000000036, 68.87052341597796, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.977499999999999, 0, 177, 1.0, 2.0, 4.0, 29.980000000000018, 105.90415673815197, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 66.49499999999998, 11, 267, 57.0, 119.0, 149.74999999999994, 193.98000000000002, 38.88024883359253, 11.542573872472783, 19.09840347978227], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 354.0, 354, 354, 354.0, 354.0, 354.0, 354.0, 2.824858757062147, 1.7076050494350283, 0.8441472457627119], "isController": false}, {"data": ["Post Booking Request", 400, 13, 3.25, 308.55999999999966, 73, 741, 308.5, 408.90000000000003, 466.5999999999999, 572.6800000000003, 35.78137579389928, 34.34881040902585, 16732.999915438544], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 30.180000000000035, 2, 168, 23.5, 64.0, 86.94999999999999, 119.98000000000002, 38.29216925138809, 44.53353107648861, 22.511607313804326], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.4175, 1, 185, 37.0, 85.80000000000007, 98.94999999999999, 132.96000000000004, 37.778617302606726, 36.9265692883453, 16.56503825085002], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 15.384615384615385, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 598 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 502 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 510 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 653 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 519 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 541 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 527 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 741 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 13, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 653 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 13, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 653 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
