jQuery(document).ready(function($) {
   
jQuery('.zma-notice-dismiss').click(function(e) {
 		var data = {
            'action': 'zma_update_notice',
			'security': jQuery( '#mh-ajax-nonce' ).val(),
        };
        jQuery.post(ajaxurl, data, function(response) {
           jQuery("#zma-notices-message").hide();
        });
 
	});	 

});