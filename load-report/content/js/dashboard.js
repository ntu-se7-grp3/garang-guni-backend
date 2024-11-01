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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 11, 0.24988641526578828, 46.831440254429644, 0, 781, 9.0, 140.0, 275.0, 407.91000000000076, 360.93801246310267, 262.72157623401114, 15429.029785636685], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.85999999999999, 8, 205, 41.0, 94.0, 110.89999999999998, 176.92000000000007, 39.6000396000396, 143.58146780021778, 17.59572072072072], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 28.050000000000015, 2, 163, 19.5, 60.0, 84.0, 133.85000000000014, 39.43217665615142, 38.71843115388407, 33.010103725108436], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 51.0, 51, 51, 51.0, 51.0, 51.0, 51.0, 19.607843137254903, 11.163449754901961, 11.546415441176471], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8225000000000011, 0, 142, 0.0, 1.0, 1.0, 12.980000000000018, 71.73601147776183, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.5500000000000034, 0, 144, 1.0, 1.0, 3.0, 15.990000000000009, 109.83981693363843, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 62.91999999999999, 11, 250, 53.0, 120.0, 148.95, 194.8800000000001, 39.916176030336295, 11.850114759006086, 19.607262249276516], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 333.0, 333, 333, 333.0, 333.0, 333.0, 333.0, 3.003003003003003, 1.8152918543543544, 0.8973817567567567], "isController": false}, {"data": ["Post Booking Request", 400, 11, 2.75, 297.51749999999987, 72, 781, 285.5, 415.0, 455.95, 554.99, 37.08167238342449, 35.62846192175767, 17340.49684371234], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.52000000000001, 2, 150, 23.0, 56.900000000000034, 74.94999999999999, 115.99000000000001, 39.2695857058708, 45.7022813174946, 23.086221284115453], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.257499999999965, 1, 155, 35.5, 87.0, 100.0, 137.97000000000003, 39.005363237445145, 38.15745368113115, 17.10293759141882], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 621 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 781 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 509 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 510 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 11, "The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 11, "The operation lasted too long: It took 534 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 555 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
