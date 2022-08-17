<?php 

require_once("./DB.php");
$db = new DB();

$response = $db->ler();

echo $response;
