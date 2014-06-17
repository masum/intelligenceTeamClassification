var team = require("./team");

function output(list) {
  for (var i=0;i<list.length;i++) {
    var level = 0;
    var ar = []
    for (var n=0;n<list[i].length;n++) {
      var item = list[i][n];
      level += item["level"];
      ar.push(item["name"] + "(" + item["level"] + ")");
    }
    var msg = "人数(" + ar.length + "),合計(" + level + ") = " + ar.join(",");
    console.log(msg);
  }
  console.log("");
}

function sample() {
  var memberList = [
    {id:"1",name:"A",level:1},
    {id:"2",name:"B",level:2},
    {id:"3",name:"C",level:5},
    {id:"4",name:"D",level:1},
    {id:"5",name:"E",level:3},
    {id:"6",name:"F",level:1},
    {id:"7",name:"G",level:3},
    {id:"8",name:"H",level:1},
    {id:"9",name:"I",level:2},
    {id:"10",name:"J",level:1},
    {id:"11",name:"K",level:4},
    {id:"12",name:"L",level:1},
    {id:"13",name:"M",level:2},
    {id:"14",name:"N",level:4},
    {id:"15",name:"O",level:4},
    {id:"16",name:"P",level:1}
  ];
  var oldlist = [
    ["10",  "3"],
    [ "8", "11"],
    ["16", "14"],
    [ "2", "15"],
    [ "4",  "5"],
    [ "7",  "1"],
    [ "5",  "9"],
    ["13", "12"]
  ];
  var ret = team.team({
    count  : 2,
    member : memberList,
    lasted : oldlist,
    random : true,
    level  : true,
    surplus: false
  });

  var group = ret["teams"];
  output(group);
}

function makeList(count) {
  var ret = [];
  for (var i=0;i<count;i++) {
    ret.push({
      id : i,
      name : i,
      level : Math.ceil(Math.random() * 5)
    });
  }
  return ret;
}

function call(cut, list, random, level, surplus) {
  console.log("--- 引数");
  console.log("チーム内メンバー数 : " + cut);
  console.log("レベル分配 : " + level);
  console.log("あふれた : " + surplus);
  console.log(list);
  var ret = team.team({
    count  : cut,
    member : list,
    lasted : [],
    random : random,
    level  : level,
    surplus: surplus
  });
  console.log("=== 結果");
  var group = ret["teams"];
  output(group);
}
function randomTest() {
  var count = Math.floor(Math.random() * 20);
  var cut = Math.ceil(Math.random() * 7);
  var list = makeList(count);
  call(cut, list, true, true, false);
}

sample();
//randomTest();
