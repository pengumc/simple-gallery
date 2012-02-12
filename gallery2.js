//author: Michiel van der Coelen
//email: use . for spaces @ gmail.com


var current_image = 0;

//default gallery:
var current_gallery = "fotos_test";

var FOTOWIDTH = 150;
var GRABSIZE = 20; //how much thumbnails to download each time
var FADETIME = 500/20;
var SCALING = false; //is there a scaling scheduled?
var LOADING = false; //are we loading thumbnails?
var SLOWMODE = false; //slow pc mode, if true, disables fade animations
var ALLLOADED = false; //no more images to load?
var scalecount = 0;
var nep_event = {keyCode:0}; 

//ignore the currnt click event. Useful if we just launched another window
//and the user wants to refocus this one without actually doing something
var disregard_click = false; 

//ffs IE 
if (!$.browser.msie){
	window.onhashchange = parseLoc;
}

//register the resize event
window.onresize = do_resize;

//register keydow event for the left and right keys
$(document).keydown(next_prev_foto);

//load images if we scroll to the bottom
window.onscroll = function checkScroll(){
	var alt_pos = window.scrollY;
	var pos = document.body.scrollTop;
	//some browsers don't have scrollTop so use scrollY instead
	if (+pos < +alt_pos) pos = alt_pos;
	var max = document.body.scrollHeight - window.innerHeight;
	if (pos >= max) {
		if(!ALLLOADED) load_images();
	}
};

//unused, builtin the gallery2.php file
function load_galleries(){
	$.ajax({
		type:"GET",
		url:"grab_galleries.php",
		success:function(data){
			if (data.length < 10){
				return;
			}
			$('#gal_list').html(data);
		}});
}


//grab thumbnails
function load_images(n){
	//basically: GET grab_photos.php and append the received data
	// to #gal_fotos
	if (LOADING) return;
	LOADING = true;
	$('#gal_footer').hide();
	$('#gal_loading').show();
	if (!n){
		n = GRABSIZE;
	}
	$.ajax({
		type:"GET",
		url:"grab_photos.php?g="+current_gallery+"&n="+n+"&start="+current_image,
		success:function(data, textStatus, jqHXR){
			if (data.length < 10){
				$('#gal_footer').hide();
				ALLLOADED = true;
				LOADING = false;
				return;
			}
			$('#gal_fotos').append(data);
			if (!SLOWMODE){
				$('#gal_fotos').find('.foto').slice(-n).hide().first().fadeIn(FADETIME,recfade);
			}
			//current_image += parseInt(n);
			current_image = +$('#gal_fotos').find('.foto').last().attr('index') + 1
			LOADING = false;
		}});
	$('#gal_footer').fadeIn('slow');
	$('#gal_loading').hide();
}

//recursive fade function for thumbnails
function recfade(){
	$(this).next('.foto').fadeIn(FADETIME,recfade);
	do_resize();
	
}

//change gallery
function set_gallery(e){
	if (disregard_click){
		disregard_click = false;
		return
	}
	var gal = e.innerHTML;
	var loc = window.location.href.toLowerCase();
	var hekje = loc.indexOf('#');
	if (hekje>0){
		loc = loc.slice(0,hekje);
	}
    window.location.href=loc+'#'+gal;
	$('.gal_list_entry').css('color','black');
	$(e).css('color', 'green');
	//ow IE u so funny, y u no DIE IN A FIRE
	if ($.browser.msie) parseLoc();
}

// parse the part after the # to be a gallery name
function parseLoc(){
	//hide fullscreen view
	$('#f_bg').hide();

	//get gallery from location
	// gallery2.php#cat_pictures ==> "cat_pictures"
	var loc = window.location.href;
	var hekje = loc.indexOf('#');
	if (hekje<1){
		set_gallery({innerHTML:current_gallery});	
		return;	
	}
	var gal = loc.slice(hekje+1);
	$('#gal_title').html(gal);
	$('#gal_fotos').html("");
	$('#gal_footer').show();
	ALLLOADED = false;
	current_gallery = gal;
	current_image = 0;
	load_images(20);
	
}

//resize the thumbnails to fit neatly
// and/or scale the current fullscreen foto
function actual_resize(){
	//TODO fix for mobile users
	var w = $('#gal_fotos').innerWidth();
	var rowsize = Math.floor(w/FOTOWIDTH); //in fotos
	var wasted = w - rowsize*FOTOWIDTH;
	var EHM = 18; //2*(border+padding foto class)
	if (w > FOTOWIDTH / 2.0){
		//try bigger
		var new_w = Math.floor(w / rowsize) - EHM;
		//if (new_w > FOTOWIDTH) return;
		$('.foto_img').css('width',new_w + 'px');
		$('.comment').css('width',new_w-8 + 'px');
		$('.foto').css('width', new_w );
	}
	if($('#f_bg').css('display') != 'none') scale_element(document.getElementById('f_img'));
	SCALING = false;
}

//setup a timeout for the actual resize
// just so we don't resize a gajilion times
function do_resize(){
	if (SCALING) return;
	SCALING = true;
	setTimeout(actual_resize, 500);
}


//show a foto fullscreen
function do_show(e){
	if (disregard_click){
		disregard_click = false;
		return
	}
	//grab image link and comment
	var plaatje = $(e).attr('href');
	var comment  = $(e).parent().find('.comment').text();
	var index = $(e).parent().attr('index');
	$('#f_note').hide();
	$('#f_img').hide().css('width','100%').css('height','100%').attr('index', index);
	$('#f_img').attr('flipheight',"");
	$('#f_loading').show();
	if (!SLOWMODE){
		$('#f_bg').fadeIn(FADETIME);
	}else $('#f_bg').show();
	if (plaatje == $('#f_img').attr('src')) fix_foto();
	$('#f_img').attr('src',plaatje);
	$('#f_comment').html(comment);
}

//close the fullscreen view
function hide_view(e){
	if (disregard_click){
		disregard_click = false;
		return
	}
	$(e).hide();	
}

//open a window with the clicked foto
function toggle_fullsize(e, ev){
	if (disregard_click){
		disregard_click = false;
		if(ev.stopPropagation) ev.stopPropagation();
		else ev.cancelBubble=true;
		return;
	}
	if(!ev)	ev = window.event;
	var e = $(e);
	var neww = window.open(
		e.attr('src'),
		'fullsize_view',
		'channelmode=yes, height=' + parseInt(e.attr('flipheight')) + ',width='+parseInt(e.attr('flipwidth')+ 'scrollbars=yes'));
	neww.focus();
	disregard_click = true;
	/* OLD
	var newh = e.attr('flipheight');
	var neww = e.attr('flipwidth');
	e.attr('flipheight', e.css('height')).attr('flipwidth', e.css('width'));
	e.css('width', neww).css('height', newh);
	e.attr('fullsize', e.attr('fullsize')?0:1);	
	*/
	if(ev.stopPropagation) ev.stopPropagation();
	else ev.cancelBubble=true;
}

//scale the fullscreen foto 
//registered to the onload of the fullscreen view foto
function fix_foto(){
	var e = document.getElementById('f_img');
	scale_element(e);
	$('#f_img').show();
	$('#f_loading').hide();
	
}

//handle keydown event
// left and right keys flip through fotos
// try to load new thumbnails if needed
// esc and q exit the fullscreen view
function next_prev_foto(ev){
	if (document.getElementById('f_bg').style.display == 'none') return;
	var active = document.getElementById('f_img').getAttribute('index');
	disregard_click = false; //pressing a key means we have focus
	if (ev.keyCode == 37) {
		if (active < 1) {
			$('#f_note').html("first foto").show();
			setTimeout("$('#f_note').hide()", 1500);
			return; //no wrap around
		}
		var foto = $('.foto[index|="'+(active - 1)+'"]>div');
		do_show(foto);
	}else if (ev.keyCode == 39){
		if (active > +current_image -2) { //load moar!
			if(!ALLLOADED){
			//if ($('#gal_footer').css('display') != 'none') {
				load_images(GRABSIZE);
			}
			else if(!LOADING) { //footer is also gone during loading
				$('#f_note').html("last foto").show();
				setTimeout("$('#f_note').hide()", 1500);
				return;
			}
			
			if (LOADING) {
				nep_event.keyCode = ev.keyCode;
				setTimeout("next_prev_foto(nep_event)", FADETIME);
				return
			}
		}
		var foto = $('.foto[index|="'+(+active +1)+'"]>div');
		do_show(foto);
	}else if(ev.keyCode == 27 || ev.keyCode == 81){ //q or esc
		$('#f_bg').click();
	}
}


//scale a fullscreen foto
function scale_element(e){
	if ($(e).attr('fullsize') == 1) return
	scalecount++;
	var w = e.width;
	var h = e.height;
	
	//IE failure workaround:
	if ($.browser.msie){
		var poep = new Image();
		poep.src = $(e).attr('src');
		w = poep.width;
		h = poep.height;
		delete(poep);
	}
	var ratio = w / h;
	var je = $(e);
	var container = $('#f_container')

	var xscale = container.width() / w;
	var yscale = (container.height()-$('#f_comment').height()) / h;

	//use smallest scale factor
	if (xscale < yscale){
		je.height( Math.floor( xscale * h));
		je.width(Math.floor(je.height() * ratio));
	}else{
		je.width( Math.floor( yscale * w));
		je.height(Math.floor(je.width() / ratio));
		
	}
	var left = Math.floor((je.parent().width() - je.width())/2) + 'px';
	if (!je.attr('flipheight')){
		je.attr('flipwidth', w+'px');
		je.attr('flipheight', h+'px');
	}
	je.css('left', left)
	$('#f_comment').width(je.width()).css('left',left);
	
}


function toggle_slowmode(e){
	SLOWMODE = SLOWMODE?false:true;
	$('#backtotop').html('animations: ' +(SLOWMODE?'Off':'On'));
}
