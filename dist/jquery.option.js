/**
 * @preserve jquery.select 0.1.1
 * https://github.com/YouHeng1/jquery.select
 *
 * Copyright 2016, Youheng1
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
!function(){
    "use strict"
    function ParseVals(dom, vals){
        var link = {};
        var opsDOM = [];
        var backDrop = false;
        var vals = vals || {};
        var addLink = function(k, prev){
            if(typeof prev == 'undefined'){
                prev = link;
            }
            if($.isEmptyObject(prev)){
                prev[k] = {}
            }else{
                for(var lk in prev){
                    if($.isEmptyObject(prev[lk])){
                        prev[lk][k] = {};
                    }else{
                        addLink(k, prev[lk]);
                    };
                    break;
                }
            }
        }
        var eachVals = function(val, lkey){
            if($.isArray(val)){
                for(var k in val){
                    addLink(lkey || k);
                    return eachVals(val[k], k);
                }
            }else if($.isArray(val.vals)){
                return eachVals(val.vals, 'vals');
            }else {
                addLink(lkey || 0);
                return val;
            }
        }
        this.createDOM = function(lists, val, callback){
            var $ul   = $('<ul class="lists"></ul>');
            var $box  = $('<div class="options-box"><span class="box-point"></span></div>');
            for(var k in lists){
                var li = $('<li class="option"></li>').html(lists[k].name);
                if($.isArray(lists[k].vals)){
                    li.addClass('has-vals');
                }
                li.click(function(val, _this){
                    return function(){
                        var $this = $(this);
                        if($.isArray(val.vals)){
                            var options = val.vals;
                            _this.openOption(options, options[0], callback)
                                .moveCoor($this.offset(),{w:$this.width(), h:$this.height()}, 'right');
                        }else callback(val);
                    }
                }(lists[k], this))
                $ul.append(li);
            }
            $box.append($ul);
            return $box;
        }
        this.getFrist = function () {
            link = {};
            return eachVals(vals);
        }
        this.openOption = function(options, val, callback){
            var dom = this.createDOM(options, val, callback);
            if(dom){
                opsDOM.push(dom);
                dom.appendTo($(document.body));
            }
            if(!backDrop){
                $(document.body).append(backDrop = $('<div class="options-backdrop"></div>'));
                backDrop.click(function(_this){
                    return function(){
                        _this.closeOption();
                    }
                }(this))
            }
            //对弹出层进行定位
            return {moveCoor:function(offset, size, position){
                var top, left, space = 7;
                var dSize = {w:dom.width(), h:dom.height()};
                var positions = ['right','left', 'bottom', 'top'];
                var positon = position || positions[0];
                switch (position){
                    case 'bottom':
                        top  = offset.top - window.scrollY + size.h + space;
                        if(top + dSize.h < window.innerHeight){
                            left = offset.left + size.w / 2 - dSize.w/2 - window.scrollX;
                            if(left + dSize.w > window.innerWidth){
                                var dec = left + dSize.w - window.innerWidth + space;
                                left -= dec;
                                dom.find('.box-point').css('left',dom.width()/2 + dec)
                            }
                            dom.css({
                                left:left,
                                top:top
                            }).addClass('bottom')
                            break;
                        }
                    case 'top':
                        top = offset.top - window.scrollY - dSize.h - space;
                        if(top > 0){
                            left = offset.left + size.w / 2 - dSize.w/2 - window.scrollX;
                            if(left + dSize.w > window.innerWidth){
                                var dec = left + dSize.w - window.innerWidth + space;
                                left -= dec;
                                dom.find('.box-point').css('left',dom.width()/2 + dec)
                            }
                            dom.css({
                                left:left,
                                top:top
                            }).addClass('top')
                            break;
                        }
                    case 'right':
                        top  = offset.top  - window.scrollY
                        left = offset.left - window.scrollX + size.w + space;
                        if(left + dSize.w + space < window.innerWidth){
                            if(top + dSize.h + space > window.innerHeight){
                                var dec = top + dSize.h + space - window.innerHeight;
                                top = top - dec;
                                dom.find('.box-point').css('top', dec + 8)
                            }
                            dom.css({
                                left:left,
                                top:top
                            }).addClass('right')
                            break;
                        }
                    case 'left':
                        top  = offset.top  - window.scrollY
                        left = offset.left - window.scrollX - dSize.w - space;
                        if(left > 0){
                            if(top + dSize.h + space > window.innerHeight){
                                var dec = top + dSize.h + space - window.innerHeight;
                                    top = top - dec;
                                    dom.find('.box-point').css('top', dec + 8)
                            }
                            dom.css({
                                left:left,
                                top:top
                            }).addClass('left')
                        }
                }
            }}
        }
        this.closeOption = function(){
            if(backDrop && backDrop.remove){
                backDrop.remove();
                backDrop = false;
            }
            if($.isArray(opsDOM)){
                for(var k in opsDOM){
                    opsDOM[k].remove && opsDOM[k].remove();
                }
                opsDOM = [];
            }
        }
    }
    $.fn.H5Option = function(opt){
        var options = opt.vals;
        var chVal   = new ParseVals(this, opt.vals);
        var value   = opt.defaultVal || chVal.getFrist();
        var set     = function(_this){
            return function(val){
                chVal.closeOption();
                _this.data(value = val);
                var funcName = _this.is('input,textarea,select')?'val':'html';
                _this[funcName].call(_this, value.name)
                _this.trigger('change');
            }
        }(this);
        this.click(function(){
            var $this = $(this);
            chVal.openOption(options, value, function(val){
                set(val)
            }).moveCoor($this.offset(),{w:$this.width(),h:$this.height()}, 'top');
        })
        set(value);
    }
}()