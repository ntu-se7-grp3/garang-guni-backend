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

    var data = {"OkPercent": 99.47751022262608, "KoPercent": 0.522489777373921};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9947751022262608, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9425, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 23, 0.522489777373921, 49.20581553839161, 0, 820, 10.0, 142.0, 289.0, 429.91000000000076, 345.11956095648765, 251.96675323402584, 14756.411930982948], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.48, 8, 208, 40.0, 91.90000000000003, 110.94999999999999, 169.8800000000001, 38.662284941040014, 140.75035037695727, 17.179042625169146], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 30.23499999999998, 2, 154, 21.0, 67.0, 84.89999999999998, 136.82000000000016, 38.42090097012775, 37.86747490634905, 32.305355363317645], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 12.939453125, 13.383345170454547], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.0975000000000021, 0, 165, 0.0, 1.0, 1.0, 16.99000000000001, 68.5283536063046, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.7024999999999955, 0, 166, 1.0, 1.0, 2.0, 17.99000000000001, 105.14325768860073, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 66.06500000000005, 10, 252, 56.0, 121.0, 156.0, 218.96000000000004, 38.99015498586607, 11.57520226142899, 19.15239058387757], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 372.0, 372, 372, 372.0, 372.0, 372.0, 372.0, 2.688172043010753, 1.624978998655914, 0.8033014112903226], "isController": false}, {"data": ["Post Booking Request", 400, 23, 5.75, 314.8475000000002, 75, 820, 300.0, 436.90000000000003, 513.0, 668.95, 35.55555555555556, 34.230381944444446, 16630.75998263889], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.219999999999995, 2, 133, 21.5, 59.0, 83.89999999999998, 115.99000000000001, 38.2226469182991, 44.55793866459627, 22.470735785953178], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 43.319999999999986, 1, 166, 35.0, 88.0, 101.0, 147.86000000000013, 37.97588531282636, 37.223970200797496, 16.65153564986234], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 669 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 705 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 664 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 636 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 624 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 554 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 627 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 510 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 820 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 618 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 8.695652173913043, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 8.695652173913043, 0.04543389368468878], "isController": false}, {"data": ["The operation lasted too long: It took 647 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 635 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 524 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 804 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 637 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 4.3478260869565215, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 23, "The operation lasted too long: It took 618 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 669 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 23, "The operation lasted too long: It took 618 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 513 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 538 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 669 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
