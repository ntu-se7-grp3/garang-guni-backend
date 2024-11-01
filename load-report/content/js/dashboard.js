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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 20, 0.45433893684688775, 48.527487505679254, 0, 666, 9.0, 146.0, 285.0, 417.97000000000025, 347.48973792232397, 253.04948368921694, 14845.604605354043], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 50.779999999999994, 8, 238, 42.0, 98.7000000000001, 121.0, 173.96000000000004, 38.71842028845223, 140.46846263672444, 17.203985577388444], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.164999999999992, 2, 183, 20.0, 61.0, 79.0, 119.94000000000005, 38.59141341051616, 37.91559258924264, 32.328788289917995], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 49.0, 49, 49, 49.0, 49.0, 49.0, 49.0, 20.408163265306122, 11.619100765306122, 12.017697704081632], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8962500000000011, 0, 138, 0.0, 1.0, 1.0, 28.0, 68.75805758487323, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7841666666666658, 0, 158, 1.0, 2.0, 4.0, 22.99000000000001, 104.85844110450891, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 69.56249999999999, 10, 289, 58.0, 128.0, 167.79999999999995, 258.98, 39.100684261974585, 11.608015640273704, 19.20668377321603], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 361.0, 361, 361, 361.0, 361.0, 361.0, 361.0, 2.770083102493075, 1.6744935941828256, 0.8277787396121884], "isController": false}, {"data": ["Post Booking Request", 400, 20, 5.0, 307.2, 46, 666, 292.0, 428.80000000000007, 501.1499999999998, 626.8100000000002, 35.60619547801317, 34.22115272276126, 16640.856144711368], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.542499999999997, 2, 155, 21.0, 62.900000000000034, 80.0, 125.99000000000001, 38.48003848003848, 44.7960821007696, 22.622053872053872], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.62499999999998, 1, 146, 36.0, 82.90000000000003, 101.0, 133.99, 37.97228023542814, 37.15934340587621, 16.64995490791722], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 502 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 627 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 632 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 551 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 606 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 605 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 608 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 600 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 10.0, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 520 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 666 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 634 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 503 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 518 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.0, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 20, "The operation lasted too long: It took 600 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 502 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 20, "The operation lasted too long: It took 600 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 583 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 502 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 558 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
