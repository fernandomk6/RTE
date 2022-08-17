<?php 

require_once("./DB.php");
$db = new DB();

$json = file_get_contents('php://input');
$response = $db->gravar($json);

echo $response;
