
var formButton = document.querySelector('form button');
formButton.onclick = function analyseData(e) {
    e.preventDefault();
    var textForm = document.querySelector('#textform');
    var preloader = document.createElement('div');
    preloader.innerHTML = '<div class="preloader"><p>Please, wait...</p><img src="images/preloader.gif"></div>';
    document.body.appendChild(preloader)
    var xobj = new XMLHttpRequest();
    var params = textForm.value;
    xobj.open('POST', '/analyse', true);
    xobj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xobj.send(params);
    xobj.onreadystatechange = () => {
          if(xobj.readyState == 4 && xobj.status == "200") {
              var response = JSON.parse(xobj.responseText);
              document.body.removeChild(preloader);
              createChart(response);
              createTable(response);
          };
     };
};

function createChart(arr) {
      arr
        .sort((a, b) => b.latensy - a.latensy)
        .forEach((item, index) => {
            var tablerowChart = document.createElement('tr');
            tablerowChart.innerHTML = '<td>' + item.url + '</td><td><div class="outerbar"><div class="innerbar"></div></div></td>';
            var tableChart = document.querySelector('#tablechart');
            tableChart.hidden = false;
            var tableTbodyChart = document.querySelector('#tablechart tbody');
            tableTbodyChart.appendChild(tablerowChart);
            var innerBar = document.querySelectorAll('.innerbar')[index];
            innerBar.style.height = "15px";
            innerBar.style.width = item.latensy > 900 ? 450 + "px" : (item.latensy/2) + "px";
            innerBar.style.backgroundColor = "green";
        });
};   
             
function createTable(arr) {
      arr
        .sort((a, b) => b.latensy - a.latensy)
        .forEach(item => {
            var tablerowTable = document.createElement('tr');
            tablerowTable.innerHTML = "<td>" + item.url + "</td><td>" + item.max + "</td><td>" + item.min + "</td><td>" + item.latensy + "</td>";
            var tableTable = document.querySelector('#tabletable');
            tableTable.hidden = false;
            var tableTbodyTable = document.querySelector('#tabletable tbody');
            tableTbodyTable.appendChild(tablerowTable);
        });
};

