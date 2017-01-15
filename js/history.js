window.onload = function history() {
	var yobj = new XMLHttpRequest();
  	yobj.open('GET', '/gethistory', true);
  	yobj.send(null);
 	yobj.onreadystatechange = () => {
        	if(yobj.readyState == 4 && yobj.status == "200") {
	            var history = JSON.parse(yobj.responseText);
	            history.reverse()
	            	   .forEach((item) => {
	            	   		var tablerowHistory = document.createElement('tr');
	            			tablerowHistory.innerHTML = '<td>' + item.url + '</td><td>' + item.date + '</td><td>' + item.latensy.toFixed(2) + '</td>'
	            			var tableHistoryTable = document.querySelector('#tablehistory tbody');
            				tableHistoryTable.appendChild(tablerowHistory);
	            	   });
	            
        	};
  	};
}
