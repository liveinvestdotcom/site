var cp_loadingpage = cp_loadingpage || {};
cp_loadingpage.graphics = cp_loadingpage.graphics || {};

cp_loadingpage.graphics['logo'] = {
	created: false,
	attr   : {percentage:0},
	create : function(opt){
		opt.backgroundColor = opt.backgroundColor || "#000000";
		opt.foregroundColor = opt.foregroundColor || "#FFFFFF";

        this.grayscale = 0;
        this.blink = 0;

		this.attr['foreground'] = opt.foregroundColor;

		var css_o = {
			width: "100%",
			height: "100%",
			backgroundColor: opt.backgroundColor,
			position: "fixed",
			zIndex: 666999,
			top: 0,
			left: 0
		};

		if( opt[ 'backgroundImage' ] ){
			css_o['backgroundImage']  = 'url('+opt[ 'backgroundImage' ]+')';
			css_o['background-repeat'] = opt[ 'backgroundRepeat' ];
			css_o['background-position'] = 'center center';

			if(
				css_o['background-repeat'].toLowerCase() == 'no-repeat' &&
				typeof opt['fullscreen'] !== 'undefined' &&
				opt['fullscreen']*1 == 1
			)
			{
				css_o[ "background-attachment" ] = "fixed";
				css_o[ "-webkit-background-size" ] = "contain";
				css_o[ "-moz-background-size" ] = "contain";
				css_o[ "-o-background-size" ] = "contain";
				css_o[ "background-size" ] = "contain";
			}
		}

		this.attr['overlay'] = jQuery("<div class='lp-screen'></div>").css(css_o).appendTo("html");

		if (opt.text) {
			this.attr['text'] = jQuery("<div class='lp-screen-text'></div>").text("0%").css({
				lineHeight: "40px",
				height: "40px",
				width: "100px",
				position: "absolute",
				fontSize: "30px",
				top: this.attr['overlay'].height()/2,
				left: this.attr['overlay'].width()/2-50,
				textAlign: "center",
				color: opt.foregroundColor
			}).appendTo(this.attr['overlay']);
		}

		if(
			typeof opt[ 'lp_ls' ]  != 'undefined'
		)
		{
			if(
				typeof opt[ 'lp_ls' ][ 'logo' ]  != 'undefined'  &&
				typeof opt[ 'lp_ls' ][ 'logo' ][ 'image' ]  != 'undefined'  &&
				!/^\s*$/.test( opt[ 'lp_ls' ][ 'logo' ][ 'image' ]  )
			)
			{
                this.grayscale = (typeof opt[ 'lp_ls' ][ 'logo' ][ 'grayscale' ] == 'undefined' || opt[ 'lp_ls' ][ 'logo' ][ 'grayscale' ]*1);

                this.blink = (typeof opt[ 'lp_ls' ][ 'logo' ][ 'blink' ] == 'undefined' || opt[ 'lp_ls' ][ 'logo' ][ 'blink' ]*1);

				var logo_height = ( 'height' in opt[ 'lp_ls' ][ 'logo' ] &&  ! isNaN( opt[ 'lp_ls' ][ 'logo' ][ 'height' ] * 1 ) && opt[ 'lp_ls' ][ 'logo' ][ 'height' ] * 1 ? 'height:'+ opt[ 'lp_ls' ][ 'logo' ][ 'height' ] + 'px;' : ''),
					logo_width = 'width:' + ( 'width' in opt[ 'lp_ls' ][ 'logo' ] &&  ! isNaN( opt[ 'lp_ls' ][ 'logo' ][ 'width' ] * 1 ) && opt[ 'lp_ls' ][ 'logo' ][ 'width' ] * 1 ? opt[ 'lp_ls' ][ 'logo' ][ 'width' ] : 120) + 'px;'
					me 	= this,
					wrapper = jQuery('<span style="width:120px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);display: inline-block;" class="lp-logo-wrapper"></span>'),
					img_url = String( opt[ 'lp_ls' ][ 'logo' ][ 'image' ] ).trim(),
					img = jQuery('<img id="lp_ls_img" src="'+img_url+'"  alt="" style="cursor:pointer;margin-left:50% !important;transform:translateX(-50%) !important;max-width:initial;'+logo_width+logo_height+(this.grayscale ? '-webkit-filter:grayscale(100%);filter:grayscale(100%);' : '')+'" class="'+(this.blink ? 'lp_blink' : '')+'" onerror="this.src=\'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\';" />');

				img.on('click',cp_loadingpage.destroyLoader);
				wrapper.append(img).appendTo( me.attr[ 'overlay' ] );
				if(me.attr[ 'text' ])
					wrapper.append(me.attr[ 'text' ].css({'position':'relative', 'top':'auto', 'left':'auto', 'width':'100%', 'margin-top':'20px'}));
			}
		}
		this.set(0);
		this.created = true;
	},

	set : function(percentage){
		this.attr['percentage'] = percentage;
		if (this.attr['text']) {
			this.attr['text'].text(Math.ceil(percentage) + "%");
		}
        if(this.grayscale)
        {
            jQuery( '#lp_ls_img' ).css({
                '-webkit-filter': 'grayscale('+(100-percentage)+'%)',
                'filter': 'grayscale('+(100-percentage)+'%)'
            });
        }
	},

	complete : function(callback){
		callback();
		var me = this;
		this.attr['overlay'].fadeOut(1000, function () {
			me.attr['overlay'].remove();
		});
	}
};
