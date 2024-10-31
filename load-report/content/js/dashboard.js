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

    var data = {"OkPercent": 99.6365288505225, "KoPercent": 0.36347114947751025};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9963652885052249, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.96, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 16, 0.36347114947751025, 46.86392548841444, 0, 801, 8.5, 136.40000000000055, 279.0, 403.8500000000013, 358.26483275006103, 261.2080953192398, 15321.69893739318], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 47.77499999999999, 6, 209, 40.0, 90.0, 109.0, 178.93000000000006, 40.100250626566414, 145.60189536340852, 17.817982456140353], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 24.857500000000012, 2, 146, 19.0, 54.900000000000034, 67.94999999999999, 107.96000000000004, 39.93211540381351, 39.26206308650295, 33.48185038559449], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 51.0, 51, 51, 51.0, 51.0, 51.0, 51.0, 19.607843137254903, 11.163449754901961, 11.546415441176471], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.7874999999999988, 0, 129, 0.0, 1.0, 1.0, 10.990000000000009, 71.37758743754462, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.625000000000001, 0, 167, 1.0, 1.0, 3.0, 25.99000000000001, 108.7547580206634, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 64.11250000000003, 9, 239, 54.0, 122.80000000000007, 145.0, 210.81000000000017, 40.51043143609479, 12.026534332590641, 19.899167004253595], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 356.0, 356, 356, 356.0, 356.0, 356.0, 356.0, 2.8089887640449436, 1.6980117626404496, 0.839404845505618], "isController": false}, {"data": ["Post Booking Request", 400, 16, 4.0, 300.05999999999995, 43, 801, 288.5, 409.7000000000001, 487.5499999999999, 656.6700000000003, 37.16090672612412, 35.789872491638796, 17385.421202910165], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 27.35000000000001, 2, 154, 20.0, 63.80000000000007, 77.94999999999999, 121.97000000000003, 39.74957766073735, 46.35047249205008, 23.36840405445692], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 44.115, 1, 145, 37.0, 89.90000000000003, 101.0, 130.96000000000004, 39.350713231677325, 38.58396996433842, 17.25436546974914], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 657 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 624 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 760 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 566 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 602 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 12.5, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 509 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 801 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 741 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 503 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 16, "The operation lasted too long: It took 602 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 657 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 16, "The operation lasted too long: It took 602 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 657 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
