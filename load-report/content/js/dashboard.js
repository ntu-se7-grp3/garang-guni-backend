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

    var data = {"OkPercent": 45.433893684688776, "KoPercent": 54.566106315311224};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.45433893684688775, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [0.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [0.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [0.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [0.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.0, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [0.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [0.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 2402, 54.566106315311224, 5.625170377101326, 0, 539, 0.0, 20.0, 32.0, 59.970000000000255, 1246.6723307844802, 690.9717612751344, 52964.6482162454], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 400, 100.0, 0.01499999999999999, 0, 5, 0.0, 0.0, 0.0, 0.0, 215.74973031283713, 249.4606256742179, 0.0], "isController": false}, {"data": ["Update Booking", 400, 400, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 215.74973031283713, 248.19646709816612, 0.0], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 1, 100.0, 10.0, 10, 10, 10.0, 10.0, 10.0, 10.0, 100.0, 33.3984375, 33.30078125], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 3.452499999999997, 0, 147, 0.0, 12.0, 25.0, 40.0, 332.08800332088003, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 11.415833333333339, 0, 156, 1.0, 34.0, 47.0, 88.97000000000003, 531.6792202038105, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 400, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 215.74973031283713, 248.19646709816612, 0.0], "isController": false}, {"data": ["GetAuthToken", 1, 1, 100.0, 539.0, 539, 539, 539.0, 539.0, 539.0, 539.0, 1.8552875695732838, 0.7881348562152133, 0.55260030148423], "isController": false}, {"data": ["Post Booking Request", 400, 400, 100.0, 19.365000000000002, 2, 92, 16.0, 41.0, 52.0, 67.98000000000002, 200.300450676014, 66.89722083124687, 93649.24486338883], "isController": false}, {"data": ["Add New Items To Booking", 400, 400, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 215.633423180593, 249.32614555256066, 0.0], "isController": false}, {"data": ["Get Booking", 400, 400, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 208.65936358894106, 240.03977569118413, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}", 1200, 49.958368026644465, 27.260336210813268], "isController": false}, {"data": ["401", 402, 16.736053288925895, 9.132212630622444], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}/items", 800, 33.30557868442964, 18.173557473875512], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 2402, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}", 1200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}/items", 800, "401", 402, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get All Items from Booking", 400, 400, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}/items", 400, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Booking", 400, 400, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}", 400, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 1, "401", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Delete Booking", 400, 400, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}", 400, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetAuthToken", 1, 1, "401", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Post Booking Request", 400, 400, "401", 400, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add New Items To Booking", 400, 400, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}/items", 400, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Booking", 400, 400, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 32: http://localhost:8080/bookings/${bookingId}", 400, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
