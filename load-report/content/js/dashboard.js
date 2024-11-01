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

    var data = {"OkPercent": 99.72739663789187, "KoPercent": 0.2726033621081327};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9972739663789186, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.97, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 12, 0.2726033621081327, 49.08268968650611, 0, 578, 9.0, 142.70000000000027, 293.0, 423.0, 342.3283303522824, 249.95192751671982, 14638.84624217474], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 54.01500000000001, 8, 202, 45.0, 102.80000000000007, 128.95, 171.99, 37.835792659856224, 137.94952173193343, 16.811802402572834], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 28.8575, 2, 160, 22.0, 64.0, 79.94999999999999, 142.7900000000002, 37.83221413033198, 37.344533245058166, 31.867082574718623], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 55.0, 55, 55, 55.0, 55.0, 55.0, 55.0, 18.18181818181818, 10.3515625, 10.706676136363637], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.2862499999999997, 0, 180, 0.0, 1.0, 1.0, 25.99000000000001, 68.1721346399659, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.9250000000000007, 0, 157, 1.0, 1.900000000000091, 3.9500000000000455, 25.99000000000001, 104.83096007687604, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 66.0575, 11, 193, 59.0, 120.90000000000003, 140.89999999999998, 181.92000000000007, 38.20439350525311, 11.341929321872014, 18.766415950334288], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 377.0, 377, 377, 377.0, 377.0, 377.0, 377.0, 2.6525198938992043, 1.6034275530503979, 0.7926475464190982], "isController": false}, {"data": ["Post Booking Request", 400, 12, 3.0, 310.2150000000001, 93, 578, 303.5, 433.50000000000017, 466.95, 545.99, 35.4295837023915, 34.035322326173606, 16573.812209366697], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 31.5125, 2, 196, 23.5, 70.90000000000003, 92.0, 111.99000000000001, 37.72161448509996, 43.894845105620526, 22.176183515654472], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 40.07000000000001, 1, 146, 34.0, 88.90000000000003, 101.94999999999999, 134.95000000000005, 37.42865163282492, 36.60916885000468, 16.411586506971087], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 545 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 528 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 546 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 557 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 509 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 518 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 12, "The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 12, "The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
