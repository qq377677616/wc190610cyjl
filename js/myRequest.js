define(function(){
  var URL = '';
  var URL_development = 'https://zhssw100.zhssw.com/Cyapi';
  if (window.location.href.indexOf("localhost") == -1) {
    URL = 'http://game.flyh5.cn/riddle/admin/';
  }

  /*登录*/ 
  function login(data, claaback) {
    var _url = URL + 'api/apildiom/index';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*通关管卡详情*/
  function passDetail(data, claaback) {
    var _url = URL + 'api/apildiom/pass_detail';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*排行榜*/
  function rankingList(data, claaback) {
    var _url = URL + 'api/apildiom/get_list';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*成语库获取显示数据*/
  function startgame(data, claaback) {
    var _url = URL + 'api/apildiom/startgame';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*抽奖奖池接口*/
  function getPrize(claaback) {
    var _url = URL + 'api/apildiom/get_prize';
    $.post(_url, function(res){
      claaback(res);
    })
  }
  /*剩余抽奖次数*/
  function count_nums(data, claaback) {
    var _url = URL + 'api/apildiom/count_nums';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*兑换抽奖次数*/
  function get_nums(data, claaback) {
    var _url = URL + 'api/apildiom/get_nums';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*抽奖*/
  function getLuck(data, claaback) {
    var _url = URL + 'api/apildiom/get_luck';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*用户获奖记录*/
  function userPrize(data, claaback) {
    var _url = URL + 'api/apildiom/user_prize';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*是否留过资*/
  function isUpinfo(data, claaback) {
    var _url = URL + 'api/apildiom/is_info';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*留资*/
  function upinfo(data, claaback) {
    var _url = URL + 'api/apildiom/upinfo';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*使用道具*/
  function useGifts(data, claaback) {
    var _url = URL + 'api/apildiom/use_gifts';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*关卡结束提交成绩*/
  function gameOver(data, claaback) {
    var _url = URL + 'api/apildiom/game_over';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  /*实时用户积分*/
  function getScore(data, claaback) {
    var _url = URL + 'api/apildiom/score_info';
    $.post(_url, data, function(res){
      claaback(res);
    })
  }
  //答错次数的统计
  function error_log(data, callback) {
    var _url = URL_development + '/error_log';
    $.post(_url, data, function(res){
      if (callback) callback(res);
    })
  }
  //记录用户使用道具
  function help_log(data, callback) {
    var _url = URL_development + '/help_log';
    $.post(_url, data, function(res){
      if (callback) callback(res);
    })
  }
  //获取积分商城URL
  function get_url_info(data, callback) {
    var _url = URL_development + '/get_url_info';
    $.post(_url, data, function(res){
      if (callback) callback(res);
    })
  }
  //获取背景音乐
  function get_music(callback) {
    var _url = URL_development + '/get_music';
    $.post(_url, function(res){
      if (callback) callback(res);
    })
  }
  //积分排行
  function integral_list(data, callback) {
    var _url = URL_development + '/integral_list';
    $.post(_url, data, function(res){
      if (callback) callback(res);
    })
  }
  //积分上报
  function integral_report(data, callback) {
    var _url = URL_development + '/integral_report';
    $.post(_url, data, function(res){
      if (callback) callback(res);
    })
  }
  //积分消耗
  function integral_consumption(data, callback) {
    var _url = URL_development + '/integral_consumption';
    $.post(_url, data, function(res){
      if (callback) callback(res);
    })
  }
  //中奖上报
  function luck_draw(data, callback) {
    var _url = URL_development + '/luck_draw';
    $.post(_url, data, function(res){
      if (callback) callback(res);
    })
  }

  return {
    login: login,
    passDetail: passDetail,
    rankingList: rankingList,
    startgame: startgame,
    getPrize: getPrize,
    count_nums: count_nums,
    get_nums: get_nums,
    getLuck: getLuck,
    userPrize: userPrize,
    isUpinfo: isUpinfo,
    upinfo: upinfo,
    useGifts: useGifts,
    gameOver: gameOver,
    getScore: getScore,
    error_log: error_log,
    help_log: help_log,
    get_url_info: get_url_info,
    get_music: get_music,
    integral_list: integral_list,
    integral_report: integral_report,
    integral_consumption: integral_consumption,
    luck_draw: luck_draw
  }
})