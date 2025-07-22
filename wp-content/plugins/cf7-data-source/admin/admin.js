//
(function($){

	var form_fields = {},
        variables = {},
        current_recordset,
		codemirror;

	function esc(v)
	{
		return v.replace(/</g, '&#60;')
				.replace(/>/g, '&#62;')
				.replace(/\[/g, '&#91;')
				.replace(/\]/g, '&#93;')
				.replace(/"/g, '&#34;');
	}

    function literal(v)
	{
		return v.replace(/&#60;/g, '<')
				.replace(/&#62;/g, '>')
				.replace(/&#91;/g, '[')
				.replace(/&#93;/g, ']')
				.replace(/&#34;/g, '"');
	}

    function test_recordset()
    {
        var flag,
            url = document.location.href;

        for(var i in variables)
        {
            flag = true;
            while(flag)
            {
                current_recordset = current_recordset.replace(i, variables[i]);
                flag = (current_recordset.indexOf(i) != -1);
            }
        }

        $.ajax(
            {
                'url'       : url,
                'method'    : 'post',
                'dataType'  : 'json',
                'data'      : {'cf7-recordset-test' : current_recordset},
                'success'   : function(data){
                    try
                    {
                        alert(JSON.stringify(data));
                    }
                    catch(err){if('console' in window) console.log(err);}
                }
            }
        );
    }

    function extract_vars(str)
    {
        current_recordset = str;

        var f  = str.match(/\{field\.[^\}]+\}/ig, str),
            v  = str.match(/\{var\.[^\}]+\}/ig, str),
            b = [].concat(f==null?[]:f, v==null?[]:v),
            r  = '';

        if(b.length)
        {
            for(var i in b) r += '<tr><th>'+b[i]+'</th><td><input name="'+esc(b[i])+'" value="'+( b[i] in variables ? esc(variables[b[i]]) : '')+'" type="text" /></td></tr>';
        }

        if(r.length)
        {
            $(
                '<div class="cf7-recordset-test-frame">'+
                    '<div class="cf-recordset-test-variables-container">'+
                        '<h3>Enter variables for testing the recordset</h3>'+
                        '<table border="0" style="width:100%;">'+
                            r+
                            '<tr><th></th><td align="right"><button class="button-primary cf7-recordset-test-variables-apply">Apply</button></div><button class="button-secondary cf7-recordset-test-variables-close">Close</button></td></tr>'+
                        '</table>'+
                    '</div>'+
                '</div>'
            ).appendTo('body');
        }
        else test_recordset();
    }

	function populate_datalists()
	{
		var form_editor = $('textarea[id="wpcf7-form"]');
		if(form_editor.length)
		{
			try
			{
				var	form_structure = form_editor.val(),
					types = ['text','email','tel','url','textarea','number','range','date','checkbox','radio','select'],
					result = Array.from(form_structure.matchAll(new RegExp('\\[\\s*([^\\]]+)\\]', 'g'))),
					components,
					type,
					name,
					datalist_fields = $('datalist[id="cf7-field-name"]'),
					datalist_recordsets = $('datalist[id="cf7-recordset-id"]');

				form_fields = {};
				datalist_fields.html('');
				datalist_recordsets.html('');

				for(var i in result)
				{
                    try
                    {
                        components = result[i][1].replace(/\s+/g, ' ').split(/\s/);
                        type = components[0].replace(/\*/g, '').toLowerCase();
                        name = components[1].replace(/"/g, '');
                        if(types.indexOf(type) != -1)
                        {
                            form_fields[name] = type;
                            $('<option />').attr('value', name).appendTo(datalist_fields);
                        }
                        else if(type == 'cf7-recordset')
                        {
                            components = result[i][1].match(/\sid\s*=\s*['"]([^'"]+)['"]/);
                            if(components)
                                $('<option />').attr('value', components[1]).appendTo(datalist_recordsets);
                        }
                    }catch(err){continue;}
				}

				// Extract IDs of tags inserted directly
				$( '<div>'+form_structure+'</div>').find('[id]').each( function() {
					try
					{
						var tag = this.tagName.toLowerCase(),
							id  = this.getAttribute('id');

						if ( id && ! ( id in form_fields ) ) {
							if ( 'input' == tag ) {
								let t = String( this.getAttribute('type') || 'text' ).toLowerCase();
								if ( 'file' != t ) {
									form_fields[id] = t;
								}
							} else if ( types.indexOf( tag ) != -1 ) {
								form_fields[id] = tat;
							} else {
								form_fields[id] = 'tag';
							}
							$('<option />').attr('value', id).appendTo(datalist_fields);
						}
					}catch(err){}
				});

			}
			catch(err)
			{
				if(typeof console != 'undefined') console.log(err);
			}
		}
	}

	function edit_recordset()
	{
		// Editor.
		let form_editor = $( 'textarea[id="wpcf7-form"]' );
		let edit_btn = $('<div style="position:sticky;top:35px;"><div id="cf7ds_edit_container"><div id="cf7ds_edit_icon" title="Edit RecordSets"></div></div></div>');
		let shortcodes = [];

		function shortcode_attr_to_field( attrs ) {
			try {
				let p = '.cf7-datasource-recordset';
				if ( 'id' in attrs ) {
					$('[name="name"]', p).val( attrs.id );
				}

				$('[name="cf7-datasource"]', p).val( 'type' in attrs ? attrs.type : 'database' ).trigger('change');
				$('[name="cf7-callback"]', p).val( 'callback' in attrs ? attrs.callback : '' ).trigger('change');
				$('[name="cf7-debugging-email"]', p).val( 'debugging_email' in attrs ? attrs.debugging_email : '' ).trigger('change');
				$('[name="cf7-debugging"]', p).prop( 'checked', ( 'debug' in attrs && attrs.debug ) ).trigger('change');

				if ( 'type' in attrs ) {
					switch ( String( attrs['type'] ).toLowerCase() ) {
						case 'database':
							let db_connection = 'website';
							if ( 'dns' in attrs) db_connection = 'dns';
							$('[name="cf7-database-dns"]', p).val( 'dns' in attrs ? literal(attrs.dns) : '' ).trigger('change');
							if ( 'engine' in attrs || 'hostname' in attrs || 'database' in attrs ) db_connection = 'components';
							$('[name="cf7-database-engine"]', p).val( 'engine' in attrs ? literal(attrs.engine) : '' ).trigger('change');
							$('[name="cf7-database-hostname"]', p).val( 'hostname' in attrs ? literal(attrs.hostname) : '' ).trigger('change');
							$('[name="cf7-database-database"]', p).val( 'database' in attrs ? literal(attrs.database) : '' ).trigger('change');
							$('[name="cf7-database-username"]', p).val( 'username' in attrs ? literal(attrs.username) : '' ).trigger('change');
							$('[name="cf7-database-password"]', p).val( 'password' in attrs ? literal(attrs.password) : '' ).trigger('change');
							$('[name="cf7-database-query"]', p).val( 'query' in attrs ? literal(attrs.query) : '' ).trigger('change').trigger('update-codemirror');
							$('[name="cf7-database-connection"][value="' + db_connection + '"]', p).prop( 'checked', true ).trigger('change');
						break;
						case 'user':
							$('[name="cf7-user-attributes"]', p).val( 'attributes' in attrs ? literal(attrs.attributes) : '' ).trigger('change');
							$('[name="cf7-user-logged"]', p).prop( 'checked', ( 'logged' in attrs && attrs.logged ) ).trigger('change');
							$('[name="cf7-user-condition"]', p).val( 'condition' in attrs ? literal(attrs.condition) : '' ).trigger('change');
							$('[name="cf7-user-order-by"]', p).val( 'order_by' in attrs ? literal(attrs.order_by) : '' ).trigger('change');
						break;
						case 'post':
							$('[name="cf7-post-attributes"]', p).val( 'attributes' in attrs ? literal(attrs.attributes) : '').trigger('change');
							$('[name="cf7-post-condition"]', p).val( 'condition' in attrs ? literal(attrs.condition) : '' ).trigger('change');

							$('[name="cf7-post-order-by"]', p).val( 'order_by' in attrs ? literal(attrs.order_by) : '').trigger('change');
							$('[name="cf7-post-current"]', p).prop( 'checked', ( 'condition' in attrs && attrs.condition.indexOf('ID={post.id}') != -1 ) ).trigger('change');
						break;
						case 'client':
							$('[name="cf7-client-function"]', p).val( 'function' in attrs ? literal(attrs.function) : '' ).trigger('change');
							$('[name="cf7-client-parameters"]', p).val( 'parameters' in attrs ? literal(attrs.parameters) : '' ).trigger('change');
						break;
						case 'taxonomy':
							$('[name="cf7-taxonomy-name"]', p).val( 'taxonomy' in attrs ? literal(attrs.taxonomy) : '').trigger('change');
							$('[name="cf7-taxonomy-attributes"]', p).val( 'attributes' in attrs ? literal(attrs.attributes) : '' ).trigger('change');
							$('[name="cf7-taxonomy-condition"]', p).val( 'condition' in attrs ? literal(attrs.condition) : '' ).trigger('change');
							$('[name="cf7-taxonomy-order-by"]', p).val( 'order_by' in attrs ? literal(attrs.order_by) : '' ).trigger('change');
							$('[name="cf7-taxonomy-posts"]', p).val( 'in' in attrs ? literal(attrs.in) : '' ).trigger('change');
						break;
						case 'csv':
							$('[name="cf7-csv-url"]', p).val( 'url' in attrs ? literal(attrs.url) : '' ).trigger('change');
							$('[name="cf7-csv-headline"]', p).prop( 'checked', ( 'headline' in attrs && attrs.headline ) ).trigger('change');
							$('[name="cf7-csv-delimiter"]', p).val( 'delimiter' in attrs ? literal(attrs.delimiter) : '' ).trigger('change');
						break;
						case 'json':
							$('[name="cf7-json-url"]', p).val( 'url' in attrs ? literal(attrs.url) : '' ).trigger('change');
						break;
						default:
							throw 'Data source selected is not supported by this plugin version.';
						break;
					}
				}
			} catch ( err ) {
				console.log( err );

				// close the popup and display a message.
				$( '#tag-generator-panel-cf7-recordset .close-button, #TB_closeWindowButton' ).trigger('click');
				$( 'body' ).append( $( '<div class="cf7-ds-error-message">' + cf7_datasource_admin_settings['uErrorMessage'] + '</div>' ) );
				$( document ).one( 'click', function(){ $( '.cf7-ds-error-message' ).remove(); } );
			}
		};

		function show_hide_icon() {
			edit_btn[ shortcodes.length ? 'show' : 'hide' ]();
		};

		function show_menu( evt ) {
			evt.preventDefault();
			evt.stopPropagation();
			get_all_recordsets();
			if ( shortcodes.length ) {
				let t = $('#cf7ds_recordsets_menu').length ? 0 : 400;
				hide_menu(0);
				let menu = '<ul id="cf7ds_recordsets_menu">';
				for ( let i in shortcodes ) {
					let id;
					try { id = shortcodes[i].shortcode.attrs.named.id; } catch ( err ) { console.log( err ); }
					id = id || i;
					menu += '<li data-shortcode-index="' + i + '">' + $('<div></div>').html(id).text() + '</li>';
				}
				menu += '</ul>';
				menu = $(menu);
				menu.appendTo('#cf7ds_edit_container');
				menu.slideDown(t);
			} else {
				hide_menu(0);
			}
		};

		function hide_menu(t) {
			t = ( typeof t == 'undefined' ) ? 400 : t;
			$('#cf7ds_recordsets_menu').slideUp(t).promise().done(function(){ $('#cf7ds_recordsets_menu').remove(); });
		};

		function get_all_recordsets() {
			shortcodes = [];
			let content = form_editor.val();
			let matches = content.match( /\[\s*cf7\-recordset[^\]]*\]/g );

            if ( matches ) {
                for ( let i = 0; i < matches.length; i++ ) {
					var shortcodeObj = wp.shortcode.next( 'cf7-recordset', matches[i] );
					if ( shortcodeObj ) {
						shortcodes.push( shortcodeObj );
					}
				}
			}

			// Show/hide icon.
			show_hide_icon();
		};

		if ( form_editor.length ) {
			// Check if the form contains RecordSet Fields.
			form_editor.wrap('<div style="position:relative"></div>');
			form_editor.before( edit_btn );
			$( document ).on( 'mouseover', '#cf7ds_edit_icon', show_menu );
			$( document ).on( 'mouseover mouseout', function( evt ) {
				if ($(evt.relatedTarget).closest('#cf7ds_edit_container').length === 0) {
					hide_menu();
				}
			});

			form_editor.on( 'keyup change', function() {
				get_all_recordsets();
			});
			get_all_recordsets();

			// Click on menu options.
			$( document ).on( 'click', '#cf7ds_recordsets_menu li', function() {
				$('[href*="cf7-recordset"],button[data-target="tag-generator-panel-cf7-recordset"]').trigger('click');

				let p = '#tag-generator-panel-cf7-recordset,[data-id="cf7-recordset"]';
				let item  = shortcodes[ this.getAttribute('data-shortcode-index')];
				try {
					let attrs = item.shortcode.attrs.named;
					let new_btn = $('.cf7-update-tag');
					if ( ! new_btn.length ) {
						let btn = $('.insert-tag:visible:last', p);
						new_btn = btn.clone();
						new_btn.removeClass('insert-tag')
							.addClass('cf7-update-tag')
							.val(cf7_datasource_admin_settings['uBtn2Text'])
							.attr('title', cf7_datasource_admin_settings['uBtn2Title']);
						btn.after(new_btn);
					}
					$('.insert-tag', p).hide();
					new_btn.off('click')
						   .on('click', (
							   function( old_shortcode ) {
									return function( evt ) {
										let new_shortcode = generate_recordset_shortcode();
										form_editor.val(form_editor.val().replace( old_shortcode, new_shortcode ));
										$('#tag-generator-panel-cf7-recordset .close-button, #TB_closeWindowButton').trigger('click');
										$('.insert-tag', p).show();
										new_btn.hide();
									};
							   })(item.content)
						   )
						   .show();

					// Get shortcode attributes and populate the popup fields.
					shortcode_attr_to_field( attrs );
				} catch ( err ) { console.log( err ); }
			});
		}
	}

	function display_datasource_section(datasource)
	{
		$('[class*="cf7-datasource-"]:not(.cf7-datasource-link):not(.cf7-datasource-recordset)').hide();
		$('.cf7-datasource-'+datasource).show();
		if(datasource == 'database') display_database_attributes();
	}

	function display_database_attributes()
	{
		$('.cf7-datasource-dns,.cf7-datasource-components').hide();
		$('.cf7-datasource-'+$('[name="cf7-database-connection"]:checked').val()).show();
	}

	function generate_recordset_shortcode()
	{
		let shortcode = '[cf7-recordset',
			p = '.cf7-datasource-recordset',
			cf7_recordset_id = String($('[id="tag-generator-panel-cf7-recordset-id"]', p).val()).trim(),
			cf7_datasource = String($('[name="cf7-datasource"]', p).val()).trim(),
			cf7_debugging = $('[name="cf7-debugging"]:checked', p).length,
			cf7_callback  = String($('[name="cf7-callback"]', p).val()).trim(),
			cf7_debugging_email  = String($('[name="cf7-debugging-email"]', p).val()).trim(),

			// User
			cf7_user_attributes = String($('[name="cf7-user-attributes"]', p).val()).trim(),
			cf7_user_logged = $('[name="cf7-user-logged"]:checked', p).length,
			cf7_user_condition = String($('[name="cf7-user-condition"]', p).val()).trim(),
			cf7_user_order_by = String($('[name="cf7-user-order-by"]', p).val()).trim(),

			// Post
			cf7_post_attributes = String($('[name="cf7-post-attributes"]', p).val()).trim(),
			cf7_post_condition = String($('[name="cf7-post-condition"]', p).val()).trim(),
            cf7_post_order_by = String($('[name="cf7-post-order-by"]', p).val()).trim(),
			cf7_post_current = $('[name="cf7-post-current"]:checked', p).length,

			// Client side
			cf7_client_function = String($('[name="cf7-client-function"]', p).val()).trim(),
			cf7_client_parameters = String($('[name="cf7-client-parameters"]', p).val()).trim(),

			// Taxonomy
			cf7_taxonomy_name = String($('[name="cf7-taxonomy-name"]', p).val()).trim(),
			cf7_taxonomy_attributes = String($('[name="cf7-taxonomy-attributes"]', p).val()).trim(),
			cf7_taxonomy_condition = String($('[name="cf7-taxonomy-condition"]', p).val()).trim(),
			cf7_taxonomy_order_by = String($('[name="cf7-taxonomy-order-by"]', p).val()).trim(),
			cf7_taxonomy_posts = String($('[name="cf7-taxonomy-posts"]', p).val()).trim(),

			// Database
			cf7_database_connection = String($('[name="cf7-database-connection"]:checked', p).val()).trim(),
			cf7_database_dns = String($('[name="cf7-database-dns"]', p).val()).trim(),
			cf7_database_engine = String($('[name="cf7-database-engine"]', p).val()).trim(),
			cf7_database_hostname = String($('[name="cf7-database-hostname"]', p).val()).trim(),
			cf7_database_database = String($('[name="cf7-database-database"]', p).val()).trim(),
			cf7_database_username = String($('[name="cf7-database-username"]', p).val()).trim(),
			cf7_database_password = String($('[name="cf7-database-password"]', p).val()).trim(),
			cf7_database_query = String($('[name="cf7-database-query"]', p).val().replace(/[\r\n]/g, ' ')).trim(),

			// CSV
			cf7_csv_url = String($('[name="cf7-csv-url"]', p).val()).trim(),
			cf7_csv_headline = $('[name="cf7-csv-headline"]:checked', p).length,
			cf7_csv_delimiter = String($('[name="cf7-csv-delimiter"]', p).val()).trim(),

			// JSON
			cf7_json_url = String($('[name="cf7-json-url"]', p).val()).trim();

		shortcode += ' id="'+esc((cf7_recordset_id != '') ? cf7_recordset_id : 'recordset'+(new Date()).valueOf())+'"';
		shortcode += ' type="'+cf7_datasource+'"';

		if(cf7_debugging) shortcode += ' debug="1"';
		if(cf7_debugging_email.length) shortcode += ' debugging_email="'+esc(cf7_debugging_email)+'"';
		if(cf7_callback.length) shortcode += ' callback="'+esc(cf7_callback)+'"';

		switch(cf7_datasource)
		{
			case 'user':
				if(cf7_user_attributes != '') shortcode += ' attributes="'+esc(cf7_user_attributes)+'"';
				if(cf7_user_logged) shortcode += ' logged="1"';
				if(cf7_user_condition != '') shortcode += ' condition="'+esc(cf7_user_condition)+'"';
				if(cf7_user_order_by != '') shortcode += ' order_by="'+esc(cf7_user_order_by)+'"';
			break;

			case 'post':
				if(cf7_post_attributes != '') shortcode += ' attributes="'+esc(cf7_post_attributes)+'"';
				if(cf7_post_condition != '')
                {
                    shortcode += ' condition="('+esc(cf7_post_condition);
                    if(cf7_post_current) shortcode += ') AND ID={post.id}';
                    else  shortcode += ')';
                    shortcode += '"';
                }
                else if(cf7_post_current) shortcode += ' condition="ID={post.id}"';
				if(cf7_post_order_by != '') shortcode += ' order_by="'+esc(cf7_post_order_by)+'"';
			break;

			case 'client':
				if(cf7_client_function != '') shortcode += ' function="'+esc(cf7_client_function)+'"';
				if(cf7_client_parameters != '') shortcode += ' parameters="'+esc(cf7_client_parameters)+'"';
            break;

			case 'taxonomy':
				if(cf7_taxonomy_name != '') shortcode += ' taxonomy="'+esc(cf7_taxonomy_name)+'"';
				if(cf7_taxonomy_attributes != '') shortcode += ' attributes="'+esc(cf7_taxonomy_attributes)+'"';
				if(cf7_taxonomy_condition != '') shortcode += ' condition="'+esc(cf7_taxonomy_condition)+'"';
				if(cf7_taxonomy_order_by != '') shortcode += ' order_by="'+esc(cf7_taxonomy_order_by)+'"';
				if(cf7_taxonomy_posts != '') shortcode += ' in="'+esc(cf7_taxonomy_posts)+'"';
			break;

			case 'database':
				if(cf7_database_connection == 'dns')
				{
					if(cf7_database_dns != '') shortcode += ' dns="'+esc(cf7_database_dns)+'"';
				}
				else if(cf7_database_connection == 'components')
				{
					if(cf7_database_engine != '') shortcode += ' engine="'+esc(cf7_database_engine)+'"';
					if(cf7_database_hostname != '') shortcode += ' hostname="'+esc(cf7_database_hostname)+'"';
					if(cf7_database_database != '') shortcode += ' database="'+esc(cf7_database_database)+'"';
				}
                if(cf7_database_connection != 'website')
                {
                    if(cf7_database_username != '') shortcode += ' username="'+esc(cf7_database_username)+'"';
                    if(cf7_database_password != '') shortcode += ' password="'+esc(cf7_database_password)+'"';
                }
				if(cf7_database_query != '') shortcode += ' query="'+esc(cf7_database_query)+'"';
			break;

			case 'csv':
				if(cf7_csv_url != '') shortcode += ' url="'+esc(cf7_csv_url)+'"';
				if(cf7_csv_headline) shortcode += ' headline="1"';
				if(cf7_csv_delimiter != '') shortcode += ' delimiter="'+esc(cf7_csv_delimiter)+'"';
			break;

			case 'json':
				if(cf7_json_url != '') shortcode += ' url="'+esc(cf7_json_url)+'"';
			break;
		}
		shortcode += ']';

		setTimeout( function(){ $('[name="cf7-recordset"]').val(shortcode); }, 50 );
		return shortcode;
	}

	function generate_link_shortcode()
	{
		var shortcode = '[cf7-link-field',
			p = '.cf7-datasource-link',
			cf7_recordset_id = String($('[name="cf7-recordset-id"]', p).val()).trim(),
			cf7_field_name = String($('[name="cf7-field-name"]', p).val()).trim(),
			cf7_keep_options = $('[name="cf7-field-keep-options"]', p).is(':checked') ? 1 : 0,
			cf7_attribute_value = String($('[name="cf7-attribute-value"]', p).val()).trim(),
			cf7_attribute_text  = String($('[name="cf7-attribute-text"]:visible', p).val() || '').trim(),
			cf7_attribute_datalist  = String($('[name="cf7-attribute-datalist"]:visible', p).val() || '').trim(),
			cf7_attribute_extra = String($('[name="cf7-attribute-extra"]', p).val()).trim(),
			cf7_limit = String($('[name="cf7-limit"]:visible', p).val() || '').trim(),
			cf7_callback = String($('[name="cf7-callback"]', p).val()).trim(),
			cf7_condition = String($('[name="cf7-condition"]', p).val()).trim();

		shortcode += ' recordset="'+esc(cf7_recordset_id)+'"';
		shortcode += ' field="'+esc(cf7_field_name)+'"';
		shortcode += ' value="'+esc(cf7_attribute_value)+'"';

		if(cf7_attribute_text != '') shortcode += ' text="'+esc(cf7_attribute_text)+'"';
		if(cf7_attribute_datalist != '') shortcode += ' datalist="'+esc(cf7_attribute_datalist)+'"';
		if(cf7_attribute_extra != '') shortcode += ' other-attributes="'+esc(cf7_attribute_extra)+'"';
		if(cf7_condition != '') shortcode += ' condition="'+esc(cf7_condition)+'"';
		if(
            cf7_limit != '' &&
            !isNaN(parseInt(cf7_limit)) &&
            parseInt(cf7_limit)
        ) shortcode += ' limit="'+parseInt(cf7_limit)+'"';
		if(cf7_callback != '') shortcode += ' callback="'+esc(cf7_callback)+'"';
		if(cf7_keep_options) shortcode += ' keep-options';

		shortcode += ']';
		$('[name="cf7-link-field"]').val(shortcode);
	}

	function update_editor_icon_position()
	{
		var form_editor = $('textarea[id="wpcf7-form"]');
		function updateRightPosition() {
			let e = form_editor[0];
			$('#cf7ds_edit_container').css('right', (e.clientHeight < e.scrollHeight ? e.offsetWidth - e.clientWidth + 5 : 10) + 'px');
		}

		if(form_editor.length)
		{
			form_editor.on('input', updateRightPosition);
			updateRightPosition();
		}
	}

	$(document).on('change', '[name="cf7-datasource"]',  function(){
		let _blur = function( n, e ){
			$('[class*="cf7-datasource"]:not(.cf7-datasource-link):not(.cf7-datasource-recordset),#tag-generator-panel-cf7-recordset .insert-box').css({'filter': 'blur('+n+'px)', 'pointer-events': (n ? 'none' : 'auto')}).find('*').prop('disabled', (n ? true : 0));
			$( '.cf7ds-banner' ).remove();
			if ( n ) {
				$(e).closest('tr').after(
					'<tr class="cf7ds-banner"><td colspan="2">'+
					'<div class="cf7ds-banner-container">'+
						'<a href="https://youtu.be/xyGfZbuiiBo" class="cf7ds-banner-video" target="_blank"></a>'+
						'<div class="cf7ds-banner-text">'+
							'<a href="https://cf7-datasource.dwbooster.com/download" target="_blank"><div class="cf7ds-banner-ribbon-container"><span class="cf7ds-banner-small">from</span> €4.49<span class="cf7ds-banner-small"> / mo</span></div></a>'+
							'<div class="cf7ds-banner-title">'+
								'<a href="https://cf7-datasource.dwbooster.com/download" target="_blank">Why to Upgrade?</a>'+
							'</div>'+
							'<div class="cf7ds-banner-points">'+
								'<ul>'+
									'<li>Fill form fields from <span class="cf7ds-banner-highlight">Google Sheets</span>, <span class="cf7ds-banner-highlight">Excel</span>, or any CSV source,</li>'+
									'<li>Integrate plugins like <span class="cf7ds-banner-highlight">Secure or Advanced Custom Fields (ACF)</span>,</li>'+
									'<li>Fetch data from third-party services,</li>'+
									'<li>... and more.</li>'+
								'</ul>'+
							'</div>'+
							'<div class="cf7ds-banner-footer">'+
								'<a href="https://cf7-datasource.dwbooster.com/download" target="_blank" style="color:white !important;"><span>Upgrade Today and Transform Your Workflow!</span>'+
								'<span class="cf7ds-banner-upgrade-icon"></span></a>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'</td></tr>'
				);
			}
		};
		let v = $(this).val();

		if ( 'professional' == v) {
			_blur(2, this);
		} else {
			_blur(0, this);
			display_datasource_section($(this).val());
		}
	});

	$(document).on('change', '[name="cf7-database-connection"]',  display_database_attributes);
	$(document).on('change keyup', '.cf7-datasource-recordset :input', generate_recordset_shortcode);
	$(document).on('change keyup', '.cf7-datasource-link :input', generate_link_shortcode);
	$(document).on('change keyup', '[name="cf7-field-name"]', function(){
		var cf7_field_name = String(this.value).trim(),
			without_text_types = ['text', 'email', 'tel', 'password', 'url', 'textarea', 'number', 'range', 'date', 'datetime-local', 'time', 'month', 'week', 'button', 'reset', 'submit', 'color', 'hidden', 'search', 'image', 'tag'],
			to_show_hide = $('[name="cf7-attribute-text"],[name="cf7-limit"]').closest('tr'),
			to_hide_show = $('[name="cf7-attribute-datalist"]').closest('tr');

		to_show_hide.show();
		to_hide_show.hide();
		if(cf7_field_name in form_fields && without_text_types.indexOf(form_fields[cf7_field_name]) != -1) {
			to_show_hide.hide();
			to_hide_show.show();
		}
	});
	$(document).on('mousedown', '[href*="cf7-link-field"], button[data-target="tag-generator-panel-cf7-link-field"]', function(){
		populate_datalists();
	});
    $(document).on('click', '.cf7-recordset-test', function(){
        var recordset = $('[name="cf7-recordset"]').val(),
            data = {'cf7-recordset' : recordset, 'cf7-datasource-action' : 'cf7-recordset-test'};
        extract_vars(recordset);
    });
    $(document).on('click', '.cf7-recordset-test-variables-close', function(){$(this).closest('.cf7-recordset-test-frame').remove();});
    $(document).on('click', '.cf7-recordset-test-variables-apply', function(){
        $('.cf-recordset-test-variables-container [type="text"]').each(function(){
            variables[this.name] = this.value;
        });
        test_recordset();
        $('.cf7-recordset-test-variables-close').trigger('click');
    });

    // Update insert button text
	$(document).on(
		'mouseup',
		'[href*="cf7-recordset"],button[data-target="tag-generator-panel-cf7-recordset"]',
		function() {
			if (
				'cf7_datasource_admin_settings' in window &&
				'btnText' in cf7_datasource_admin_settings
			) {
				$('[name="cf7-recordset"]')
				 .closest('.insert-box')
				 .find('[type="button"]:not(.insert-tag-only)')
				 .val( cf7_datasource_admin_settings['btnText'] )
				 .attr('title', cf7_datasource_admin_settings['btnTitle']);
			}

			// Clone button
			if (
				'cf7_datasource_admin_settings' in window &&
				'btn2Text' in cf7_datasource_admin_settings &&
				$('[name="cf7-recordset"]')
				 .closest('.insert-box')
				 .find('[type="button"].insert-tag-only').length == 0
			) {
				let originalBtn = $('[name="cf7-recordset"]')
									.closest('.insert-box')
									.find('[type="button"].insert-tag');
				originalBtn.removeClass('button-primary').addClass('button-secondary');

				let newBtn = originalBtn.clone();

				 newBtn.val( cf7_datasource_admin_settings['btn2Text'] )
						.attr('title', cf7_datasource_admin_settings['btn2Title'])
						.addClass('insert-tag-only button-primary')
						.on('click', function(){
							let s = $(this).siblings('.insert-tag');
							s.addClass('insert-tag-only').trigger('click');
							s.removeClass('insert-tag-only');
						});

				 originalBtn.parent().append(newBtn);

			}
			setTimeout(function(){
				$('[name="cf7-datasource"]').trigger('change');
				$('[name="cf7-database-connection"][value="website"]').prop('checked', true).trigger('change');
				$('[name="cf7-database-query"]').trigger('update-codemirror');
			}, 10);
		}
	);

    // Insert the recordset field, opens the recordset-link dialog, and populates the id of recordset field
    $(document).on(
        'mousedown',
        '[data-id="cf7-recordset"] button.insert-tag,[data-id="cf7-recordset"] input[type="button"].insert-tag',
        function()
        {
			if ($(this).hasClass('insert-tag-only')) return;
			$('[name="cf7-recordset"]').trigger('focus');
            // Global variable with the recordset id
            cf7_recordset_id = jQuery('[name="name"]:visible').val();
        }
    );

	$(document).on(
        'mouseup',
        '[data-id="cf7-recordset"] button.insert-tag,[data-id="cf7-recordset"] input[type="button"].insert-tag',
        function()
        {
			if ($(this).hasClass('insert-tag-only')) return;

            // Waits until the recorset panel closes
            setTimeout(function(){
                try
                {
					if( $('#TB_window:visible').length ) return;

                    $('#tag-generator-list').find('[href*="cf7-link-field"],button[data-target="tag-generator-panel-cf7-link-field"]').trigger('mousedown').trigger('click');
                    // Waits until the link panel opens
                    setTimeout(function(){
                        try
                        {
							if(typeof cf7_recordset_id != 'undefined')
								$('[name="cf7-recordset-id"]').val(cf7_recordset_id);
                        }
                        catch(err){}
                    },500);
                }
                catch(err){}
            }, 2000);
        }
    );

	$(document).on(
		'click',
		'[name="cf7-database-use-predefined-query"]',
		function( evt )
		{
			$('[name="cf7-database-query"]').val( $('[name="cf7-database-predefined-query"]').val() ).trigger( 'update-codemirror' );
		}
	);

	$(document).on(
		'change',
		'[name="cf7-database-predefined-query"]',
		function()
		{
			$('.cf7-database-predefined-query-description').html( $('option:selected', this).attr('data-description') );
		}
	);

	$('[name="cf7-database-predefined-query"]').trigger('change');

	// Update datalists
	$(document).on(
		'input',
		'.cf7-datasource-recordset [list]',
		function()
		{
			let e = $(this),
				v = new String(e.val()).split(' '),
				l = $( '#'+e.attr('list') ),
				n = v.length ? v.pop() : '';

			l.find('option').each(function(){
				let o = $(this), t = o.attr('data-value'), s;

				if(typeof t == 'undefined') {
					t = o.attr('value');
					o.attr('data-value', t);
				}
				if(n.length == 0 || t.toLowerCase().indexOf(n.toLowerCase()) == 0){
					s = String(v.join(' ')).trim();
					o.attr('value', s+(s.length ? ' ' : '')+t);
				}
				if(o.attr('value') != t) {
					o.text('...'+t);
				} else {
					o.text('');
				}
			});
		}
	);

	// Open video tutorial
	$(document).on('click', '[id="cf7-ds-video-tutorial"]', function(){
		let w = screen.width*0.8,
			h = screen.height*0.7,
			l = screen.width/2 - w/2,
			t = screen.height/2 - h/2,
			o = window.open('', 'cf7-ds-video-tutorial-window', 'resizeable,scrollbars,width='+w+',height='+h+',left='+l+',top='+t);

		o.document.title = 'Video Tutorial';
		o.document.body.innerHTML = '<style>.youtube-video-container{position:relative;overflow:hidden;width:100%;}</style><div class="youtube-video-container"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/bcf1i6jvlYE" title="Data Source for Contact Form 7, reading data of the logged user" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
	});

	// Main app.
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					if ( 'wp' in window && 'codeEditor' in wp && typeof codemirror == 'undefined' ) {
						var editorSettings = wp.codeEditor.defaultSettings ? _.clone(wp.codeEditor.defaultSettings) : {'codemirror':{}};
						if ( typeof cf7_datasource_admin_settings != 'undefined' ) {
							if ( ! 'codemirror' in editorSettings ) {
								editorSettings['codemirror'] = {};
							}
							editorSettings['codemirror']['mode'] = cf7_datasource_admin_settings['mode'];
							editorSettings['codemirror']['height'] = 200;
							editorSettings['codemirror']['parserfile'] = cf7_datasource_admin_settings['parserfile'];
							editorSettings['codemirror']['stylesheet'] = cf7_datasource_admin_settings['stylesheet'];
							editorSettings['codemirror']['textWrapping'] = cf7_datasource_admin_settings['textWrapping'];
						}
						codemirror = wp.codeEditor.initialize( $('[name="cf7-database-query"]')[0], editorSettings );
						codemirror.codemirror.on('change', function(e){ $('[name="cf7-database-query"]').val(e.getValue()).trigger('change');});
						$( document ).on( 'update-codemirror', '[name="cf7-database-query"]', function(evt){
							codemirror.codemirror.getDoc().setValue( evt.target.value );
						});
					}
				}
			});
		}, {
			threshold: 1.0,
		}
	);

	// Start observing the element
	observer.observe($('[name="cf7-database-query"]')[0]);
	$( window ).on( 'load', function(){
		edit_recordset();
		update_editor_icon_position();
	});
})(jQuery)