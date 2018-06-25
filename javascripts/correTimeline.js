/**
 * Created by gly on 2018/2/1.
 */
var correTimeDiv=document.getElementById("correTimeline")
function appendTime(names) {
    correTimeDiv.innerHTML="";
    var seriesOptions = [],
        seriesCounter = 0
    /**
     * Create the chart when all data is loaded
     * @returns {undefined}
     */
    function createChart() {
        $('#correTimeline').highcharts('StockChart', {
            chart: {
                zoomType: null,
                // pinchType: null
            },
            rangeSelector: {
                selected: 7
            },
            yAxis: {
                // labels: {
                //     formatter: function () {
                //         return (this.value > 0 ? ' + ' : '') + this.value + '%';
                //     }
                // },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            // plotOptions: {
            //     series: {
            //         //compare: 'value',
            //         showInNavigator: true
            //     }
            // },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                followTouchMove: false,
                split: true
            },
            series: seriesOptions
        });
    }
    $.each(names, function (i, name) {
        //$.getJSON('https://data.jianshukeji.com/jsonp?filename=json/' + name.toLowerCase() + '-c.json&callback=?',    function (data) {
        $.getJSON('./data/correTime/ip' +(i+1) + '.json',    function (data) {
            seriesOptions[i] = {
                name: name,
                data: data
            };
            // As we're loading the data asynchronously, we don't know what order it will arrive. So
            // we keep a counter and create the chart when all the data is loaded.
            seriesCounter += 1;
            if (seriesCounter === names.length) {
                createChart();
            }
        });
    });
}

//事件对象
var EventUtil={
    addHandler:function (element,type,handler) {
        if(element.addEventListener){
            element.addEventListener(type,handler,false);
        }
        else if(element.attachEvent){
            element.attachEvent("on"+type,handler);
        }
        else{
            element["on"+type]=handler;
        }
    },
    getEvent:function (event) {
        return event? event:window.event;
    },
    getTarget:function (event) {
        return event.target || event.srcElement;
    },
    preventDefault:function (event) {
        if(event.preventDefault){
            event.preventDefault();
        }
        else{
            event.returnValue=false;
        }
    },
    stopPropagation: function (event) {
        if(event.stopPropagation){
            event.stopPropagation();
        }
        else {
            event.cancelBubble=true;
        }
    },
    removeHandler:function (element,type,handler) {
        if(element.removeEventListener){
            element.removeEventListener(type,handler,false)
        }
        else if(element.detachEvent){
            element.detachEvent("on"+type,handler)
        }
        else{
            element["on"+type]=null;
        }
    }
};
//按钮事件，添加，删除和开始
var form2=document.getElementsByTagName("form")[1];
var btnAppend2=form2.elements["append"];
EventUtil.addHandler(form2,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var formLen2=form2.length;
    //删除按钮
    if(target.className=="delete") {//删除按钮
        for (var i = 0; i < formLen2; i++) {
            if (form2[i] == target) {
                form2.removeChild(target);
                form2.removeChild(form2[i - 1]);
                return;
            }
        }
    }
    //添加按钮
    else if(target.className=="append"){
        var inputNew=document.createElement("input");
        inputNew.className="form-control";
        inputNew.type="text";
        inputNew.name="node";
        var btnNew=document.createElement("input");
        btnNew.className="delete";
        btnNew.type="button";
        btnNew.value="Delete";
        btnNew.name="delete";
        form2.insertBefore(inputNew,btnAppend2);
        form2.insertBefore(btnNew,btnAppend2);
    }
    //开始按钮
    else if(target.className=="btnStart"){
        //获取参数
        var conditions2=[];
        for(var j=0;j<formLen2;j++){
            if(form2[j].className=="form-control"){
                if(form2[j].value!=""){
                    var curValue=form2[j].value;
                    conditions2.push(curValue);
                }
            }
        }
        var startTime=conditions2[0];
        var endTime=conditions2[1];
        startTime="2013/"+startTime;
        startTime=new Date(startTime);
        startTime=startTime.getTime()/1000+8*3600;
        endTime="2013/"+endTime;
        endTime=new Date(endTime);
        endTime=endTime.getTime()/1000+8*3600;
        var objects=[]
        for(var k=2;k<conditions2.length;k++){
            objects.push(conditions2[k])
        }
        var parameters="target=correTime"+"&startTime="+startTime+"&endTime="+endTime+"&objects="+objects;
        console.log(parameters)
        //测试用
        appendTime(objects);
        //AJAX通信
        // $.ajax({
        //     type:'get',
        //     url:'http://127.0.0.1:8000/gly/?'+parameters,
        //     error: function(XMLHttpRequest, textStatus, errorThrown) {
        //         console.log(XMLHttpRequest,textStatus,errorThrown);
        //         alert("请求失败，请输入正确的搜索条件");
        //     },
        //     success:function (data) {
        //         console.log(data)
        //         //画时间线
        //         appendTime(objects);
        //     }
        // });
    }
});



