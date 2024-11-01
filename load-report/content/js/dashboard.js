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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 12, 0.2726033621081327, 46.126533393911984, 0, 717, 9.0, 131.70000000000027, 277.6999999999989, 399.0, 365.4325087165864, 266.5641894871742, 15613.252470348041], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 44.827500000000015, 9, 158, 38.0, 83.90000000000003, 100.94999999999999, 141.95000000000005, 40.93327875562833, 148.75329384977488, 18.188126790830946], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.88750000000001, 2, 141, 18.0, 57.0, 75.0, 132.99, 40.807998367680064, 40.15373536650684, 34.24773404024689], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 12.113530585106384, 12.52908909574468], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8587500000000008, 0, 175, 0.0, 1.0, 1.0, 4.0, 72.81995266703078, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.6283333333333354, 0, 166, 1.0, 1.0, 2.0, 17.980000000000018, 112.03435720287555, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 64.01749999999997, 11, 313, 54.0, 117.90000000000003, 147.89999999999998, 248.76000000000022, 41.343669250645995, 12.27390180878553, 20.30846253229974], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 366.0, 366, 366, 366.0, 366.0, 366.0, 366.0, 2.73224043715847, 1.65161799863388, 0.8164702868852459], "isController": false}, {"data": ["Post Booking Request", 400, 12, 3.0, 294.4875, 87, 717, 285.0, 401.90000000000003, 457.0, 553.9300000000001, 37.87878787878788, 36.48015802556818, 17704.156216708096], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.447499999999984, 1, 157, 22.0, 64.90000000000003, 84.0, 113.95000000000005, 40.51043143609479, 47.239851029218144, 23.815702855985414], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 41.32, 1, 199, 35.0, 84.0, 106.94999999999999, 134.96000000000004, 40.056078509913874, 39.27774274609453, 17.56365161225716], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 592 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 506 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 524 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 527 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 12, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 12, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
