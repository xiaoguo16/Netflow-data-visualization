/**
 * Created by gly on 2018/1/31.
 */
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
var form=document.getElementsByTagName("form")[0];
var btnAppend=form.elements["append"];
//参数
var conditions=[];
//第一个form表单中的点击事件
var targetStart;
EventUtil.addHandler(form,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var formLen=form.length;
    //删除按钮
    if(target.className=="delete") {//删除按钮
        for (var i = 0; i < formLen; i++) {
            if (form[i] == target) {
                form.removeChild(target);
                form.removeChild(form[i - 1]);
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
        form.insertBefore(inputNew,btnAppend);
        form.insertBefore(btnNew,btnAppend);
    }
    //开始按钮1
    else if(target.className=="btnStart"||"btnStart2"){
        if(target.className=="btnStart"){
            targetStart="correIndirct"
        }else{ targetStart="correDirct"}
        //获取参数
        conditions=[];
        for(var j=0;j<formLen;j++){
            if(form[j].className=="form-control"){
                if(form[j].value!=""){
                    var curValue=form[j].value;
                    conditions.push(curValue);
                }
            }
        }
        var startTime=conditions[0];
        var endTime=conditions[1];
        startTime="2013/"+startTime;
        startTime=new Date(startTime);
        startTime=startTime.getTime()/1000+8*3600;
        endTime="2013/"+endTime;
        endTime=new Date(endTime);
        endTime=endTime.getTime()/1000+8*3600;
        var startIp=conditions[2];
        var focusIp=[];
        var filterCounts=conditions[conditions.length-1];
        for(var k=3;k<conditions.length-1;k++){
            focusIp.push(conditions[k])
        }
        var parameters="target="+targetStart+"&startTime="+startTime+"&endTime="+endTime+"&startIp="+startIp+"&focusIp="+focusIp+"&filterCounts="+filterCounts;
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
                forceLayout();
                titleCircle();
            }
        });
    }

});
//视图函数
//通过阈值比例尺根据连接次数确定线条宽度。
var color=["black","#ff7f0e","#1f77b4","#9467bd"];
var colorRange=d3.range(4).map(function(i) { return "q" + i + "-4"; });
var threshold=d3.scaleThreshold()//阈值比例尺
    .domain([1000,10000,20000])
    .range(colorRange);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))//连接作用力
    .force("charge", d3.forceManyBody())//节点间的作用力
    .force("center", d3.forceCenter(0, 0));
var forceDiv1=document.getElementsByClassName("forceLayout")[0];
var forceDiv2=document.getElementsByClassName("forceLayout2")[0];
var forceDiv;
function forceLayout() {
    var dataForce;
    if(targetStart=="correIndirct"){
        forceDiv=forceDiv1;
        dataForce="forceAll"
    }else{
        forceDiv=forceDiv2;
        dataForce="forceDirect"
    }
    forceDiv.innerHTML="";
    var margin={left:0,right:0,bottom:0,top:0};
    var widthVis=forceDiv.offsetWidth-margin.left-margin.right;
    var heightVis=forceDiv.offsetHeight-margin.top-margin.bottom;
    var minWidth=Math.min(widthVis,heightVis);
    var svg=d3.select(forceDiv)
        .append("svg")
        .attr("width",widthVis)
        .attr("height",heightVis)
        .append("g")
        .attr("transform","translate("+widthVis/2+","+heightVis/2+")");


    d3.json("./data/force/"+dataForce+".json",function (error,data) {
        var link=svg.append("g")
            .attr("class","links")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("marker-end","url(#arrow)")
            .attr("class",function (d) {
                return threshold(d.count)
            });
        var num=data.nodes.map(function (item) {
            return item.size
        });
        var linear=d3.scaleLinear()
        .domain([d3.min(num),d3.max(num)])
        .range([5,11]);//半径的范围
            //.domain([d3.min(num),1000,10000,d3.max(num)])
            //.range([5,6,8,11]);//半径的范围
        var node=svg.append("g")
            .attr("class","nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("circle")
            .attr("r",function (d) {
                return linear(d.size)
            })
            .attr("fill",function (d) {
                if(conditions.indexOf(d.id)!=-1){
                    return color[0];
                }
                else {
                    return color[d.groupId]
                }
            })
            .call(d3.drag()
                .on("start",dragstarted)
                .on("drag",dragged)
                .on("end",dragended));

        simulation.nodes(data.nodes)
            .on("tick",ticked);
        simulation.force("link")
            .distance(minWidth/3)//确定力导图的连线长度
            .links(data.links);
        //定义箭头标识
        var defs = svg.append("defs");

        var arrowMarker = defs.append("marker")
            .attr("id","arrow")
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","8")
            .attr("markerHeight","8")
            .attr("viewBox","0 0 12 12")
            .attr("refX","13")
            .attr("refY","6")
            .attr("orient","auto");

        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

        arrowMarker.append("path")
            .attr("d",arrow_path)
            .attr("fill","#999");
        //提示框
        var tooltip=d3.select("body")
            .append("div")
            .attr("class","tooltip")
            .style("opacity",0.0);
        node.on("mouseover",function (d) {
            var currIP=d.id;
            currIP=currIP.replace("ip_","");
            currIP=currIP.replace(/_/g,".");
            tooltip
                .html("IP: "+currIP+"\nCounts:"+d.size)
                .style("left",(d3.event.pageX) +"px")
                .style("top",(d3.event.pageY +20)+"px")
                .style("opacity",1.0)
        })
            .on("mouseout",function (d) {
                tooltip.style("opacity",0.0);
            });
        node.attr("id",function (d) {
            return d.id;
        });

        link.on("mouseover",function (d) {
            var currIP=d.target.id;
            currIP=currIP.replace("ip_","");
            currIP=currIP.replace(/_/g,".");
            tooltip
                .html("IP: "+currIP+"\n"+"<br>连接次数："+d.count)
                .style("left",(d3.event.pageX) +"px")
                .style("top",(d3.event.pageY +20)+"px")
                .style("opacity",1.0)
        })
            .on("mouseout",function (d) {
                tooltip.style("opacity",0.0);
            });

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
    });
}

//力导图拖拽函数
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;

}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    //不设置为null，可以固定
    d.fx = d.x;
    d.fy = d.y;
}

//最顶端标注
var visTitleDiv=document.getElementsByClassName("forceCircleTitle")[0];
function titleCircle() {
    visTitleDiv.innerHTML="";
    var widthVis=visTitleDiv.offsetWidth;
    var visTitleHeight=visTitleDiv.offsetHeight;
    var titleSvg=d3.select(visTitleDiv)
        .append("svg")
        .attr("width",widthVis)
        .attr("height",visTitleHeight);
    var cicleHeight=25,textHeight=30;
    titleSvg.append("g")
        .attr("transform","translate(30,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[0]);
    titleSvg.append("g")
        .attr("transform","translate(40,"+textHeight+")")
        .append("text")
        .text("Initial Node");
    titleSvg.append("g")
        .attr("transform","translate(150,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[1]);
    titleSvg.append("g")
        .attr("transform","translate(160,"+textHeight+")")
        .append("text")
        .text("Focus Nodes");
    titleSvg.append("g")
        .attr("transform","translate(290,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[2]);
    titleSvg.append("g")
        .attr("transform","translate(300,"+textHeight+")")
        .append("text")
        .text("Others");
}



// //测试用，需删掉
// forceLayout();
// titleCircle();