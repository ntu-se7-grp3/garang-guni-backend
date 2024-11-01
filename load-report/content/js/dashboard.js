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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 15, 0.3407542026351658, 46.84166288050889, 0, 820, 9.0, 136.70000000000027, 275.0, 407.97000000000025, 355.57350565428106, 259.16675080775445, 15153.197729452746], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 50.79749999999997, 8, 160, 43.0, 92.0, 112.94999999999999, 153.96000000000004, 39.710116152089746, 144.33192383103346, 17.64463168867269], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 26.372499999999985, 2, 137, 19.0, 59.900000000000034, 71.94999999999999, 106.98000000000002, 39.54522985664855, 38.91874304869006, 33.19356694883836], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 52.0, 52, 52, 52.0, 52.0, 52.0, 52.0, 19.230769230769234, 10.948768028846155, 11.324368990384617], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.89125, 0, 153, 0.0, 1.0, 1.0, 8.990000000000009, 70.9282737831368, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7541666666666664, 0, 147, 1.0, 1.0, 3.0, 28.980000000000018, 108.33258102374289, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 63.710000000000065, 11, 213, 54.0, 117.80000000000007, 149.95, 184.94000000000005, 40.11231448054553, 11.908343361411953, 19.703607601283593], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 356.0, 356, 356, 356.0, 356.0, 356.0, 356.0, 2.8089887640449436, 1.6980117626404496, 0.839404845505618], "isController": false}, {"data": ["Post Booking Request", 400, 15, 3.75, 294.59000000000003, 48, 820, 284.0, 410.90000000000003, 462.5999999999999, 626.97, 36.801913699512376, 35.3559830423682, 17156.60885459794], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.797500000000007, 2, 150, 23.0, 64.90000000000003, 81.0, 126.72000000000025, 39.35845714847978, 45.80225142674407, 23.138467972055494], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 43.16000000000009, 1, 162, 36.0, 92.90000000000003, 103.94999999999999, 128.98000000000002, 39.01677721420211, 38.16519032871634, 17.107942352711664], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 13.333333333333334, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 598 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 624 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 627 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 606 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 820 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 710 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 647 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 582 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 556 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 15, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 598 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 624 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 15, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 598 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 624 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
