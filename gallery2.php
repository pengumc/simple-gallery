<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html><head><title>murad gallery2</title>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script src="gallery2.js"></script>
<link rel="stylesheet" href="gallery2.css" type="text/css"></link>
<!-- FFS ie9 why does ie8 understand inline-blocks better than you? -->
<meta http-equiv="X-UA-Compatible" content="IE=8">

</head>
<body >
<!-- ok you've asked for it TABLES!-->
<table><tr><td id="gal_list">
<div >

<?php
//populate gal_list
$dirs = scandir('./');
$galleries = Array();
foreach($dirs as $name){
	if (is_dir($name) && !preg_match('/[^a-z0-9\_]/i', $name)){  
		if (file_exists($name.'/.gallery')){
			array_push($galleries, $name);
		}
	}
}

foreach ($galleries as $gal){
	echo '<div class="gal_list_entry" onclick="set_gallery(this)">'.$gal.'</div>';
}

?>
<div id="backtotop" onclick="toggle_slowmode(this)">animations: On</div>
</div> 
</td><td>
<div id="gallery">
	<div id="gal_title"><script>document.write(current_gallery)</script> </div>
	<div id="gal_fotos">
	</div>
	<div id="gal_footer" onclick="load_images(20)">next 20 fotos</div>
	<div id="gal_loading" onclick="load_images(20)">
		<img src="loading.gif"></img>
	</div>
</div>
</td></tr></table>



<!-- popup stuff -->

<div id="f_bg" onclick="hide_view(this)">
	<div id="f_container">
		<img id="f_img" onload="fix_foto()" onclick="toggle_fullsize(this, event)"></img>
		<img id="f_loading" src="loading.gif"></img>
		<div id="f_comment">comment</div>
		<div id="f_note">hello</div>
	</div>
</div>

<script>
	parseLoc();
</script>

<!--
<input type="button" value="add img" onclick="load_images(5);"></input>
<input type="button" value="fadein" onclick="$('.foto').fadeIn('slow');"></input>
-->
</body></html>
