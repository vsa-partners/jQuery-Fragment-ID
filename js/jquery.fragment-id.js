/*global window: true, document: true, jQuery: true */

/*
 * An attempt to implement http://simonstl.com/articles/cssFragID.html.
 * It will scroll to http://example.com/#css(.class :nth-child(2)) or whatever jQuery selector you include within "#css()".
 * By: Erik Vorhes and Jeremy Kahn (jeremyckahn@gmail.com)
 *
 *
 * Tested in Chrome, Firefox, Safari, IE 7 and 8.  Who knows, it may even work in IE 6.
 * Developed with jQuery 1.5, but should be compatible with 1.4 and probably even earlier versions.
 * 
 * BASIC USAGE
 * =================================================
 * Usage:  After the DOM has loaded, call `$.gotoFrag()` with your options, detailed below.
 * The page will scroll to the element specified by the jQuery selector string in `location.hash`.
 * This is most effective when called in the `$.ready()` jQuery function, but you can call it whenever you like.
 * Here's the hash format:
 * 
 * http://example.com/#css(_SELECTOR_)
 *	   - Where _SELECTOR_ is the jQuery selector string
 *
 * API:
 *
 * `$.gotoFrag( options )`
 * 
 * @param {Object} options This is the object containing the options to set the following:
 *	  @param {Number} duration How long the scrolling animation runs for
 *	  @param {Function} complete The callback function that is called when the animation completes.	 It gets the jQuery object for the element targeted by the hash selector as the first parameter
 *    @param {Function} onChangeTarget This function is called if `$.gotoFrag()` was called at least once before.  Handy for removing any CSS changes that were applied to the old target.  It gets the `oldTarget` jQuery object for the first parameter, and the `newTarget` jQuery object for the second parameter.
 *
 * @codestart
 *
 *  $(function() {
 *    $.gotoFrag({
 *      'duration': 2500,
 *      'complete': function (el) {
 *         el.css({
 *           'background' : '#ff8'
 *         })
 *      },
 *      'onChangeTarget': function (oldTarget, newTarget) {
 *         oldEl.css({
 *          'background' : ''
 *      });
 *    });
 *  });
 *
 * @codeend
 * Yay!	 It's like magic!
 * 
 * ADVANCED USAGE
 * =================================================
 * This plugin automagically integrates with Ben Alman's super handy jQuery Hashchange plugin (http://benalman.com/projects/jquery-hashchange-plugin/).
 * If Hashchange is present, just sit back and enjoy the scrolling.  To customize the effect, you can configure the call to `$.gotoFrag` by calling...
 * 
 * @codestart
 * 
 *	$(function() {
 *	  $.gotoFrag.configHashchange({
 *      // exact same parameters as $.gotoFrag()
 *    });
 *  });
 * 
 * @codeend
 * 
 * See the API documentation for details on what paramters to pass in - they are exactly the same. All `$.gotoFrag.configHashchange()` does is call  `$.gotoFrag()` when `location.hash` changes.
 */
(function ($) {
	
	var hashchangeOptions,
		lastSelectedElement,
		fakeEl,
		defaults = {
			'duration': 1000
	};

	$.gotoFrag = function gotoFrag(options) {
		var hash/* = decodeURIComponent(window.location.hash).match(/^#css\((.+)\)$/i)*/,
			targetEl, 
			targetClass,
			selector,
			isSelector;
			
		// Copy any options that were not defined in `options` from `defaults`.
		options = $.extend( (options || {}), defaults );
		targetClass = options.targetClassName || 'target';
			
		//hash = decodeURIComponent(window.location.hash).match(/^#css\((.+)\)$/i);
		hash = decodeURIComponent(window.location.hash);
		
		if (hash.length > 0) {
			selector = hash.match(/^#css\((.+)\)$/i);

			if (selector) {
				isSelector = true;
				selector = selector[1];
			}
		} else {
			return;
		}
		
		if (isSelector) {
			targetEl = $(selector).first();
		} else {
			$('a[name]').each(function (index, el) {
				el = $(el);
				
				if (targetEl) {
					// A target was found, so just quit out of the `each`.
					return false;
				}
				
				if (el.attr('name') === hash.substr(1)) {
					targetEl = el;
				}
			});
		}

		if ( targetEl && targetEl.length !== 0 ) {
			if (options.onChangeTarget && lastSelectedElement) {
				fakeEl.stop();
				options.onChangeTarget(lastSelectedElement, targetEl);
			}
			
			lastSelectedElement = targetEl;

			fakeEl = $('<div>');
			// It makes more semantic sense to animate the `top` property, but apparently that CSS
			// property doesn't work the same as `width` in detached DOM nodes.
			fakeEl.css({
				'width': $(window).scrollTop()
			}).animate({
				'width': targetEl.offset().top
			}, {
				'duration': options.duration,
				'step': function () {
					// You need to set the scrollTop property for both the body and documentElement
					// for this to work cross-browser, SWEET
					//document.documentElement.scrollTop = document.body.scrollTop = fakeEl.css('width').replace(/px$/, '');
					$(window).scrollTop(fakeEl.css('width').replace(/px$/, ''));
				},
				'complete': function () {
					targetEl.addClass(targetClass);

					if (options.complete) {
						options.complete(targetEl);
					}
				}
			});
			
			if (parseInt($(window).scrollTop(), 10) === parseInt(targetEl.offset().top, 10)) {
				fakeEl.stop(true, true);
			}
		}

		return this;
	};
	
	$.gotoFrag.configHashchange = function ( options ) {
		hashchangeOptions = $.extend( (options || {}), defaults );
		
		if (!!$.fn.hashchange) {
			$(window).hashchange();
		} else {
			throw 'Hashchange plugin is not present, cannot call $.gotoFrag.configHashchange.';
		}
	};

	// Detect to see if Ben Alman's jQuery Hashchange plugin is present.
	// http://benalman.com/projects/jquery-hashchange-plugin/
	if (!!$.fn.hashchange) {
		// Bind to the `hashchange` event
		$(window).hashchange(function (ev) {
			$.gotoFrag(hashchangeOptions);
		});
		
		$(function () {
			$.gotoFrag(hashchangeOptions);
		});
	}
	
}(jQuery));