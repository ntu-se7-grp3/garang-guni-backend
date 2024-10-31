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

    var data = {"OkPercent": 99.70467969104952, "KoPercent": 0.29532030895047706};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9970467969104952, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9675, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 13, 0.29532030895047706, 46.41890049977292, 0, 808, 8.0, 138.70000000000027, 270.0, 405.97000000000025, 362.36417517286793, 264.49513615924434, 15468.267104796058], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.374999999999986, 8, 197, 39.5, 103.30000000000024, 127.94999999999999, 162.9000000000001, 40.25764895330113, 146.29645355273752, 17.88792018921095], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 24.74750000000001, 2, 126, 17.0, 62.900000000000034, 74.0, 117.91000000000008, 40.148549633644485, 39.50505542381813, 33.693415637860085], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 50.0, 50, 50, 50.0, 50.0, 50.0, 50.0, 20.0, 11.38671875, 11.77734375], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.853750000000001, 0, 165, 0.0, 1.0, 1.0, 7.990000000000009, 71.83908045977012, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.4266666666666656, 0, 152, 1.0, 1.0, 2.0, 13.990000000000009, 109.8197126384186, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 63.85500000000007, 10, 238, 52.0, 128.60000000000014, 165.0, 199.96000000000004, 40.6421459053038, 12.065637065637064, 19.963866592156066], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 351.0, 351, 351, 351.0, 351.0, 351.0, 351.0, 2.849002849002849, 1.7221999643874646, 0.8513621794871795], "isController": false}, {"data": ["Post Booking Request", 400, 13, 3.25, 294.33750000000003, 39, 808, 283.0, 417.90000000000003, 467.95, 674.4200000000005, 37.275184046221234, 35.96327229521946, 17406.315158768986], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 28.61750000000001, 2, 150, 20.5, 64.0, 84.89999999999998, 116.96000000000004, 39.97601439136518, 46.685465283330004, 23.50152408554867], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.91750000000002, 1, 167, 37.0, 88.90000000000003, 103.94999999999999, 128.97000000000003, 39.52569169960474, 38.82569324357708, 17.331089426877472], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 590 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 580 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 737 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 576 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 614 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 808 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 509 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 747 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 568 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 675 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 7.6923076923076925, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 13, "The operation lasted too long: It took 590 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 580 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 737 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 13, "The operation lasted too long: It took 590 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 596 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 580 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 737 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
