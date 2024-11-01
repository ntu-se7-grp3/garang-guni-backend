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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 11, 0.24988641526578828, 47.351885506587855, 0, 708, 10.0, 135.70000000000027, 280.0, 403.0, 356.9285656369091, 259.81638122820885, 15232.391231224154], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 51.33750000000001, 8, 187, 44.0, 95.0, 117.94999999999999, 175.97000000000003, 39.17344040740378, 142.00984232690234, 17.40616736852414], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.380000000000013, 2, 110, 22.0, 58.0, 73.0, 103.98000000000002, 39.051059259982424, 38.33887319388851, 32.68609889070585], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 55.0, 55, 55, 55.0, 55.0, 55.0, 55.0, 18.18181818181818, 10.3515625, 10.706676136363637], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8762500000000015, 0, 151, 0.0, 1.0, 1.0, 17.940000000000055, 70.577856197618, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.5449999999999993, 0, 136, 1.0, 1.0, 3.0, 20.980000000000018, 107.93308148947654, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 63.625, 10, 223, 57.0, 116.90000000000003, 144.79999999999995, 203.95000000000005, 39.54913980620921, 11.74115087996836, 19.426970041526594], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 356.0, 356, 356, 356.0, 356.0, 356.0, 356.0, 2.8089887640449436, 1.6980117626404496, 0.839404845505618], "isController": false}, {"data": ["Post Booking Request", 400, 11, 2.75, 300.2599999999998, 55, 708, 291.0, 408.7000000000001, 454.95, 567.96, 36.51967497489272, 35.10320017917466, 17049.267234861454], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.29749999999999, 2, 201, 22.0, 61.0, 71.94999999999999, 94.96000000000004, 38.98255530650034, 45.3833652604522, 22.917478803235554], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.79249999999998, 2, 152, 37.0, 84.80000000000007, 103.84999999999997, 129.94000000000005, 38.58024691358025, 37.75655487437307, 16.916534047067902], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 564 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 536 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 708 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 568 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 556 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 563 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 11, "The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 11, "The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
