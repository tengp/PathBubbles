<?php
error_reporting(E_ALL ^ E_DEPRECATED);
    // load in mysql server configuration (connection string, user/pw, etc)
    include 'mysqlConfig.php';
    // connect to the database
    @mysql_select_db($database) or die( "Unable to select database");
    //Query
    $myquery = "
        SELECT `pathwayID`, `symbol` FROM `protein`
    ";

    $result = mysql_query($myquery);
    if ( ! $result ) {
        echo mysql_error();
        die;
    }
    $data = array();
    for ($x = 0; $x < mysql_num_rows($result); $x++) {
        $data[] = mysql_fetch_assoc($result);
    }
    echo json_encode($data);

    mysql_close();
?>