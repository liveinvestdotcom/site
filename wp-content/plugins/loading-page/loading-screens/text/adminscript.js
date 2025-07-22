jQuery( function( $ ){
	$( document ).on( 'change',  '[ name="lp_loading_screen" ]' , function(){
		if( this.value == 'text' )
		{
			$( '.lp_ls_section' ).hide();
			$( '#loading_screen_text' ).show();
		}
		else
		{
			$( '#loading_screen_text' ).hide();
		}
	});
} );