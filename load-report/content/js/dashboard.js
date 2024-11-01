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

    var data = {"OkPercent": 99.34120854157202, "KoPercent": 0.6587914584279873};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9934120854157201, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9275, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 29, 0.6587914584279873, 50.926397092230836, 0, 878, 11.0, 144.40000000000055, 305.0, 437.97000000000025, 331.77570093457945, 241.68751589821375, 14161.783682426703], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.745000000000026, 9, 179, 42.0, 99.0, 113.94999999999999, 154.98000000000002, 37.418147801683816, 135.90278589803555, 16.626227782974745], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 26.847499999999993, 2, 128, 20.0, 58.0, 71.94999999999999, 103.92000000000007, 37.379684141669, 36.7626820799458, 31.387709822680122], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 59.0, 59, 59, 59.0, 59.0, 59.0, 59.0, 16.949152542372882, 9.633209745762713, 9.980799788135593], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.3162500000000013, 0, 190, 0.0, 1.0, 1.0, 27.99000000000001, 65.9358773592681, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 2.0999999999999988, 0, 195, 1.0, 2.0, 3.0, 25.980000000000018, 101.78980405462718, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 66.92749999999994, 11, 331, 56.0, 122.0, 156.0, 268.7000000000003, 37.75365738555923, 11.208117036337894, 18.545009438414347], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 375.0, 375, 375, 375.0, 375.0, 375.0, 375.0, 2.6666666666666665, 1.6119791666666667, 0.796875], "isController": false}, {"data": ["Post Booking Request", 400, 29, 7.25, 328.48750000000007, 66, 878, 313.0, 450.80000000000007, 556.1499999999999, 738.6500000000003, 34.602076124567475, 33.22939757244809, 16157.181029006271], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 30.812499999999996, 2, 156, 24.0, 65.90000000000003, 83.0, 123.99000000000001, 37.18508877939946, 43.259076938272756, 21.86076508320164], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 47.607499999999995, 2, 215, 38.0, 99.0, 120.84999999999997, 173.92000000000007, 36.64010259228726, 35.826613595768066, 16.065826234313455], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 535 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 702 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 772 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 689 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 739 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 6.896551724137931, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 628 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 503 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 837 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 631 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 878 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 704 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 653 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 692 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 623 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 6.896551724137931, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 557 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 602 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 681 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 515 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.4482758620689653, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 29, "The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 535 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 702 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 772 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 29, "The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 535 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 702 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 772 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
