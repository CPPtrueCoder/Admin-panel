<?php
$newfile="../../". $_POST["name"].".html";
if (file_exists($newfile)){
    header("HTTP/1.0 400 Bad Request");
}else{
    fopen($newfile,"w");
}