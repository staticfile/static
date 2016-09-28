jQuery(
function($) {
	
	$(document).ready(function(){
		var lastScrollTop = 0;
		var scrollDir = '';
		var stickyHeight = 0;
		var stickyMarginB = 0;
		var currentMarginT = 0;
		var topMargin = 0;
		var vartop = 0;
		var varscroll = 0;
		$('.navbar-static-top').css('height','70px');
		$('.menuItem').find('a').css('line-height', '50px');
		$(window).scroll(function(event){
   			var st = $(this).scrollTop();
   			if (st > lastScrollTop){
       			scrollDir = 'down';
   			} else {
      			scrollDir = 'up';
   			}
  			lastScrollTop = st;
		});
		$.fn.stickUp = function( options ) {
			// adding a class to users div
			$(this).addClass('stuckMenu');

        	if(options != null) {
	  			if(options.topMargin != null) {
	  				if(options.topMargin == 'auto') {
	  					topMargin = parseInt($('.stuckMenu').css('margin-top'));
	  				} else {
	  					if(isNaN(options.topMargin) && options.topMargin.search("px") > 0){
	  						topMargin = parseInt(options.topMargin.replace("px",""));
	  					} else if(!isNaN(parseInt(options.topMargin))) {
	  						topMargin = parseInt(options.topMargin);
	  					} else {
	  						topMargin = 0;
	  					}	
	  				}
	  			} else {
	  				topMargin = 0;
	  			}
  			}
			stickyHeight = parseInt($(this).height());
			stickyMarginB = parseInt($(this).css('margin-bottom'));
			currentMarginT = parseInt($(this).next().closest('div').css('margin-top'));
			vartop = parseInt($(this).offset().top);
		};

		$(document).on('scroll', function() {
			varscroll = parseInt($(document).scrollTop());
			var screenWidth=$(document).width();
			if(vartop < varscroll + topMargin){
				$('.stuckMenu').addClass('isStuck');

				if(screenWidth > 767) {
					$('.navbar-static-top').css('height', '50px');
					$('.menuItem').find('a').css('line-height', '30px');
				}
				$('.stuckMenu').next().closest('div').css({
					'margin-top': stickyHeight + stickyMarginB + currentMarginT + 'px'
				}, 10);
				$('.stuckMenu').css("position","fixed");
				$('.isStuck').css({
					top: '0px'
				}, 10, function(){

				});
			}

			if(varscroll + topMargin < vartop){
				$('.stuckMenu').removeClass('isStuck');
				if(screenWidth > 767){

					$('.navbar-static-top').css('height','70px');
					$('.menuItem').find('a').css('line-height', '50px');
				}

				$('.stuckMenu').next().closest('div').css({
					'margin-top': currentMarginT + 'px'
				}, 10);
				$('.stuckMenu').css("position","relative");
			};

		});
	});

});
