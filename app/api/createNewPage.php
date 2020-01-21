<?php
$_POST = json_decode(file_get_contents("php://input"),true);

$newfile="../../". $_POST["name"].".html";

if (file_exists($newfile)){
    header("HTTP/1.0 400 Bad Request");
}else{
    fopen($newfile,"w");
}

