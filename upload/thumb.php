#! /usr/bin/php
<?php
if ($argc < 2) {
?>

loser!

<?php
exit();
}
if ($argv[1] == '-s'){
	echo "single mode\n";
	if (file_exists($argv[2])){
		single_thumb($argv[2], '');
	}else{
		echo $argv[2].' does not exist';
		single_thumb($argv[2], '.');
	}
	exit();

}

$ls = scandir($argv[1]);
foreach($ls as $name){
	single_thumb($name, $argv[1]);
}

function single_thumb($name, $root){
	echo "received: ".$root.'/'.$name."\n";
	if (preg_match('/(.*)\.jpg$/i', $name, $matches)){
		if (!preg_match('/_thumb\.jpg$/i', $name)){
			$src = $root.'/'.$name;
			$dest = $root.'/'.$matches[1].'_thumb.jpg';
			echo 'src = ' . $src."\n";
			echo 'dest = ' . $dest."\n";
			thumbify($src, $dest, 150);
		}
	}

}

function thumbify($src, $dest, $width){
	$img = imagecreatefromjpeg($src);
	$x = imagesx($img);
	$y = imagesy($img);
	if($y > $x){
		$height = $width;
		$newx = floor($x *$height/$y);
		$newimg = imagecreatetruecolor($newx, $height);
		imagecopyresized($newimg, $img, 0,0,0,0, $newx, $height, $x, $y);
		$newimg = imagerotate($newimg, 90, 0);
		
	}else{
		$newy = floor($y * $width/$x);
		$newimg = imagecreatetruecolor($width, $newy);
		imagecopyresized($newimg, $img, 0,0,0,0, $width, $newy, $x, $y);
	}
	imagejpeg($newimg, $dest);
}


?>
