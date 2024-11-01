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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 17, 0.3861880963198546, 47.27169468423443, 0, 823, 8.0, 137.70000000000027, 280.84999999999945, 397.97000000000025, 354.742525586268, 258.9583417277782, 15160.784810293939], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 46.012499999999996, 8, 177, 37.0, 86.90000000000003, 109.94999999999999, 149.93000000000006, 40.35105417129022, 146.86680369212147, 17.929423484313528], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.774999999999995, 1, 130, 21.0, 54.0, 72.94999999999999, 101.0, 40.18888777253089, 39.60185135763087, 33.78525554481061], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 52.0, 52, 52, 52.0, 52.0, 52.0, 52.0, 19.230769230769234, 10.948768028846155, 11.324368990384617], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.8974999999999985, 0, 174, 0.0, 1.0, 1.0, 8.990000000000009, 70.60277115876798, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.9091666666666638, 0, 171, 1.0, 2.0, 4.0, 27.970000000000027, 107.9427903211298, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 65.7125, 10, 260, 53.0, 125.0, 151.95, 240.95000000000005, 40.60089321965083, 12.053390174583841, 19.943602821762077], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 360.0, 360, 360, 360.0, 360.0, 360.0, 360.0, 2.7777777777777777, 1.679144965277778, 0.830078125], "isController": false}, {"data": ["Post Booking Request", 400, 17, 4.25, 302.0999999999999, 37, 823, 286.5, 402.90000000000003, 476.95, 782.910000000001, 36.778227289444644, 35.40703512895366, 17194.580796449754], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 27.29999999999999, 2, 136, 22.0, 57.900000000000034, 73.89999999999998, 112.91000000000008, 39.98800359892032, 46.614726519544135, 23.508572428271517], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 44.772500000000015, 1, 153, 39.0, 91.0, 103.0, 135.96000000000004, 39.219531326600645, 38.44184325669183, 17.196845278948917], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 648 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 652 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 11.764705882352942, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 784 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 820 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 501 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 818 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 626 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 823 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 662 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 519 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 536 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 515 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 675 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 17, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 648 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 652 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 784 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 820 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 17, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 648 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 652 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 784 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 820 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
