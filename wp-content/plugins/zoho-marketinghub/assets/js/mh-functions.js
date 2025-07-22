
var zc_domain_url = "";

var changevalue = function(selectedvalue) {
        jQuery("#add_page_tracking_script_globalErr").html("");
        jQuery("#add_page_tracking_script_globalErr").hide();
        jQuery("#cateogrylist").removeClass("err");
        jQuery("#zmhub_change").attr("value",1);
        if(selectedvalue == 'global') {
            jQuery("#zmhub_code_loc").attr("value",'global');
            if(jQuery("#selectpo").is(":visible"))
            {
                jQuery("#selectpo").fadeOut(function(){
                    jQuery("#Date").fadeIn();
                });
            }
            else if(jQuery("#Cateogry").is(":visible"))
            {
                jQuery("#Cateogry").fadeOut(function(){
                    //jQuery("#Date").fadeIn();
                });
            }

            jQuery('#specific').removeClass("zcicon-radiobox-marked");
            jQuery('#specific').addClass("zcicon-radiobox-blank");
            jQuery('#Cat').removeClass("zcicon-radiobox-marked");
            jQuery('#Cat').addClass("zcicon-radiobox-blank");
            jQuery('#global').removeClass("zcicon-radiobox-blank");
            jQuery('#global').addClass("zcicon-radiobox-marked");
            jQuery("#pageList").slideUp();
            jQuery("#postList").slideUp();

        } else if(selectedvalue == 'specific') {
            jQuery("#zmhub_code_loc").attr("value",'specific');
            if(jQuery("#Cateogry").is(":visible"))
            {
                jQuery("#Cateogry").fadeOut();
                jQuery("#Date").fadeOut(function(){
                    jQuery('#selectpo').fadeIn();
                });
            }
            else {
                jQuery("#Date").fadeOut(function(){
                        jQuery('#selectpo').fadeIn();
                    });
            }

            jQuery('#specific').addClass("zcicon-radiobox-marked");
            jQuery('#specific').removeClass("zcicon-radiobox-blank");
            jQuery('#Cat').removeClass("zcicon-radiobox-marked");
            jQuery('#Cat').addClass("zcicon-radiobox-blank");
            jQuery('#global').removeClass("zcicon-radiobox-marked");
            jQuery('#global').addClass("zcicon-radiobox-blank");

        }
        else if(selectedvalue == 'cateogry'){
            jQuery("#zmhub_code_loc").attr("value",'cateogry');
            if(jQuery("#selectpo").is(":visible"))
            {
                jQuery("#selectpo").fadeOut(function(){
                    jQuery("#Cateogry").fadeIn();
                    jQuery('#Date').fadeIn();
                });
            }
            else {
                jQuery("#Cateogry").fadeIn();
            }

            jQuery('#specific').removeClass("zcicon-radiobox-marked");
            jQuery('#specific').addClass("zcicon-radiobox-blank");
            jQuery('#Cat').removeClass("zcicon-radiobox-blank");
            jQuery('#Cat').addClass("zcicon-radiobox-marked");
            jQuery('#global').removeClass("zcicon-radiobox-marked");
            jQuery('#global').addClass("zcicon-radiobox-blank");
            jQuery("#pageList").slideUp();
            jQuery("#postList").slideUp();

        }

    }
    var showpage = function(element) {

        if(jQuery(element).hasClass("zcicon-checkbox-blank-outline"))
        {
            jQuery(element).removeClass("zcicon-checkbox-blank-outline").addClass("zcicon-checkbox-marked");
            jQuery("#selectedpage").slideDown();

        }
        else if(jQuery(element).hasClass("zcicon-checkbox-marked"))
        {
            jQuery(element).removeClass("zcicon-checkbox-marked").addClass("zcicon-checkbox-blank-outline");
            jQuery("#selectedpage").slideUp();
            jQuery("#pageList").css("display","none");

        }

    }

    var showpost = function(element) {

         if(jQuery(element).hasClass("zcicon-checkbox-blank-outline"))
        {
            jQuery(element).removeClass("zcicon-checkbox-blank-outline").addClass("zcicon-checkbox-marked");
            jQuery("#selectedpost").slideDown();
        }
        else if(jQuery(element).hasClass("zcicon-checkbox-marked"))
        {
            jQuery(element).removeClass("zcicon-checkbox-marked").addClass("zcicon-checkbox-blank-outline");
            jQuery("#selectedpost").slideUp();
            jQuery("#postList").css("display","none");

        }

    }
    var showContent = function(id,e) {
            e.stopPropagation();
            jQuery('#'+id).slideToggle();
            if(id=='postList')
                jQuery("#pageList").slideUp();
            else if(id == 'pageList')
                 jQuery("#postList").slideUp();
    }

    var select_Content = function (Id,name,type,e) {
        e.stopPropagation();
        var content = "";
        var countlen =0;
        var sellen = 0;
        content = '<div id="copy_'+Id+'"><span> <i class= "zcicon-closex fr f18 csrpntr" onclick="remove_Content(\''+type+'\','+Id+')"></i></span>'+name+'</div>';
        jQuery("#add_page_tracking_script_globalErr").html('');
        if(type == 'post')
        {
            var postcount = jQuery("#zmhub_postvalue").attr('value').split(',').length;
            if(postcount<10)
            {
                jQuery("#selectedpostlist").append(content);
                jQuery("#postList").find("#"+Id).hide();
                jQuery("#postList").find("#"+Id).attr('visible','false');

               var post_value = jQuery("#zmhub_postvalue").attr('value');
                if(post_value == "")
                {
                     jQuery("#zmhub_postvalue").attr('value',+Id);
                }
                else
                {
                    post_value = post_value+','+Id ;
                     jQuery("#zmhub_postvalue").attr('value',post_value);
                }
                countlen = jQuery("#searchposts").find("li").length;
                sellen = jQuery("#zmhub_postvalue").attr('value').split(',').length;
                if(countlen!=9 && (countlen - sellen ==1))
                {
                    jQuery("#postList").slideUp();
                }
            }
            else{
                alert("You cannot track more than 10 posts.");
            }

        }
        else if(type == 'page')
        {
            var pagecount = jQuery("#zmhub_pagevalue").attr('value').split(',').length;
            if(pagecount<10)
            {
                jQuery("#selectedpagelist").append(content);
                jQuery("#pageList").find("#"+Id).hide();
                jQuery("#pageList").find("#"+Id).attr('visible','false');

                var page_value = jQuery("#zmhub_pagevalue").attr('value');
                if(page_value == "")
                {
                     jQuery("#zmhub_pagevalue").attr('value',+Id);
                }
                else
                {
                     jQuery("#zmhub_pagevalue").attr('value',page_value+','+Id);
                }
                countlen = jQuery("#searchpages").find("li").length;
                sellen = jQuery("#zmhub_pagevalue").attr('value').split(',').length;
                if(countlen!=9 && (countlen - sellen ==1))
                {
                    jQuery("#pageList").slideUp();
                }
            }
            else{
                alert("You cannot track more than 10 pages.");
            }
        }
        jQuery("#zmhub_change").attr("value",1);
    }
    var remove_Content = function (type,Id)
    {
        if(type == 'post')
        {
            jQuery("#postList").find("#"+Id).fadeIn();
            jQuery("#postList").find("#"+Id).attr('visible','true');
            jQuery("#selectedpostlist").find("#copy_"+Id).remove();
            var postvalue = jQuery("#zmhub_postvalue").attr('value');
            postvalue = postvalue.replace(Id+',','').replace(','+Id,'').replace(Id,'');
            jQuery("#zmhub_postvalue").attr('value',postvalue);


        }
        else if(type == 'page')
        {
            jQuery("#pageList").find("#"+Id).fadeIn();
            jQuery("#pageList").find("#"+Id).attr('visible','true');
            jQuery("#selectedpagelist").find("#copy_"+Id).remove();
            var pagevalue = jQuery("#zmhub_pagevalue").attr('value').replace(Id+',','').replace(','+Id,'').replace(Id,'');
            jQuery("#zmhub_pagevalue").attr('value',pagevalue);
        }
        jQuery("#zmhub_change").attr("value",1);
    }
    function changeActionValue(selectedAction)
    {
        jQuery("#add_page_tracking_script_globalErr").html('');
        jQuery("#cateogrylist").removeClass("err");
        jQuery("#catname").html(jQuery(selectedAction).attr("id"));
        jQuery("#cateogrylist").attr("value",jQuery(selectedAction).attr("value"));
        jQuery("#zmhub_cateogry").attr("value",jQuery(selectedAction).attr("id"));
        jQuery("#postcateogry").slideUp();
    }

    function change_status(element)
    {
        if(jQuery("#wa_status").hasClass("sel"))
        {

            jQuery("#webAutoStatusPopup").fadeIn();
            // jQuery("#wa_body").css("z-index",-1);
            // jQuery("#wa_body").css("opacity",0.5);
        }
        else if(jQuery("#wa_status").hasClass("notsel"))
        {
            jQuery("#wa_status").removeClass("notsel").addClass("sel");
            jQuery("#wa_status").css({"margin-left" : "24px"});
            jQuery("#zmhub_status").attr('value',1);
            jQuery("#zmhub_change").attr('value',1);


        }
    }
    function confirm_activate(val)
    {
        if(val == 1)
        {
            jQuery(".zmhbtnonoff").removeClass("zhmtoglabon");
            jQuery("#zmhub_status").attr('value',0);
            jQuery("#zmhub_change").attr('value',1);
            jQuery("#zmh_trk_swth_txt").text('Activate');
            jQuery("#test").css('color',"#ababab")

        }
        jQuery("#webAutoStatusPopup").slideUp();
        jQuery("#formRefreshPopup").slideUp();
        jQuery('.zmhsignformlst').removeClass('popupopen');
        jQuery("#wa_body").removeClass('popupopen');
        jQuery('#mh_disconnect_popup').slideUp();
        jQuery('#zmhwc_disconnect_popup').slideUp();
        jQuery(".zmhcontaainer").removeClass('popupopen');

    }

    function confirm_changes(val)
    {
        if(val == 1)
        {

            jQuery("#ldsubmit").attr("value","cancel");
            jQuery("#zmhub_form").submit();
        }
        else if (val ==0 )
        {
          jQuery("#webAutocancelpopup").slideUp();
          jQuery("#zmhub_submit1").removeClass("btnload");
        }

    }

    function validateForm()
    {
        if(jQuery("#ldcodesnippet").val() == "")
        {
            alert("please paste valid tracking code");
            return false;
        }
        else {

            if(jQuery("#specifc").hasClass("vm zcicon-radiobox-marked") && jQuery("#selectedpostlist").attr('value') == "" && jQuery("#selectedpagelist").attr('value') == "")
            {
               alert("please select at least one page or post to proceed.");
                return false;
            }

            else if(jQuery("#Cat").hasClass("vm zcicon-radiobox-marked") && jQuery("#cateogrylist").val() == "")
            {
                return false;
            }
            else{
            //jQuery("#zmhub_form").submit();
            }
        }

    }

    // function saveWaSettings()
    // {
    //    var data = {
    //     'action': 'zmhub_save_settings',
    //     'security': jQuery( '#mh-ajax-nonce' ).val(),
    //     };
    //     jQuery.post(ajaxurl, data, function(response) {
    //         jQuery('.greenband').find("p").text(response.slice(0, -1));
    //         jQuery('.greenband').show();
    //     });
    // }
    var hglghttxt = function(ele,id)
    {
    jQuery(jQuery("#"+id).find("li")).css("display","none");
    var searchCount = 0;
    jQuery(jQuery("#"+id).find("li")[0]).css("display","none");
    var lielem_len = jQuery("#"+id).find("li").length;
    for(i=1;i<lielem_len;i++)
    {
        if(jQuery(jQuery("#"+id).find("li")[i]).attr("visible")!="false")
        {
            if(jQuery(jQuery("#"+id).find("li")[i]).text().toLowerCase().indexOf(ele.value.toLowerCase())!==-1)
            {
                jQuery(jQuery("#"+id).find("li")[i]).css("display","block");
                searchCount++;
            }
        }
    }
    if(searchCount < 1)
    {
        //jQuery(jQuery("#"+id).find("li")[0]).find("a").html("No match found");
        jQuery(jQuery("#"+id).find("li")[0]).css("display","block");
    }

    };
    function success_msg_function()
    {
        jQuery("#success_msg").show();
        setTimeout(function() {
            jQuery("#success_msg").hide();
        }, 5000);
    }

    function copyToClipboard(text) {
        var newInput = document.createElement('input');
        newInput.setAttribute('type','text');
        newInput.setAttribute('display','none');
        newInput.setAttribute('value',text);
        document.body.appendChild(newInput);
        newInput.select();
        document.execCommand('copy');
        newInput.parentElement.removeChild(newInput);
          jQuery(this).parent().parent().find('#zmh_code_msg').css('display','inline');
        setTimeout(function() {
             jQuery(this).parent().parent().find('#zmh_code_msg').css('display','none');
        }, 100);
    }

    function mh_refresh_forms(){
        jQuery('.zmhsignformlst').removeClass('popupopen');
        jQuery(".zmhflodwa").css("display","block");
        var data = {
            'action': 'zmhub_refresh_forms_list',
            'security': jQuery( '#mh-ajax-nonce' ).val(),
        };
        jQuery.post( ajaxurl, data, function(response) {
           window.location.reload();
        });
    }

    function mh_success_msg(msg){
        jQuery('.greenband').find("p").text(msg);
        jQuery('.greenband').show()
    }

    function mh_error_msg(msg){
        jQuery('.redband').find("p").text(msg);
        jQuery('.redband').show()
    }

    function closeBand()
    {
        jQuery('.greenband').hide();
        jQuery('.redband').hide();
        jQuery('.greenband').find("p").text("");
        jQuery('.red').find("p").text("");
    }
   function zmhub_setvalue(key,val)
   {
       jQuery("#zmhub_list").attr("value",key);
       jQuery("#zmhub_list").text(val);

   }
