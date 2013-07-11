/*
	hi��ʿ����ӭ����js������!
*/
(function(_win){
	var K = _win['Koala'],pow = Math.pow,sin = Math.sin,PI = Math.PI,BACK_CONST = 1.70158,uid=1,expando='KoloaData' + ( +new Date() + "" ).slice( -8 ),KfxData=[],cacheData={};
	K.P.fn.extend({            
      fx:function(){ 
		return new _fx(this);
      }
	});
	var AnimationTool = {
		Easing:{
			linear:function(t){
				return t;
			},
			easeIn : function (t) {
				return t * t;
			},

			easeOut : function (t) {
				return ( 2 - t) * t;
			},

			easeBoth : function (t) {
				return (t *= 2) < 1 ?
					.5 * t * t :
					.5 * (1 - (--t) * (t - 2));
			},

			easeInStrong : function (t) {
				return t * t * t * t;
			},

			easeOutStrong : function (t) {
				return 1 - (--t) * t * t * t;
			},

			easeBothStrong: function (t) {
				return (t *= 2) < 1 ?
					.5 * t * t * t * t :
					.5 * (2 - (t -= 2) * t * t * t);
			},
			
			easeOutQuart : function(t){
			  return -(pow((t-1), 4) -1)
			},
			
			easeInOutExpo: function(t){
			  if(t===0) return 0;
			  if(t===1) return 1;
			  if((t/=0.5) < 1) return 0.5 * pow(2,10 * (t-1));
			  return 0.5 * (-pow(2, -10 * --t) + 2);
			},
			
			easeOutExpo: function(t){
			  return (t===1) ? 1 : -pow(2, -10 * t) + 1;
			},
			
			swingFrom: function(t) {
			  return t*t*((BACK_CONST+1)*t - BACK_CONST);
			},
			
			swingTo: function(t) {
			  return (t-=1)*t*((BACK_CONST+1)*t + BACK_CONST) + 1;
			},

			backIn : function (t) {
				if (t === 1) t -= .001;
				return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
			},

			backOut : function (t) {
				return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
			},

			bounce : function (t) {
				var s = 7.5625, r;

				if (t < (1 / 2.75)) {
					r = s * t * t;
				}
				else if (t < (2 / 2.75)) {
					r = s * (t -= (1.5 / 2.75)) * t + .75;
				}
				else if (t < (2.5 / 2.75)) {
					r = s * (t -= (2.25 / 2.75)) * t + .9375;
				}
				else {
					r = s * (t -= (2.625 / 2.75)) * t + .984375;
				}

				return r;
			}	
		},
		speed:{//Ԥ�����ٶ�
			slow : 600,
			fast : 200,
			defaults : 400
		},
		fxAttrs : function( type, index ){
			var attrs = [
				['width', 'height', 'opacity', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth' ],
				[ 'height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'],
				['opacity']
			];
				
			return { 
				attrs : attrs[index],
				type : type
			}
		},
		getStyleNew:function(obj,p){
			if( (p === 'left' || p === 'right' || p === 'top' || p === 'bottom') && obj.getStyle(p) === 'auto' ){
				return '0px';
			}
			if( (p === 'marginRight' || p === 'marginLeft' || p === 'marginTop' || p === 'marginBottom') && obj.getStyle(p) === 'auto' ){
				return '0px';
			}
			if(p==='opacity'){
				var val = obj.opacity();
				return (val === 1 || val === 0) ? val.toFixed(0) : val.toFixed(1);
			}
			if((p==='borderTopWidth' || p==='borderRightWidth' || p==='borderBottomWidth' || p==='borderLeftWidth') && (obj.getStyle(p) === 'thin' ||obj.getStyle(p) === 'medium' ||obj.getStyle(p) === 'thick') ){
				return '0px';
			}
			return obj.getStyle(p);
		},
		parseColor : function( val ){//��ȡrgb��ɫ
			var r, g, b;
			if( /rgb/.test(val) ){
				var arr = val.match( /\d+/g );
				r = arr[0];
				g = arr[1];
				b = arr[2];
			}
			else if( /#/.test(val) ){
				var len = val.length;
				if( len === 7 ){
					r = parseInt( val.slice(1, 3), 16 );
					g = parseInt( val.slice(3, 5), 16 );
					b = parseInt( val.slice(5), 16 );
				}
				else if( len === 4 ){
					r = parseInt( val.charAt(1) + val.charAt(1), 16 );
					g = parseInt( val.charAt(2) + val.charAt(2), 16 );
					b = parseInt( val.charAt(3) + val.charAt(3), 16 );
				}
			}
			else{
				return val;
			}
			
			return {
				r : parseFloat( r ),
				g : parseFloat( g ),
				b : parseFloat( b )
			}
		},
		parseStyle:function(prop){//��ʽ��CSS����,ֻ����λ��
			var val = parseFloat( prop ),unit = prop.replace(/^[\-\d\.]+/, '');
			return isNaN(val) ? { 
				val : this.parseColor( unit ),
				unit : '',
				fn : function( sv, tv, tu, e ){
					var r = ( sv.r + (tv.r - sv.r) * e ).toFixed(0), 
						g = ( sv.g + (tv.g - sv.g) * e ).toFixed(0), 
						b = ( sv.b + (tv.b - sv.b) * e ).toFixed(0);
					
					return 'rgb(' + r + ',' + g + ',' + b + ')';
				}
			} : {
				val : val,
				unit : unit,
				fn : function( sv, tv, tu, e ){
					return ( sv + (tv - sv) * e ).toFixed(3) + tu;
				}
			}
		},
		newObj:function( arr, val ){
			val = val !== undefined ? val : 1;
			var obj = {};
			K.A.each(arr,function(items,i){
				obj[items] = val;
			})
			return obj;
		},
		setOptions:function(obj,duration, easing, callback){// �����������洢��һ���¶�����
			var self=this,options = {};
			options.duration = (function( d ){
				if(K.C.isNumber(d)){
					return d;
				}else if(K.C.isString(d) && self.speed[d] ){
					return self.speed[d];
				}else if( !d ){
					return self.speed.defaults;
				}
			})(duration);
			// �ص����������˶���
			options.callback = function(){
				if(K.C.isFunction(callback)){
					callback();
				}
				self.dequeue(obj);
			};
			options.easing = (function( e ){
				if(K.C.isString(e) && AnimationTool.Easing[e] ){ 
					return AnimationTool.Easing[e];
				}
				else if(K.C.isFunction(e) ){
					return e;
				}
				else{
					return AnimationTool.Easing.easeBoth;
				}
			})( easing );
			return options;
		},
		setProps:function( elem, props, type){//��ʼ����������
			if( type ){
				var attrs = props().attrs,
					type = props().type,
					val, obj, p;
							
				if( type === 'hide' ){
					val = attrs[0] === 'opacity' ? '0' : '0px';
				}
				obj = this.newObj( attrs, val );
				if( type === 'show' ){
					for( p in obj ){
						obj[p] = this.getStyleNew( elem, p );
					}
				}
				return obj;
			}
			else if( props && typeof props === 'object' ){
				return props;
			}
		},
		data:function(key, val, data ){//���淽ʽй©
				if(K.C.isString(key)){
					if( val !== undefined ){
						cacheData[key] = val;
					}

					return cacheData[key];
				}
				else if(K.C.isObj(key)){
					var index,
						thisCache;

					if( !key[expando] ){
						// ���һ��DOMԪ�ص�����
						// ������������� ����ֵ������ֵ
						index = key[expando] = ++uid;
						thisCache = cacheData[index] = {};
					}
					else{
						index = key[expando];
						thisCache = cacheData[index];
					}

					if( !thisCache[expando] ){
						thisCache[expando] = {};
					}

					if( data !== undefined ){
						// �����ݴ浽���������
						thisCache[expando][val] = data;
					}

					// ����DOMԪ�ش洢������
					return thisCache[expando][val];
				}
			},
		removeData:function(key, val ){//ɾ������
				if(K.C.isString(key)){
					delete cacheData[key];
				}
				else if(K.C.isObj(key)){
					if( !key[expando] ){
						return;
					}
					// �������Ƿ�Ϊ��
					var isEmptyObject = function( obj ) {
							var name;
							for ( name in obj ) {
								return false;
							}
							return true;
						},

						removeAttr = function(){
							try{
								// IE8����׼���������ֱ��ʹ��delete��ɾ������
								delete key[expando];
							}
							catch (e) {
								// IE6/IE7ʹ��removeAttribute������ɾ������
								key.removeAttribute(expando);
							}
						},

						index = key[expando];

					if( val ){
						// ֻɾ��ָ��������
						delete cacheData[index][expando][val];
						// ����ǿն��� ����ȫ��ɾ��
						if( isEmptyObject(cacheData[index][expando] ) ){
							delete cacheData[index];
							removeAttr();
						}
					}
					else{
						// ɾ��DOMԪ�ش浽�����е���������
						delete cacheData[index];
						removeAttr();
					}
				}
		},
		queue:function(obj,data){//��Ӷ���
			var KQueue = this.data( obj, 'KQueue' ) || this.data( obj, 'KQueue', [] );
			if( data ){
				KQueue.push( data );
			}	
			//alert(KQueue)
			if( KQueue[0] !== 'runing' ){
				this.dequeue(obj);
			}
		},
		dequeue:function( obj ){//ȡ������
				var _self = this,KQueue = _self.data( obj, 'KQueue' ) || _self.data( obj, 'KQueue', [] ),fn = KQueue.shift();
				if( fn === 'runing' ){
					fn = KQueue.shift();
				}
				if(fn){
					KQueue.unshift( 'runing' );//��ͷ���һ��
					if(K.C.isNumber(fn)){
						setTimeout(function(){
							_self.dequeue( obj );
						},fn);
					}else if(K.C.isFunction(fn)){
						fn.call( obj, function(){
							_self.dequeue( obj );
						});
					}
				}
				if( !KQueue.length ){
					_self.removeData( obj, 'KQueue' );
				}
		},
		setOpacity : function( elem, val ){
			if( 'getComputedStyle' in _win ){
				elem.node.style.opacity = val === 1 ? '' : val;
			}
			else{
				elem.node.style.zoom = 1;
				elem.node.style.filter = val === 1 ? '' : 'alpha(opacity=' + val * 100 + ')';
			}
		}
	}
	var core =function( ele, options, props, type){
		this.ele = ele;
		this.options = options;
		this.props = props;
		this.type = type;
	}
	core.prototype = {
		start:function( source, target){
				this.startTime = +new Date();
				this.source = source;
				this.target = target;
				KfxData.push(this);
				var _self = this;
				if( _self.timer ) return;
				_self.timer = _win.setInterval(function(){
					for( var i = 0, curStep; curStep = KfxData[i++]; ){//����ִ��
						curStep.run();
					}
					
					if( !KfxData.length ){//�������
						_self.stop();
					}
				},13);
		},
		run:function(end){
			var ele = this.ele,
				type=this.type,
				props=this.props,
				startTime=this.startTime,
				elapsedTime = +new Date(),
				duration = this.options.duration,
				endTime = startTime + duration,
				t = elapsedTime > endTime ? 1 : ( elapsedTime - startTime ) / duration,
				e = this.options.easing( t ),
				len = 0,
				i = 0,
				p;
				for( p in props ){
					len += 1;
				}
				ele.css("overflow","hidden");
				if( type === 'show' ){
					ele.css('display','block');
				}
				for( p in props ){
					i+=1;
					var sv = this.source[p].val,
						tv=this.target[p].val,
						tu=this.target[p].unit;
					if( end || elapsedTime >= endTime ){// ������������ԭ��ʽ
						ele.css("overflow","");
						if( type === 'hide' ){
							ele.css('display','none');
						}
						if( type ){
							if( p === 'opacity' ){
								AnimationTool.setOpacity(ele,1);
							}
							else{
								ele.css(p,( type === 'hide' ? sv : tv ) + tu)
							}
						}
						else{
							ele.css(p,/color/i.test(p) ? 'rgb(' + tv.r + ',' + tv.g + ',' + tv.b + ')' :tv + tu);
						}
						if( i === len ){  // �ж��Ƿ�Ϊ���һ������
							this.complete();
							this.options.callback.call( ele );	
						}
					}else{
						if( sv === tv )	continue;
						var x = this.target[p].fn( sv, tv, tu, e );
						if( p === 'opacity' ){
							AnimationTool.setOpacity(ele,(sv + (tv - sv) * e).toFixed(3));
						}
						else{
							ele.css(p,x);
						}
						
					}
				}
		},
		complete:function(){
				for( var i =KfxData.length - 1; i >= 0; i-- ){
					if( this === KfxData[i] ){
						KfxData.splice( i, 1 );
					}
				}
		},
		stop:function(){
			window.clearInterval( this.timer );
			this.timer = undefined;
		}
	}
	var _fx = function(ele){
		this.ele = ele;
	}
	_fx.prototype = {
		go:function(props, duration, easing, callback ){
			var ele = this.ele,type,options=AnimationTool.setOptions(this.ele,duration, easing, callback);
					if(K.C.isFunction(props)){
						type = props().type;
					}else{
						type = null;
					}
					props =AnimationTool.setProps(ele,props,type);
					AnimationTool.queue(ele,function(){
						var source = {},
						target = {},
						p;
						K.A.each(props,function(item,p){
							if(type === 'show' ){
								if( p === 'opacity' ){
									AnimationTool.setOpacity(ele,'0');
								}
								else{
									ele.css(p,'0px');
								}
							}
							source[p] = AnimationTool.parseStyle(AnimationTool.getStyleNew(ele,p));	// ������ʼʱ��CSS��ʽ
							target[p] = AnimationTool.parseStyle( props[p] );
						});
						var g = new core( ele, options, props, type );
						g.start(source, target);
					})
					return this;
		},
		delay:function( time ){
			if(K.C.isNumber(time)){
				AnimationTool.queue( this.ele, time );
			}		
			return this;
		},
		fadeOut : function( duration, easing, callback ){
			this.go(function(){
				return AnimationTool.fxAttrs( 'hide', 2 );
			}, duration, easing, callback );
			return this;
		},
		fadeIn : function( duration, easing, callback ){
			this.go(function(){
				return AnimationTool.fxAttrs( 'show', 2 );
			}, duration, easing, callback );
			return this;
		},
		show : function( duration, easing, callback ){
			var elem = this.ele;
			if( duration ){
				this.go(function(){
					return AnimationTool.fxAttrs( 'show', 0 );
				}, duration, easing, callback );
			}
			else{
				elem.show();
			}
			
			return this;
		},
		hide:function( duration, easing, callback ){
			var elem = this.ele;
			if( duration ){
				this.go(function(){
					return AnimationTool.fxAttrs( 'hide', 0 );
				}, duration, easing, callback );
			}
			else{
				elem.hide();
			}
			
			return this;
		},
		slideDown : function( duration, easing, callback ){
			this.go(function(){
				return AnimationTool.fxAttrs( 'show', 1 );
			}, duration, easing, callback );
			
			return this;
		},
		
		slideUp : function( duration, easing, callback ){
			this.go(function(){
				return AnimationTool.fxAttrs( 'hide', 1 );
			}, duration, easing, callback );
			
			return this;
		},
		
		slideToggle : function( duration, easing, callback ){
			var elem = this.ele;
			AnimationTool.getStyleNew( elem, 'display' ) === 'none' ? 
				this.slideDown( duration, easing, callback ) :
				this.slideUp( duration, easing, callback );
			
			return this;
		},
		showToggle : function( duration, easing, callback ){
			var elem = this.ele;
			AnimationTool.getStyleNew( elem, 'display' ) === 'none' ? 
				this.show( duration, easing, callback ) :
				this.hide( duration, easing, callback );
			
			return this;
		},
		fadeToggle : function( duration, easing, callback ){
			var elem = this.ele;
			AnimationTool.getStyleNew( elem, 'display' ) === 'none' ? 
				this.fadeIn( duration, easing, callback ) :
				this.fadeOut( duration, easing, callback );
			
			return this;
		}
	}
})(window)