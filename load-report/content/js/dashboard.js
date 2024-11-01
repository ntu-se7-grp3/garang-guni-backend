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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 15, 0.3407542026351658, 47.157428441617505, 0, 732, 9.0, 140.0, 288.0, 408.0, 354.91413367733617, 258.5986001370636, 15171.120551731436], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.28249999999999, 8, 187, 41.0, 94.90000000000003, 116.89999999999998, 157.95000000000005, 39.66286564204264, 143.95993430837876, 17.623636588993552], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 24.79500000000001, 2, 143, 18.0, 54.0, 69.0, 107.97000000000003, 39.607881968511734, 38.92992576616496, 33.19887024705416], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 40.0, 40, 40, 40.0, 40.0, 40.0, 40.0, 25.0, 14.2333984375, 14.7216796875], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8700000000000011, 0, 161, 0.0, 1.0, 1.0, 8.980000000000018, 70.11393514461, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.8741666666666674, 0, 186, 1.0, 1.0, 3.0, 23.0, 107.03773080010703, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 63.54000000000003, 10, 313, 51.5, 125.80000000000007, 150.95, 231.91000000000008, 40.060090135202806, 11.892839258888333, 19.67795443164747], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 350.0, 350, 350, 350.0, 350.0, 350.0, 350.0, 2.857142857142857, 1.7271205357142858, 0.8537946428571429], "isController": false}, {"data": ["Post Booking Request", 400, 15, 3.75, 304.0025000000001, 33, 732, 297.0, 420.60000000000014, 466.9, 599.97, 36.603221083455345, 35.20995736296669, 17116.259104336335], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 25.15499999999999, 2, 142, 19.0, 53.0, 65.94999999999999, 90.99000000000001, 39.51007506914264, 46.02576489035954, 23.22760272619518], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 44.85499999999998, 1, 169, 41.0, 86.90000000000003, 100.0, 143.99, 39.108330074305826, 38.30133884923739, 17.14808613609699], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 586 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 636 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 561 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 600 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 557 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 597 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 585 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 651 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 732 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 6.666666666666667, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 15, "The operation lasted too long: It took 586 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 636 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 15, "The operation lasted too long: It took 586 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 636 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
