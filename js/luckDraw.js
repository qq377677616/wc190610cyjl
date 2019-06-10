$.extend({
  luckGame: function(options) {
  var settings = $.extend(options);
  w_config={
    'w':$(window).width(),
    'h':$(window).height()
  }
  var gameArr=[];
  var gameLen=settings.gameLen;
  var game_list_h='';
  var game_init=[];
  var game_list_item_h=0;
  //每次进来随机3个数字，来启动当前的选择的状态
  for (var i = 0; i < 3; i++) {
    game_init.push(Math.floor(Math.random() * gameLen.length));
  }
  createGame();
  /*$(window).resize(function(){
    createGame();
  })*/
  function createGame(){
    getHeight();
    setLi();
    pushLi(gameArr);
    if (settings.isStar) {start();settings.isStar = false;}
    //start();
  }
  function getHeight(){
    w_config={
      'w':$(window).width(),
      'h':$(window).height()
    }
    //game_list_item_h=(w_config.w*320/750*0.5*0.7).toFixed(2);
    game_list_item_h = $(settings.eleId + 1).height();
  }
  //设置奖品
  function setLi(){
    for (var j = 1; j <= settings.game_pagesize; j++) {
      for (var i = 0; i < gameLen.length; i++) {
        gameArr.push({'type':j,'index':i,'src': gameLen[i].img});
      }
    }
  }
  //写入，初始化奖品的滚动
  function pushLi(arr){
    //console.log(game_list_item_h);
    var html_str='';
    for (var i = 0; i < arr.length; i++) {
      html_str+='<li style="height:'+game_list_item_h+'px" data-index="'+arr[i]['index']+'" data-type="'+arr[i]['type']+'"><img src="'+arr[i]['src']+'"></li>';
    }
    if (!settings.isStar) {
      $(settings.eleClass).each(function(e){
        $(this).empty().append(html_str);
        game_list_h=$(this).height();
        //console.log('game_list_item_h',game_init);
        y=game_list_item_h*game_init[e];
        $(this).css({
          'transition-duration': '0ms',
          'transform':'translate(0px, -'+y+'px) translateZ(0px)'
        })
      });
      settings.callback({status: 202, message:"奖品已初始化完成。"});
    }
  }
  function start(){
    //$(".start-btn").click(function(){
      //如果中奖
      if (settings.zj_arr.number!=-1) {
        $(settings.eleClass).each(function(e){
          setTimeout(function(){
            y=(settings.zj_arr.number+settings.gameLen.length*(settings.game_pagesize-1))*game_list_item_h;
            $(settings.eleClass).eq(e).css({
              'transition-duration': '5000ms',
              'transform':'translate(0px, -'+y+'px) translateZ(0px)'
            })
          }, e*300);
          //判断最后面是否完毕
          $(settings.eleId + 3).find(settings.eleClass).on("webkitTransitionEnd", function() {
            y=settings.zj_arr.number*game_list_item_h;
            $(settings.eleClass).css({
              'transition-duration': '0ms',
              'transform':'translate(0px, -'+y+'px) translateZ(0px)'
            })
            $(settings.eleId + 3).find(settings.eleClass).unbind("webkitTransitionEnd");
            if (e == 2) {
              settings.callback({status: 200, message:"恭喜您，已中奖！"});
            }  
          })
        })
      } else {
        numrand=randNum2();
        //不中奖的时候
        $(settings.eleClass).each(function(e){
          y2=(numrand[0])*game_list_item_h;
          y3=(numrand[1])*game_list_item_h;
          y4=(numrand[2])*game_list_item_h;
          setTimeout(function(){
            y=(numrand[e]+settings.gameLen.length*(settings.game_pagesize-1))*game_list_item_h;
            $(settings.eleClass).eq(e).css({
              'transition-duration': '5000ms',
              'transform':'translate(0px, -'+y+'px) translateZ(0px)'
            })
          }, e*300);
          //判断最后面是否完毕
          $(settings.eleId + 3).find(settings.eleClass).on("webkitTransitionEnd", function() {
            $(settings.eleClass).eq(2).css({
              'transition-duration': '00ms',
              'transform':'translate(0px, -'+y4+'px) translateZ(0px)'
            })
            $(settings.eleId + 3).find(settings.eleClass).unbind("webkitTransitionEnd");
            if (e == 2) {
              settings.callback({status: 400, message:"很遗憾，您未中奖！"});
            }
          })
          $(settings.eleId + 2).find(settings.eleClass).on("webkitTransitionEnd", function() {
            $(settings.eleClass).eq(1).css({
              'transition-duration': '00ms',
              'transform':'translate(0px, -'+y3+'px) translateZ(0px)'
            })
            $(settings.eleId + 2).find(settings.eleClass).unbind("webkitTransitionEnd");
          })
          $(settings.eleId + 1).find(settings.eleClass).on("webkitTransitionEnd", function() {
            $(settings.eleClass).eq(0).css({
              'transition-duration': '00ms',
              'transform':'translate(0px, -'+y2+'px) translateZ(0px)'
            })
            $(settings.eleId + 1).find(settings.eleClass).unbind("webkitTransitionEnd");
          })
        })
      }
    //})
  }
  function randNum2(){
    a=Math.floor(Math.random() * gameLen.length);
    b=Math.floor(Math.random() * gameLen.length);
    c=Math.floor(Math.random() * gameLen.length);
    arr=[];
    if (a==b) {
      return randNum2();
    } else {
      return arr=[a,b,c];
    }
  }
  }
})
