<?php

class DB {

  public $conn;

  public function conectar($host, $user, $password, $dbname) {

    try {
      $conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);

      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      return $conn;

      } catch(PDOException $e) {
        echo "Falha ao conectar com banco de dados $dbname: " . $e->getMessage();
        die();
      }
  }

  public function gravar($json) {
    $conn = $this->conectar("localhost", "root", "", "rte_teste");
    $json = json_decode($json, true);
    
    // limpando dados anteriores nas tabelas filhos e pessoas
    $sql = "DELETE FROM filhos";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    $sql = "DELETE FROM pessoas";
    $stmt = $conn->prepare($sql);
    $stmt->execute();


    foreach ($json["pessoas"] as $pessoa) {

      $sql = "INSERT INTO `pessoas`(`nome`) VALUES (:nome)";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':nome', $pessoa['nome']);
      $stmt->execute();

      // resgatando id da pessoa inserida
      $pessoa_id = $conn->lastInsertId();

      // inserindo filhos
      foreach ($pessoa["filhos"] as $filho) {

        $sql = "INSERT INTO `filhos`(`pessoa_id`, `nome`) VALUES (:pessoa_id, :nome)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':nome', $filho);
        $stmt->bindParam(':pessoa_id', $pessoa_id);
        $stmt->execute();

      }
    }
    
    $conn = null;
    return $this->ler();
  }

  public function ler() {
    $conn = $this->conectar("localhost", "root", "", "rte_teste");

    // seleciona todas pessoas
    $sql = "SELECT * FROM pessoas";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $todasPessoas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // seleciona todos filtros
    $sql = "SELECT * FROM filhos";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $todosFilhos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // array base para o retorno
    $resultado = [ "pessoas" => [] ];

    // iterando sobre todas as pessoas
    foreach ($todasPessoas as $pessoa) {
      $filhosDaPessoa = [];


      foreach ($todosFilhos as $filho) {
        // selecionado os filhos de cada pessoa
        if ($filho['pessoa_id'] === $pessoa['id']) {
          $filhosDaPessoa[] = $filho['nome'];
        }
      }

      // inserindo array de pessoa com seus filhos ao array resultado
      $resultado["pessoas"][] = ["nome" => $pessoa['nome'], "filhos" => $filhosDaPessoa];
    }

    $conn = null;

    return json_encode($resultado);
  }
}