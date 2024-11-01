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

    var data = {"OkPercent": 99.61381190368014, "KoPercent": 0.3861880963198546};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9961381190368015, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9575, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 17, 0.3861880963198546, 48.91640163562, 0, 817, 10.0, 138.0, 285.0, 419.9400000000005, 337.9135641360252, 246.47202085092502, 14424.06861110578], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.78249999999998, 7, 159, 43.0, 95.0, 114.94999999999999, 148.97000000000003, 37.99753016053956, 137.9789024650898, 16.883668186567874], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 28.945000000000032, 2, 139, 22.0, 64.0, 83.89999999999998, 109.94000000000005, 37.87878787878788, 37.24698153409091, 31.762972745028407], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 12.113530585106384, 12.52908909574468], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.9175000000000003, 0, 163, 0.0, 1.0, 1.0, 13.990000000000009, 67.36842105263158, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 2.07833333333333, 0, 159, 1.0, 2.0, 5.0, 32.98000000000002, 102.76612143530016, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 67.32499999999999, 12, 289, 59.0, 127.0, 162.84999999999997, 227.86000000000013, 38.325189230621824, 11.377790552840855, 18.82575213183865], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 379.0, 379, 379, 379.0, 379.0, 379.0, 379.0, 2.638522427440633, 1.5949661939313984, 0.788464709762533], "isController": false}, {"data": ["Post Booking Request", 400, 17, 4.25, 306.67499999999995, 34, 817, 293.0, 425.60000000000014, 478.95, 663.98, 34.91620111731844, 33.66191160745461, 16304.231100242232], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 31.122499999999977, 2, 142, 24.0, 69.90000000000003, 85.94999999999999, 115.97000000000003, 37.789324515824276, 44.101230367264996, 22.215989607935757], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 45.34000000000001, 1, 152, 41.0, 91.80000000000007, 105.94999999999999, 148.8800000000001, 37.334328915437744, 36.64296933334889, 16.370228206085496], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 664 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 728 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 546 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 815 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 11.764705882352942, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 653 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 650 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 662 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 817 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 619 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 544 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 651 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 17, "The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 664 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 17, "The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 508 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 589 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 664 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 514 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
