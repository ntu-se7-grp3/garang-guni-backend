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

    var data = {"OkPercent": 99.54566106315312, "KoPercent": 0.45433893684688775};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9954566106315311, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.95, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 20, 0.45433893684688775, 50.37142208087237, 0, 805, 11.0, 145.0, 281.84999999999945, 428.7900000000018, 337.4472978152549, 245.89065194998085, 14450.0479859381], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 58.3625, 9, 312, 47.5, 115.90000000000003, 130.95, 199.9000000000001, 37.37619136609979, 135.73725997477106, 16.60758503083536], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 30.705000000000013, 2, 153, 23.0, 66.0, 79.94999999999999, 112.99000000000001, 37.16781267422412, 36.54977075009292, 31.171417661679985], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 58.0, 58, 58, 58.0, 58.0, 58.0, 58.0, 17.241379310344826, 9.816136853448276, 10.152882543103448], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.92375, 0, 145, 0.0, 1.0, 1.0, 11.990000000000009, 67.00167504187604, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.5466666666666682, 0, 157, 1.0, 1.0, 2.9500000000000455, 18.970000000000027, 102.0321401241391, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 69.65749999999994, 11, 244, 60.0, 126.90000000000003, 161.89999999999998, 198.0, 37.73584905660377, 11.202830188679245, 18.53626179245283], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 378.0, 378, 378, 378.0, 378.0, 378.0, 378.0, 2.6455026455026456, 1.5991856812169312, 0.7905505952380952], "isController": false}, {"data": ["Post Booking Request", 400, 20, 5.0, 308.49, 31, 805, 292.0, 436.0, 506.1999999999998, 614.98, 34.638032559750606, 33.29580879806027, 16226.165211237876], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 32.497499999999995, 2, 175, 24.0, 74.0, 88.94999999999999, 119.96000000000004, 37.02675182819587, 43.109769855595665, 21.76768027399796], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 47.047500000000014, 1, 208, 41.0, 92.90000000000003, 113.89999999999998, 162.95000000000005, 36.61327231121282, 35.83488272311212, 16.054061784897023], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.0, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 545 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 615 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 668 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 805 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 561 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 724 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 519 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 602 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 613 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 532 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 518 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 20, "The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 20, "The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
