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

    var data = {"OkPercent": 99.56837800999546, "KoPercent": 0.4316219900045434};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9956837800999546, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get All Items from Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Create Location Data for Location ID"], "isController": false}, {"data": [1.0, 500, 1500, "Randomize Variables"], "isController": false}, {"data": [1.0, 500, 1500, "generateRandomItem"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "GetAuthToken"], "isController": false}, {"data": [0.9525, 500, 1500, "Post Booking Request"], "isController": false}, {"data": [1.0, 500, 1500, "Add New Items To Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 19, 0.4316219900045434, 50.793730122671384, 0, 827, 10.0, 150.70000000000027, 300.0, 428.97000000000025, 330.7536253662935, 241.3626792724848, 14131.952605497221], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All Items from Booking", 400, 0, 0.0, 53.845000000000006, 8, 263, 46.0, 99.0, 123.0, 193.9000000000001, 37.147102526002975, 135.1831671387444, 16.50579262630015], "isController": false}, {"data": ["Update Booking", 400, 0, 0.0, 29.524999999999977, 2, 214, 23.0, 64.90000000000003, 80.94999999999999, 113.98000000000002, 37.067926976183855, 36.520957858400514, 31.155972714530627], "isController": false}, {"data": ["Create Location Data for Location ID", 1, 0, 0.0, 55.0, 55, 55, 55.0, 55.0, 55.0, 55.0, 18.18181818181818, 10.3515625, 10.706676136363637], "isController": false}, {"data": ["Randomize Variables", 800, 0, 0.0, 1.0687500000000003, 0, 152, 0.0, 1.0, 1.0, 23.970000000000027, 65.84362139917695, 0.0, 0.0], "isController": false}, {"data": ["generateRandomItem", 1200, 0, 0.0, 1.8491666666666657, 0, 158, 1.0, 2.0, 4.0, 23.0, 100.56989607777406, 0.0, 0.0], "isController": false}, {"data": ["Delete Booking", 400, 0, 0.0, 72.76249999999992, 10, 302, 60.5, 144.90000000000003, 176.95, 225.92000000000007, 37.491798669041145, 11.13037772987159, 18.416381572780953], "isController": false}, {"data": ["GetAuthToken", 1, 0, 0.0, 384.0, 384, 384, 384.0, 384.0, 384.0, 384.0, 2.6041666666666665, 1.5741984049479167, 0.7781982421875], "isController": false}, {"data": ["Post Booking Request", 400, 19, 4.75, 319.94499999999994, 58, 827, 312.0, 432.90000000000003, 498.4499999999999, 659.96, 34.12678099138299, 32.83027991958877, 15950.883013794684], "isController": false}, {"data": ["Add New Items To Booking", 400, 0, 0.0, 29.22749999999998, 2, 172, 24.0, 61.900000000000034, 74.89999999999998, 106.94000000000005, 36.95491500369549, 43.054190196553954, 21.72544807834442], "isController": false}, {"data": ["Get Booking", 400, 0, 0.0, 44.8975, 1, 152, 35.5, 93.0, 113.94999999999999, 137.96000000000004, 36.38017280582083, 35.63436149954525, 15.951853115052298], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 827 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 652 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 800 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 572 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 656 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 618 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 638 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 564 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 614 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 672 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 536 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 642 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}, {"data": ["The operation lasted too long: It took 660 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 19, "The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 827 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 652 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Booking Request", 400, 19, "The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 827 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 530 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 652 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
