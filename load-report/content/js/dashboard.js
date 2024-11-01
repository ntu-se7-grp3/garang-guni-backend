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

    var data = {"OkPercent": 99.7955474784189, "KoPercent": 0.2044525215810995};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.997955474784189, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9775, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 9, 0.2044525215810995, 47.33870967741938, 0, 714, 8.0, 137.0, 286.0, 405.0, 359.8757357750164, 262.74592896705366, 15401.625299547295], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 48.9175, 9, 208, 40.0, 92.90000000000003, 118.89999999999998, 175.86000000000013, 39.52569169960474, 143.96924407114625, 17.562685276679844], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 27.212499999999988, 2, 173, 19.0, 64.90000000000003, 77.0, 129.96000000000004, 39.362330249950794, 38.815524441546934, 33.11788479753001], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 12.651909722222223, 13.0859375], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 0.7312500000000015, 0, 137, 0.0, 1.0, 1.0, 5.990000000000009, 71.09215320359014, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.5283333333333322, 0, 160, 1.0, 1.0, 2.0, 21.99000000000001, 109.2001092001092, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 64.12500000000006, 10, 212, 53.0, 117.0, 137.0, 193.98000000000002, 40.02801961372961, 11.883318322825978, 19.662201040728508], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 360.0, 360, 360, 360.0, 360.0, 360.0, 360.0, 2.7777777777777777, 1.679144965277778, 0.830078125], "isController": false}, {"data": ["Post Booking Request", 400, 9, 2.25, 301.6100000000003, 101, 714, 293.5, 406.90000000000003, 478.0, 546.98, 36.78837487353996, 35.39048848064012, 17223.441865026904], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.205000000000016, 2, 167, 22.0, 64.90000000000003, 83.94999999999999, 124.95000000000005, 39.27729772191673, 45.75757238683229, 23.090755106048704], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 42.83250000000003, 1, 172, 38.0, 82.90000000000003, 99.0, 133.97000000000003, 38.87269193391642, 38.073505071671526, 17.044764334305153], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 714 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 545 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 524 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 542 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 553 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 544 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 11.11111111111111, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 9, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 714 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 545 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 9, "The operation lasted too long: It took 547 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 714 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 522 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 573 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 545 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
