var express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require('body-parser'),
    loadtest = require('loadtest'),
    mongojs = require('mongojs'),
    db = mongojs('perfomancedata', ['perfomancedata']),
    ObjectId = mongojs.ObjectId,
    EventEmitter = require('events').EventEmitter,
    SitemapGenerator = require('sitemap-generator'),
    port = process.env.PORT || 7500,
    commonUrls = [],
    finalData = [],
    urls;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.post("/analyse", function(req, res) {
            var reqBody = req.body;
            var newReqBody = '';
            for(var prop in reqBody) {
                if(reqBody) {
                    newReqBody = prop;
                    break;
                }
            }

            var generator = new SitemapGenerator(newReqBody);

            generator.on('fetch', function (status, url) {
              commonUrls.push(url);
            });

            generator.on('done', function () {
                urls = commonUrls.slice();
                commonFunc(0, function(data) {
                    res.json(data);

                    var historyObj = {};
                    var averageLatensy = 0;
                    for(var k = 0; k < data.length; k++) {
                        averageLatensy += data[k].latensy;
                    }
                    averageLatensy = averageLatensy/data.length;
                    function formatDate(date) {
                          var dd = date.getDate();
                          if (dd < 10) dd = '0' + dd;

                          var mm = date.getMonth() + 1;
                          if (mm < 10) mm = '0' + mm;

                          var yy = date.getFullYear() % 100;
                          if (yy < 10) yy = '0' + yy;

                          return dd + '.' + mm + '.' + yy;
                    };
                    var d = new Date();
                    historyObj.date = formatDate(d);
                    historyObj.url = data[0].url;
                    historyObj.latensy = averageLatensy;

                    db.perfomancedata.insert(historyObj, function(err, doc) {
                        console.log(doc);
                    });
                });
            });

            generator.start();
});

app.get('/history', function (req, res) {
    res.sendFile(__dirname + '/templates/history.html');
});

app.get('/gethistory', function(req, res) {
    db.perfomancedata.find(function (err, docs) {
        res.json(docs);
    });
});

db.on('connect', function () {
   console.log('db connected');
});

app.listen(port, function() {
   console.log("Server is running at port", port, "!");
});

function commonFunc(j, callback) {
    var objs = [];
    var z = (function(x) {
        return urls[j];
    }(j));


    var options = {
        url: z,
        maxRequests: 20,
        maxSeconds: 0.5,
        statusCallback: statusCallback
    };

    function statusCallback(error, result, latency) {
        var obj = {};
        obj.url = options.url;
        obj.requestIndex = result.requestIndex;
        obj.meanLatencyMs = latency.meanLatencyMs;
        obj.requestElapsed = result.requestElapsed;
        objs.push(obj);
    };

    loadtest.loadTest(options, function(error) {
        if(error) {
            return console.error('Got an error: %s', error);
        };

        var objPerUrl = {};
        objPerUrl.latensy = 0;
        var maxmin = [];

        for(var i = 0; i < objs.length; i++) {
            objPerUrl.latensy += objs[i].meanLatencyMs;
            maxmin[i] = objs[i].meanLatencyMs;
        }

        maxmin.sort(function(a, b) {
            return a-b;
        });

        objPerUrl.url = options.url;
        objPerUrl.latensy = +(objPerUrl.latensy / objs.length).toFixed(2);
        objPerUrl.max = maxmin[maxmin.length-1];
        objPerUrl.min = maxmin[0];
        finalData.push(objPerUrl);

        j++;
        if(j === urls.length) {
            return callback(finalData);
        };
            commonFunc(j, callback);
    });
};
