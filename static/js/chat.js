;(function ($) {

    // Set the defaults
    var pluginName = 'EASchat',
        defaults = {
            is_disabled: true,
            url_send_message: "",
            url_get_messages: "",
            draw_id: "",
            msg_type_your_message: "",
            msg_chat: "",
            msg_login_first: "",
            msg_send: ""
        };

    /*********************************
     *     CHAT CLASS DEFINITION
     ********************************/
    var Chat = function (element, options){
        this.init(element, options);
    };

    Chat.prototype = {

        constructor: Chat,

        init: function (element, options){
            var that = this;
            this.$element = $(element)
            this.options = $.extend( {}, defaults, options) ;

            this.$element.removeClass("hidden");

            this.renderChat();

            // Toggle chat when click on it header
            this.$element.find('.panel-heading').click(function (){
                console.log('collapsed '+$(this).parent());
                that.$element.find(".panel-body").toggle(150);
            });


            // Submit message when click on "Send" button
            this.$element.find('#chat-send').click(function () {
                    console.log('send msg');
                    var message = that.get_message_and_clean();
                    that.submit_message(message);
                }
            );

            // Submit message when the "enter" key is pressed
            this.$element.find("#chat-message-box").keyup(function (e) {
               if(e.keyCode == 13) {
                   var message = that.get_message_and_clean();
                   that.submit_message(message);
               }
            });

            // Auto refresh the chat against the server
            (function start_auto_refresh () {
                that.get_messages();
                setTimeout(start_auto_refresh,5000);
             })();

            $( window ).resize(function() {
                that.setup_outer_chat_box();
            });

            $(window).resize();
            this.setup_outer_chat_box();
        },

        setup_outer_chat_box: function(){
            var chat_location = {};
            var $site_frame = $('#site-frame');
            var site_frame_position = $site_frame.offset();
            var width = $site_frame.outerWidth();
            var extra = 10; // 5px border + 5px padding from site-frame
            chat_location.left = site_frame_position.left + width + extra;
            var window_width = $(window).width();
            chat_location.width = window_width - chat_location.left - 20;
            $("#chat-column").css({
                position: "absolute",
                width: chat_location.width + "px",
                top: site_frame_position.top + "px",
                left: (site_frame_position.left + width + extra) + "px"
            });
        },

        // Return the message from the chat input box and clean it
        get_message_and_clean: function (){
            var $message_input = this.$element.find("#chat-message-box");
            var message = $message_input.val();
            $message_input.val("");
            return message;
        },

        // Submit the parameter "message" to the server
        submit_message: function (message) {
            // Check empty string
            if(!message || /^\s*$/.test(message)){
                return;
            }

            $.ajax({
                url : this.options.url_send_message,
                method : "GET",
                data: {
                    draw_id : this.options.draw_id,
                    message : message
                }
            });
        },

        // Get all the messages of a public draw and refresh the chat board
        get_messages: function (){
            var that = this;
            var $chat = this.$element.find("#chat-board");
            $.ajax({
                url : this.options.url_get_messages,
                method : "GET",
                data: { draw_id : this.options.draw_id},
                success : function(data){
                    $chat.html("");
                    var arr = data.messages;
                    for (var i = 0, length = arr.length; i < length; i++) {
                      var element = arr[i];
                      var entry = that.formatChatEntry(element);
                      $chat.append(entry);
                    }
                }
            });

        },

        // Given a chat entry generates and returns the html code necessarry to be rendered
        formatChatEntry: function (chat_entry){
            var user = chat_entry.user;
            var content = chat_entry.content;
            var time = moment(chat_entry.creation_time).fromNow();;
            var html = '<li class="right clearfix"><span class="chat-img pull-left">' +
                '    <img src="http://placehold.it/40/FA6F57/fff&text=' + user.toUpperCase().charAt(0) + '" alt="User Avatar" class="img-circle" />' +
                '</span>' +
                '    <div class="chat-line clearfix">' +
                '        <div class="header">' +
                '            <small class=" text-muted"><i class="fa fa-clock-o"></i> ' + time + '</small>' +
                '            <strong class="pull-right primary-font">' + user + '</strong>' +
                '        </div>' +
                '        <p>' + content + '</p>' +
                '    </div>' +
                '</li>';

            var html2 = '<li class="clearfix">' +
                        '    <p class="chatline-details text-muted small">' + user + '<span class="chatline-datetime"><i class="fa fa-clock-o"></i> ' + time + '</span></p>' +
                        '	<span class="chat-img pull-left">' +
                        '		<img src="http://placehold.it/30/FA6F57/fff&text=' + user.toUpperCase().charAt(0) + '" alt="User Avatar" class="img-circle">' +
                        '	</span>' +
                        '	<div class="chatline-content">' + content +
                        '	</div>' +
                        '</li>';

            return html2    ;
        },

        renderChat: function (){
             var html_input = '<input id="chat-message-box" type="text" class="form-control input-sm" placeholder="'+this.options.msg_type_your_message+'"';
             if (this.options.is_disabled) {
                 html_input += 'disabled="disabled"';
             }
             html_input += '/>';

            var html_button = '<button class="btn btn-success btn-sm" id="chat-send" ';
             if (this.options.is_disabled) {
                 html_button += 'title="' + this.options.msg_login_first + '"';
             }
             html_button += '>'+this.options.msg_send+'</button>';

             var html = '<div class="col-md-12">' +
                        '    <div class="panel panel-success">' +
                        '        <div class="panel-heading">' +
                        '            <span class="fa fa-comment"></span>'+this.options.msg_chat +
                        '        </div>' +
                        '        <div class="panel-body">' +
                        '            <ul id="chat-board">' +
                        '            </ul>' +
                        '        </div>' +
                        '        <div class="panel-footer">' +
                        '            <div class="input-group">' +
                        '                '+ html_input +
                        '                <span class="input-group-btn">' +
                        '                    '+ html_button +
                        '                </span>' +
                        '            </div>' +
                        '        </div>' +
                        '    </div>' +
                        '</div>';
             this.$element.append(html);
        }
    };

    /*********************************
     *     CHAT PLUGIN DEFINITION
     ********************************/
    $.fn.chat = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Chat( this, options ));
            }
        });
    };
})(window.jQuery, window, document );




