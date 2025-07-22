(function(){
	var $ = jQuery;

	window['loading_page_collapse_expand_video_tutorial'] = function(e){
		var t = $(e).text(), n = 'X', v = 'expanded', a = 'removeClass';
		if(t == 'X')
		{
			n = '+';
			v = 'collapsed';
			a = 'addClass';
		}
		$(e).text(n);
		$('[name="loading_page_video_tutorial"]').val(v);
		$('.lp-video-tutorial')[a]('lp-video-collapsed');
	};

    window['loading_page_selected_image'] = function(fieldName){
        var img_field = $('input[name="'+fieldName+'"]');
        var media = wp.media({
				title: 'Select Media File',
				library:{
					type: 'image'
				},
				button: {
				text: 'Select Item'
				},
				multiple: false
		}).on('select',
			(function( field ){
				return function() {
					var attachment = media.state().get('selection').first().toJSON();
					var url = attachment.url;
					field.val( url );
				};
			})( img_field )
		).open();
		return false;
    };

    window['lp_ls_setColorPicker'] = function(field, colorPicker){
        $(colorPicker).hide();
        $(colorPicker).farbtastic(field);
        $(field).on('click',function(){$(colorPicker).slideToggle()});
    };

	$( document ).on(
		'change',
		'[name="lp_loading_screen"]',
		function( evt, mssg ){
			if( typeof mssg == 'undefined' || mssg == true )
			{
				var	t = $(evt.target.options[evt.target.selectedIndex]).attr('title');
				if( t && t.length ){ alert(t); }
			}
		}
	);

	$( document ).on(
		'change',
		'[name="lp_backgroundTransparencyPercentage"]',
		function( evt, mssg ){
			let v = this.value;
			$('#lp_backgroundTransparencyPercentageCaption').text( '(' + v + '%)' );
		}
	);

    $( document ).on(
		'change',
		'[name="lp_backgroundTransparency"]',
		function(){
			let f = $( '[name="lp_backgroundTransparencyPercentage"],#lp_backgroundTransparencyPercentageCaption' );
			if ( this.checked ) {
				f.css('visibility', 'visible');
			} else {
				f.css('visibility', 'hidden');
			}
		}
	);

	// Document ready.
	$(function(){
		$( '[name="lp_backgroundTransparencyPercentage"]' ).trigger( 'change' );
		$( '[name="lp_backgroundTransparency"]' ).trigger( 'change' );
	});

	// Window Load.
	$(window).on( 'load', function(){
		lp_ls_setColorPicker("#lp_backgroundColor", "#lp_backgroundColor_picker");
		lp_ls_setColorPicker("#lp_foregroundColor", "#lp_foregroundColor_picker");
		$( '[name="lp_loading_screen"]' ).trigger( 'change', [ false ] );
	});
})();