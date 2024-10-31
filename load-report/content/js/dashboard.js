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

    var data = {"OkPercent": 99.36392548841435, "KoPercent": 0.6360745115856429};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9936392548841436, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.93, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 28, 0.6360745115856429, 51.97387551113124, 0, 855, 11.0, 151.0, 294.6999999999989, 438.97000000000025, 325.32702682728547, 237.42687509238044, 13898.495815165175], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 56.200000000000024, 10, 192, 46.0, 109.90000000000003, 126.94999999999999, 161.98000000000002, 36.7680853019579, 133.78627975916905, 16.337381652725433], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 30.212500000000006, 2, 155, 21.0, 69.7000000000001, 86.0, 135.99, 36.630036630036635, 36.08791924221612, 30.784970238095237], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 56.0, 56, 56, 56.0, 56.0, 56.0, 56.0, 17.857142857142858, 10.166713169642858, 10.515485491071429], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.2150000000000014, 0, 195, 0.0, 1.0, 1.0, 9.990000000000009, 64.70397929472662, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 2.253333333333333, 0, 208, 1.0, 2.0, 4.0, 29.99000000000001, 99.27200529450694, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 71.15500000000002, 11, 321, 60.5, 136.90000000000003, 165.89999999999998, 234.81000000000017, 37.13330857779428, 11.023950984032677, 18.24028731897512], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 377.0, 377, 377, 377.0, 377.0, 377.0, 377.0, 2.6525198938992043, 1.6034275530503979, 0.7926475464190982], "isController": false}, {"data": ["Post Booking Request", 400, 28, 7.0, 322.97499999999997, 76, 855, 303.5, 443.80000000000007, 554.6499999999999, 731.5300000000004, 33.835222466587716, 32.56441909152428, 15812.783089129378], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 33.947499999999955, 2, 138, 27.0, 71.7000000000001, 93.89999999999998, 120.99000000000001, 36.54302941713868, 42.590918628951215, 21.483304403435046], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 47.21000000000005, 1, 238, 40.0, 94.0, 110.89999999999998, 150.91000000000008, 36.146755828664375, 35.42214398269474, 15.849505241279594], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 622 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 636 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 615 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 7.142857142857143, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 685 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 612 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 525 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 548 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 519 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 855 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 680 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 625 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 503 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 590 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 655 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 620 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 626 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 605 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 531 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 650 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 838 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 732 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 849 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 518 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 3.5714285714285716, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 28, "The operation lasted too long: It took 615 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 622 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 636 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 28, "The operation lasted too long: It took 615 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 622 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 636 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
