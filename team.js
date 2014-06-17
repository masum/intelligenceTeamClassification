/**
 * {
 *   count : １チームのメンバー数
 *   member : 入力となるメンバー一覧
 *                 {id:"1",name:"A",level:1}
 *   lasted : 前回のメンバー一覧(IDの二次元配列)
 *                 [["1","2"],["5","10"]]
 *   random : 前回とメンバーに関係なくランダムにする
 *   level  : レベルを分散する
 *   surplus: あふれたメンバーを、どこかのチームに入れる
 * }
 */
exports.team = function(param) {
  var paramList = param["member"]; // グループ内の全メンバー一覧
  var paramCount = param["count"]; // カットするメンバー数
  var totalLevel = 0;       // 合計レベル
  var list;                 // 現在の残りのメンバーリスト
  var team_count;           // チーム数
  var team_rem_count;       // チーム別けした際のあふらる人数
  var team_level;           // 平均化された１チームのレベル
  var inteam_total_level;   // 現在のチーム内の合計レベル
  var inteam_average_level; // 現在のチーム内の平均レベル
  var inteam_rest_level;    // 現在のチーム内の追加可能な残りレベル
  var boolRem = false;      // あふれた人を他のチームに割り振るかどうか

  // 登録済みのレベルの平均を求める
  var sortList = {
    "1" : [5,4,3,2,1],
    "2" : [4,5,3,1,2],
    "3" : [4,5,1,3,2],
    "4" : [2,1,3,5,4],
    "5" : [1,2,3,4,5]
  };

  // ランダムに並び替える
  var sortRandom = function(ar) {
    return ar.sort(function() {
      return Math.random() - Math.random();
    });
  };
  // 指定したレベルにふさわしい順番に並び替える
  var levelSort = function(key, plist) {
    var ar = sortList[key.toString()];
    plist.sort(function(a,b) {
      var x = ar.indexOf(a["level"]);
      var y = ar.indexOf(b["level"]);
      return x - y;
    });
    return plist;
  };
  // １つを抽出する
  var extract = function(_count, _team, _list, _level) {
    var item = null;
    for (var i=0;i<_list.length;i++) {
      if (_list[i]["level"] < _level) {
        item = _list.splice(i,1)[0];
        break;
      }
    }
    if ((item == null) && (team.length == 0)) {
      item = _list.splice(0,1)[0];
    }
    if ((item == null) && (_team.length < _count)) {
      for (var n=1;n<6;n++) {
        for (var i=0;i<_list.length;i++) {
          if (_list[i]["level"] < (_level+n)) {
            item = _list.splice(i,1)[0];
            break;
          }
        }
        if (item != null) {
          break;
        }
      }
    }
    return item;
  }
  // 前回のリストと同じメンバーかどうかチェック
  var checkOldMember = function(_id, _teams, _oldlist) {
    for (var i=0;i<_oldlist.length;i++) {
      for (var n=0;n<_teams.length;n++) {
        if (_oldlist[i].indexOf(_teams[n]["id"]) != -1) {
          if (_oldlist[i].indexOf(_id.toString()) != -1) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // ランダムに並び替える
  list = sortRandom(paramList);
  // チーム数を計算する
  team_count = Math.floor(list.length / paramCount);
  // あふれる人数を求める
  team_rem_count = list.length % paramCount;
  // あふれた人数を他チームに入れるかどうか
  if ((team_rem_count > 0) && (!param["surplus"])) {
    // あふれたメンバーだけで１チームとする
    team_count += 1;
  }
  // すべての合計レベルを計算
  for (var i=0;i<list.length;i++) {
    totalLevel += list[i]["level"];
  }
  // １チーム分のレベル平均を計算する
  team_level = Math.floor(totalLevel / team_count);
  // 平均レベルが６よりも低いと、レベル５の人が入らない場合が多いので、最小値をセット
  if (team_level < 7) {
    team_level = 7;
  }

  inteam_rest_level = team_level;
  var group = [];
  var team = [];

  while(list.length > 0) {
    // ランダムに並び替える
    list = sortRandom(list);
    if ((param["level"]) && (team.length > 0)) {
      // 現在のチームにすでに何人か登録されている
      inteam_total_level = 0;
      for (var i=0;i<team.length;i++) {
        inteam_total_level += team[i]["level"];
      }
      // チーム内の平均レベル
      inteam_average_level = Math.round(inteam_total_level / team.length);
      // チームのMaxレベルまでの残りレベル
      inteam_rest_level = team_level - inteam_total_level;
      // 平均レベルに合わせた、抽出順のためのソートを行う
      list = levelSort(inteam_average_level, list);
    }
    // 抽出
    var item = null;
    if (param["level"]) {
      item = extract(paramCount, team, list, inteam_rest_level);
    } else {
      // レベル均等せずに、ランダムにする場合は、無条件に１つ抽出する
      item = list.splice(0,1)[0];
    }
    if (param["random"]) {
      if (checkOldMember(item["id"], team, param["lasted"])) {
        // 前回のリストにヒットした場合、１度だけ引き直す
        list.push(item);
        var item = null;
        if (param["level"]) {
          item = extract(paramCount, team, list, inteam_rest_level);
        } else {
          // レベル均等せずに、ランダムにする場合は、無条件に１つ抽出する
          item = list.splice(0,1)[0];
        }
      }
    }

    if (item == null) {
      // 該当するメンバーが検出できなかった場合、次のチームとする
      group.push(team);
      team = [];
    } else {
      // 検出したメンバーを現在のチームに入れる
      team.push(item);
      // チーム内のメンバー数が定員に達した場合、チーム登録し、新たなチームを作成
      if (team.length == param["count"]) {
        group.push(team);
        team = [];
      }
    }
    // 新たなチームが作成された場合、値の初期化を行う
    if (team.length == 0) {
      inteam_total_level = 0;
      inteam_average_level = 0;
      inteam_rest_level = team_level;
    }
  }
  // １つもチームが作られていない場合、１つだけ作成する
  if (group.length == 0) {
    group.push([]);
  }
  // あふれたメンバーがいて、かつ、各チームの定員に達していない場合、適当に埋める
  for (var i=0;i<group.length;i++) {
    if (group[i].length < param["count"]) {
      if (team.length > 0) {
        group[i].push(team.splice(0,1)[0]);
      }
    }
  }
  // まだあふれている場合
  if (team.length > 0) {
    if ((team.length < param["count"]) && (param["surplus"])) {
      // あふれたメンバー数が、現在のチーム数以上ならば、分割して登録する
      var i = Math.floor(team.length / group.length);
      if (i==0) {
        i = 1;
      }
      for (var n=0;n<group.length;n++) {
        var cutlist = team.splice(0,i);
        group[n] = group[n].concat(cutlist);
      }
      // それでも、まだあふれている場合、最初のチームに入れる
      if (team.length > 0) {
        group[0].concat(team);
      }
    } else {
      // あふれたメンバーだけで１チームとする
      group.push(team);
    }
  }

  return ret = {
    teams: group
  };
};
