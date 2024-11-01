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

    var data = {"OkPercent": 99.43207632894139, "KoPercent": 0.5679236710586097};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9943207632894139, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9375, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 25, 0.5679236710586097, 49.387096774193566, 0, 876, 10.0, 138.70000000000027, 298.84999999999945, 437.97000000000025, 339.634287477818, 247.79921193870072, 14502.352912101689], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.31, 8, 179, 42.5, 96.90000000000003, 115.89999999999998, 163.95000000000005, 38.27751196172249, 139.1866028708134, 17.008074162679428], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.777499999999996, 2, 124, 20.0, 55.0, 71.94999999999999, 115.85000000000014, 38.16065636328945, 37.56989288184507, 32.047684423297085], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 52.0, 52, 52, 52.0, 52.0, 52.0, 52.0, 19.230769230769234, 10.948768028846155, 11.324368990384617], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.093749999999999, 0, 184, 0.0, 1.0, 1.0, 19.99000000000001, 67.33439946132481, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 2.4549999999999943, 0, 193, 1.0, 1.0, 4.0, 63.99000000000001, 103.00429184549357, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 67.07250000000009, 11, 268, 55.5, 127.0, 151.95, 221.98000000000002, 38.52080123266564, 11.43586286594761, 18.921838886748844], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 371.0, 371, 371, 371.0, 371.0, 371.0, 371.0, 2.6954177897574128, 1.6293589959568733, 0.8054666442048518], "isController": false}, {"data": ["Post Booking Request", 400, 25, 6.25, 319.65000000000026, 48, 876, 308.0, 448.0, 517.8499999999999, 615.8600000000001, 35.140121233418256, 33.831288983571994, 16414.250983511596], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.002499999999987, 2, 180, 22.5, 58.0, 70.94999999999999, 107.99000000000001, 38.02642836771556, 44.32984732983173, 22.35538073961403], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 43.08250000000001, 1, 144, 37.0, 83.90000000000003, 104.94999999999999, 131.99, 37.622272385252074, 36.87800169888074, 16.496484668924005], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 8.0, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 566 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 546 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 525 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 548 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 876 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 506 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 553 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 857 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 586 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 593 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 575 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 602 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 515 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 616 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 539 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 518 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.0, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 25, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 857 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 586 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 25, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 857 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 586 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
