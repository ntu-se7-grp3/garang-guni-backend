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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 11, 0.24988641526578828, 46.81940027260328, 0, 670, 8.0, 140.70000000000027, 285.84999999999945, 400.0, 362.18528879381273, 264.48420401719596, 15430.191047571787], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.342499999999994, 8, 204, 39.0, 105.80000000000007, 123.89999999999998, 177.9000000000001, 40.056078509913874, 145.9981474063689, 17.798355197276184], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.39500000000001, 2, 145, 18.0, 66.0, 82.94999999999999, 132.8900000000001, 39.92414412616029, 39.39429147120471, 33.61503767841102], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 51.0, 51, 51, 51.0, 51.0, 51.0, 51.0, 19.607843137254903, 11.163449754901961, 11.546415441176471], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.108749999999999, 0, 141, 0.0, 1.0, 1.0, 27.980000000000018, 71.92950908110052, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.4991666666666683, 0, 146, 1.0, 1.0, 2.0, 18.99000000000001, 110.56850640375933, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 60.39000000000005, 11, 293, 46.0, 118.90000000000003, 153.89999999999998, 240.76000000000022, 40.55561188279428, 12.039947277704552, 19.92136013383352], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 349.0, 349, 349, 349.0, 349.0, 349.0, 349.0, 2.865329512893983, 1.7320693051575933, 0.8562410458452723], "isController": false}, {"data": ["Post Booking Request", 400, 11, 2.75, 301.79499999999996, 86, 670, 294.0, 409.80000000000007, 462.9, 580.97, 37.32736095558044, 35.89076789380366, 17396.052595126446], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 26.930000000000007, 1, 185, 18.5, 67.0, 85.94999999999999, 123.97000000000003, 39.65107057890563, 46.173749132632835, 23.310492664551944], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 41.68000000000002, 1, 163, 34.0, 83.0, 99.94999999999999, 128.99, 39.219531326600645, 38.39415935385822, 17.196845278948917], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 670 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 621 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 524 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 630 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 544 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 549 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 9.090909090909092, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 11, "The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 670 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 11, "The operation lasted too long: It took 552 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 670 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 559 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 581 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 533 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
