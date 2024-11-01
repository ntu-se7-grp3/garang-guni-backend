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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 16, 0.36347114947751025, 47.542026351658315, 0, 844, 9.0, 137.0, 287.0, 415.97000000000025, 352.63958984218533, 257.09746505247136, 15032.902403518785], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.04750000000003, 9, 175, 41.0, 95.90000000000003, 114.89999999999998, 152.8900000000001, 39.24646781789639, 142.7716744750785, 17.43861607142857], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.28749999999999, 2, 213, 18.5, 54.900000000000034, 67.89999999999998, 115.81000000000017, 39.06631506983104, 38.476696027444085, 32.82257178435394], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 51.0, 51, 51, 51.0, 51.0, 51.0, 51.0, 19.607843137254903, 11.163449754901961, 11.546415441176471], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.9299999999999999, 0, 155, 0.0, 1.0, 1.0, 16.99000000000001, 70.12008063809273, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.8258333333333272, 0, 158, 1.0, 2.0, 3.0, 30.99000000000001, 107.34412738169782, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 64.19249999999997, 10, 246, 53.0, 119.90000000000003, 150.0, 204.98000000000002, 39.631427722183695, 11.765580105023284, 19.46739076587734], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 355.0, 355, 355, 355.0, 355.0, 355.0, 355.0, 2.8169014084507045, 1.7027948943661972, 0.8417693661971831], "isController": false}, {"data": ["Post Booking Request", 400, 16, 4.0, 306.75249999999994, 70, 844, 298.5, 421.80000000000007, 470.84999999999997, 610.9000000000001, 36.36694244931357, 34.91581621056459, 16959.177840741202], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.49250000000002, 2, 147, 21.0, 62.900000000000034, 80.79999999999995, 110.95000000000005, 38.90672113607626, 45.253949944071586, 22.87289660538858], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.07500000000003, 1, 158, 36.0, 88.0, 103.94999999999999, 139.93000000000006, 38.55050115651504, 37.68669134300308, 16.903491229760988], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 639 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 535 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 611 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 844 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 501 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 541 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 511 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 523 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 570 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 568 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 756 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.25, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 16, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 639 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 535 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 16, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 639 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 535 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
