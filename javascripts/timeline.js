/**
 * Created by gly on 2018/1/11.
 */
$.getJSON('./data/timeCountsNf.json', function (data) {
    // create the chart
    Highcharts.stockChart('timeline', {


        title: {
            text: ''
        },

        subtitle: {
            text: ''
        },

        xAxis: {
            gapGridLineWidth: 0
        },

        rangeSelector: {
            buttons: [{
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'day',
                count: 1,
                text: '1D'
            }, {
                type: 'all',
                count: 1,
                text: 'All'
            }],
            selected: 1,
            inputEnabled: false
        },

        series: [{
            name: '流数',
            type: 'area',
            data: data,
            gapSize: 5,
            tooltip: {
                valueDecimals: 2//包留两位小数
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            },
            threshold: null
        }]
    });

});


//对平行坐标中的参数设置器的参数进行处理
//点击select添加相应的span
//select标签
var select=document.getElementById("paraSelect");
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
//select的onchange事件，每次触发onchange都给selectedDim添加相应的数据
var selectedDim=[];
var selectedDiv=document.getElementById("selected");
EventUtil.addHandler(select,"change",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var curData=target.value;
    selectedDim.push(curData);
    var span=document.createElement("span");
    var text=document.createTextNode(curData);
    span.appendChild(text);
    selectedDiv.appendChild(span);
});
//清空维度事件
var clearBtn=document.getElementsByName("clear")[0];
EventUtil.addHandler(clearBtn,"click",function (event) {
    selectedDim=[];
    selectedDiv.innerHTML="";
});
//开始分析para事件
var startBtn=document.getElementsByName("start")[0];
var parallelDiv=document.getElementById("paraView");

//需要删除的，测试用，selectedDim会对后面的平行坐标有影响，正式使用的时候一定要删除！！！！！
selectedDim=["timeNum","sIpEn","dIpEn","sPortEn","dPortEn"];
paraView();

//开始获取平行坐标数据
EventUtil.addHandler(startBtn,"click",function (event) {
    //获取起止时间,时间格式4/12 00:00
    var startTime=document.getElementsByName("timeStart")[0].value;
    var endTime=document.getElementsByName("timeEnd")[0].value;
    startTime="2013/"+startTime;
    startTime=new Date(startTime);
    startTime=startTime.getTime()/1000+8*3600;
    endTime="2013/"+endTime;
    endTime=new Date(endTime);
    endTime=endTime.getTime()/1000+8*3600;
    //获取时间片
    var timeSplice=document.getElementsByName("timeSplice")[0].value;
    //参数
    var parameters="target=para&"+"startTime="+startTime+"&endTime="+endTime+"&timeSplice="+timeSplice;
    console.log(parameters)


    //AJAX通信
       $.ajax({
       type:'get',
       url:'http://127.0.0.1:8000/gly/?'+parameters,
       error: function(XMLHttpRequest, textStatus, errorThrown) {
           console.log(XMLHttpRequest,textStatus,errorThrown);
           alert("请求失败，请输入正确的搜索条件");
       },
       success:function (data) {
           console.log(data)
           //画平行坐标
           paraView();
       }
   });
});
//开始分析meso事件
var startBtnMeso=document.getElementsByName("start")[1];
var ipDiv=document.getElementById("ipView");
var ipSunPath="allIp.json";
var heatMatrix=document.getElementById("matrixPort");
var heatCircle=document.getElementById("ratio");
var heatPath="allPort.json";

//需要删除的，测试用
sunburst(ipSunPath);
heatMap(heatPath)
d3.queue()
    .defer(d3.json, './data/circos/rearData/time.json')//外围的月份
    .defer(d3.csv, './data/circos/rearData/0.csv')//外层的数据，热力图数据
    .defer(d3.csv, './data/circos/rearData/1.csv')//最里层的数据
   // .defer(d3.csv,'./data/circos/rearData/2.csv')
   // .defer(d3.csv,'./data/circos/rearData/3.csv')//更改4，视图
   // .defer(d3.csv,'./data/circos/rearData/4.csv')//更改4，视图
   // .defer(d3.csv,'./data/circos/rearData/5.csv')//更改4，视图
   // .defer(d3.csv,'./data/circos/rearData/6.csv')//更改4，视图
    .await(drawCircos)

//开始获取中观部分的数据
EventUtil.addHandler(startBtnMeso,"click",function (event){
    //参数
    var parameters="target=meso&";

    //AJAX通信
    $.ajax({
        type:'get',
        url:'http://127.0.0.1:8000/gly/?'+parameters,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest,textStatus,errorThrown);
            alert("请求失败，请输入正确的搜索条件");
        },
        success:function (data) {
            console.log(data)
            //画视图
            sunburst(ipSunPath);
            heatMap(heatPath);
        }
    });
});
//IP的数据更换事件
var ipTitle=document.getElementById("ipTitle");
EventUtil.addHandler(ipTitle,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var targetId=target.id;
    //target.style.color="#311bf0"
    if(targetId=="allBtn"){
        ipSunPath="allIp.json";
        sunburst(ipSunPath)
    }else if(targetId=="srcBtn"){
        ipSunPath="srcIp.json";
        sunburst(ipSunPath)
    }else if(targetId=="dstBtn"){
        ipSunPath="dstIp.json";
        sunburst(ipSunPath)
    }

});
//heatmap的数据更换事件
var portTitle=document.getElementById("portTitle");
EventUtil.addHandler(portTitle,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var targetId=target.id;
    if(targetId=="allPortBtn"){
        heatPath="allPort.json";
        heatMap(heatPath)
    }else if(targetId=="sPortBtn"){
        heatPath="srcPort.json";
        heatMap(heatPath)
    }else if(targetId=="dPortBtn"){
        heatPath="dstPort.json";
        heatMap(heatPath)
    }
});
//开始分析micro微观事件
var startBtnMicro=document.getElementsByClassName("microStart")[0];
var target1=document.getElementsByName("target1")[0];
//var target2=document.getElementsByName("target2")[0];
var date=document.getElementsByName("date")[0];
var microView=document.getElementById("microView");
EventUtil.addHandler(startBtnMicro,"click",function (event) {
    var value1=target1.value;
   // var value2=target2.value;
    var microDate=date.value.split("/")[1];
    //参数
   // var parameters="target=micro&microTarget1="+value1+"&microTarget2="+value2+"&microDate="+microDate;
    var parameters="target=micro&microTarget1="+value1+"&microDate="+microDate;

    //AJAX通信
    $.ajax({
        type:'get',
        url:'http://127.0.0.1:8000/gly/?'+parameters,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest,textStatus,errorThrown);
            alert("请求失败，请输入正确的搜索条件");
        },
        success:function (data) {
            console.log(parameters)
            console.log(data)
            //画视图
            d3.queue()
                .defer(d3.json, './data/circos/rearData/time.json')//外围的月份
                .defer(d3.csv, './data/circos/rearData/0.csv')//外层的数据，热力图数据
                .defer(d3.csv, './data/circos/rearData/1.csv')//最里层的数据
               // .defer(d3.csv,'./data/circos/rearData/2.csv')//更改4，视图
               // .defer(d3.csv,'./data/circos/rearData/3.csv')//更改4，视图
               // .defer(d3.csv,'./data/circos/rearData/4.csv')//更改4，视图
               // .defer(d3.csv,'./data/circos/rearData/5.csv')//更改4，视图
               // .defer(d3.csv,'./data/circos/rearData/6.csv')//更改4，视图
                .await(drawCircos)
        }
    });
});
function paraView(){
    //清空para的div
    parallelDiv.innerHTML="";
    d3.csv("./data/para/paraDjango.csv",function (error,paraData) {
        console.log(paraData)
        var margin={left:30,right:30,bottom:30,top:30};
        var width=parallelDiv.offsetWidth-margin.left-margin.right;
        var height=parallelDiv.offsetHeight-margin.top-margin.bottom;

        var svgPara=d3.select("#paraView")
            .append("svg")
            .attr("width",width+margin.left+margin.right)
            .attr("height",height+margin.top+margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x=d3.scale.ordinal().rangePoints([0,width],1);
        var y={};
        // var line=d3.svg.line();
        // var line=d3.svg.line().interpolate("cardinal");//cardinal – 基本样条曲线(Cardinal spline)，在末端控制点的重复。
        var line=d3.svg.line().interpolate("monotone");// 三次插值(cubic interpolation)，可以保留y的单调性。
        var axis=d3.svg.axis().orient("left").ticks(5);
        var foreBackground;
        var background;
        //选中的维度
        dimensions=selectedDim;
        console.log(dimensions)
        x.domain(dimensions);
        d3.keys(paraData[0]).filter(function(d) {
            return  (y[d] = d3.scale.linear()
                .domain(d3.extent(paraData, function(p) { return +p[d]; }))
                .range([height, 0]));
        });

        // 给每个维度加一个分组g
        var g = svgPara.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; });
        // 在维度分组g中加坐标轴和坐标轴的名称
        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; });

        // 灰色背景线
        background = svgPara.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(paraData)
            .enter().append("path")
            .attr("d", path);
        //蓝色前景线，画线条
        foreBackground=svgPara.append("g")
            .attr("class","foreBackground")
            .selectAll("path")
            .data(paraData)
            .enter().append("path")
            .attr("d",path);

        //给每个轴都加一个刷子
        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 10)
            .attr("fill","#f71806")
            .attr("opacity",.3)
            .attr("stroke","#000")
            .attr("stroke-width","2px")
        //平行坐标需要的函数
        function position(d) {
            return  x(d);
        }
        function path(d) {
            return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
        }

        function brushstart() {
            d3.event.sourceEvent.stopPropagation();
        }
        function brush() {
            var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); });//获取选中的维度
            var extents = actives.map(function(p) { return y[p].brush.extent(); });//获取刷子选中得最大值最小值
            //console.log(extents);
            foreBackground.style("display", function(d) {
                return actives.every(function(p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                }) ? null : "none";
            });
        }
    });
}
function sunburst(ipSunPath) {
    //清空ip的div
    ipDiv.innerHTML="";
    //定义宽高半径颜色
    var sunDiv=document.getElementById("ipView");
    var width = sunDiv.scrollWidth,
        //height = sunDiv.scrollHeight,
       // radius = Math.min(width, height) / 2.2,
        radius=width/2.65,
        color = d3.scale.category20c();

    //创建svg
    var svg = d3.select("#ipView").append("svg")
        .attr("width", width)
        .attr("height", width)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");
    //创建旭日图布局
    var partition = d3.layout.partition()
        .sort(null)
        .size([2 * Math.PI, radius * radius])
        .value(function(d) { return d.size; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return d.x; })
        .endAngle(function(d) { return d.x + d.dx; })
        //.innerRadius(function(d) { return Math.sqrt(d.y); })
        //.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
.innerRadius(function(d) { return Math.sqrt(d.y); })
        .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

    d3.json("data/sunburst/"+ipSunPath, function(error, root) {
        if (error) throw error;

        var path = svg.datum(root).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
            .attr("d", arc)
            .style("stroke", "#fff")
            .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
            .style("fill-rule", "evenodd")
            .append("title")
            .text(function(d){return d.name+": "+d.size})

    });
}

var heatMapGheight;
function heatMap(heatPath) {
    //清空div
    heatMatrix.innerHTML="";
    heatCircle.innerHTML="";
    var matrixDiv=document.getElementById("matrixPort");

    var margin={top:20,bottom:10,left:0,right:0};
    var width=matrixDiv.offsetWidth-margin.left-margin.right;
    matrixDiv.style.height=matrixDiv.offsetWidth+"px";
    var height=matrixDiv.offsetHeight-margin.top-margin.bottom;
    var lineNum=64;
    var gridSize=Math.floor(width/lineNum);
    heatMapGheight=gridSize*lineNum;//方格总高度，方便ratio高度定义
    //以下为外层的矩形框
    var svg=d3.select("#matrixPort")
        .append("svg")
        .attr("height",height+margin.top+margin.bottom)
        .attr("width",width+margin.left+margin.right)
        .append("g")
        .attr("transform","translate("+margin.left+","+margin.top+")");

    //最主要部分
    d3.json("./data/portMatrix/"+heatPath,function (error,data) {
        Data = data;


        //颜色方案3（线性）
        var a = d3.rgb(252,251,198);    //黄色
        //var b=d3.rgb(161,0,67);
        var b=d3.rgb(222,27,32)//红色
        var colorLinear=d3.interpolate(a,b);//颜色插值函数

        var minData=d3.min(Data.sum),maxData=d3.max(Data.sum);
        var linear=d3.scale.linear()
        // .domain([minData,maxData])
        // .range([0,1]);
            .domain([minData,100,1000,10000,100000,maxData])
            .range([0,0.1,0.3,0.5,0.6,1])
        //.range([0,0.1,0.3,0.5,0.6,1]);

        var gridrect=svg.selectAll(".matrix")
            .data(data.port)
            .enter()
            .append("rect")
            .attr("x",function (d) {
                return d.x*gridSize +'px';
            })
            .attr("y",function (d) {
                return d.y*gridSize + "px";
            })
            .attr("width",gridSize)
            .attr("height",gridSize)

            //颜色方案3
            .attr("fill",function(d){
                return colorLinear(linear(d.value)).toString();
            })
            .attr("stroke-width",1)
            .attr("stroke","#ccc");

        var target;//mousedown的事件对象，需要全局
        gridrect.on("mouseover",function (d) {

            tooltip
                .html(" x: " +d.x+"<br/>"+" y: "+d.y+"<br/>"+"端口号以及相应的数值:"+d.port[0][0]+" - "+d.port[15][0]+"<br/>"+"数量："+d.value)
                .style("left",(d3.event.pageX) +"px")
                .style("top",(d3.event.pageY +20)+"px")
                .style("opacity",1.0)

        })
            .on("mouseout",function (d) {
                tooltip.style("opacity",0.0);
            })
            .on("mousedown",function (d) {
                if(target){
                    target.style.stroke="#ccc";
                    target.style.strokeWidth="1px"
                }
                //当前的矩形框进行样式更改
                target=event.target;
                target.style.stroke="#2d2ff7";
                target.style.strokeWidth="2px";
                //画右侧的图形
                document.getElementById("ratio").innerHTML="";
                ratio(d.port)
            })

    });
    var tooltip=d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style("opacity",0.0);

    //画右侧的图形的函数，当点击点时运行该函数
    function ratio(data){
        var ratioDiv=document.getElementById("ratio");
        var margin={top:0,bottom:0,left:0,right:0};
        var width=ratioDiv.offsetWidth-margin.left-margin.right;

        var height=heatMapGheight+20-margin.top-margin.bottom;
        //以下为外层的矩形框
        var svgRatio=d3.select("#ratio")
            .append("svg")
            .attr("height",height+margin.top+margin.bottom)
            .attr("width",width+margin.left+margin.right)
            .append("g")
            .attr("transform","translate("+margin.left+","+margin.top+")");
        var eachHeight=(height-10)/17;
        var xSkewL=10,xSkewR=width*2.7/4;
//上面的一条线
        svgRatio.append("g")
            .attr("class","ratioLine")
            .attr("transform","translate(0,0)")
            .append("line")
            .attr("x1",0)
            .attr("x2",width)
            .attr("y1",eachHeight)
            .attr("y2",eachHeight)
//下面的一条线
        svgRatio.append("g")
            .attr("class","ratioLine")
            .attr("transform","translate(0,0)")
            .append("line")
            .attr("x1",0)
            .attr("x2",width)
            .attr("y1",17*eachHeight+8)
            .attr("y2",17*eachHeight+8)
//上面的文字
        svgRatio.append("g")
            .attr("transform","translate(0,0)")
            .append("text")
            .attr("x",xSkewL)
            .attr("y",eachHeight-5)
            .text("port")
            .style("font-size","1.3em")
        svgRatio.append("g")
            .append("text")
            .attr("x",xSkewR-5)
            .attr("y",eachHeight-5)
            .text("num")
            .style("font-size","1.3em")
        //数字
        svgRatio.selectAll()
            .data(data)
            .enter()
            .append("text")
            .attr("x",xSkewL)
            .attr("y",function (d,i) {
                return (i+2)*eachHeight
            })
            .text(function (d) {
                return d[0]
            })
            .style("font-size","0.8em")

        var num=data.map(function (item) {
            return item[1]
        })

        var linear=d3.scale.linear()
            .domain([d3.min(num),d3.max(num)])
            .range([1,12]);//半径的范围
        //圆
        var circle=svgRatio.selectAll()
            .data(data)
            .enter()
            .append("circle")
            .attr("fill","#c1546e")
            // .attr("fill","#e19600")
            .attr("cx",xSkewR+10)
            .attr("cy",function (d,i) {
                return (i+2)*eachHeight-6
            })
            .attr("r",function (d) {
                return linear(d[1])
            })

        circle.on("mouseover",function (d) {
            tooltip
                .html("端口号："+d[0]+"<br/>次数："+d[1])
                .style("left",(d3.event.pageX) +"px")
                .style("top",(d3.event.pageY +20)+"px")
                .style("opacity",1.0)

        })
            .on("mouseout",function (d) {
                tooltip.style("opacity",0.0);
            })

    }
}

function drawCircos(error, time, obj1,obj2) {
    //清空
    microView.innerHTML="";
    var width=microView.offsetWidth;
    //创建svg容器
    var circosHeatmap = new Circos({
        container: '#microView',
        width: width,
        height: width
    });

    //读取数据并转换为对应的数组格式
    // for(var i=1;i<=objArr.length;i++){
    //     objArr[i]=objArr[i].map(function(d) {
    //             return {
    //                 block_id: d.month,
    //                 start: parseInt(d.start),
    //                 end: parseInt(d.end),
    //                 value: parseFloat(d.value)
    //             };
    //         })
    // }
    obj1 = obj1.map(function(d) {
        return {
            block_id: d.month,
            start: parseInt(d.start),
            end: parseInt(d.end),
            value: parseFloat(d.value)
        };
    })
    obj2 = obj2.map(function(d) {
        return {
            block_id: d.month,
            start: parseInt(d.start),
            end: parseInt(d.end),
            value: parseFloat(d.value)
        };
    })
    //更改2，定义参数对象
    // obj3=obj3.map(function (d) {
    //     return {
    //         block_id: d.month,
    //         start: parseInt(d.start),
    //         end: parseInt(d.end),
    //         value: parseFloat(d.value)
    //     }
    // })
    // obj4=obj4.map(function (d) {
    //     return {
    //         block_id: d.month,
    //         start: parseInt(d.start),
    //         end: parseInt(d.end),
    //         value: parseFloat(d.value)
    //     }
    // })
    // obj5=obj5.map(function (d) {
    //     return {
    //         block_id: d.month,
    //         start: parseInt(d.start),
    //         end: parseInt(d.end),
    //         value: parseFloat(d.value)
    //     }
    // })
    // obj6=obj6.map(function (d) {
    //     return {
    //         block_id: d.month,
    //         start: parseInt(d.start),
    //         end: parseInt(d.end),
    //         value: parseFloat(d.value)
    //     }
    // })
    // obj7=obj7.map(function (d) {
    //     return {
    //         block_id: d.month,
    //         start: parseInt(d.start),
    //         end: parseInt(d.end),
    //         value: parseFloat(d.value)
    //     }
    // })

    circosHeatmap
        .layout(
            time,
            {
                innerRadius: width / 2.4-40,
                outerRadius: width / 2.4,
                ticks: {display: false},
                labels: {
                    position: 'center',
                    display: true,
                    size: 14,
                    color: '#000',
                    radialOffset: 15
                }
            }
        )
        .heatmap('obj1', obj1, {
            innerRadius: 0.8,
            outerRadius: 0.98,
            logScale: false,
            color: 'YlOrRd',//RColorBrewer包
            events: {
                'mouseover.demo': function (d, i, nodes, event) {
                    //console.log(d, i, nodes, event)
                }
            }
        })
        .heatmap('obj2', obj2, {
            //innerRadius: 0.68,
            innerRadius: 0.65,
            outerRadius: 0.78,
            logScale: false,
            //color:'Greens'
            color: 'YlGnBu'
            // color:'Blues'
        })//更改3，加入半径范围
        // .heatmap('obj3',obj3,{
        //     innerRadius: 0.56,
        //     outerRadius: 0.66,
        //     logScale: false,
        //     //color:'Greens'
        //     color: 'Reds'
        // })
        // .heatmap('obj4',obj4,{
        //     innerRadius: 0.44,
        //     outerRadius: 0.54,
        //     logScale: false,
        //     //color:'Greens'
        //     color: 'Greens'
        // })
        // .heatmap('obj5',obj5,{
        //     innerRadius: 0.32,
        //     outerRadius: 0.42,
        //     logScale: false,
        //     //color:'Greens'
        //     color: 'Reds'
        // })
        // .heatmap('obj6',obj6,{
        //     innerRadius: 0.3,
        //     outerRadius: 0.38,
        //     logScale: false,
        //     //color:'Greens'
        //     color: 'BuGn'
        // })
        // .heatmap('obj7',obj7,{
        //     innerRadius: 0.2,
        //     outerRadius: 0.28,
        //     logScale: false,
        //     //color:'Greens'
        //     color: 'OrRd'
        // })
        .render()
}
//更改1，参数
// function drawCircos(error, time, obj1, obj2,obj3,obj4,obj5,obj6,obj7) {
//     //清空
//     microView.innerHTML="";
//     var width=microView.offsetWidth;
//     //创建svg容器
//     var circosHeatmap = new Circos({
//         container: '#microView',
//         width: width,
//         height: width
//     });
//
//     //读取数据并转换为对应的数组格式
//     obj1 = obj1.map(function(d) {
//         return {
//             block_id: d.month,
//             start: parseInt(d.start),
//             end: parseInt(d.end),
//             value: parseFloat(d.value)
//         };
//     })
//     obj2 = obj2.map(function(d) {
//         return {
//             block_id: d.month,
//             start: parseInt(d.start),
//             end: parseInt(d.end),
//             value: parseFloat(d.value)
//         };
//     })
//     //更改2，定义参数对象
//     // obj3=obj3.map(function (d) {
//     //     return {
//     //         block_id: d.month,
//     //         start: parseInt(d.start),
//     //         end: parseInt(d.end),
//     //         value: parseFloat(d.value)
//     //     }
//     // })
//     // obj4=obj4.map(function (d) {
//     //     return {
//     //         block_id: d.month,
//     //         start: parseInt(d.start),
//     //         end: parseInt(d.end),
//     //         value: parseFloat(d.value)
//     //     }
//     // })
//     // obj5=obj5.map(function (d) {
//     //     return {
//     //         block_id: d.month,
//     //         start: parseInt(d.start),
//     //         end: parseInt(d.end),
//     //         value: parseFloat(d.value)
//     //     }
//     // })
//     // obj6=obj6.map(function (d) {
//     //     return {
//     //         block_id: d.month,
//     //         start: parseInt(d.start),
//     //         end: parseInt(d.end),
//     //         value: parseFloat(d.value)
//     //     }
//     // })
//     // obj7=obj7.map(function (d) {
//     //     return {
//     //         block_id: d.month,
//     //         start: parseInt(d.start),
//     //         end: parseInt(d.end),
//     //         value: parseFloat(d.value)
//     //     }
//     // })
//
//     circosHeatmap
//         .layout(
//             time,
//             {
//                 innerRadius: width / 2.4-40,
//                 outerRadius: width / 2.4,
//                 ticks: {display: false},
//                 labels: {
//                     position: 'center',
//                     display: true,
//                     size: 14,
//                     color: '#000',
//                     radialOffset: 15
//                 }
//             }
//         )
//         .heatmap('obj1', obj1, {
//             innerRadius: 0.8,
//             outerRadius: 0.98,
//             logScale: false,
//             color: 'YlOrRd',//RColorBrewer包
//             events: {
//                 'mouseover.demo': function (d, i, nodes, event) {
//                     //console.log(d, i, nodes, event)
//                 }
//             }
//         })
//         .heatmap('obj2', obj2, {
//             //innerRadius: 0.68,
//             innerRadius: 0.65,
//             outerRadius: 0.78,
//             logScale: false,
//             //color:'Greens'
//             color: 'YlGnBu'
//             // color:'Blues'
//         })//更改3，加入半径范围
//         // .heatmap('obj3',obj3,{
//         //     innerRadius: 0.56,
//         //     outerRadius: 0.66,
//         //     logScale: false,
//         //     //color:'Greens'
//         //     color: 'Reds'
//         // })
//         // .heatmap('obj4',obj4,{
//         //     innerRadius: 0.44,
//         //     outerRadius: 0.54,
//         //     logScale: false,
//         //     //color:'Greens'
//         //     color: 'Greens'
//         // })
//         // .heatmap('obj5',obj5,{
//         //     innerRadius: 0.32,
//         //     outerRadius: 0.42,
//         //     logScale: false,
//         //     //color:'Greens'
//         //     color: 'Reds'
//         // })
//         // .heatmap('obj6',obj6,{
//         //     innerRadius: 0.3,
//         //     outerRadius: 0.38,
//         //     logScale: false,
//         //     //color:'Greens'
//         //     color: 'BuGn'
//         // })
//         // .heatmap('obj7',obj7,{
//         //     innerRadius: 0.2,
//         //     outerRadius: 0.28,
//         //     logScale: false,
//         //     //color:'Greens'
//         //     color: 'OrRd'
//         // })
//         .render()
// }

