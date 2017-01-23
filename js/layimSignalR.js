var chat;
layui.use(['layim', 'element','jquery'], function (layim) {
	var $ = layui.jquery //重点处
    $.connection.hub.url = "http://service.25xm.com/signalr";
    chat = $.connection.chatHub;


    ///连接到Sr服务器
    (function poll() {
        if (layim.cache().mine && layim.cache().mine.id) { 
            //连接到Sr服务器
            $.connection.hub.start().done(function () {
                layer.msg("连接成功!", { icon: 6 });
                chat.server.login(layim.cache().mine);
            }).fail(function () {
                layer.msg("连接失败!", { icon: 5 });
            });
            return;
        }
        setTimeout(poll, 100);
    })();


    //基础配置
    layim.config({
        //初始化接口
        init: {
            url: '/layim/getFriendList'
          , data: {}
        }
        //获取群员接口（返回的数据格式见下文）
      , members: {
          url: '/layim/getMembers' //接口地址（返回的数据格式见下文）
        , type: 'get' //默认get，一般可不填
        , data: {} //额外参数
      }
        //上传图片接口（返回的数据格式见下文）
      , uploadImage: {
          url: '/layim/uploadImage' //接口地址
        , type: 'post' //默认post
      }
        //上传文件接口（返回的数据格式见下文）
      , uploadFile: {
          url: '/layim/uploadFile' //接口地址
        , type: 'post' //默认post
      }
        //扩展工具栏，下文会做进一步介绍（如果无需扩展，剔除该项即可）
      , tool: [{
          alias: 'code' //工具别名
        , title: '代码' //工具名称
        , icon: '&#xe64e;' //工具图标，参考图标文档
      }]
        //消息盒子页面地址，若不开启，剔除该项即可
      , msgbox: '/LayIm/msgbox'
        //发现页面地址，若不开启，剔除该项即可
      , find: '/LayIm/find'
        //聊天记录页面地址，若不开启，剔除该项即可
      , chatLog: '/layim/chatLog'
      , title: "LayIm3.0演示"
        //是否开启桌面消息提醒，即在浏览器之外的提醒
      , notice: true
        //设定消息提醒的声音文件
        // , voice: false
    });
    //监听在线状态的切换事件
    layim.on('online', function (status) {
        layer.msg(status);
    });

    //监听签名修改
    layim.on('sign', function (value) {
        $.post('/layim/UpdateSign', { sign: value }, function () { }); 
    });
    //监听layim建立就绪
    layim.on('ready', function (res) {
        //layim.msgbox(5); //模拟消息盒子有新消息，实际使用时，一般是动态获得
    });
    //监听自定义工具栏点击，以添加代码为例
    layim.on('tool(code)', function (insert) {
        layer.prompt({
            title: '插入代码'
          , formType: 2
          , shade: 0
        }, function (text, index) {
            layer.close(index);
            insert('[pre class=layui-code]' + text + '[/pre]'); //将内容插入到编辑器
        });
    });
    /******************* 
     * 监听发送消息
     ******************/
    layim.on('sendMessage', function (data) {
        chat.server.sendChatMessage(data);
    });
    /******************* 
     * 监听接收到的消息
     ******************/
    chat.client.onMessage = function (data) {
        layim.getMessage(data);
    }

    layim.on('chatChange', function (obj) {
        layim.setChatStatus('<span style="color:#FF5722;">在sss线</span>'); //模拟标注好友在线状态
    });

    /******************* 
     * 监听通知消息
     ******************/
    chat.client.onNoticeMessage = function (res) {
        switch (res.type) {
            case "addFriend":
                layim.msgbox(1);
                break;
            case "logOff":
                layim.setFriendStatus(res.data, 'offline'); //置好友头像为灰色
                break;
            case "logIn":
                layim.setFriendStatus(res.data, 'online');//置好友上线
                break;
            case "agreeFriend":
                //将好友追加到主面板
                layim.addList(res.data);
                break;
        }
        layer.open({ offset: 'rb', title: '系统消息', content: res.content, shade:false });
    }

    chat.client.sayHello = function (res) {
        console.log(res);
    }


});