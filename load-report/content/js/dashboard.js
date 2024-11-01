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

    var data = {"OkPercent": 99.77283053157656, "KoPercent": 0.22716946842344388};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9977283053157655, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.975, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 10, 0.22716946842344388, 46.87346660608822, 0, 621, 9.0, 134.0, 284.0, 400.9400000000005, 357.9152776648508, 261.48260910439876, 15265.184161313928], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.35999999999999, 7, 246, 39.5, 92.60000000000014, 109.0, 149.98000000000002, 39.96003996003996, 145.52478771228772, 17.75568181818182], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 25.032500000000013, 2, 185, 17.0, 55.900000000000034, 73.0, 113.98000000000002, 39.6589331746976, 39.09900248488003, 33.35988235549276], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 11.861165364583334, 12.26806640625], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.7987499999999995, 0, 140, 0.0, 1.0, 1.0, 12.980000000000018, 71.18704395799965, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7141666666666644, 0, 167, 1.0, 1.0, 3.0, 25.980000000000018, 108.61694424330196, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 61.25999999999999, 11, 265, 54.0, 109.0, 152.44999999999987, 207.93000000000006, 40.30632809351068, 11.965941152760983, 19.79890920999597], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 347.0, 347, 347, 347.0, 347.0, 347.0, 347.0, 2.881844380403458, 1.7420524135446687, 0.8611761527377523], "isController": false}, {"data": ["Post Booking Request", 400, 10, 2.5, 300.2075000000002, 43, 621, 294.0, 404.0, 472.6499999999999, 567.8600000000001, 36.903773410831256, 35.57475104368484, 17217.859480233416], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 30.64499999999997, 2, 147, 22.0, 69.80000000000007, 86.94999999999999, 123.93000000000006, 39.502271380604384, 46.10009582386925, 23.223015010863126], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.60999999999999, 1, 225, 38.0, 83.90000000000003, 98.94999999999999, 126.97000000000003, 39.005363237445145, 38.28286887493905, 17.10293759141882], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 621 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 523 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 539 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 503 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 568 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 10.0, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 10, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 621 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 10, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 621 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
