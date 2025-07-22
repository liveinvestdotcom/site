var cp_loadingpage = cp_loadingpage || {};
cp_loadingpage.graphics = cp_loadingpage.graphics || {};

cp_loadingpage.graphics['text'] = {
	created: false,
	attr   : {percentage:0},
	create : function(opt){
		opt.backgroundColor = opt.backgroundColor || "#000000";
		opt.foregroundColor = opt.foregroundColor || "#FFFFFF";

        this.shortText = '';
        this.textColor = '#ffffff';
        this.textBackgroundColor = '#ff5c35';

		this.attr['foreground'] = opt.foregroundColor;

		var css_o = {
			width: "100%",
			height: "100%",
			backgroundColor: opt.backgroundColor,
			position: "fixed",
			zIndex: 666999,
			top: 0,
			left: 0
		},
		$ = jQuery;

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

		this.attr['overlay'] = $("<div class='lp-screen'></div>").css(css_o).appendTo("html");

		if (opt.text) {
			this.attr['text'] = $("<div class='lp-screen-text'></div>").text("0%").css({
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
				typeof opt[ 'lp_ls' ][ 'text' ]  != 'undefined'  &&
				typeof opt[ 'lp_ls' ][ 'text' ][ 'text' ]  != 'undefined'  &&
				!/^\s*$/.test( opt[ 'lp_ls' ][ 'text' ][ 'text' ]  )
			)
			{
                this.shortText = opt[ 'lp_ls' ][ 'text' ][ 'text' ];

				if (
					typeof opt[ 'lp_ls' ][ 'text' ][ 'color' ] != 'undefined' &&
					!/^\s*$/.test( opt[ 'lp_ls' ][ 'text' ][ 'color' ] )
				) {
					this.textColor = opt[ 'lp_ls' ][ 'text' ][ 'color' ];
				}

				if (
					typeof opt[ 'lp_ls' ][ 'text' ][ 'background' ] != 'undefined' &&
					!/^\s*$/.test( opt[ 'lp_ls' ][ 'text' ][ 'background' ] )
				) {
					this.textBackgroundColor = opt[ 'lp_ls' ][ 'text' ][ 'background' ];
				}

				var tags 	= '<div class="lp_text_characters">',
					css     = '',
					width   = 0,
					wrapper = $('<span style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);display: inline-block;" class="lp-text-wrapper"></span>');

				for ( let i = 0, h = this.shortText.length; i < h; i++ ) {
					tags  += '<div class="lp_text_character">' + ( /^\s*$/.test(this.shortText[i]) ? '' : this.shortText[i] ) + '</div>';
					width += 30;
					css   += '.lp_text_character:nth-child(' + (i+1) + ') {animation-delay: '+ (i*0.3) +'s;}';
				}

				css += '.loader-container {display: flex;justify-content: center;align-items: center;height: 100vh;}';
				css += '.lp_text_characters {display: flex;justify-content: space-between;width: ' + width + 'px;font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";}';
				css += '.lp_text_character {width: 30px;height: 40px;background-color:' + this.textBackgroundColor + ';color: ' + this.textColor + ';display: flex;justify-content: center;align-items: center;font-size: 18px;font-weight: bold;border-radius: 4px;backface-visibility: hidden;transform-style: preserve-3d;animation: lp_ls_text_flip 2s infinite;}.lp_text_character:empty{visibility:hidden !important;}';
				css += '@keyframes lp_ls_text_flip {0%, 100% {transform: rotateY(0deg);} 50% {transform: rotateY(180deg);}}';

				wrapper.append( $( tags ) ).appendTo( this.attr[ 'overlay' ] );

				if(this.attr[ 'text' ])
					wrapper.append('<style>' + css + '</style>').append(this.attr[ 'text' ].css({'position':'relative', 'top':'auto', 'left':'auto', 'width':'100%', 'margin-top':'20px'}));
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
    },

	complete : function(callback){
		callback();
		var me = this;
		this.attr['overlay'].fadeOut(1000, function () {
			me.attr['overlay'].remove();
		});
	}
};
