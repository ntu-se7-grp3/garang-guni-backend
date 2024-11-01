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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 17, 0.3861880963198546, 49.13357564743304, 0, 897, 10.0, 138.70000000000027, 292.6999999999989, 418.9400000000005, 343.7988128709778, 250.79221764194781, 14674.140984994923], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 50.887499999999974, 9, 255, 39.5, 107.0, 128.89999999999998, 161.98000000000002, 38.25188868700393, 139.1206996509515, 16.99668882088553], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.677500000000038, 2, 133, 22.0, 62.900000000000034, 81.94999999999999, 116.99000000000001, 38.12428516965307, 37.54041397612466, 32.02253800514678], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 56.0, 56, 56, 56.0, 56.0, 56.0, 56.0, 17.857142857142858, 10.166713169642858, 10.515485491071429], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.4825000000000026, 0, 181, 0.0, 1.0, 1.0, 43.930000000000064, 68.47556278353163, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 2.0675000000000012, 0, 179, 1.0, 1.0, 4.0, 32.97000000000003, 105.81077506392735, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 62.87500000000009, 11, 224, 55.0, 118.0, 139.0, 194.81000000000017, 38.692203520990525, 11.48674792029406, 19.006033565486558], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 372.0, 372, 372, 372.0, 372.0, 372.0, 372.0, 2.688172043010753, 1.624978998655914, 0.8033014112903226], "isController": false}, {"data": ["Post Booking Request", 400, 17, 4.25, 313.61000000000007, 105, 897, 299.0, 422.0, 487.9, 666.8900000000001, 35.612535612535616, 34.259154925658834, 16628.033064709092], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 30.487499999999986, 2, 137, 24.0, 65.0, 84.94999999999999, 126.90000000000009, 38.048130885570245, 44.32514357224389, 22.368139446399695], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 44.940000000000005, 1, 218, 37.0, 94.90000000000003, 110.89999999999998, 167.97000000000003, 37.69672980868909, 36.92125948308359, 16.529132504005275], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 584 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 864 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 615 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 566 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 758 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 546 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 897 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 599 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 656 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 591 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 608 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 667 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 524 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.882352941176471, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 17, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 584 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 864 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 17, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 512 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 505 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 584 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 864 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
