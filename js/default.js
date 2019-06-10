require.config({
  paths:{
    "jquery":"./jquery-3.3.1",
    "fitremtaobao":"./fitremtaobao",
    "sMethods": "./sMethods",
    "myRequest": "./myRequest",
    "swiper": "./swiper.min",
    "luckDraw": "./luckDraw"
  }
})
require(['jquery', 'fitremtaobao', 'sMethods', 'myRequest', 'swiper', 'luckDraw'], function(jquery, fitremtaobao, sMethods, myRequest, swiper, luckDraw){
$(function(){
  var loginUrl = 'https://www.zhssw.com/Users/login';//登录入口地址
  var URL_development = 'http://zhssw100.zhssw.com/';
  var PW = window.innerWidth;  
  var PH = window.innerHeight; 
  var BGM = document.getElementById('my-audio-bg');
  var USERINFO, CHECKPOINT, PARIZELIST, curCheckpoint, autoT, isPrizeScore, horseRaceLamp;
  /*isPrizeScore:奖品是否为积分  horseRaceLamp:跑马灯定时器*/
  var ISLOGIN = false;//是否登录
  var isDraw = false;//是否正在抽奖
  var drawNum = 0;//连续第几次抽奖
  var isContinuity = true;//连续5次有没有中过奖
  var isAutoTime = false;//当前是否正在计时 
  var isTips = false;//用户积分达到100分后是否提示过去商城弹窗
  var LD_CONSUME = 10;//每次抽奖消耗积分数
  var Checkpoint_page_num = 6;//大关选择界面每一页放置几大关
  var Checkpoint_big = 20;//大关卡总关卡数
  var Checkpoint_Small = 10;//每大关中小关卡数
  var ShutdownTime = 30;//每次闯关限定时间
  var BonusPoints = 10;//通过每一小关增加积分
  var BonusAdditional = 50;//通过每大关额外增加积分
  var swiperCheckpoint;//大关卡切换swiper实例
  var isProp = false;//是否在使用道具
  var REG_PHONE  = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;//正则--手机号
  //loading加载
  loading(".page_loading .loadingBox .img", ".page_loading .loadingBox .img", window.location.href.indexOf("localhost") == -1 ? 1000 :100, function(){
    $("#app .page_loading").hide();
    $("#app .page_home").show(0, function(){$(this).addClass("on");});
    initPage();
  });
  function initPage(){
    var _users = sMethods.getUrlParameter("users");
    var _nickname = sMethods.getUrlParameter("nickname");
    var _head_pic = sMethods.getUrlParameter("head_pic");
    if (!_users) {
      window.location.href = loginUrl;
    }
    var _data = {
      uid: _users,
      nickname: _nickname,
      head_pic: _head_pic,
    }
    myRequest.login(_data, function(res){
      if (res) {
        setTimeout(function(){
          $(".login").fadeOut();
          console.log(">>用户个人信息：");
          console.log(res);
          USERINFO = res;
          if (res.code == 202) {
            $(".tips .tips-item").hide();
            $(".tips, .tips-new-user").show(); 
          } else {
            getScore();
          }
          $('#fraction').data("fraction", USERINFO.info.score);
          //BGM.play();
          myRequest.get_url_info({ id: USERINFO.info.uid }, function(res){
            $(".scoreMall").attr("href", res.data.url)
          })
          myRequest.get_music(function(res){
            // sMethods.audioContextMusic("./images/mp3_01.mp3");
            //BGM.setAttribute("src", URL_development + res.data[0].url);
            audioMusic("my-audio-bg", res.data, showControls);
            $("body").on("click", ".page_home", function(){ audioMusic("my-audio-bg", res.data, showControls)});
            function showControls() { $("#controls-btn").show(); }
            $("#controls-btn").on("click", function(){
              if ($(this).hasClass("on")) {
                $(this).removeClass("on");
                BGM.play();
              } else {
                $(this).addClass("on");
                BGM.pause();
              }
            });
            //sMethods.audioContextMusic('http://zhssw100.zhssw.com/' + res.data[0].url);
          });
          bigShutInit();
          sMethods.sequence_img(".effect .effect_01", "./images/effect/effect1/effect1(", 51);//答题正确的序列帧图片加载
          sMethods.sequence_img(".effect .effect_02", "./images/effect/effect2/effect2(", 51);//做错成语的序列帧图片加载
          sMethods.sequence_img(".effect .effect_03", "./images/effect/effect3/effect3(", 50);//闯关失败的序列帧图片加载
        }, 1000);
      }
    });
  }
  //大关dom渲染
  function bigShutInit() {
    var _str = '';
    var _repair = 6 - (Checkpoint_big % 6) - 1;
    for (var i = 0; i <= (Checkpoint_big + _repair); i++) {
      if ( i % 6 == 0) {
        _str += '<ul class="swiper-slide">';
      }
      if (i < Checkpoint_big) {
        _str += '<li class="activation" data-shut="'+(i+1)+'"><img src="./images/texture3/bg_0'+(i%5+1)+'.png" alt="" class="colour"/><img src="./images/texture3/bg_hb.png" alt="" class="black-white"/><div class="order" data-order="'+(i+1)+'"></div></li>';
      } else if (i == Checkpoint_big + _repair) {
        _str += '<li class="expect"><img src="./images/texture3/game1_9.png" alt=""></li>';
      } else if (i >= Checkpoint_big) {
        _str += '<li class="disab"><img src="./images/texture3/game1_8.png" alt=""></li>';
      }
      if ((i + 1) % 6 == 0) {
        _str += '</ul>';
      }
    }
    $(".checkpoint_con .swiper-wrapper").html(_str);
    calcNum(".checkpoint-one ul li .order", "order", "cur", "./images/texture3/number_", true);
  }
  //大关swiper切换
  function swiperInit() {
    swiperCheckpoint = new Swiper('.swiper-container', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
  //登录
  $(".login .loginBox button").on("click", function(){
    if (ISLOGIN) {return;}
    ISLOGIN = true;
    $("#BGM").trigger("click");
    var _phone = $(".login .loginBox input").val();
    if (!_phone) {
      sMethods.showToast("手机号不能为空");
      return;
    }
    if (!REG_PHONE.test(_phone)) {
      sMethods.showToast("请输入正确的手机号");
      return;
    }
    var _data = {
      uid: _phone
    }
    myRequest.login(_data, function(res){
      if (res) {
        sMethods.showToast("登录成功");
        $(".login").fadeOut();
        console.log(">>用户个人信息：");
        console.log(res);
        USERINFO = res;
        if (res.code == 202) {
          $(".tips .tips-item").hide();
          $(".tips, .tips-new-user").show(); 
        } else {
          getScore();
        }
        $('#fraction').data("fraction", USERINFO.info.score);
        //localStorage.setItem("userInfo", JSON.stringify(res));
      }
    });
  }); 
  //确认领取新用户奖励
  $(".tips-new-user .btn img").on("click", function(){
    $(".tips, .tips-new-user").hide();
    setTimeout(function(){sMethods.showToast("积分领取成功");getScore();}, 300);
  });
  //首页游规则
  $(".rule .ruleBox .btn .btn1").on("click", function(){
    $(".page_home .homeBox").fadeIn(100);
    $(".rule.popup").removeClass("on").fadeOut(200);
  });
  $(".page_home .controls .btn2").on("click", function(){
    $(".page_home .homeBox").fadeOut(200);
    $(".rule.popup").fadeIn(0,function(){$(".rule.popup").addClass("on")});
  });
  //积分排行
  $(".page_home .controls .btn1").on("click", function(){
    $(".page_home .homeBox").fadeOut(200);
    $(".rankings").fadeIn(0,function(){$(".rankings").addClass("on")});
    var _data = {u_code: USERINFO.info.uid};
    //myRequest.rankingList(_data, function(res){
    myRequest.integral_list(_data, function(res){
      if (parseInt(res.code) == 1) {
        var _list = _class = '';
        // for (k in res.all) {
        //   _list += '<li class="flex-ali" data-num="'+(parseInt(k) + 1)+'"><div class="num flex-cen"></div><div class="avatar"><img src="'+res.all[k].headimgurl+'" alt="" /></div><div class="nickName">'+res.all[k].nickname+'</div><div class="integral">'+res.all[k].score+'</div></li>';
        // }
        for (k in res.data.integral_list) {
          _list += '<li class="flex-ali" data-num="'+(parseInt(k) + 1)+'"><div class="num flex-cen"></div><div class="avatar"><img src="'+res.data.integral_list[k].head_pic+'" alt="" /></div><div class="nickName">'+res.data.integral_list[k].nickname+'</div><div class="integral">'+res.data.integral_list[k].num_integral+'</div></li>';
        }
        $(".rankings_box ul.top").html(_list);
        if (res.data.integral_user_sort.rank == 1) {
          _class = 'one no';
        } else if (res.data.integral_user_sort.rank == 2) {
          _class = 'two no';
        } else if (res.data.integral_user_sort.rank == 3) {
          _class = 'three no';
        }
        $(".rankings_box ul.bottom").html('<li class="flex-ali '+_class+'" data-num="'+res.data.integral_user_sort.rank+'"><div class="num flex-cen"></div><div class="avatar"><img src="'+res.data.integral_user_sort.head_pic+'" alt="" /></div><div class="nickName">'+res.data.integral_user_sort.nickname+'</div><div class="integral">'+res.data.integral_user_sort.num_integral+'</div></li>');
        calcNum(".rankings_box ul li", "num", ".num", "./images/texture2/num_");
      }
    });
  });
  $(".rankings .btn .btn1").on("click", function(){
    $(".page_home .homeBox").fadeIn(200);
    $(".rankings").removeClass("on").fadeOut(200);
  }); 
  /*$(".rankings .btn .btn2").on("click", function(){
    $(".prize").fadeIn(0, function(){$(this).addClass("on")});
    $(".rankings").removeClass("on").fadeOut(200);
  }); */
  //开始游戏--选择关卡
  $(".page_home .controls .btn3").on("click", function(){
    $(".page_home .homeBox").fadeOut(100);
    $(".checkpoint").fadeIn(0,function(){$(".checkpoint").addClass("on");swiperInit();});
    checkpointBig();
  });
  //首页进入抽奖页面
  $(".page_home .controls .btn4, .tips-clearance .btn4").on("click", function(){
    if ($(this).hasClass("btn4")) {
      $(".tips, .tips-item").hide();
      idiomLoong.exitGame();
    }
    $(".page_home .homeBox,.pages .game").fadeOut(100);
    //$(".prize").fadeIn(0, function(){$(this).addClass("on")});
    luckDrawInit();
  });
  //大、小关卡
  function checkpointBig(isUpdate){
    myRequest.passDetail({uid: USERINFO.info.uid}, function(res){
      if (parseInt(res.code) === 200) {
        CHECKPOINT = res.data;
        var _large = res.large;
        var _swiperIndex = 0;
        if (res.small == Checkpoint_Small) {
           _swiperIndex = parseInt(res.large / Checkpoint_page_num);
           _large++;
        } else {
          _swiperIndex = Math.floor(res.large / Checkpoint_page_num);
        }
        swiperCheckpoint.slideTo(_swiperIndex, 0, false);
        for (var i = 0; i < _large; i++) {
          $(".checkpoint-one ul li:eq("+i+")").addClass("ok");
        }
        if (isUpdate) {checkpointSmall(curCheckpoint.cid);}
      } else {
        $(".checkpoint-one dd:first-child ul li:eq(0)").addClass("ok");
      }
    });
  }
  //小关卡
  function checkpointSmall(cid){
    var _cursid = cursid(CHECKPOINT, cid);
    $(".checkpoint-two ul li").data("cid", cid).removeClass("ok");
    for (var i = 0; i <= _cursid.length; i++) {
      $(".checkpoint-two ul li:eq("+i+")").addClass("ok");
    }
  }
  function calcMaxCid(shutList) {
    var _maxCid = 1;
    for (k in shutList) {
      if (shutList[k].cid > _maxCid) {
        _maxCid = shutList[k].cid;
      }
    }
    return _maxCid;
  }
  function cursid(shutList, cid) {
    var _cursid= [];
    for (k in shutList) {
      if (shutList[k].cid == cid) {
        _cursid.push(shutList[k]);
      }
    }
    return _cursid;
  }
  $(".backHome img").on("click", function(){
    $(".page_home .homeBox").fadeIn(200);
    $(".checkpoint").removeClass("on").fadeOut(200);
  });
  //点击大关卡到小关卡
  $("body").delegate(".checkpoint-one ul li", "click", function(){
    if ($(this).hasClass("ok")) {
      showBigGuan($(this).data("shut"));
      $(".checkpoint-one").fadeOut(200);
      $(".checkpoint-two").fadeIn(200);
      checkpointSmall($(this).data("shut"));
    } else {
      if ($(this).hasClass("activation")) {
        sMethods.showToast("请先解锁前面的大关卡");
      } else {
        sMethods.showToast("更多关卡，敬请期待~");
      }
    }
  });
  function showBigGuan(curCid){
    $(".guan_title .guan_num").data("num", curCid);
    if (curCid > 10) {
      $(".guan_title").addClass("big");
    }
    var _all = $(".guan_title .guan_num");
    _all.each(function(){
      if ($(this).data("num")>=0) {
        var _curNum = $(this).data("num");
        var _img = '<img src="./images/texture3/num_'+_curNum+'.png" alt="" />';
        $(this).html(_img);
      }
    });
  }
  $(".backPrev img").on("click", function(){
    $(".checkpoint-one").fadeIn(200);
    $(".checkpoint-two").fadeOut(200,function(){$(".guan_title").attr("class", "guan_title");});
  });
  //从小关卡进行到游戏界面--【正式开始游戏】
  $("body").delegate(".checkpoint-two ul li", "click", function(){
    if ($(this).hasClass("ok")) {
      $(".checkpoint").fadeOut(200);
      $(".game").fadeIn(200).addClass("on");
      curCheckpoint = {
        uid: USERINFO.info.uid,
        cid: parseInt($(this).data('cid')),
        sid: parseInt($(this).index() + 1)
      };
      $("#curSco").html(curCheckpoint.cid + "-" + curCheckpoint.sid);
      getScore();
      sMethods.showToast("游戏初始化中...", 1000, '',function(){
        idiomLoong.combination();//调取启动游戏方法
      });
    } else {
      sMethods.showToast("请先解锁前面的小关卡");
    }
  });
  //我的道具
  function myPrize(){
    myRequest.userPrize({uid: USERINFO.info.uid}, function(res){
      var _lis = '';
      $(".gameBox .prop-box .prop-num").data("num", 0);
      for (k in res.data) {
        if (res.data[k].istype != 1 ) {continue;}
        if (res.data[k].prize_id == 2) {//提示道具
          $("#props-time .prop-num").data({"num": res.data[k].nums, "prize_id": res.data[k].prize_id});
        } else if (res.data[k].prize_id == 4) {//通关
          $("#props-clearance .prop-num").data({"num": res.data[k].nums, "prize_id": res.data[k].prize_id});
        }
      }
      $(".gameBox .prop-box ul li").fadeIn(200);
      calcNum(".gameBox .prop-box .prop-num", "num", "cur", "./images/texture6/nums_", true);//道具数量
    });
  }
  //抽奖页面返回到首页
  $(".prize-btn .btn1").on("click", function(){
    if (isDraw) {sMethods.showToast("正在抽奖中...");return;}
    $(".prize").removeClass("on").fadeOut(200);
    $(".page_home .homeBox").fadeIn(200);
    clearInterval(horseRaceLamp);
  });
  //我的奖品
  $(".prize-btn .btn2").on("click", function(){
    if (isDraw) {sMethods.showToast("正在抽奖中...");return;}
    $(".prizetBox").fadeOut(200);
    $(".my-prize").fadeIn(0, function(){$(this).addClass("on")});
    myRequest.userPrize({uid: USERINFO.info.uid}, function(res){
      var _lis = '';
      if (res.data.length == 0) {
        _lis += '<li>'+
                  '<div class="not">你暂未获得任何奖品</div>'+
                '</li>';
      } else {
        for (k in res.data) {
         _lis += '<li>'+
                    '<div class="left">'+
                      '<div class="img" style="background:url('+res.data[k].img+') no-repeat center"></div>'+
                      '<div class="text"><h4>'+res.data[k].title+'</h4><p>'+res.data[k].text+'</p></div>'+
                    '</div>'+
                    '<div class="nums">X'+res.data[k].nums+'个</div>'+
                 '</li>';
        }
      }
      $(".myPrizeBox ul").html(_lis);
    });
  });
  $(".myPrizeBox .btn img").on("click", function(){
    $(".prizetBox").fadeIn(200);
    $(".my-prize").removeClass("on").fadeOut(200);
  });
  //计算小关卡数字
  function calcOrder(ele, imgSrcName){
    var _all = $(ele);
    _all.each(function(index){
      var _curNum = String(index + 1);
      var _img = '';
      for (var i = 0; i < _curNum.length; i++) {
        _img += '<img src="'+imgSrcName+_curNum[i]+'.png" alt="" />';
      }
      $(this).append(_img);
    });
  }
  calcOrder(".checkpoint-two ul li", "./images/texture3/order_");
  //计算排名数字
  function calcNum (parentEle, data, view, imgSrcName, isEmpty) {
    var _all = $(parentEle);
    if (isEmpty) {_all.html("");}
    _all.each(function(){
      if ($(this).data(data)>=0) {
        var _curNum = String($(this).data(data));
        var _img = '';
        for (var i = 0; i < _curNum.length; i++) {
          _img += '<img src="'+imgSrcName+_curNum[i]+'.png" alt="" />';
        }
        if (view == "cur") {
          $(this).append(_img);
        } else {
          $(this).find(view).append(_img);
        }
      }
    });
  }
  //退出游戏
  $(".gameBox .back-btn").on("click", function(){
    // if (isProp) {
    //   sMethods.showToast("您正在游戏中，请稍后再试");
    //   return;
    // }
    idiomLoong.exitGame(true);
  });
  //选择待选区
  $("body").delegate('#game-lattice ul.bottom li:first-child~li', 'click', function(){
    audioPlay("my-audio-select");
    $("#game-lattice ul.bottom .cur").removeClass('cur');
    $(this).addClass('cur');
  });
  //选字填字
  $("body").delegate('#game-controls ul li div:not(.on)', 'click', function(){
    audioPlay("my-audio-fill");    
    $(this).addClass("on");
    idiomLoong.undoFont();    
    $("#game-lattice ul.bottom li").removeClass("new");
    $("#game-lattice ul.bottom li.cur").html($(this).html()).addClass("new").addClass("isFill");
    /*if ($("#game-lattice ul.bottom li:first-child").data("idiom")[$("#game-lattice ul.bottom li.cur").index()] != $(this).html()) {
      $(".effect,.effect .effect_02").show();
      sMethods.sequence_play(".effect_02 img", 80, function(){$(".effect,.effect .effect_02").hide();}, true);
    }*/
    idiomLoong.passthrough();//判断是否填写完当前成语
    idiomLoong.autoSelect();//自动定位下一空格
  });
  //将已填字反选
  $("body").delegate("#game-lattice ul.bottom li.cur", "click", function(){
    if ($(this).html()) {
      idiomLoong.undoFont(true);
    }
  });
  //主游戏逻辑
  var idiomLoong = {
    //游戏启动
    combination: function () {
      var _self = this;
      myPrize();//显示我的道具
      $("#curSco").html(curCheckpoint.cid + "-" + curCheckpoint.sid);//显示当前关卡
      myRequest.startgame(curCheckpoint, function(res){//请求成语题目数据
        _self.timingInit(res);
      });
    },
    //初始化
    timingInit: function(subject) {
      var _self = this;
      $("#game-lattice ul.top li").each(function(index){
        $(this).html(subject.idiom[0][index]);
      });
      isProp = false;
      $("#game-lattice ul.bottom li").html('');
      $("#game-lattice ul.bottom li:first-child~li").removeClass("isFill");
      $("#game-lattice ul.bottom").removeClass("yes no");
      $("#game-lattice ul.bottom li:first-child").html(subject.idiom[1][0]).data("idiom", subject.idiom[1]);
      $("#game-lattice ul.bottom li:nth-child(2)").addClass("cur").siblings().removeClass("cur");
      var _str = '';
      for (var k in subject.selectFont) {
        if (k % 7 == 0) {_str += '<li class="flex-bet">';}
        _str += '<div class="flex-cen">'+subject.selectFont[k]+'</div>';
        if (((parseInt(k) + 1) % 7 == 0) || (k == (subject.selectFont.length - 1))) {
          _str += '</li>';
        }
      }
      $("#game-controls").html('<ul class="flex-cen">' + _str + '</ul>');
      autoTime(".game-box .time", 30, 0, function(){
        clearance(3);
        //sMethods.showToast("很遗憾，挑战失败");
        //$(".tips, .tips-fail").show().siblings().hide();
      });
    },
    //退出游戏
    exitGame: function(isBack) {
      // $(".gameBox .back-btn").on("click", function(){
        if (isBack) {$(".checkpoint").fadeIn(200);}
        $("#showModal").fadeOut(200);
        $(".game").fadeOut(100).removeClass("on");
        if (autoT) {clearInterval(autoT);}
        $(".game-box .time").html('<img src="./images/texture6/num_0.png" alt="">');
        $(".game-box ul li, #curSco, #curGk").html('');
        $("#game-lattice ul.bottom li").removeClass("cur");
      // });
    },
    //自动选定当前所填位置
    autoSelect: function() {
      for (var i = 0; i < $("#game-lattice ul.bottom li").length; i++) {
        if (!$($("#game-lattice ul.bottom li")[i]).html()) {
          $("#game-lattice ul.bottom li").removeClass("cur");
          $($("#game-lattice ul.bottom li")[i]).addClass("cur").siblings();
          break;
        }
      }
    },
    //更换字
    undoFont: function(isReverse, curFont) {
      $("#game-lattice ul.bottom").removeClass("yes no");
      var _curFont = curFont || $("#game-lattice ul.bottom li.cur").html();
      if (_curFont) {
        if (isReverse) {$("#game-lattice ul.bottom li.cur").html('').removeClass("isFill");}
        for (var i = 0; i < $("#game-controls ul li .on").length; i++) {
          if ($($("#game-controls ul li .on")[i]).html() == _curFont) {
            $($("#game-controls ul li .on")[i]).removeClass("on");
            break;
          }
        }
      }
    },
    //完成所有填写
    passthrough: function() {
      var _fill = '';
      var _answer = $("#game-lattice ul.bottom li:first-child").data("idiom");
      for (var i = 0; i < $("#game-lattice ul.bottom li").length; i++) {
        _fill += $($("#game-lattice ul.bottom li")[i]).html();
        if (!$($("#game-lattice ul.bottom li")[i]).html()) {
          return;
        }
      }
      if (_fill == _answer) {
        $("#game-lattice ul.bottom").addClass("yes");
        clearInterval(autoT);
        clearance(2);
      } else {
        var _data = {
          u_code: USERINFO.info.uid,
          name: _answer,
          large: curCheckpoint.cid,
          small: curCheckpoint.sid
        }
        myRequest.error_log(_data);
        $("#game-lattice ul.bottom").addClass("no");
        $(".effect,.effect .effect_02").show();
        sMethods.sequence_play(".effect_02 img", 80, function(){$(".effect,.effect .effect_02").hide();}, true);
        console.log('%c正确答案---->>【' + _answer + '】','color: green;');
      }
    }
  }
  //游戏中使用2种道具
  $(".gameBox .prop-box ul li").on("click", function(){
    if (isProp) {
      sMethods.showToast("提示道具每一小关限使用一次");
      return;
    }
    isProp = true
    var _answer = $("#game-lattice ul.bottom li:first-child").data("idiom"); 
    var _data = {
      u_code: USERINFO.info.uid,
      name: _answer,
      large: curCheckpoint.cid,
      small: curCheckpoint.sid
    }
    myRequest.help_log(_data);
    var _curBtn = $(this).data("curBtnIndex");
    //clearInterval(autoT);
    //$("#game-lattice ul.bottom").addClass("no");
    var k = 1;
    //$("#game-lattice ul.bottom li:first-child~li").html("");
    for (var p = 1; p < _answer.length; p ++) {
      for (var q = 0; q < $("#game-controls ul li div").length; q++) {
        if (_answer[p] == $($("#game-controls ul li div.on")[q]).html() && !$($("#game-controls ul li div")[q]).hasClass("cur")) {
          $($("#game-controls ul li div.on")[q]).addClass("cur");
          break;   
        } else if (_answer[p] == $($("#game-controls ul li div")[q]).html() && !$($("#game-controls ul li div")[q]).hasClass("cur")) {
          $($("#game-controls ul li div")[q]).addClass("cur");
          break;
        }
      }
    }
    /*setTimeout(function(){
      clearance(1);
    }, 5000);*/
    //var _idiom = $("#game-lattice ul.bottom li:first-child").data("idiom");
    // var autoFill = setInterval(function(){
    //   $("#game-lattice ul.bottom li:eq("+k+")").html($("#game-lattice ul.bottom li:first-child").data("idiom")[k]).addClass("cur").siblings().removeClass("cur");
    //   k++;
    //   if (k == _idiom.length) {
    //     clearInterval(autoFill);
    //     setTimeout(function(){
    //       clearance(1);
    //     }, 5000);
    //   }
    // }, 400);
    $(".tips .tips-item").hide();
    $(".tips, .tips-use").fadeOut(100);
  });
  //取消当前弹窗
  $(".tips-use .btn .btn2, .tips-prop .btn img,.tips-input .btn1,.tips-exchange .btn1,.tips-reward .btn1").on("click", function(){
    $(".tips, .tips-item").fadeOut(100);
  });
  $(".tips-goods .btn .btn2").on("click", function(){
    $(".tips, .tips-item").fadeOut(100);
    if (isPrizeScore) {setTimeout(function(){getScore();}, 200);isPrizeScore = false;}
  });
  //过关提交大关卡数、小关卡数、过关时间、过关分数成绩
  function clearance(istype, callback){
    //参数istype：1为使用道具通关、2为正常通关、3为闯关失败
    var _data = {
      uid: USERINFO.info.uid,
      cid: curCheckpoint.cid,
      sid: curCheckpoint.sid,
      record: $(".game-box .time").data("num"),
      score: istype == 3 ? - 1 : BonusPoints,
      istype: istype
    }
    myRequest.gameOver(_data, function(res){
      //201未通关的通关、202已经通过的关又通关、203未通关的未通关、204已通关的再次未通关
      isProp = false;
      if (istype == 3) {
         if (res.code == 204) {
           $(".tips-item.tips-fail .text").hide();
         } else {
          $(".tips-item.tips-fail .text").show();
          $(".tips-item.tips-fail .text span").html("积分-1");
         }
         $(".effect>div").hide();
         $(".effect,.effect .effect_03").show();
         sMethods.sequence_play(".effect_03 img", 80, function(){
           $(".effect,.effect .effect_03").hide();
           $(".effect,.effect>div, .tips .tips-item").hide();
           $(".tips, .tips-fail").show();
         }, false);
      }
      if (res.code == 201 || res.code == 202) {
        if (res.code == 201) {
          var _datas = {
            u_code: USERINFO.info.uid,
            consume_time: $(".game-box .time").data("num"),
            types: 3,
            fraction: BonusPoints,
            large: curCheckpoint.sid,
            small: curCheckpoint.cid,
            is_small: 1
          }
          myRequest.integral_report(_datas)
        }
        if (autoT) {clearInterval(autoT);}
        if (res.code == 202) {
          $(".tips, .tips-next-pass").addClass("clearance");
        } else {
          $(".tips, .tips-next-pass").removeClass("clearance");
        }
        console.log(curCheckpoint.sid, Checkpoint_Small)
        console.log(11111)
        if (curCheckpoint.sid == Checkpoint_Small) {//通过每一大关的最后一小关
          console.log(22222)
          //$(".tips-clearance .btn-img, .tips-clearance .btn-a").hide();
          $(".tips-clearance .btn-a2, .tips-clearance .btn4, .tips-clearance .btn5").show();
        } else {
          console.log(33333)
          $(".tips-clearance .btn-img, .tips-clearance .btn-a").show();
          $(".tips-clearance .btn-a2,.tips-clearance .btn4, .tips-clearance .btn5").hide();
        }
        console.log(44444)
        audioPlay("my-audio-ok");
        $(".tips .tips-item").hide();
        $(".tips-clearance.tips-item .text .num").html(curCheckpoint.sid);
        $(".tips-clearance.tips-item .consume-integral").html(res.score);
        $(".tips-clearance.tips-item .total-integral").html("0");
        $(".tips-clearance.tips-item .reward-integral").html((res.code == 201 && istype != 1) ? BonusPoints : 0);
        $(".effect>div").hide();
        $(".effect, .effect_01").show();
        if (istype == 1) {
          $(".effect,.effect>div, .tips .tips-item").hide();
          $(".tips, .tips-clearance").show();
        } else {
          sMethods.sequence_play(".effect_01 img", 80, function(){
            $(".effect,.effect>div, .tips, .tips-item").hide();
            $(".tips, .tips-clearance").show();
            // if (res.score >= 100 && !isTips) {
            //   isTips = true;
            //   $(".tips, .tips-goMall").show();
            //   $(".tips-goMall .btn").on("click", function(){
            //     $(".tips, .tips-item").hide();
            //     $(".gameBox .back-btn").trigger("click");
            //   });
            // } else {
            //   $(".tips, .tips-clearance").show();
            // }
          });
        }
        // }
        checkpointBig(true);
      }
      getScore();
    }); 
  }
  //支付弹框点击
  $(".tips-payment .btn img").on("click", function(){
    next_topic();
    // if (curCheckpoint.sid == 20) {
    //   $(".tips .tips-item").hide();
    //   $(".tips, .tips-next-pass").addClass("big");
    //   $(".tips, .tips-next-pass").show();
    // } else {
      //$(".tips .tips-item").hide();
      //$(".tips-next-pass .btn img").trigger("click");
    // }
  });
  //实时获取用户最新积分
  function getScore(callback){
    myRequest.getScore({uid: USERINFO.info.uid}, function(res){
      if (callback) {callback(res);}
      $('#fraction, .page_home .homeBox .homeScore').data("fraction", res.score);
      $(".tips-exchange .integral-box .integral-total").html(res.score);
      $("#curGk").html(res.score);
      calcNum("#fraction", "fraction", "cur", "./images/texture4/fraction_", true);
      calcNum(".page_home .homeBox .homeScore", "fraction", "cur", "./images/texture1/num_", true);
    });
  }
  //计算分数成绩
  function calcScore(){
    var _score = 5;
    var _times = $(".game-box .time").data("num");
    _score += parseInt((120 - _times > 10 ? 120 - _times : 0)/10);
    return _score;
  }
  //很遗憾挑战失败--重新挑战
  $(".tips .tips-fail .btn1").on("click", function(){
    $(".game-box .time").html('<img src="./images/texture6/num_3.png" alt=""><img src="./images/texture6/num_0.png" alt="">');
    $(".tips, .tips-item").hide();
    idiomLoong.combination();
  });
  //很遗憾挑战失败--选择关卡
  $(".tips .tips-fail .btn2, .tips-clearance .btn1").on("click", function(){
    $(".tips, .tips-item").hide();
    $(".gameBox .back-btn").trigger("click");
    $(".game-box .time").html('<img src="./images/texture6/num_3.png" alt=""><img src="./images/texture6/num_0.png" alt="">');
  });
  //下一关换题
  $(".tips-clearance .btn2,.tips-clearance .btn5").on("click", function(){
    if (curCheckpoint.sid == Checkpoint_Small) {
      $(".tips .tips-item").hide();
      //$(".tips, .tips-next-pass").addClass("big");
      $(".tips, .tips-next-pass").show();
      return;
    }
    next_topic();  
  });
  $(".tips-next-pass .btn img").on("click", function(){
    if (curCheckpoint.sid == Checkpoint_Small) {
      next_topic();
      //$(".tips .tips-item").hide();
      //$(".tips, .tips-payment").fadeIn(200);
      return;
    }
    next_topic();
  });
  function next_topic(){
    $(".tips, .tips-item").hide(); 
    sMethods.showToast("换题中...", 500, '', function(){
      $(".game-box .time").html('<img src="./images/texture6/num_3.png" alt=""><img src="./images/texture6/num_0.png" alt="">');
      if (curCheckpoint.sid < Checkpoint_Small) {
        curCheckpoint.sid++;
      } else {
        if (curCheckpoint.cid < Checkpoint_big) {
          curCheckpoint.cid++;
          showBigGuan(curCheckpoint.cid);
          curCheckpoint.sid = 1;
        } else {
          sMethods.showToast("恭喜您，您已完成当前所有通关！", 20000); 
          setTimeout(function(){$(".gameBox .back-btn").trigger("click");}, 3000);
          return;       
        }
      }
      checkpointBig(true);
      idiomLoong.combination();
    }); 
  }
  //计时
  function autoTime(ele, time, type, callback){
    if (autoT) {clearInterval(autoT);}
    if (type) {
      var _time = 0;
      $(ele).data("num", _time);
      autoT = setInterval(function(){
        _time = parseInt($(ele).data("num"));
        if (_time >= time) {
          clearInterval(autoT);
          callback();
          return;
        } else {
          _time++;
          $(ele).data("num", _time).html('');
          calcNum(".game-box .time", "num", "cur", "./images/texture6/num_");//当前游戏分
        }
      }, 1000);
    } else {
      var _time = time;
      $(ele).data("num", _time);
      autoT = setInterval(function(){
        _time = parseInt($(ele).data("num"));
        if (_time <= 0) {
          clearInterval(autoT);
          callback();
          return;
        } else {
          _time--;
          $(ele).data("num", _time).html('');
          calcNum(".game-box .time", "num", "cur", "./images/texture6/num_");//当前游戏分
        }
      }, 1000);
    }
  }
  //加载进度条
  function loading(ele, ele2, speed, callback){
    $(ele2).animate({ 'height': '0%' }, 0).animate({ 'height': '33%' }, speed * 2).animate({ 'height': '66%' }, speed * 2).animate({ 'height': '100%' }, speed * 3);
    setTimeout(function () {
        var timer = setInterval(function () {
          var wtg2 = $(ele2).attr("style").split(".")[0];
          var wtg = parseInt(wtg2.replace(/[^0-9]/ig, "")) + 1;
          if ( wtg <= 100) { $(ele).text(wtg + "%");}
          if (wtg == 101) {
            clearInterval(timer);
            callback();
          }
        }, 50);
    }, 1);
  }
  /*function loading(ele, ele2, speed, callback){
    //第一个进度节点 
    $(ele2).animate({ 'height': '0%' }, 0).animate({ 'height': '33%' }, speed * 2).animate({ 'height': '66%' }, speed * 2).animate({ 'height': '90%' }, speed * 3);
    setTimeout(function () {
        var timer = setInterval(function () {
            var wtg2 = $(ele2).attr("style").split(".")[0];
            var wtg = parseInt(wtg2.replace(/[^0-9]/ig, "")) + 1;
            if ( wtg <= 100) { $(ele).text(wtg + "%");}
            if (wtg == 101) {
              clearInterval(timer);
              callback();
            }
        }, 50);
    }, 10);
    //第二个进度节点 
    document.onreadystatechange = loadingChange; //当页面加载状态改变的时候执行这个方法.  
    function loadingChange() {
        if (document.readyState == "complete") { //当页面加载状态为完全结束时进入
            $(ele2).animate({ 'height': '100%' }, 1000);
        }
    }
  }*/
  function luckDraw(eleId, eleClass, win, isStar, prizeAll, callback){
    $.luckGame({
      eleId: eleId,//三个盒子
      eleClass: eleClass,//三个ul
      isStar: isStar,//初始化/抽奖
      gameLen: prizeAll,//所以待抽奖品
      callback: callback,
      zj_arr: {
        is_win:1,//是否中奖：0为不中奖，1为中奖
        number: win//中奖号码：从0算起，就是10了
      },
      //gameLen: 9,//总产品抽奖数量，
      game_pagesize:10//奖品循环次数
    });
  }
  $(".rankings .btn .btn2").on("click", function(){
    $(".rankings").removeClass("on").fadeOut(200);
    luckDrawInit();
  }); 
  function luckDrawInit(){
    horseRaceLamp = setInterval(function(){
      $(".prize-top .lamp").toggleClass("on");
    }, 400);
    sMethods.showToast("初始化中...", "none");
    drawNum = 0;
    isContinuity = true;
    $(".prize").fadeIn(0, function(){$(this).addClass("on")});
    myRequest.getPrize(function(res){
      get_luck_num(function(){
        PARIZELIST = res.data;
        luckDrawStar(PARIZELIST, false);//初始化抽奖
      });
    });
  }
  /*获得抽奖次数*/
  function get_luck_num(callback){
    var _data = {uid: USERINFO.info.uid};
    myRequest.count_nums(_data, function(res){
      if (res.code == 100) {
        $("#frequency .num").html(res.play_nums);
        if (callback) {callback(res.play_nums);}
      }
    });
  }
  //兑换抽奖次数
  $(".order-btn .btn1").on("click", function(){
    if (isDraw) {sMethods.showToast("正在抽奖中...");return;}
    $(".tips, .tips-exchange").show();
    $(".tips-exchange .con dd:first-child").trigger("click");
  });
  $(".tips-exchange .con dd").on("click", function(){
    $(this).addClass("cur").siblings().removeClass("cur");
    $(".tips-exchange .integral-box .integral-consume").html($(this).data("num"));
  });
  $(".tips-exchange .btn2").on("click", function(){
    var _data = {
      uid: USERINFO.info.uid,
      istype: $(".tips-exchange .con dd.cur").index() + 1
    }  
      myRequest.get_nums(_data, function(res){
      if (res.code == 100) {
        $("#frequency .num").html(res.play_nums);
        $(".tips, .tips-item").fadeOut(100);
        getScore();
        sMethods.showToast("兑换成功");  
      } else if (res.code == 101) {
        sMethods.showToast("您的积分不足");
      }
    });
  });
  //抽奖
  $(".start-btn img").click(function(){
    /*get_luck_num(function(res){
      if (res <= 0) {
        sMethods.showToast("您的可抽奖次数不足，请先去兑换");
      } else {
        if (isDraw) {sMethods.showToast("正在抽奖中...");return;}
        $(".start-btn").addClass("on");
        isDraw = true;
        luckDrawStar(PARIZELIST, true);
      }
    });*/
    if (isDraw) {sMethods.showToast("正在抽奖中...");return;}
    getScore(function(res){
      /*if (drawNum % 5 == 0 && res < 110) {
        sMethods.showToast("连续第5次抽奖需要您的积分在110分以上");return;
      } else {*/
        $(".start-btn").addClass("on");
        isDraw = true;
        luckDrawStar(PARIZELIST, true);
      /*}*/
    });
  });
  function luckDrawStar(parizeList, isStar) {
    if (isStar) {
      var _data = {uid: USERINFO.info.uid};
      var parizeType, parizeName, parizeId;
      myRequest.getLuck(_data, function(res){
        var _datas = {
          u_code: USERINFO.info.uid,
          integral: LD_CONSUME,
          types: 3,
          integral_describe: '成语接龙-抽奖消耗',
          integral_identifier: Date.now()
        }
        myRequest.integral_consumption(_datas);
        var _newScore = res.score;
        if (res.code == 202) {//中奖
          win = parseInt(calcCurIndex(PARIZELIST, res.prize_info));
          parizeType = res.prize_info.istype;
          parizeName = res.prize_info.title;
          parizeId = res.prize_info.id;
          var _data2 = {
            id: USERINFO.info.uid,
            prize_shop: res.prize_info.title,
            add_points: 0,
            integral: LD_CONSUME
          }
          if (parizeType == 2) _data2.add_points = res.prize_info.records
          myRequest.luck_draw(_data2);
        } else if (res.code == 100){
          win = -1;
        } else if (res.code == -100) {//积分不够
          sMethods.showToast("您的积分不足");
          $(".start-btn").removeClass("on");
          isDraw = false;
          return;
        }
        //console.log(win);
        if (parizeType != 2) {
          getScore();
        } else {
          $('#fraction').data("fraction", $('#fraction').data("fraction") - LD_CONSUME);
          calcNum("#fraction", "fraction", "cur", "./images/texture4/fraction_", true);            
        }
        // $('#fraction').data("fraction", $('#fraction').data("fraction") - LD_CONSUME);
        // calcNum("#fraction", "fraction", "cur", "./images/texture4/fraction_", true); 
        //get_luck_num();
        luckDraw("#game", ".game-goods-ul", win, isStar, parizeList, function(res){
          $(".start-btn").removeClass("on");
          isDraw = false;
          drawNum++;
          setTimeout(function(){
            if (win == -1) {
              if (drawNum % 5 == 0 && isContinuity) {
                $(".tips, .tips-reward").show();
                isContinuity = true;
              } else {
                sMethods.showToast("很遗憾,您未中奖");
              }
              return;
            }
            isContinuity = false;
            if (parizeType == 1) {//判断是否为道具类奖品
              $(".tips .tips-item,.tips-prop .textImg img").hide();
              $(".tips, .tips-prop").fadeIn(200);
              $(".tips-prop .textImg img:eq("+(parizeId - 2)+")").show();
            } else {
              $(".tips-goods .text").html(parizeName);
              if (parizeType == 3) {//判断是否是实物类奖品、是否已留过资
                myRequest.isUpinfo({uid: USERINFO.info.uid}, function(res){
                  if (res.code == 400) {
                    $(".tips .tips-item,.tips-goods .btn .btn2").hide();
                    $(".tips-goods .btn .btn1").show();
                    $(".tips, .tips-goods").fadeIn(200);
                  } else {
                    $(".tips .tips-item, .tips-goods .btn .btn1").hide();
                    $(".tips-goods .btn .btn2").show();
                    $(".tips, .tips-goods").fadeIn(200);
                  }
                });
              } else if (parizeType == 2) {//为积分
                // if (_newScore >= 100 && !isTips) {
                //   isTips = true;
                //   $(".tips, .tips-goMall").show();
                //   $(".tips-goMall .btn").on("click", function(){
                //     $(".tips, .tips-item").hide();
                //     getScore();
                //   });
                // } else {
                  isPrizeScore = true;
                  $(".tips .tips-item").hide();
                  $(".tips-goods .btn .btn1").hide();
                  $(".tips, .tips-goods, .tips-goods .btn .btn2").fadeIn(200);
                  //getScore();
                //}
              }
            }
            //sMethods.showToast("恭喜中奖，奖品：" + parizeName, 3000);
          }, 300);
        });
      });
    } else {
      luckDraw("#game", ".game-goods-ul", -1, isStar, parizeList, function(res){
        if (res.status == 202) {
          setTimeout(function(){sMethods.hideToast();}, 600);
        }
      });
    }
    function calcCurIndex(list, item){
      for (k in list) {
        if (list[k].title == item.title) {
          return k;
        }
      }
    }
  }
  $(".tips-goods .btn .btn1").on("click", function(){
    $(".tips .tips-item").hide();
    $(".tips, .tips-input").show();
    $("#input-name input").focus();
  });
  //留资
  $("#inputBtn").on("click", function(){
    var _name = $("#input-name input").val();
    var _phone = $("#input-phone input").val();
    var _address = $("#input-address input").val();
    if (!_name) {
      sMethods.showToast("姓名不能为空");
      return;
    }
    if (!_phone) {
      sMethods.showToast("手机号不能为空");
      return;
    }
    if (!REG_PHONE.test(_phone)) {
      sMethods.showToast("请输入正确的手机号");
      return;
    }
    if (!_address) {
      sMethods.showToast("地址不能为空");
      return;
    }
    var _data = {
      uid: USERINFO.info.uid,
      username: _name,
      phone: _phone,
      address: _address 
    };
    myRequest.upinfo(_data, function(res){
      console.log(res);
      if (res.code == 200) {
        $(".tips, .tips-input").hide();
        sMethods.showToast("恭喜您，提交成功", 2000);
      }
    });
  });
  /*背景音乐*/
  // $("#BGM").on("click", function(){
  //   audioMusic("my-audio-bg");
  // });
  //audio播放音乐
  function audioMusic(audio, musiceSrcList, callback) {
    var audio = document.getElementById(audio);
    var _curIndex = 0;
    var isCallback = true;
    if(!audio.paused) return;
    audio.setAttribute("src", URL_development + musiceSrcList[_curIndex].url);
    audio.play(); 
    audio.addEventListener("timeupdate",function(){
      var timeDisplay;
      timeDisplay = Math.floor(audio.currentTime);
      if (timeDisplay == 1 && isCallback) {
        if (callback) callback();
        isCallback = false;   
      }
    });  
    audio.onended = function() {
      _curIndex < musiceSrcList.length - 1 ? _curIndex++ : _curIndex = 0;
      audio.setAttribute("src", URL_development + musiceSrcList[_curIndex].url);
      audio.currentTime = 0;
      audio.play();
    }
  }
  function audioPlay(eleId){
    var _audio = document.getElementById(eleId);
    _audio.currentTime = 0;
    _audio.play();
  }
})
})