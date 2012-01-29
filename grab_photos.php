
<?php
$gallery = $_GET["g"];
if(!$gallery) $gallery="fotos_test";

$amount = $_GET["n"];
if ($amount < 1) $amount = 10;

$start = $_GET["start"];
if ($start < 1) $start = 0;

grab($gallery, $amount, $start);


function grab($gallery, $amount, $start){
	$files = scandir($gallery);
	$jpegs = Array();
	$thumbs = Array();
	$texts = Array();
	$index = $start;
	foreach ($files as $name){
		if (preg_match('/(.*)_thumb.jpg/i', $name, $matches)){
			$thumb = $gallery.'/'.$name;
			$thumbs[$matches[1]] = $thumb;
		} elseif (preg_match('/(.*)\.jpg/i', $name, $matches)){
			$jpg = $gallery.'/'.$name;
			$jpegs[$matches[1]] = $jpg;
		} elseif (preg_match('/(.*)\.txt/i', $name, $matches)){
			$texts[$matches[1]] = $gallery.'/'.$name;
		}
	}

	foreach(array_slice($thumbs, $start, $amount) as $key => $t){
		if (array_key_exists($key, $jpegs)){
			echo '<div class="foto" index="'.$index.'">
				<div href="'.$jpegs[$key].'" onclick="do_show(this)">
				<img class="foto_img" onload="do_resize()" src="'.$t.'"></img></div>';
			if (array_key_exists($key, $texts)){
				echo '<div class="comment">';
				readfile($texts[$key]);
				echo '</div>';
			}
			echo "</div>";
			$index++;
		}

	}	
}
?> 
