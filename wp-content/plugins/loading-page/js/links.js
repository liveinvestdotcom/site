jQuery(
    function () {
    var $ = jQuery, target;
	if (
		(typeof cp_loadingpage != 'undefined' && 'displayScreen' in cp_loadingpage)
	) {
		$(document).on('click', '*', function(evt){
			target = evt.target;
		});

		$(window).on('beforeunload', function(evt){
			try {
				if ( target && target.classList.contains( 'no-loading-screen' ) ) return;
			} catch ( err ) {}

			try {
				let destination = document.activeElement.href;
				if ( /^(mailto|skype|tel|javascript)\:/i.test( destination ) ) return;
			} catch( err ) {}

			try {
				if ( $('.lp-screen:visible').length ) return;
				cp_loadingpage.displayScreen();
				$('body').addClass('lp_loading_screen_body');
				if (
					typeof loading_page_settings == 'undefined' ||
					!('triggerLinkScreenNeverClose' in loading_page_settings) ||
					!(loading_page_settings['triggerLinkScreenNeverClose'] * 1)
				) {
					setTimeout(
						function () {
							cp_loadingpage.onLoadComplete();
						},
						(typeof loading_page_settings != 'undefined' && 'triggerLinkScreenCloseAfter' in loading_page_settings && loading_page_settings['triggerLinkScreenCloseAfter'] * 1) ? Math.round(loading_page_settings['triggerLinkScreenCloseAfter'] * 1000) : 4000
					);
				}
			} catch( err ) {}
		});
	}
});
