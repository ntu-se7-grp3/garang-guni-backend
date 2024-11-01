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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 12, 0.2726033621081327, 46.987278509768316, 0, 724, 10.0, 142.70000000000027, 282.0, 402.8500000000013, 361.7388446051442, 262.9656748192127, 15445.47195679082], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 49.614999999999995, 9, 200, 43.0, 91.90000000000003, 113.94999999999999, 147.99, 40.072129833700664, 144.97345221398518, 17.805487377279103], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.810000000000013, 2, 141, 22.0, 60.0, 76.0, 108.96000000000004, 39.9400898652022, 39.138655298302545, 33.39590224038941], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 12.092752659574469, 12.52908909574468], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.0425000000000018, 0, 169, 0.0, 1.0, 1.0, 30.980000000000018, 71.46685724495265, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.8416666666666694, 0, 192, 1.0, 1.0, 3.0, 25.0, 109.2697140775815, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 65.7225, 10, 284, 55.0, 131.90000000000003, 165.84999999999997, 208.97000000000003, 40.51863857374392, 12.028970826580228, 19.903198440032416], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 354.0, 354, 354, 354.0, 354.0, 354.0, 354.0, 2.824858757062147, 1.7076050494350283, 0.8441472457627119], "isController": false}, {"data": ["Post Booking Request", 400, 12, 3.0, 295.9725000000003, 44, 724, 287.0, 405.0, 470.39999999999986, 573.97, 37.22315280104225, 35.76167149404429, 17386.54708365322], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.787500000000026, 2, 151, 23.0, 66.90000000000003, 84.0, 112.96000000000004, 39.72589134968716, 46.22761151181845, 23.354479094249676], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 39.57499999999999, 1, 147, 35.5, 76.0, 92.89999999999998, 122.99000000000001, 39.40110323089046, 38.53891551541568, 17.276460303388497], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 563 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 575 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 724 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 536 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 544 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 539 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 570 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 8.333333333333334, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 12, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 724 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 12, "The operation lasted too long: It took 610 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 567 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 724 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 574 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
